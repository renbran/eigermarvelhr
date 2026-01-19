# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class InterviewScheduler(models.TransientModel):
    _name = 'interview.scheduler'
    _description = 'Interview Scheduler Wizard'

    candidate_ids = fields.Many2many('hr.applicant', string='Candidates', required=True)
    interview_date = fields.Date('Interview Date', required=True, default=fields.Date.today)
    interview_time = fields.Float('Interview Time', required=True, default=9.0, help="Time in 24-hour format (e.g., 14.5 for 2:30 PM)")
    interview_mode = fields.Selection([
        ('in_person', 'In-Person'),
        ('virtual', 'Virtual (Online)'),
        ('phone', 'Phone Call')
    ], default='virtual', required=True, string='Interview Mode')
    interviewer_id = fields.Many2one('hr.employee', string='Interviewer', required=True)
    meeting_link = fields.Char('Meeting Link', help="Teams/Zoom/Google Meet link for virtual interviews")
    notes = fields.Text('Interview Notes')

    @api.model
    def create(self, vals_list):
        """Override create to support batch creation"""
        if isinstance(vals_list, dict):
            vals_list = [vals_list]
        return super(InterviewScheduler, self).create(vals_list)

    def action_schedule_interviews(self):
        """Schedule interviews for selected candidates"""
        self.ensure_one()

        if not self.candidate_ids:
            raise ValidationError(_('Please select at least one candidate'))

        if self.interview_mode == 'virtual' and not self.meeting_link:
            raise ValidationError(_('Meeting link is required for virtual interviews'))

        # Prepare activity values for batch creation
        activity_vals_list = []
        scheduled_count = 0

        for candidate in self.candidate_ids:
            # Calculate interview datetime
            interview_datetime = datetime.combine(
                self.interview_date,
                datetime.min.time()
            ) + timedelta(hours=self.interview_time)

            # Prepare activity summary
            summary = f"Interview - {self.interview_mode.replace('_', ' ').title()}"
            if self.interview_mode == 'virtual':
                summary += f" (Link: {self.meeting_link})"

            # Create activity for each candidate
            activity_vals = {
                'activity_type_id': self.env.ref('mail.mail_activity_data_meeting').id,
                'res_model_id': self.env['ir.model']._get_id('hr.applicant'),
                'res_id': candidate.id,
                'summary': summary,
                'date_deadline': self.interview_date,
                'user_id': self.interviewer_id.user_id.id if self.interviewer_id.user_id else self.env.user.id,
                'note': self.notes or '',
            }
            activity_vals_list.append(activity_vals)

            # Update candidate stage to interview
            interview_stage = self.env['hr.recruitment.stage'].search([
                ('name', 'ilike', 'interview')
            ], limit=1)
            if interview_stage:
                candidate.stage_id = interview_stage.id

            scheduled_count += 1

        # Batch create activities
        if activity_vals_list:
            self.env['mail.activity'].create(activity_vals_list)

        # Send notification email to candidates (batch)
        for candidate in self.candidate_ids:
            if candidate.email_from:
                template = self.env.ref('uae_recruitment_mgmt.email_template_interview_invitation', raise_if_not_found=False)
                if template:
                    template.send_mail(candidate.id, force_send=True)

        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Interviews Scheduled'),
                'message': _(f'Successfully scheduled {scheduled_count} interviews'),
                'type': 'success',
                'sticky': False,
            }
        }
