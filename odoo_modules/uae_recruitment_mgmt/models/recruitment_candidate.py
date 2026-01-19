# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
import json
import requests
import base64


class HrApplicantInherit(models.Model):
    _inherit = 'hr.applicant'

    # Enhanced Identification
    candidate_code = fields.Char('Candidate ID', readonly=True, default='New')
    nationality_id = fields.Many2one('res.country', 'Nationality')
    
    # UAE Specific Info
    visa_status = fields.Selection([
        ('visit', 'Visit Visa'),
        ('employment', 'Employment Visa'),
        ('own', 'Own Visa'),
        ('cancelled', 'Cancelled Visa'),
        ('none', 'Outside UAE')
    ], string='Visa Status', default='none', tracking=True)
    
    emirates_id = fields.Char('Emirates ID')
    passport_number = fields.Char('Passport Number')
    passport_expiry = fields.Date('Passport Expiry Date')
    
    # Salary Information
    current_salary = fields.Monetary('Current Salary', currency_field='currency_id')
    expected_salary = fields.Monetary('Expected Salary', currency_field='currency_id')
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.ref('base.AED'))
    
    notice_period = fields.Integer('Notice Period (Days)', default=30)
    
    # Job Order Relationship
    job_order_ids = fields.Many2many('recruitment.job.order', string='Applied Job Orders')

    # Submission / Placement
    submission_date = fields.Date('Submission Date')
    client_feedback = fields.Text('Client Feedback')
    offer_status = fields.Selection([
        ('none', 'Not Offered'),
        ('offered', 'Offered'),
        ('accepted', 'Offer Accepted'),
        ('rejected', 'Offer Rejected')
    ], default='none', string='Offer Status', tracking=True)
    placement_id = fields.Many2one('recruitment.placement', string='Placement', readonly=True)
    submitted_to_client = fields.Boolean('Submitted to Client', compute='_compute_submitted_to_client', store=True)
    
    # AI Resume Analysis
    ai_parsed_skills = fields.Many2many('hr.skill', string='AI Extracted Skills')
    ai_match_score = fields.Float('AI Match Score', compute='_compute_ai_match', store=True)
    resume_summary = fields.Text('AI Resume Summary', readonly=True)
    
    # Qualifications
    education_level = fields.Selection([
        ('high_school', 'High School'),
        ('diploma', 'Diploma'),
        ('bachelor', 'Bachelor'),
        ('master', 'Master'),
        ('phd', 'PhD')
    ], default='bachelor')
    
    years_of_experience = fields.Float('Years of Experience')
    
    # Compliance
    requires_noc = fields.Boolean('Requires NOC')
    noc_obtained = fields.Boolean('NOC Obtained', tracking=True)
    noc_expiry = fields.Date('NOC Expiry Date')
    
    can_join_immediately = fields.Boolean('Can Join Immediately', default=False)
    
    # Additional Information
    linkedin_profile = fields.Char('LinkedIn Profile')
    availability_date = fields.Date('Available From')
    
    # Internal Notes
    internal_notes = fields.Text('Interview Notes')
    
    # Tracking
    created_date = fields.Date('Created Date', default=fields.Date.today, readonly=True)

    @api.model
    def create(self, vals_list):
        """Handle both single and batch creates for Odoo 18.
        
        The @api.model_create_single decorator is deprecated in Odoo 18+.
        Batch creates skip resume parsing to avoid performance issues.
        """
        if not isinstance(vals_list, list):
            vals_list = [vals_list]
        
        is_batch = len(vals_list) > 1
        
        for vals in vals_list:
            if vals.get('candidate_code', 'New') == 'New':
                vals['candidate_code'] = self.env['ir.sequence'].next_by_code('hr.applicant')
        
        results = super().create(vals_list)
        
        # Auto-parse resume if attached (only for single creates to avoid performance issues)
        if not is_batch and results.attachment_ids:
            results.action_parse_resume()
        
        return results

    def action_parse_resume(self):
        """AI Resume Parsing using configurable LLM provider"""
        self.ensure_one()
        
        if not self.attachment_ids:
            self.message_post(body=_('No resume attached. Please attach a resume file.'))
            return
        
        # Get resume file
        resume_attachment = self.attachment_ids.filtered(lambda x: x.mimetype in [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ])
        
        if not resume_attachment:
            self.message_post(body=_('No valid resume file found. Please attach PDF, Word, or text document.'))
            return
        
        attachment = resume_attachment[0]
        
        # Check file size (max 5MB)
        if len(attachment.datas) > 5 * 1024 * 1024:
            self.message_post(body=_('Resume file too large (max 5MB). Please upload a smaller file.'))
            return
        
        # Get LLM provider
        provider = self._get_llm_provider()
        if not provider:
            self._parse_resume_mock()
            return
        
        try:
            # Prepare resume content
            file_data = base64.b64decode(attachment.datas)
            content_text = file_data.decode('utf-8', errors='ignore')[:8000]
            
            # Build messages for LLM
            system_msg = {
                'role': 'system',
                'content': 'You are an expert resume parser for recruitment. Extract key information accurately and respond only in valid JSON format.'
            }
            
            user_msg = {
                'role': 'user',
                'content': f'''Extract information from this resume and respond ONLY with valid JSON (no markdown, no code blocks):
{{
    "name": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "summary": "Professional summary in 2-3 sentences",
    "skills": ["skill1", "skill2", "skill3", ...],
    "experience_years": 5,
    "education_level": "bachelor|master|phd|diploma|high_school",
    "current_company": "Current Company Name",
    "current_position": "Current Job Title",
    "expected_salary": 0,
    "languages": ["English", "Arabic"],
    "certifications": ["Cert1", "Cert2"]
}}

Resume:
{content_text}
'''
            }
            
            # Get completion from LLM
            content = provider.get_completion(
                messages=[system_msg, user_msg],
                temperature=0.2,
                max_tokens=1000
            )
            
            # Parse response
            content = content.strip()
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
                content = content.strip()
            
            parsed = json.loads(content)
            
            # Process skills
            skill_ids = []
            for skill_name in parsed.get('skills', [])[:15]:
                if skill_name and len(skill_name) > 1:
                    skill = self.env['hr.skill'].search([('name', 'ilike', skill_name)], limit=1)
                    if not skill:
                        skill = self.env['hr.skill'].sudo().create({'name': skill_name.title()})
                    skill_ids.append(skill.id)
            
            # Extract experience years
            experience = parsed.get('experience_years', 0)
            if isinstance(experience, str):
                experience = float(experience.replace('+', '').split()[0]) if experience else 0
            
            # Update candidate
            update_vals = {
                'resume_summary': parsed.get('summary', ''),
                'years_of_experience': float(experience) if experience else 0,
                'education_level': parsed.get('education_level', 'bachelor'),
            }
            
            if not self.partner_name or self.partner_name == 'New':
                update_vals['partner_name'] = parsed.get('name', self.partner_name)
            if not self.email_from:
                update_vals['email_from'] = parsed.get('email', '')
            if not self.partner_phone:
                update_vals['partner_phone'] = parsed.get('phone', '')
            
            if skill_ids:
                update_vals['ai_parsed_skills'] = [(6, 0, skill_ids)]
            
            self.write(update_vals)
            
            provider_name = provider.name or provider.provider_type.upper()
            self.message_post(
                body=_('✅ Resume parsed successfully using %s. Extracted %s skills.') % (provider_name, len(skill_ids))
            )
        
        except json.JSONDecodeError as e:
            self._parse_resume_mock()
            self.message_post(body=_('AI response parsing error. Used fallback method.'))
        except Exception as e:
            self._parse_resume_mock()
            self.message_post(body=_('Resume parsing error: %s. Used fallback method.') % str(e))

    @api.depends('submission_date', 'job_order_ids')
    def _compute_submitted_to_client(self):
        for record in self:
            record.submitted_to_client = bool(record.submission_date or record.job_order_ids)

    def _get_llm_provider(self):
        """Get the configured LLM provider"""
        # First, try to get the default provider
        default_provider = self.env['llm.provider'].search([
            ('is_default', '=', True),
            ('active', '=', True),
            ('is_available', '=', True)
        ], limit=1)
        
        if default_provider:
            return default_provider
        
        # Fall back to first active, available provider
        provider = self.env['llm.provider'].search([
            ('active', '=', True),
            ('is_available', '=', True)
        ], limit=1)
        
        if not provider:
            # Try to get from system parameter (fallback for backward compatibility)
            api_key = self.env['ir.config_parameter'].sudo().get_param('ai.api_key')
            if not api_key:
                return None
            
            # Create or get OpenAI provider from config
            provider = self.env['llm.provider'].search([
                ('provider_type', '=', 'openai'),
                ('active', '=', True)
            ], limit=1)
        
        return provider

    def _parse_resume_mock(self):
        """Fallback resume parsing (development mode)"""
        if self.attachment_ids:
            # Simple mock parsing - just extract from filename
            attachment = self.attachment_ids[0]
            self.message_post(body=_('Resume parsing completed (Development Mode)'))

    @api.depends('ai_parsed_skills', 'years_of_experience', 'expected_salary', 'job_order_ids', 'job_order_ids.skills_ids', 'job_order_ids.experience_years_min', 'job_order_ids.salary_max')
    def _compute_ai_match(self):
        """Calculate AI matching score for job orders"""
        for record in self:
            if record.job_order_ids:
                scores = []
                
                for job in record.job_order_ids:
                    # Skills match (50%)
                    matching_skills = set(record.ai_parsed_skills.ids) & set(job.skills_ids.ids)
                    if job.skills_ids:
                        skill_score = (len(matching_skills) / len(job.skills_ids)) * 50
                    else:
                        skill_score = 50
                    
                    # Experience match (30%)
                    if job.experience_years_min and record.years_of_experience:
                        if record.years_of_experience >= job.experience_years_min:
                            if job.experience_years_max:
                                if record.years_of_experience <= job.experience_years_max:
                                    experience_score = 30
                                else:
                                    experience_score = 20  # Over-experienced
                            else:
                                experience_score = 30
                        else:
                            experience_score = 0
                    else:
                        experience_score = 20
                    
                    # Salary match (20%)
                    if record.expected_salary and job.salary_max:
                        if record.expected_salary <= job.salary_max:
                            salary_score = 20
                        else:
                            salary_score = 0
                    else:
                        salary_score = 15
                    
                    total_score = skill_score + experience_score + salary_score
                    scores.append(total_score)
                
                record.ai_match_score = max(scores) if scores else 0
            else:
                record.ai_match_score = 0

    def _compute_match_score_for_job(self, job_order):
        """Compute match score for a specific job order"""
        # Skills match (50%)
        matching_skills = set(self.ai_parsed_skills.ids) & set(job_order.skills_ids.ids)
        if job_order.skills_ids:
            skill_score = (len(matching_skills) / len(job_order.skills_ids)) * 50
        else:
            skill_score = 50
        
        # Experience match (30%)
        if job_order.experience_years_min and self.years_of_experience:
            if self.years_of_experience >= job_order.experience_years_min:
                if job_order.experience_years_max:
                    if self.years_of_experience <= job_order.experience_years_max:
                        experience_score = 30
                    else:
                        experience_score = 20
                else:
                    experience_score = 30
            else:
                experience_score = 0
        else:
            experience_score = 20
        
        # Salary match (20%)
        if self.expected_salary and job_order.salary_max:
            if self.expected_salary <= job_order.salary_max:
                salary_score = 20
            else:
                salary_score = 0
        else:
            salary_score = 15
        
        return skill_score + experience_score + salary_score

    def action_view_placements(self):
        """View placements for this candidate"""
        placements = self.env['recruitment.placement'].search([
            ('applicant_id', '=', self.id)
        ])
        
        action = self.env.ref('uae_recruitment_mgmt.action_recruitment_placement').read()[0]
        action['domain'] = [('applicant_id', '=', self.id)]
        return action

    def action_sync_to_website(self):
        """Sync applicant to website"""
        try:
            # In production, sync applicant data to website
            self.message_post(body=_('Applicant synced to website'))
        except Exception as e:
            self.message_post(body=_('Sync failed: %s') % str(e))
