# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class OfferGenerator(models.TransientModel):
    _name = 'offer.generator'
    _description = 'Job Offer Generator Wizard'

    placement_id = fields.Many2one('recruitment.placement', string='Placement', required=True)
    offered_salary = fields.Monetary('Offered Salary', required=True, currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.ref('base.AED'), required=True)
    probation_period = fields.Integer('Probation Period (Days)', default=90)
    joining_bonus = fields.Monetary('Joining Bonus', currency_field='currency_id')
    benefits_description = fields.Text('Benefits Description', help="Medical insurance, housing allowance, transport, etc.")
    contract_duration = fields.Selection([
        ('permanent', 'Permanent'),
        ('1_year', '1 Year'),
        ('2_years', '2 Years'),
        ('3_years', '3 Years')
    ], default='permanent', required=True, string='Contract Duration')
    joining_date = fields.Date('Expected Joining Date')

    @api.model
    def create(self, vals_list):
        """Override create to support batch creation"""
        if isinstance(vals_list, dict):
            vals_list = [vals_list]
        return super(OfferGenerator, self).create(vals_list)

    @api.onchange('placement_id')
    def _onchange_placement_id(self):
        """Pre-fill salary from placement"""
        if self.placement_id and self.placement_id.gross_salary:
            self.offered_salary = self.placement_id.gross_salary

    def action_generate_offer(self):
        """Generate and send job offer"""
        self.ensure_one()

        if not self.placement_id:
            raise ValidationError(_('Please select a placement'))

        # Update placement with offer details
        self.placement_id.write({
            'gross_salary': self.offered_salary,
            'joining_date': self.joining_date or fields.Date.today(),
        })

        # Update applicant offer status
        if self.placement_id.applicant_id:
            self.placement_id.applicant_id.write({
                'offer_status': 'sent',
                'expected_salary': self.offered_salary,
            })

        # Generate offer letter (you can customize this with a report template)
        offer_details = {
            'candidate_name': self.placement_id.applicant_id.partner_name,
            'position': self.placement_id.job_order_id.name if self.placement_id.job_order_id else 'Position',
            'salary': self.offered_salary,
            'currency': self.currency_id.name,
            'probation_period': self.probation_period,
            'joining_bonus': self.joining_bonus,
            'benefits': self.benefits_description,
            'contract_duration': dict(self._fields['contract_duration'].selection).get(self.contract_duration),
            'joining_date': self.joining_date,
        }

        # Create a message/note with offer details
        message_body = f"""
        <h3>Job Offer Generated</h3>
        <p><strong>Candidate:</strong> {offer_details['candidate_name']}</p>
        <p><strong>Position:</strong> {offer_details['position']}</p>
        <p><strong>Salary:</strong> {offer_details['currency']} {offer_details['salary']:,.2f}</p>
        <p><strong>Probation Period:</strong> {offer_details['probation_period']} days</p>
        <p><strong>Joining Bonus:</strong> {offer_details['currency']} {offer_details['joining_bonus']:,.2f}</p>
        <p><strong>Contract Duration:</strong> {offer_details['contract_duration']}</p>
        <p><strong>Expected Joining Date:</strong> {offer_details['joining_date']}</p>
        <p><strong>Benefits:</strong><br/>{offer_details['benefits'] or 'Not specified'}</p>
        """

        self.placement_id.message_post(
            body=message_body,
            subject='Job Offer Generated',
            message_type='notification',
        )

        # Send offer email to candidate
        if self.placement_id.applicant_id and self.placement_id.applicant_id.email_from:
            template = self.env.ref('uae_recruitment_mgmt.email_template_job_offer', raise_if_not_found=False)
            if template:
                template.send_mail(self.placement_id.applicant_id.id, force_send=True)

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Offer Generated'),
                'message': _(f'Job offer generated and sent to {offer_details["candidate_name"]}'),
                'type': 'success',
                'sticky': False,
            }
        }

    def action_generate_multiple_offers(self, placement_ids):
        """Batch generate offers for multiple placements"""
        if not placement_ids:
            raise ValidationError(_('No placements selected'))

        generated_count = 0
        for placement in self.env['recruitment.placement'].browse(placement_ids):
            try:
                # Create offer for each placement
                wizard = self.create({
                    'placement_id': placement.id,
                    'offered_salary': placement.gross_salary or 0,
                })
                wizard.action_generate_offer()
                generated_count += 1
            except Exception as e:
                # Log error but continue with other placements
                placement.message_post(
                    body=f"Error generating offer: {str(e)}",
                    subject='Offer Generation Failed',
                    message_type='notification',
                )

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Batch Offer Generation'),
                'message': _(f'Successfully generated {generated_count} job offers'),
                'type': 'success',
                'sticky': False,
            }
        }
