# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError
import json
import requests


class LLMProvider(models.Model):
    """LLM Provider Configuration"""
    _name = 'llm.provider'
    _description = 'LLM Provider Configuration'
    _order = 'sequence, name'

    # Basic Info
    name = fields.Char('Provider Name', required=True, unique=True)
    provider_type = fields.Selection([
        ('openai', 'OpenAI'),
        ('groq', 'Groq'),
        ('anthropic', 'Anthropic (Claude)'),
        ('cohere', 'Cohere'),
        ('custom', 'Custom API')
    ], required=True, tracking=True)
    
    sequence = fields.Integer('Sequence', default=10)
    active = fields.Boolean('Active', default=True)
    
    # API Configuration
    api_endpoint = fields.Char('API Endpoint', required=True, help='Base URL for API calls')
    api_key = fields.Char('API Key', required=True, help='Keep secure - never display')
    api_key_masked = fields.Char('API Key (Masked)', compute='_compute_api_key_masked', readonly=True)
    
    # Model Configuration
    default_model = fields.Char('Default Model', required=True, help='e.g., gpt-4o-mini, mixtral-8x7b-32768')
    model_ids = fields.One2many('llm.model', 'provider_id', 'Available Models')
    
    # Capabilities
    supports_resume_parsing = fields.Boolean('Resume Parsing', default=True)
    supports_matching = fields.Boolean('Candidate Matching', default=True)
    supports_interview_feedback = fields.Boolean('Interview Feedback', default=False)
    supports_offer_drafting = fields.Boolean('Offer Drafting', default=False)
    
    # Pricing & Limits
    cost_per_1k_tokens = fields.Float('Cost per 1K Tokens ($)', default=0.0, help='0.0 = Free tier')
    monthly_limit = fields.Float('Monthly Token Limit', default=0.0, help='0.0 = Unlimited')
    current_month_usage = fields.Float('Current Month Usage', compute='_compute_month_usage', readonly=True)
    usage_percentage = fields.Float('Usage %', compute='_compute_usage_percentage', readonly=True)
    
    # Status
    is_default = fields.Boolean('Default Provider', help='Use for resume parsing by default')
    is_available = fields.Boolean('Available', compute='_compute_is_available', readonly=True)
    last_test_date = fields.Datetime('Last Test Date')
    last_test_status = fields.Selection([
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('timeout', 'Timeout')
    ], readonly=True)
    
    # Notes
    notes = fields.Text('Notes')
    documentation_url = fields.Char('Documentation URL')

    @api.constrains('is_default')
    def _check_default_provider(self):
        """Ensure only one default provider"""
        for record in self:
            if record.is_default:
                other_defaults = self.search([
                    ('is_default', '=', True),
                    ('id', '!=', record.id)
                ])
                if other_defaults:
                    raise ValidationError(_('Only one default LLM provider allowed'))

    @api.depends('api_key')
    def _compute_api_key_masked(self):
        """Mask API key for display"""
        for record in self:
            if record.api_key:
                masked = record.api_key[:4] + '*' * (len(record.api_key) - 8) + record.api_key[-4:]
                record.api_key_masked = masked
            else:
                record.api_key_masked = ''

    @api.depends('model_ids')
    def _compute_month_usage(self):
        """Calculate current month token usage"""
        from datetime import datetime, date
        today = date.today()
        month_start = today.replace(day=1)
        
        for record in self:
            usage_logs = self.env['llm.usage.log'].search([
                ('provider_id', '=', record.id),
                ('usage_date', '>=', month_start),
                ('usage_date', '<=', today)
            ])
            record.current_month_usage = sum(log.tokens_used for log in usage_logs)

    @api.depends('current_month_usage', 'monthly_limit')
    def _compute_usage_percentage(self):
        """Calculate usage percentage"""
        for record in self:
            if record.monthly_limit > 0:
                record.usage_percentage = (record.current_month_usage / record.monthly_limit) * 100
            else:
                record.usage_percentage = 0.0

    @api.depends('active', 'api_key', 'api_endpoint')
    def _compute_is_available(self):
        """Check if provider is ready to use"""
        for record in self:
            record.is_available = bool(
                record.active and 
                record.api_key and 
                record.api_endpoint
            )

    def test_connection(self):
        """Test API connection"""
        self.ensure_one()
        
        try:
            if self.provider_type == 'openai':
                response = requests.get(
                    'https://api.openai.com/v1/models',
                    headers={'Authorization': f'Bearer {self.api_key}'},
                    timeout=10
                )
            elif self.provider_type == 'groq':
                response = requests.get(
                    'https://api.groq.com/openai/v1/models',
                    headers={'Authorization': f'Bearer {self.api_key}'},
                    timeout=10
                )
            else:
                response = requests.get(
                    self.api_endpoint,
                    headers={'Authorization': f'Bearer {self.api_key}'},
                    timeout=10
                )
            
            if response.status_code == 200:
                self.write({
                    'last_test_date': fields.Datetime.now(),
                    'last_test_status': 'success'
                })
                return {
                    'type': 'ir.actions.client',
                    'tag': 'display_notification',
                    'params': {
                        'title': _('Success'),
                        'message': _('LLM provider connection successful'),
                        'type': 'success',
                        'sticky': False,
                    }
                }
            else:
                self.write({
                    'last_test_date': fields.Datetime.now(),
                    'last_test_status': 'failed'
                })
                raise ValidationError(_('API responded with error: %s') % response.status_code)
        
        except requests.Timeout:
            self.write({
                'last_test_date': fields.Datetime.now(),
                'last_test_status': 'timeout'
            })
            raise ValidationError(_('Connection timeout'))
        except Exception as e:
            raise ValidationError(_('Connection failed: %s') % str(e))

    def get_completion(self, messages, temperature=0.3, max_tokens=1000):
        """Get completion from this provider"""
        self.ensure_one()
        
        try:
            if self.provider_type == 'openai':
                return self._get_openai_completion(messages, temperature, max_tokens)
            elif self.provider_type == 'groq':
                return self._get_groq_completion(messages, temperature, max_tokens)
            elif self.provider_type == 'anthropic':
                return self._get_anthropic_completion(messages, temperature, max_tokens)
            else:
                return self._get_custom_completion(messages, temperature, max_tokens)
        
        except Exception as e:
            # Log error and fallback
            self.env['llm.error.log'].create({
                'provider_id': self.id,
                'error_type': 'completion_error',
                'error_message': str(e)
            })
            raise

    def _get_openai_completion(self, messages, temperature, max_tokens):
        """OpenAI API call"""
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': self.default_model,
                'messages': messages,
                'temperature': temperature,
                'max_tokens': max_tokens
            },
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f'OpenAI API error: {response.text}')
        
        data = response.json()
        tokens_used = data.get('usage', {}).get('total_tokens', 0)
        content = data['choices'][0]['message']['content']
        
        # Log usage
        self.env['llm.usage.log'].create({
            'provider_id': self.id,
            'tokens_used': tokens_used,
            'cost': (tokens_used / 1000) * self.cost_per_1k_tokens
        })
        
        return content

    def _get_groq_completion(self, messages, temperature, max_tokens):
        """Groq API call (Free tier)"""
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': self.default_model,  # e.g., mixtral-8x7b-32768
                'messages': messages,
                'temperature': temperature,
                'max_tokens': max_tokens
            },
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f'Groq API error: {response.text}')
        
        data = response.json()
        tokens_used = data.get('usage', {}).get('total_tokens', 0)
        content = data['choices'][0]['message']['content']
        
        # Log usage (Groq free tier: no cost)
        self.env['llm.usage.log'].create({
            'provider_id': self.id,
            'tokens_used': tokens_used,
            'cost': 0.0  # Free tier
        })
        
        return content

    def _get_anthropic_completion(self, messages, temperature, max_tokens):
        """Anthropic Claude API call"""
        # Convert to Anthropic format
        system_msg = next((m['content'] for m in messages if m['role'] == 'system'), '')
        user_messages = [m for m in messages if m['role'] != 'system']
        
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers={
                'x-api-key': self.api_key,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            json={
                'model': self.default_model,  # e.g., claude-3-haiku-20240307
                'max_tokens': max_tokens,
                'temperature': temperature,
                'system': system_msg,
                'messages': user_messages
            },
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f'Anthropic API error: {response.text}')
        
        data = response.json()
        tokens_used = data.get('usage', {}).get('input_tokens', 0) + data.get('usage', {}).get('output_tokens', 0)
        content = data['content'][0]['text']
        
        # Log usage
        self.env['llm.usage.log'].create({
            'provider_id': self.id,
            'tokens_used': tokens_used,
            'cost': (tokens_used / 1000) * self.cost_per_1k_tokens
        })
        
        return content

    def _get_custom_completion(self, messages, temperature, max_tokens):
        """Custom API implementation"""
        response = requests.post(
            self.api_endpoint,
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': self.default_model,
                'messages': messages,
                'temperature': temperature,
                'max_tokens': max_tokens
            },
            timeout=30
        )
        
        if response.status_code != 200:
            raise Exception(f'API error: {response.text}')
        
        data = response.json()
        return data.get('choices', [{}])[0].get('message', {}).get('content', '')

    def action_view_usage_logs(self):
        """Open usage logs for this provider"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Usage Logs',
            'res_model': 'llm.usage.log',
            'view_mode': 'list,form',
            'domain': [('provider_id', '=', self.id)],
            'context': {'default_provider_id': self.id}
        }

    def action_view_errors(self):
        """Open error logs for this provider"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Error Logs',
            'res_model': 'llm.error.log',
            'view_mode': 'list,form',
            'domain': [('provider_id', '=', self.id)],
            'context': {'default_provider_id': self.id}
        }


