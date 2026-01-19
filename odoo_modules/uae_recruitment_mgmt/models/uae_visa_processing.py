# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from datetime import timedelta


class UAEVisaProcessing(models.Model):
    _name = 'uae.visa.processing'
    _description = 'UAE Visa Processing Tracker'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    # References
    name = fields.Char('Reference', default='New', readonly=True)
    applicant_id = fields.Many2one('hr.applicant', 'Candidate', required=True, ondelete='restrict')
    client_id = fields.Many2one('recruitment.client', 'Client', required=True, ondelete='restrict')
    placement_id = fields.Many2one('recruitment.placement', 'Placement', ondelete='restrict')

    # Visa Details
    visa_type = fields.Selection([
        ('employment', 'Employment Visa'),
        ('investor', 'Investor Visa'),
        ('golden', 'Golden Visa'),
        ('sponsor_transfer', 'Sponsor Transfer')
    ], default='employment', required=True, tracking=True)

    # Processing Stage & State
    stage_id = fields.Many2one('uae.visa.stage', 'Stage', tracking=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('documents', 'Document Collection'),
        ('submission', 'Submitted to Immigration'),
        ('approval', 'Approval Pending'),
        ('medical', 'Medical Test'),
        ('emirates_id', 'Emirates ID'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled')
    ], default='draft', tracking=True)

    # Document Checklist
    passport_copy = fields.Boolean('Passport Copy', tracking=True)
    passport_photo = fields.Boolean('Passport Photo', tracking=True)
    educational_certificates = fields.Boolean('Educational Certificates', tracking=True)
    experience_certificates = fields.Boolean('Experience Certificates', tracking=True)
    medical_fitness = fields.Boolean('Medical Fitness Certificate', tracking=True)
    police_clearance = fields.Boolean('Police Clearance', tracking=True)
    noc_letter = fields.Boolean('NOC Letter', tracking=True)
    employment_contract = fields.Boolean('Employment Contract', tracking=True)
    
    documents_complete = fields.Boolean('All Documents Collected', compute='_compute_documents_complete')

    # Timeline
    application_date = fields.Date('Application Date', default=fields.Date.today, required=True)
    expected_completion = fields.Date('Expected Completion')
    actual_completion = fields.Date('Actual Completion')
    processing_days = fields.Integer('Days to Process', compute='_compute_processing_days')

    # PRO & Immigration Details
    pro_company = fields.Char('PRO Company Name')
    pro_contact_name = fields.Char('PRO Contact Person')
    pro_contact_phone = fields.Char('PRO Contact Phone')
    pro_email = fields.Char('PRO Email')
    
    tracking_number = fields.Char('Immigration Tracking Number')
    reference_number = fields.Char('Reference Number')

    # Costs
    visa_cost = fields.Monetary('Visa Cost', currency_field='currency_id')
    medical_cost = fields.Monetary('Medical Cost', currency_field='currency_id')
    emirates_id_cost = fields.Monetary('Emirates ID Cost', currency_field='currency_id')
    other_costs = fields.Monetary('Other Costs', currency_field='currency_id')
    total_cost = fields.Monetary('Total Cost', compute='_compute_total_cost', currency_field='currency_id')
    
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.ref('base.AED'))
    
    # Medical Examination
    medical_exam_date = fields.Date('Medical Exam Date')
    medical_exam_location = fields.Char('Medical Center')
    medical_exam_passed = fields.Boolean('Medical Exam Passed', tracking=True)
    medical_exam_notes = fields.Text('Medical Exam Notes')

    # Emirates ID
    emirates_id_collection_date = fields.Date('Emirates ID Collection Date')
    emirates_id_number = fields.Char('Emirates ID Number')
    emirates_id_expiry = fields.Date('Emirates ID Expiry Date')

    # Status & Notes
    is_urgent = fields.Boolean('Urgent Processing', default=False)
    is_priority = fields.Boolean('Priority Case', default=False)
    
    notes = fields.Text('Notes & Comments')
    rejection_reason = fields.Text('Rejection Reason')

    @api.model
    def create(self, vals_list):
        """Handle both single and batch creates for Odoo 18.
        
        The @api.model_create_single decorator is deprecated in Odoo 18+.
        Expected completion dates are calculated based on visa type.
        """
        from datetime import timedelta
        
        if not isinstance(vals_list, list):
            vals_list = [vals_list]
        
        for vals in vals_list:
            if vals.get('name', 'New') == 'New':
                vals['name'] = self.env['ir.sequence'].next_by_code('uae.visa.processing')
            
            # Set expected completion date
            if not vals.get('expected_completion'):
                application_date = fields.Date.from_string(vals.get('application_date', fields.Date.today()))
                processing_days = 30 if vals.get('visa_type') == 'employment' else 45
                vals['expected_completion'] = application_date + timedelta(days=processing_days)
        
        return super().create(vals_list)

    @api.depends('passport_copy', 'passport_photo', 'educational_certificates',
                 'experience_certificates', 'medical_fitness', 'police_clearance',
                 'noc_letter', 'employment_contract')
    def _compute_documents_complete(self):
        for record in self:
            record.documents_complete = all([
                record.passport_copy,
                record.passport_photo,
                record.educational_certificates,
                record.experience_certificates,
                record.medical_fitness,
                record.police_clearance,
                record.noc_letter,
                record.employment_contract
            ])

    @api.depends('visa_cost', 'medical_cost', 'emirates_id_cost', 'other_costs')
    def _compute_total_cost(self):
        for record in self:
            record.total_cost = (
                (record.visa_cost or 0.0) +
                (record.medical_cost or 0.0) +
                (record.emirates_id_cost or 0.0) +
                (record.other_costs or 0.0)
            )

    @api.depends('application_date', 'actual_completion')
    def _compute_processing_days(self):
        for record in self:
            if record.application_date and record.actual_completion:
                delta = record.actual_completion - record.application_date
                record.processing_days = delta.days
            else:
                record.processing_days = 0

    def action_collect_documents(self):
        """Move to document collection stage"""
        self.write({'state': 'documents'})
        self._schedule_document_reminder()
        self.message_post(body=_('Moved to document collection stage'))

    def action_submit_to_immigration(self):
        """Submit visa application to immigration"""
        self.ensure_one()
        
        if not self.documents_complete:
            self.message_post(body=_('Warning: Not all documents are collected'))
        
        self.write({'state': 'submission'})
        self.message_post(body=_('Visa application submitted to immigration'))

    def action_schedule_medical(self):
        """Schedule medical examination"""
        self.write({'state': 'medical'})
        self.activity_schedule(
            'mail.mail_activity_data_todo',
            summary=_('Complete medical examination'),
            user_id=self.env.user.id
        )
        self.message_post(body=_('Medical examination scheduled'))

    def action_approve(self):
        """Approve visa and move to Emirates ID stage"""
        self.write({'state': 'emirates_id'})
        self.activity_schedule(
            'mail.mail_activity_data_todo',
            summary=_('Collect Emirates ID'),
            user_id=self.env.user.id
        )
        self.message_post(body=_('Visa approved - moving to Emirates ID stage'))

    def action_complete(self):
        """Mark visa processing as complete"""
        self.write({
            'state': 'completed',
            'actual_completion': fields.Date.today()
        })
        
        # Update placement visa status
        if self.placement_id:
            self.placement_id.write({'visa_status': 'completed'})
        
        # Update applicant visa status
        self.applicant_id.write({
            'visa_status': 'employment',
            'emirates_id': self.emirates_id_number
        })
        
        self.message_post(body=_('Visa processing completed successfully'))

    def action_reject(self):
        """Reject visa application"""
        self.write({'state': 'rejected'})
        self.message_post(body=_('Visa application rejected'))

    def action_cancel(self):
        """Cancel visa processing"""
        self.write({'state': 'cancelled'})
        self.message_post(body=_('Visa processing cancelled'))

    def action_mark_documents_complete(self):
        """Mark all documents as collected"""
        self.write({
            'passport_copy': True,
            'passport_photo': True,
            'educational_certificates': True,
            'experience_certificates': True,
            'medical_fitness': True,
            'police_clearance': True,
            'noc_letter': True,
            'employment_contract': True,
        })
        self.message_post(body=_('All documents marked as collected'))

    def _schedule_document_reminder(self):
        """Schedule activity reminder for document collection"""
        self.activity_schedule(
            'mail.mail_activity_data_todo',
            summary=_('Collect visa documents'),
            date_deadline=fields.Date.today() + timedelta(days=3),
            user_id=self.env.user.id
        )


class UAEVisaStage(models.Model):
    _name = 'uae.visa.stage'
    _description = 'Visa Processing Stage'
    _order = 'sequence'

    name = fields.Char('Stage Name', required=True)
    sequence = fields.Integer('Sequence', default=10)
    fold = fields.Boolean('Folded in Kanban', default=False)
    description = fields.Text('Description')
