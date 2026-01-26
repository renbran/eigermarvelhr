# -*- coding: utf-8 -*-
from odoo import SUPERUSER_ID
from odoo.api import Environment


def post_init_hook(cr, registry):
    env = Environment(cr, SUPERUSER_ID, {})
    websites = env['website'].search([])
    Menu = env['website.menu']
    for website in websites:
        existing = Menu.search([
            ('website_id', '=', website.id),
            ('url', '=', '/workforce360')
        ], limit=1)
        if not existing:
            Menu.create({
                'name': 'Workforce 360',
                'url': '/workforce360',
                'website_id': website.id,
                'parent_id': False,
                'sequence': 50,
            })
