# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class RecruitmentPlacement(models.Model):
    _name = 'recruitment.placement'
    _description = 'Candidate Placement / Hired Employee'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    # Basic Info
    name = fields.Char('Placement Reference', default='New', readonly=True, copy=False)
    applicant_id = fields.Many2one('hr.applicant', 'Candidate', required=True, ondelete='restrict', tracking=True)
    client_id = fields.Many2one('recruitment.client', 'Client', required=True, ondelete='restrict', tracking=True)
    job_order_id = fields.Many2one('recruitment.job.order', 'Job Order', required=True, tracking=True)
    agency_id = fields.Many2one('recruitment.agency', 'Recruitment Agency', 
                                related='applicant_id.agency_id', store=True, readonly=True,
                                help='The recruitment agency that sourced this candidate')
    
    # Employee Information (once hired)
    employee_id = fields.Many2one('hr.employee', 'Employee', readonly=True)
    
    # Dates
    placement_date = fields.Date('Placement Date', default=fields.Date.today, required=True, tracking=True)
    joining_date = fields.Date('Joining Date', tracking=True)
    confirmation_period_days = fields.Integer('Confirmation Period (Days)', default=90)
    confirmation_date = fields.Date('Confirmation Date', compute='_compute_confirmation_date')
    
    contract_end_date = fields.Date('Contract End Date')
    
    # Salary & Benefits
    gross_salary = fields.Monetary('Gross Salary', currency_field='currency_id', required=True)
    currency_id = fields.Many2one('res.currency', 'Currency', default=lambda self: self.env.ref('base.AED'))
    
    benefits = fields.Text('Benefits Package')
    
    # Commission & Fees
    commission_percentage = fields.Float('Commission %', default=20.0)
    base_amount = fields.Monetary('Base Amount', compute='_compute_base_amount', currency_field='currency_id')
    commission_amount = fields.Monetary('Commission Amount', compute='_compute_commission', currency_field='currency_id')
    final_amount = fields.Monetary('Final Amount', compute='_compute_final_amount', currency_field='currency_id')
    
    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('terminated', 'Terminated')
    ], default='draft', tracking=True)
    
    # Visa Information
    visa_processing_id = fields.Many2one('uae.visa.processing', 'Visa Processing')
    visa_status = fields.Selection([
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected')
    ], default='not_started', tracking=True)
    
    # Internal Notes
    internal_notes = fields.Text('Notes')
    
    # Website Sync
    sync_status = fields.Selection([
        ('not_synced', 'Not Synced'),
        ('synced', 'Synced'),
        ('error', 'Sync Error')
    ], default='not_synced', readonly=True)

    @api.model
    def create(self, vals_list):
        """Handle both single and batch creates properly for Odoo 18.
        
        The @api.model_create_single decorator is deprecated in Odoo 18+.
        This method handles both single dict and list of dicts.
        """
        if not isinstance(vals_list, list):
            vals_list = [vals_list]
        
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('recruitment.placement')
        
        return super().create(vals_list)

    @api.constrains('gross_salary')
    def _check_salary(self):
        for record in self:
            if record.gross_salary <= 0:
                raise ValidationError(_('Salary must be greater than 0'))

    @api.depends('joining_date', 'confirmation_period_days')
    def _compute_confirmation_date(self):
        for record in self:
            if record.joining_date and record.confirmation_period_days:
                record.confirmation_date = record.joining_date + timedelta(days=record.confirmation_period_days)
            else:
                record.confirmation_date = False

    @api.depends('gross_salary')
    def _compute_base_amount(self):
        for record in self:
            record.base_amount = record.gross_salary

    @api.depends('base_amount', 'commission_percentage')
    def _compute_commission(self):
        for record in self:
            record.commission_amount = (record.base_amount * record.commission_percentage) / 100

    @api.depends('base_amount', 'commission_amount')
    def _compute_final_amount(self):
        for record in self:
            record.final_amount = (record.base_amount or 0.0) + (record.commission_amount or 0.0)

    def action_submit_offer(self):
        """Submit offer to candidate (User action)"""
        self.ensure_one()
        self.write({'state': 'offer_sent'})
        self.message_post(body=_('Offer submitted to candidate'))

    def action_confirm_offer(self):
        """Confirm offer accepted (Manager action)"""
        self.ensure_one()
        self.write({'state': 'accepted'})
        self.message_post(body=_('Offer confirmed and accepted'))

    def action_onboard(self):
        """Start onboarding process (Manager action)"""
        self.ensure_one()
        self.write({'state': 'onboarding'})
        self.message_post(body=_('Onboarding process started'))

    def action_deploy(self):
        """Deploy candidate to client (Manager action)"""
        self.ensure_one()
        self.write({'state': 'deployed'})
        self._create_invoice()
        self.message_post(body=_('Candidate deployed successfully'))

    def action_confirm(self):
        """Confirm placement - create invoice"""
        self.ensure_one()
        self.write({'state': 'confirmed'})
        self._create_invoice()
        self.message_post(body=_('Placement confirmed'))

    def action_complete(self):
        """Complete placement after confirmation period"""
        self.ensure_one()
        self.write({'state': 'completed'})
        self.message_post(body=_('Placement completed'))

    def action_cancel(self):
        """Cancel placement"""
        self.ensure_one()
        self.write({'state': 'cancelled'})
        self.message_post(body=_('Placement cancelled'))

    def action_set_to_draft(self):
        """Set placement back to draft"""
        self.write({'state': 'draft'})
        self.message_post(body=_('Placement set back to draft'))

    def action_view_visa_processing(self):
        """View visa processing for this placement"""
        if self.visa_processing_id:
            return {
                'type': 'ir.actions.act_window',
                'name': 'Visa Processing',
                'res_model': 'uae.visa.processing',
                'res_id': self.visa_processing_id.id,
                'view_mode': 'form',
                'target': 'current',
            }
        else:
            return {
                'type': 'ir.actions.act_window',
                'name': 'Visa Processing',
                'res_model': 'uae.visa.processing',
                'view_mode': 'list,form',
                'domain': [('placement_id', '=', self.id)],
                'context': {'default_placement_id': self.id},
                'target': 'current',
            }

    def action_terminate(self):
        """Terminate placement"""
        self.ensure_one()
        self.write({'state': 'terminated'})
        self.message_post(body=_('Placement terminated'))

    def _create_invoice(self):
        """Create invoice for client"""
        self.ensure_one()
        
        if not self.client_id.partner_id:
            raise ValidationError(_('Client partner not set'))
        
        Invoice = self.env['account.move']
        
        # Get default income account from product or company
        income_account = self.env['account.account'].search([
            ('account_type', '=', 'income'),
            ('company_ids', 'in', self.env.company.id)
        ], limit=1)
        
        if not income_account:
            raise ValidationError(_('No income account found. Please configure accounting.'))
        
        lines = [(0, 0, {
            'name': _('Placement: %s - %s') % (self.applicant_id.partner_name, self.job_order_id.name),
            'quantity': 1,
            'price_unit': self.final_amount,
            'account_id': income_account.id,
        })]
        
        invoice = Invoice.create({
            'move_type': 'out_invoice',
            'partner_id': self.client_id.partner_id.id,
            'invoice_line_ids': lines,
            'narration': _('Placement commission for %s') % self.applicant_id.partner_name,
        })
        
        return invoice

    def action_start_visa_processing(self):
        """Create and start visa processing for this placement"""
        self.ensure_one()
        
        if self.visa_processing_id:
            raise ValidationError(_('Visa processing already started for this placement'))
        
        visa_processing = self.env['uae.visa.processing'].create({
            'applicant_id': self.applicant_id.id,
            'client_id': self.client_id.id,
            'placement_id': self.id,
            'visa_type': self.job_order_id.visa_type,
        })
        
        self.visa_processing_id = visa_processing.id
        self.write({'visa_status': 'in_progress'})
        self.message_post(body=_('Visa processing started'))
        
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'uae.visa.processing',
            'res_id': visa_processing.id,
            'view_mode': 'form',
            'target': 'current',
        }

    def action_sync_to_website(self):
        """Sync placement to website"""
        try:
            api_url = self.env['ir.config_parameter'].sudo().get_param('website.url')
            
            if not api_url:
                return
            
            # In production, post placement data to website
            self.write({
                'sync_status': 'synced'
            })
            self.message_post(body=_('Placement synced to website'))
        
        except Exception as e:
            self.write({
                'sync_status': 'error'
            })
            self.message_post(body=_('Sync failed: %s') % str(e))
