# -*- coding: utf-8 -*-

from . import models
from . import controllers
from . import wizards


def post_init_hook(cr, registry):
    """Post-installation hook to setup sequences and initial data"""
    from odoo import api, SUPERUSER_ID
    env = api.Environment(cr, SUPERUSER_ID, {})
    
    # Create sequences if they don't exist
    env['ir.sequence'].sudo().create({
        'name': 'Client Reference',
        'code': 'recruitment.client',
        'prefix': 'RC/',
        'padding': 5,
        'company_id': False,
    })
    
    env['ir.sequence'].sudo().create({
        'name': 'Job Order Reference',
        'code': 'recruitment.job.order',
        'prefix': 'JO/',
        'padding': 5,
        'company_id': False,
    })
    
    env['ir.sequence'].sudo().create({
        'name': 'Placement Reference',
        'code': 'recruitment.placement',
        'prefix': 'PL/',
        'padding': 5,
        'company_id': False,
    })
    
    env['ir.sequence'].sudo().create({
        'name': 'Candidate Code',
        'code': 'hr.applicant',
        'prefix': 'CAN/',
        'padding': 6,
        'company_id': False,
    })
    
    env['ir.sequence'].sudo().create({
        'name': 'Visa Processing Reference',
        'code': 'uae.visa.processing',
        'prefix': 'VISA/',
        'padding': 6,
        'company_id': False,
    })


def uninstall_hook(cr, registry):
    """Uninstall hook to cleanup sequences"""
    from odoo import api, SUPERUSER_ID
    env = api.Environment(cr, SUPERUSER_ID, {})
    
    # Delete sequences
    sequences = env['ir.sequence'].search([
        ('code', 'in', [
            'recruitment.client',
            'recruitment.job.order',
            'recruitment.placement',
            'hr.applicant',
            'uae.visa.processing'
        ])
    ])
    sequences.unlink()
