# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError, UserError
import requests
import json


class RecruitmentClient(models.Model):
    _name = 'recruitment.client'
    _description = 'Recruitment Client'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'

    # Basic Info
    name = fields.Char('Client Name', required=True, tracking=True)
    reference = fields.Char('Client Reference', default='New', readonly=True, copy=False)
    partner_id = fields.Many2one('res.partner', 'Partner', required=True, ondelete='restrict')
    active = fields.Boolean('Active', default=True, tracking=True)

    # Registration Details
    trade_license_number = fields.Char('Trade License Number', required=True, tracking=True)
    trade_license_expiry = fields.Date('License Expiry Date')
    entity_type = fields.Selection([
        ('mainland', 'Mainland'),
        ('freezone', 'Free Zone'),
        ('deira', 'Deira Dubai'),
        ('jafza', 'JAFZA'),
        ('other', 'Other')
    ], default='mainland', required=True, tracking=True)
    
    # DED Verification
    ded_verified = fields.Boolean('DED Verified', readonly=True, tracking=True)
    ded_verification_date = fields.Datetime('DED Verification Date', readonly=True)
    ded_verification_result = fields.Text('DED Verification Result', readonly=True)
    
    # Contact Information
    contact_person = fields.Char('Contact Person', tracking=True)
    phone = fields.Char('Phone Number')
    email = fields.Char('Email', required=True)
    website = fields.Char('Website')
    
    # Address
    address = fields.Text('Address')
    city = fields.Char('City')
    emirate = fields.Selection([
        ('abu_dhabi', 'Abu Dhabi'),
        ('dubai', 'Dubai'),
        ('sharjah', 'Sharjah'),
        ('ajman', 'Ajman'),
        ('umm_al_quwain', 'Umm Al Quwain'),
        ('ras_al_khaimah', 'Ras Al Khaimah'),
        ('fujairah', 'Fujairah')
    ], string='Emirate')
    
    # Service Agreement
    service_type = fields.Selection([
        ('contingency', 'Contingency (20-25%)'),
        ('retainer', 'Retainer (Monthly Fee)'),
        ('hybrid', 'Hybrid (Retainer + Commission)')
    ], default='contingency', required=True, tracking=True)
    
    contingency_percentage = fields.Float('Contingency %', default=20.0)
    retainer_amount = fields.Monetary('Monthly Retainer', currency_field='currency_id')
    retainer_includes = fields.Integer('Positions Included', default=0)
    
    # Financial
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.ref('base.AED'))
    total_revenue = fields.Monetary('Total Revenue', compute='_compute_total_revenue', currency_field='currency_id')
    outstanding_amount = fields.Monetary('Outstanding Amount', compute='_compute_outstanding', currency_field='currency_id')
    
    # Relationships
    job_order_ids = fields.One2many('recruitment.job.order', 'client_id', 'Job Orders')
    placement_ids = fields.One2many('recruitment.placement', 'client_id', 'Placements')
    job_order_count = fields.Integer('Total Job Orders', compute='_compute_counts')
    placement_count = fields.Integer('Total Placements', compute='_compute_counts')
    
    # Status
    state = fields.Selection([
        ('draft', 'Draft'),
        ('pending_verification', 'Pending Verification'),
        ('verified', 'Verified'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('terminated', 'Terminated')
    ], default='draft', tracking=True)
    
    # Portal Access
    portal_enabled = fields.Boolean('Portal Enabled', default=False)
    portal_user_id = fields.Many2one('res.users', 'Portal User', readonly=True)
    
    # Internal Notes
    internal_notes = fields.Text('Internal Notes')
    terms_and_conditions = fields.Html('Terms & Conditions')

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
                vals['reference'] = self.env['ir.sequence'].next_by_code('recruitment.client')
        
        return super().create(vals_list)

    @api.constrains('trade_license_number', 'partner_id')
    def _check_duplicate_client(self):
        """Prevent duplicate clients for same trade license"""
        for record in self:
            duplicate = self.search([
                ('trade_license_number', '=', record.trade_license_number),
                ('id', '!=', record.id),
                ('partner_id', '!=', record.partner_id.id)
            ])
            if duplicate:
                raise ValidationError(
                    _('A client with this trade license number already exists!')
                )

    @api.depends('placement_ids')
    def _compute_total_revenue(self):
        for record in self:
            record.total_revenue = sum(
                record.placement_ids.mapped('final_amount')
            )

    @api.depends('placement_ids')
    def _compute_outstanding(self):
        for record in self:
            invoices = self.env['account.move'].search([
                ('partner_id', '=', record.partner_id.id),
                ('move_type', '=', 'out_invoice'),
                ('state', '=', 'posted')
            ])
            record.outstanding_amount = sum(invoice.amount_residual for invoice in invoices)

    @api.depends('job_order_ids', 'placement_ids')
    def _compute_counts(self):
        for record in self:
            record.job_order_count = len(record.job_order_ids)
            record.placement_count = len(record.placement_ids)

    def action_verify_ded(self):
        """Verify client with DED (Department of Economic Development)"""
        self.ensure_one()
        
        if self.ded_verified:
            raise UserError(_('This client is already verified with DED.'))
        
        # In production, call actual DED API
        # For now, mock the verification
        try:
            api_url = self.env['ir.config_parameter'].sudo().get_param('uae_recruitment.ded_api_url')
            api_key = self.env['ir.config_parameter'].sudo().get_param('uae_recruitment.ded_api_key')
            
            if api_url and api_key:
                response = requests.post(
                    f'{api_url}/verify_license',
                    json={
                        'trade_license': self.trade_license_number,
                        'entity_type': self.entity_type
                    },
                    headers={'Authorization': f'Bearer {api_key}'},
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    self.write({
                        'ded_verified': True,
                        'ded_verification_date': fields.Datetime.now(),
                        'ded_verification_result': json.dumps(result),
                        'state': 'verified'
                    })
                    self.message_post(body=_('Client verified with DED successfully'))
                else:
                    raise UserError(_('DED verification failed: %s') % response.text)
            else:
                # Mock verification for development
                self.write({
                    'ded_verified': True,
                    'ded_verification_date': fields.Datetime.now(),
                    'ded_verification_result': json.dumps({
                        'status': 'verified',
                        'license': self.trade_license_number,
                        'entity_type': self.entity_type
                    }),
                    'state': 'verified'
                })
                self.message_post(body=_('Client verified successfully (Development Mode)'))
        
        except Exception as e:
            raise UserError(_('Error during verification: %s') % str(e))

    def action_enable_portal(self):
        """Enable portal access for client"""
        self.ensure_one()
        
        # Create or get portal user
        User = self.env['res.users'].with_context(no_reset_password=True)
        
        portal_user = User.search([
            ('login', '=', self.email),
            ('partner_id', '=', self.partner_id.id)
        ])
        
        if not portal_user:
            # Create new portal user
            portal_user = User.create({
                'name': self.name,
                'email': self.email,
                'login': self.email,
                'partner_id': self.partner_id.id,
                'groups_id': [(6, 0, [self.env.ref('base.group_portal').id])],
            })
        
        self.write({
            'portal_enabled': True,
            'portal_user_id': portal_user.id
        })
        
        # Send portal access email
        template = self.env.ref('uae_recruitment_mgmt.email_template_client_welcome', raise_if_not_found=False)
        if template:
            template.send_mail(self.id)
        
        self.message_post(body=_('Portal access enabled for client'))

    def action_suspend(self):
        """Suspend client services"""
        self.write({'state': 'suspended'})
        self.message_post(body=_('Client suspended'))

    def action_reactivate(self):
        """Reactivate suspended client"""
        self.write({'state': 'active'})
        self.message_post(body=_('Client reactivated'))

    def action_terminate(self):
        """Terminate client relationship"""
        self.write({'state': 'terminated', 'active': False})
        self.message_post(body=_('Client relationship terminated'))

    def action_view_job_orders(self):
        """View related job orders for this client"""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': f'Job Orders for {self.name}',
            'res_model': 'recruitment.job.order',
            'view_mode': 'list,form',
            'domain': [('client_id', '=', self.id)],
            'target': 'current',
            'context': {'default_client_id': self.id}
        }

    def get_portal_url(self):
        """Get portal URL for client"""
        return f"/recruitment/client/{self.id}"
