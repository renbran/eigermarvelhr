# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError
from datetime import datetime, timedelta


class RecruitmentJobOrder(models.Model):
    _name = 'recruitment.job.order'
    _description = 'Job Order / Job Requisition'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    # Basic Info
    name = fields.Char('Job Title', required=True, tracking=True)
    reference = fields.Char('Reference', default='New', readonly=True, copy=False)
    client_id = fields.Many2one('recruitment.client', 'Client', required=True, tracking=True)
    description = fields.Html('Job Description', required=True)
    
    # Job Details
    job_level = fields.Selection([
        ('entry', 'Entry Level'),
        ('junior', 'Junior'),
        ('mid', 'Mid-Level'),
        ('senior', 'Senior'),
        ('lead', 'Team Lead'),
        ('manager', 'Manager'),
        ('director', 'Director'),
        ('c_level', 'C-Level')
    ], default='mid', required=True)
    
    # category_id = fields.Many2one('hr.job.category', 'Job Category')  # TODO: Model not in Odoo 18
    department_id = fields.Many2one('hr.department', 'Department')
    
    # Requirements
    skills_ids = fields.Many2many('hr.skill', string='Required Skills')
    experience_years_min = fields.Integer('Minimum Experience (Years)', default=0)
    experience_years_max = fields.Integer('Maximum Experience (Years)', default=10)
    
    languages = fields.Char('Languages Required')
    certifications = fields.Char('Certifications Required')
    education_level = fields.Selection([
        ('high_school', 'High School'),
        ('diploma', 'Diploma'),
        ('bachelor', 'Bachelor'),
        ('master', 'Master'),
        ('phd', 'PhD')
    ], default='bachelor')
    
    # Positions
    positions_required = fields.Integer('Positions Required', default=1, required=True)
    positions_filled = fields.Integer('Positions Filled', compute='_compute_positions_filled')
    positions_remaining = fields.Integer('Positions Remaining', compute='_compute_positions_remaining')
    
    # Salary & Benefits
    salary_min = fields.Monetary('Minimum Salary', currency_field='currency_id')
    salary_max = fields.Monetary('Maximum Salary', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.ref('base.AED'))
    benefits = fields.Text('Benefits & Allowances')
    
    # Timeline
    created_date = fields.Date('Created Date', default=fields.Date.today)
    requested_completion_date = fields.Date('Requested Completion Date')
    closing_date = fields.Date('Job Closing Date')
    
    actual_closing_date = fields.Date('Actual Closing Date')
    days_to_fill = fields.Integer('Days to Fill', compute='_compute_days_to_fill')
    
    # Location
    location = fields.Char('Work Location', required=True)
    work_type = fields.Selection([
        ('on_site', 'On-Site'),
        ('remote', 'Remote'),
        ('hybrid', 'Hybrid')
    ], default='on_site')
    
    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('posted', 'Posted'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('filled', 'Filled'),
        ('closed', 'Closed'),
        ('cancelled', 'Cancelled')
    ], default='draft', tracking=True)
    
    # Candidates
    applicant_ids = fields.One2many('hr.applicant', 'job_id', 'Applicants')
    applicant_count = fields.Integer('Total Applicants', compute='_compute_applicant_count')
    
    # AI Matching
    ai_matching_enabled = fields.Boolean('Enable AI Matching', default=True)
    ai_match_threshold = fields.Float('AI Match Threshold (%)', default=70.0)
    
    # Company & Visa
    company_id = fields.Many2one('res.company', 'Company', default=lambda self: self.env.company)
    visa_sponsorship = fields.Boolean('Visa Sponsorship Available', default=True)
    visa_type = fields.Selection([
        ('employment', 'Employment Visa'),
        ('investor', 'Investor Visa'),
        ('golden', 'Golden Visa'),
        ('no_sponsorship', 'No Sponsorship')
    ], default='employment')
    
    # Internal Notes
    internal_notes = fields.Text('Internal Notes')
    source = fields.Char('Job Source/Portal')
    
    # Website Sync
    website_published = fields.Boolean('Published on Website', default=False, tracking=True)
    website_id = fields.Char('Website ID', readonly=True)
    sync_status = fields.Selection([
        ('not_synced', 'Not Synced'),
        ('synced', 'Synced'),
        ('out_of_sync', 'Out of Sync'),
        ('error', 'Sync Error')
    ], default='not_synced', readonly=True)
    last_sync_date = fields.Datetime('Last Sync Date', readonly=True)

    @api.model
    def create(self, vals_list):
        """Handle both single and batch creates properly for Odoo 18.
        
        The @api.model_create_single decorator is deprecated in Odoo 18+.
        This method handles both single dict and list of dicts.
        """
        if not isinstance(vals_list, list):
            vals_list = [vals_list]
        
        for vals in vals_list:
            if vals.get('reference', 'New') == 'New':
                vals['reference'] = self.env['ir.sequence'].next_by_code('recruitment.job.order')
        
        return super().create(vals_list)

    @api.constrains('positions_required')
    def _check_positions_required(self):
        """Ensure positions required is at least 1"""
        for record in self:
            if record.positions_required < 1:
                raise ValidationError(_('Positions required must be at least 1'))

    @api.constrains('salary_min', 'salary_max')
    def _check_salary_range(self):
        """Ensure salary min is less than max"""
        for record in self:
            if record.salary_min and record.salary_max:
                if record.salary_min > record.salary_max:
                    raise ValidationError(_('Minimum salary cannot be greater than maximum'))

    @api.depends('applicant_ids')
    def _compute_positions_filled(self):
        for record in self:
            record.positions_filled = len(record.applicant_ids.filtered(
                lambda x: x.stage_id.name in ['Hired', 'Approved']
            ))

    @api.depends('positions_required', 'positions_filled')
    def _compute_positions_remaining(self):
        for record in self:
            record.positions_remaining = max(0, record.positions_required - record.positions_filled)

    @api.depends('applicant_ids')
    def _compute_applicant_count(self):
        for record in self:
            record.applicant_count = len(record.applicant_ids)

    @api.depends('created_date', 'actual_closing_date')
    def _compute_days_to_fill(self):
        for record in self:
            if record.created_date and record.actual_closing_date:
                delta = record.actual_closing_date - record.created_date
                record.days_to_fill = delta.days
            else:
                record.days_to_fill = 0

    def action_post(self):
        """Post job order - make it active"""
        self.write({'state': 'posted'})
        self.action_sync_to_website()
        self.message_post(body=_('Job order posted'))

    def action_activate(self):
        """Activate job order - start accepting applications"""
        self.write({'state': 'active'})
        self.action_sync_to_website()
        self.message_post(body=_('Job order activated'))

    def action_hold(self):
        """Put job order on hold"""
        self.write({'state': 'on_hold'})
        self.message_post(body=_('Job order put on hold'))

    def action_close(self):
        """Close job order"""
        self.write({
            'state': 'closed',
            'actual_closing_date': fields.Date.today()
        })
        self.message_post(body=_('Job order closed'))

    def action_reopen(self):
        """Reopen closed job order"""
        self.write({'state': 'active'})
        self.message_post(body=_('Job order reopened'))

    def action_cancel(self):
        """Cancel job order"""
        self.write({'state': 'cancelled'})
        self.message_post(body=_('Job order cancelled'))

    def action_cancel_job(self):
        """Cancel job order (alias for cancel)"""
        return self.action_cancel()

    def action_set_to_draft(self):
        """Set job order back to draft"""
        self.write({'state': 'draft'})
        self.message_post(body=_('Job order set back to draft'))

    def action_sync_to_website(self):
        """Sync job order to website"""
        for record in self:
            # Read configuration once per record to avoid noisy exceptions
            api_url = self.env['ir.config_parameter'].sudo().get_param('website.url')
            api_key = self.env['ir.config_parameter'].sudo().get_param('website.api_key')

            # Fast-fail if configuration is missing; do not raise to users
            if not api_url or not api_key:
                record.write({
                    'sync_status': 'error',
                    'last_sync_date': fields.Datetime.now()
                })
                record.message_post(
                    body=_('Website sync skipped: Website API not configured'),
                    message_type='comment'
                )
                continue

            try:
                # Prepare job data
                job_data = {
                    'title': record.name,
                    'description': record.description,
                    'location': record.location,
                    'salary_min': record.salary_min,
                    'salary_max': record.salary_max,
                    'job_level': record.job_level,
                    'skills': [skill.name for skill in record.skills_ids],
                    'experience_years': f"{record.experience_years_min}-{record.experience_years_max}",
                    'visa_sponsorship': record.visa_sponsorship,
                    'work_type': record.work_type,
                    'company': record.client_id.name,
                    'external_id': record.id,
                    'status': 'active' if record.state == 'active' else 'draft'
                }
                
                # Make API call to website
                import requests
                if record.website_id:
                    # Update existing job
                    response = requests.put(
                        f'{api_url}/api/jobs/{record.website_id}',
                        json=job_data,
                        headers={'Authorization': f'Bearer {api_key}'},
                        timeout=10
                    )
                else:
                    # Create new job
                    response = requests.post(
                        f'{api_url}/api/jobs',
                        json=job_data,
                        headers={'Authorization': f'Bearer {api_key}'},
                        timeout=10
                    )
                    
                    if response.status_code in [200, 201]:
                        website_id = response.json().get('id')
                        record.website_id = str(website_id)
                
                record.write({
                    'website_published': True,
                    'sync_status': 'synced',
                    'last_sync_date': fields.Datetime.now()
                })
                record.message_post(body=_('Job order synced to website'))
            
            except Exception as e:
                record.write({
                    'sync_status': 'error',
                    'last_sync_date': fields.Datetime.now()
                })
                # Post a plain comment without subtype to avoid mail.thread validation errors on Odoo 18+
                record.message_post(
                    body=_('Website sync failed: %s') % str(e),
                    message_type='comment'
                )

    def action_find_matching_candidates(self):
        """Find AI-matched candidates for this job order with improved matching algorithm"""
        if not self.ai_matching_enabled:
            return
        
        # Get all active applicants
        all_applicants = self.env['hr.applicant'].search([
            '|', ('job_id', '=', False), ('job_id', '=', self.id),
            ('active', '=', True)
        ])
        
        # Score each applicant
        matches = []
        for applicant in all_applicants:
            score = applicant._compute_match_score_for_job(self)
            if score >= self.ai_match_threshold:
                matches.append({
                    'applicant': applicant,
                    'score': score,
                    'skills_match': self._calculate_skills_match(applicant),
                    'experience_match': self._calculate_experience_match(applicant),
                    'salary_match': self._calculate_salary_match(applicant)
                })
        
        # Sort by score
        matches.sort(key=lambda x: x['score'], reverse=True)
        
        # Create activities for top matches
        top_matches = matches[:10]  # Top 10 matches
        
        if top_matches:
            # Create a summary activity
            match_summary = []
            for match in top_matches[:5]:
                match_summary.append(
                    f"• {match['applicant'].partner_name} - Score: {match['score']:.0f}% "
                    f"(Skills: {match['skills_match']:.0f}%, Exp: {match['experience_match']:.0f}%, "
                    f"Salary: {match['salary_match']:.0f}%)"
                )
            
            self.activity_schedule(
                'mail.mail_activity_data_todo',
                summary=_('Found %s matching candidates for %s') % (len(top_matches), self.name),
                note='\n'.join(match_summary),
                user_id=self.create_uid.id
            )
            
            # Log the matches
            self.message_post(
                body=_('AI Matching completed: Found %s candidates above %s%% threshold') % (
                    len(top_matches), self.ai_match_threshold
                ),
                subject='AI Candidate Matching'
            )
        else:
            self.message_post(
                body=_('No candidates found matching the threshold of %s%%') % self.ai_match_threshold
            )
        
        return {
            'type': 'ir.actions.act_window',
            'name': _('Matched Candidates'),
            'res_model': 'hr.applicant',
            'view_mode': 'list,form',
            'domain': [('id', 'in', [m['applicant'].id for m in top_matches])],
            'context': {'default_job_id': self.id}
        }
    
    def _calculate_skills_match(self, applicant):
        """Calculate skills match percentage"""
        if not self.skills_ids:
            return 50.0
        
        matching_skills = set(applicant.ai_parsed_skills.ids) & set(self.skills_ids.ids)
        return (len(matching_skills) / len(self.skills_ids)) * 100 if self.skills_ids else 50.0
    
    def _calculate_experience_match(self, applicant):
        """Calculate experience match percentage"""
        if not self.experience_years_min:
            return 30.0
        
        if applicant.years_of_experience >= self.experience_years_min:
            if self.experience_years_max and applicant.years_of_experience > self.experience_years_max:
                return 20.0  # Over-qualified
            return 30.0
        else:
            # Partial credit if close
            if applicant.years_of_experience >= (self.experience_years_min - 1):
                return 15.0
            return 0.0
    
    def _calculate_salary_match(self, applicant):
        """Calculate salary match percentage"""
        if not applicant.expected_salary or not self.salary_max:
            return 15.0
        
        if applicant.expected_salary <= self.salary_max:
            return 20.0
        elif applicant.expected_salary <= (self.salary_max * 1.1):
            return 10.0  # Within 10% over
        return 0.0

    def action_view_applicants(self):
        """View all applicants for this job"""
        action = self.env.ref('hr_recruitment.hr_applicant_action').read()[0]
        action['domain'] = [('job_id', '=', self.id)]
        action['context'] = {'default_job_id': self.id}
        return action
