# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError, UserError


class RecruitmentAgency(models.Model):
    _name = 'recruitment.agency'
    _description = 'Recruitment Agency'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name'

    # Basic Information
    name = fields.Char(string='Agency Name', required=True, tracking=True, index=True)
    code = fields.Char(string='Agency Code', required=True, copy=False, readonly=True, 
                       default=lambda self: _('New'), index=True)
    partner_id = fields.Many2one('res.partner', string='Partner', tracking=True)
    
    # Agency Details
    agency_type = fields.Selection([
        ('domestic', 'Domestic (UAE-based)'),
        ('international', 'International'),
        ('labor_supply', 'Labor Supply Agency'),
        ('recruitment_firm', 'Recruitment Firm'),
        ('manpower', 'Manpower Agency')
    ], string='Agency Type', required=True, default='international', tracking=True)
    
    specialization = fields.Selection([
        ('blue_collar', 'Blue Collar Workers'),
        ('white_collar', 'White Collar Professionals'),
        ('skilled_labor', 'Skilled Labor'),
        ('unskilled_labor', 'Unskilled Labor'),
        ('domestic_workers', 'Domestic Workers'),
        ('mixed', 'Mixed Recruitment')
    ], string='Specialization', default='blue_collar', tracking=True)
    
    # Contact Information
    contact_person = fields.Char(string='Contact Person', tracking=True)
    email = fields.Char(string='Email', tracking=True)
    phone = fields.Char(string='Phone', tracking=True)
    mobile = fields.Char(string='Mobile', tracking=True)
    website = fields.Char(string='Website')
    
    # Address
    street = fields.Char(string='Street')
    street2 = fields.Char(string='Street2')
    city = fields.Char(string='City')
    state_id = fields.Many2one('res.country.state', string='State')
    zip = fields.Char(string='ZIP')
    country_id = fields.Many2one('res.country', string='Country', required=True)
    
    # Source Countries (Countries they recruit from)
    source_country_ids = fields.Many2many(
        'res.country', 
        'agency_source_country_rel',
        'agency_id', 
        'country_id',
        string='Source Countries',
        help='Countries from which this agency recruits candidates'
    )
    
    # License & Compliance
    license_number = fields.Char(string='License Number', tracking=True)
    license_expiry_date = fields.Date(string='License Expiry Date', tracking=True)
    license_status = fields.Selection([
        ('valid', 'Valid'),
        ('expired', 'Expired'),
        ('pending_renewal', 'Pending Renewal'),
        ('suspended', 'Suspended')
    ], string='License Status', compute='_compute_license_status', store=True)
    
    mohre_registered = fields.Boolean(string='MOHRE Registered', default=False, tracking=True)
    mohre_registration_number = fields.Char(string='MOHRE Registration No.')
    
    # Performance Metrics
    candidate_count = fields.Integer(string='Total Candidates', compute='_compute_candidates')
    active_candidate_count = fields.Integer(string='Active Candidates', compute='_compute_candidates')
    deployed_count = fields.Integer(string='Deployed Candidates', compute='_compute_deployments')
    placement_success_rate = fields.Float(string='Placement Success Rate (%)', 
                                          compute='_compute_performance_metrics', store=True)
    
    # Financial
    currency_id = fields.Many2one('res.currency', string='Currency', 
                                  default=lambda self: self.env.company.currency_id)
    commission_rate = fields.Float(string='Commission Rate (%)', default=10.0)
    total_commission = fields.Monetary(string='Total Commission Earned', 
                                       compute='_compute_financial_metrics', currency_field='currency_id')
    outstanding_amount = fields.Monetary(string='Outstanding Amount', currency_field='currency_id')
    
    # Quality Ratings
    quality_rating = fields.Selection([
        ('1', '★ Poor'),
        ('2', '★★ Fair'),
        ('3', '★★★ Good'),
        ('4', '★★★★ Very Good'),
        ('5', '★★★★★ Excellent')
    ], string='Quality Rating', tracking=True)
    
    # Deployment Capabilities
    deployment_capacity = fields.Selection([
        ('small', 'Small (1-50 workers/month)'),
        ('medium', 'Medium (51-200 workers/month)'),
        ('large', 'Large (201-500 workers/month)'),
        ('enterprise', 'Enterprise (500+ workers/month)')
    ], string='Deployment Capacity', default='medium')
    
    average_deployment_time = fields.Integer(string='Avg Deployment Time (days)', 
                                             compute='_compute_deployment_metrics')
    
    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('blacklisted', 'Blacklisted'),
        ('terminated', 'Terminated')
    ], string='Status', default='draft', required=True, tracking=True)
    
    active = fields.Boolean(default=True)
    
    # Relationships
    candidate_ids = fields.One2many('hr.applicant', 'agency_id', string='Candidates')
    placement_ids = fields.One2many('recruitment.placement', 'agency_id', string='Placements')
    
    # Notes
    notes = fields.Text(string='Internal Notes')
    services_offered = fields.Text(string='Services Offered')
    
    # Dates
    onboarding_date = fields.Date(string='Onboarding Date', default=fields.Date.today)
    last_deployment_date = fields.Date(string='Last Deployment', compute='_compute_deployment_metrics')

    @api.model
    def create(self, vals):
        """Override create to generate agency code"""
        if vals.get('code', _('New')) == _('New'):
            vals['code'] = self.env['ir.sequence'].next_by_code('recruitment.agency') or _('New')
        return super(RecruitmentAgency, self).create(vals)

    @api.depends('license_expiry_date')
    def _compute_license_status(self):
        """Compute license status based on expiry date"""
        today = fields.Date.today()
        for record in self:
            if not record.license_expiry_date:
                record.license_status = 'pending_renewal'
            elif record.license_expiry_date < today:
                record.license_status = 'expired'
            elif record.license_expiry_date < (today + fields.timedelta(days=30)):
                record.license_status = 'pending_renewal'
            else:
                record.license_status = 'valid'

    def _compute_candidates(self):
        """Compute candidate counts"""
        for record in self:
            candidates = self.env['hr.applicant'].search([('agency_id', '=', record.id)])
            record.candidate_count = len(candidates)
            record.active_candidate_count = len(candidates.filtered(lambda c: c.active))

    def _compute_deployments(self):
        """Compute deployment counts"""
        for record in self:
            placements = self.env['recruitment.placement'].search([
                ('agency_id', '=', record.id),
                ('state', 'in', ['confirmed', 'completed'])
            ])
            record.deployed_count = len(placements)

    @api.depends('candidate_count', 'deployed_count')
    def _compute_performance_metrics(self):
        """Calculate placement success rate"""
        for record in self:
            if record.candidate_count > 0:
                record.placement_success_rate = (record.deployed_count / record.candidate_count) * 100
            else:
                record.placement_success_rate = 0.0

    def _compute_financial_metrics(self):
        """Calculate total commission from placements"""
        for record in self:
            placements = self.env['recruitment.placement'].search([
                ('agency_id', '=', record.id),
                ('state', 'in', ['confirmed', 'completed'])
            ])
            record.total_commission = sum(placements.mapped('commission_amount'))

    def _compute_deployment_metrics(self):
        """Calculate deployment metrics"""
        for record in self:
            placements = self.env['recruitment.placement'].search([
                ('agency_id', '=', record.id),
                ('state', 'in', ['confirmed', 'completed'])
            ], order='placement_date desc', limit=1)
            
            if placements:
                record.last_deployment_date = placements[0].placement_date
                
                # Calculate average deployment time
                all_placements = self.env['recruitment.placement'].search([
                    ('agency_id', '=', record.id),
                    ('state', 'in', ['confirmed', 'completed']),
                    ('placement_date', '!=', False)
                ])
                
                if all_placements:
                    total_days = 0
                    count = 0
                    for placement in all_placements:
                        if placement.applicant_id.submission_date and placement.placement_date:
                            days = (placement.placement_date - placement.applicant_id.submission_date).days
                            total_days += days
                            count += 1
                    
                    record.average_deployment_time = total_days / count if count > 0 else 0
                else:
                    record.average_deployment_time = 0
            else:
                record.last_deployment_date = False
                record.average_deployment_time = 0

    # Actions
    def action_activate(self):
        """Activate agency"""
        self.write({'state': 'active'})
        self.message_post(body=_('Agency activated'))

    def action_deactivate(self):
        """Deactivate agency"""
        self.write({'state': 'inactive'})
        self.message_post(body=_('Agency deactivated'))

    def action_blacklist(self):
        """Blacklist agency"""
        self.write({'state': 'blacklisted', 'active': False})
        self.message_post(body=_('Agency blacklisted'))

    def action_terminate(self):
        """Terminate relationship with agency"""
        self.write({'state': 'terminated', 'active': False})
        self.message_post(body=_('Agency relationship terminated'))

    def action_view_candidates(self):
        """View all candidates from this agency"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Candidates from {self.name}',
            'res_model': 'hr.applicant',
            'view_mode': 'tree,form',
            'domain': [('agency_id', '=', self.id)],
            'context': {'default_agency_id': self.id},
            'target': 'current',
        }

    def action_view_placements(self):
        """View all placements from this agency"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Placements from {self.name}',
            'res_model': 'recruitment.placement',
            'view_mode': 'tree,form',
            'domain': [('agency_id', '=', self.id)],
            'context': {'default_agency_id': self.id},
            'target': 'current',
        }

    @api.constrains('email')
    def _check_email(self):
        """Validate email format"""
        for record in self:
            if record.email and '@' not in record.email:
                raise ValidationError(_('Please enter a valid email address'))

    @api.constrains('license_number')
    def _check_license_unique(self):
        """Ensure license number is unique"""
        for record in self:
            if record.license_number:
                existing = self.search([
                    ('license_number', '=', record.license_number),
                    ('id', '!=', record.id)
                ])
                if existing:
                    raise ValidationError(_('License number must be unique. Agency "%s" already uses this license.') % existing[0].name)