class LLMModel(models.Model):
    """Available models per provider"""
    _name = 'llm.model'
    _description = 'LLM Model'
    _order = 'sequence, name'

    name = fields.Char('Model Name', required=True)
    provider_id = fields.Many2one('llm.provider', required=True, ondelete='cascade')
    model_id = fields.Char('Model ID', required=True, help='API model identifier')
    
    context_window = fields.Integer('Context Window', help='Max tokens in context')
    max_output_tokens = fields.Integer('Max Output Tokens', default=4096)
    
    cost_per_1k_input = fields.Float('Cost per 1K Input Tokens ($)', default=0.0)
    cost_per_1k_output = fields.Float('Cost per 1K Output Tokens ($)', default=0.0)
    
    capabilities = fields.Many2many('llm.capability', string='Capabilities')
    sequence = fields.Integer('Sequence', default=10)
    active = fields.Boolean('Active', default=True)


class LLMCapability(models.Model):
    """LLM Capabilities/Features"""
    _name = 'llm.capability'
    _description = 'LLM Capability'

    name = fields.Char('Capability', required=True, unique=True)
    description = fields.Text('Description')


class LLMUsageLog(models.Model):
    """Track LLM API usage for cost monitoring"""
    _name = 'llm.usage.log'
    _description = 'LLM Usage Log'
    _order = 'usage_date desc'

    provider_id = fields.Many2one('llm.provider', required=True, ondelete='cascade')
    usage_date = fields.Date('Date', default=fields.Date.today)
    tokens_used = fields.Integer('Tokens Used', required=True)
    cost = fields.Float('Cost ($)', default=0.0)
    
    request_type = fields.Selection([
        ('resume_parsing', 'Resume Parsing'),
        ('candidate_matching', 'Candidate Matching'),
        ('interview_feedback', 'Interview Feedback'),
        ('offer_drafting', 'Offer Drafting'),
        ('other', 'Other')
    ], default='other')
    
    model_used = fields.Char('Model Used')
    context = fields.Char('Context')  # e.g., applicant ID, job order ID
    
    def _auto_delete_old_logs(self):
        """Keep only 90 days of logs"""
        from datetime import date, timedelta
        cutoff_date = date.today() - timedelta(days=90)
        self.search([('usage_date', '<', cutoff_date)]).unlink()


class LLMErrorLog(models.Model):
    """Track LLM API errors for debugging"""
    _name = 'llm.error.log'
    _description = 'LLM Error Log'
    _order = 'create_date desc'

    provider_id = fields.Many2one('llm.provider', ondelete='cascade')
    error_type = fields.Selection([
        ('connection_error', 'Connection Error'),
        ('auth_error', 'Authentication Error'),
        ('timeout', 'Timeout'),
        ('rate_limit', 'Rate Limit'),
        ('completion_error', 'Completion Error'),
        ('other', 'Other')
    ], required=True)
    
    error_message = fields.Text('Error Message', required=True)
    request_data = fields.Text('Request Data')
    response_data = fields.Text('Response Data')
    
    resolved = fields.Boolean('Resolved', default=False)
    resolution_notes = fields.Text('Resolution Notes')

