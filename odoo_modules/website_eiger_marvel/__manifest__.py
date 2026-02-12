# -*- coding: utf-8 -*-
{
    'name': 'Eiger Marvel Website',
    'version': '18.0.1.0.0',
    'category': 'Website',
    'summary': 'Modern recruitment website for Eiger Marvel HR Consultancies',
    'description': """
        Eiger Marvel Website Module
        ============================
        Modern, responsive recruitment website featuring:
        * Hero section with team photo and AI-powered messaging
        * Job listings integration with Odoo jobs
        * Services showcase
        * Company information
        * Contact form
        * Responsive design optimized for mobile and desktop
        * Integration with UAE recruitment management system
    """,
    'author': 'Eiger Marvel HR Consultancies',
    'website': 'https://eigermarvelhr.com',
    'license': 'LGPL-3',
    'depends': [
        'website',
        'website_hr_recruitment',
        'uae_recruitment_mgmt',
    ],
    'data': [
        'views/website_templates.xml',
        'views/snippets.xml',
        'data/website_menu.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'website_eiger_marvel/static/src/css/eiger_marvel.css',
        ],
    },
    'images': [
        'static/description/icon.png',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
