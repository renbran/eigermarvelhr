# -*- coding: utf-8 -*-
from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class ClientOnboardingWizard(models.TransientModel):
    _name = 'recruitment.client.onboarding.wizard'
    _description = 'Client Onboarding Wizard'

    @api.model
    def create(self, vals_list):
        """Override create to support batch creation"""
        if isinstance(vals_list, dict):
            vals_list = [vals_list]
        return super(ClientOnboardingWizard, self).create(vals_list)

    # Step 1: Company Information
    company_name = fields.Char('Company Name', required=True)
    trade_license = fields.Char('Trade License Number', required=True)
    entity_type = fields.Selection([
        ('mainland', 'Mainland'),
        ('freezone', 'Free Zone'),
        ('deira', 'Deira Dubai'),
        ('jafza', 'JAFZA'),
        ('other', 'Other')
    ], default='mainland', required=True)
    
    # Step 2: Contact Details
    contact_person = fields.Char('Contact Person Name')
    email = fields.Char('Email Address', required=True)
    phone = fields.Char('Phone Number', required=True)
    website = fields.Char('Company Website')
    
    # Step 3: Address
    address = fields.Text('Address')
    emirate = fields.Selection([
        ('abu_dhabi', 'Abu Dhabi'),
        ('dubai', 'Dubai'),
        ('sharjah', 'Sharjah'),
        ('ajman', 'Ajman'),
        ('umm_al_quwain', 'Umm Al Quwain'),
        ('ras_al_khaimah', 'Ras Al Khaimah'),
        ('fujairah', 'Fujairah')
    ])

    # Step 4: Service Agreement
    service_type = fields.Selection([
        ('contingency', 'Contingency (20-25%)'),
        ('retainer', 'Retainer (Monthly Fee)'),
        ('hybrid', 'Hybrid (Retainer + Commission)')
    ], default='contingency', required=True)
    
    contingency_percentage = fields.Float('Contingency %', default=20.0)
    retainer_amount = fields.Monetary('Monthly Retainer', currency_field='currency_id')
    
    # Step 5: Preferences
    enable_portal = fields.Boolean('Enable Portal Access', default=True)
    verify_ded = fields.Boolean('Verify with DED', default=True)
    
    currency_id = fields.Many2one('res.currency', default=lambda self: self.env.ref('base.AED'))

    def action_create_client(self):
        """Create client and related records"""
        self.ensure_one()
        
        # Validate
        if not self.email:
            raise ValidationError(_('Email is required'))
        
        # Check if partner already exists
        Partner = self.env['res.partner']
        partner = Partner.search([('email', '=', self.email)])
        
        if not partner:
            partner = Partner.create({
                'name': self.company_name,
                'email': self.email,
                'phone': self.phone,
                'website': self.website,
                'street': self.address,
                'is_company': True,
                'type': 'contact',
            })
        else:
            # Update existing partner
            partner.write({
                'name': self.company_name,
                'phone': self.phone,
                'website': self.website,
                'street': self.address,
            })
        
        # Create client
        client_vals = {
            'name': self.company_name,
            'partner_id': partner.id,
            'trade_license_number': self.trade_license,
            'entity_type': self.entity_type,
            'contact_person': self.contact_person,
            'phone': self.phone,
            'email': self.email,
            'website': self.website,
            'address': self.address,
            'emirate': self.emirate,
            'service_type': self.service_type,
            'contingency_percentage': self.contingency_percentage if self.service_type == 'contingency' else 0,
            'retainer_amount': self.retainer_amount if self.service_type in ['retainer', 'hybrid'] else 0,
            'state': 'pending_verification' if self.verify_ded else 'verified',
        }
        
        client = self.env['recruitment.client'].create(client_vals)
        
        # Enable portal if requested
        if self.enable_portal:
            client.action_enable_portal()
        
        # Verify with DED if requested
        if self.verify_ded:
            client.action_verify_ded()
        
        # Open the created client
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'recruitment.client',
            'res_id': client.id,
            'view_mode': 'form',
            'target': 'current',
            'context': {'initial_open': True}
        }
