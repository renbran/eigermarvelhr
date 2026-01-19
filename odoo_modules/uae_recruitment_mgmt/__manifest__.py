# -*- coding: utf-8 -*-
{
    'name': 'UAE Recruitment Management',
    'version': '18.0.1.0.1',
    'category': 'Human Resources/Recruitment',
    'summary': 'Complete recruitment management system for UAE with AI-powered candidate matching, '
               'visa processing tracking, and seamless website integration',
    'description': '''
        Complete Recruitment Management Module
        =======================================
        
        Key Features:
        • Client Management: Automated verification, service agreements, portal access
        • Job Orders: Compliance checks, auto-posting, AI-powered matching
        • Candidate Management: AI resume parsing, skill extraction, match scoring
        • Visa Processing: Complete UAE visa workflow with document tracking
        • Dashboard: Real-time KPIs, analytics, and quick actions
        • AI Integration: OpenAI-powered resume analysis and candidate matching
        • Automation: Scheduled actions, email notifications, workflow automation
        • Portal: Client and candidate self-service portals
        • Website Sync: Real-time integration with React website for seamless data flow
        • Compliance: DED verification, visa status tracking, document management
        
        Perfect for:
        ✓ Recruitment agencies
        ✓ HR departments
        ✓ Staffing firms
        ✓ UAE-based companies
        
        Integration:
        ✓ Website (React) - Auto-sync jobs, applicants, and placements
        ✓ HR Module - Extend hr.applicant with advanced features
        ✓ Mail Module - Automated email notifications
        ✓ Portal - Client and candidate portals
        ✓ OpenAI API - AI-powered resume parsing and matching
    ''',
    'author': 'Eiger Marvel HR',
    'website': 'https://eigermarvelhr.com',
    'license': 'LGPL-3',
    'installable': True,
    'application': True,
    'auto_install': False,
    'depends': [
        'base',
        'mail',
        'hr_recruitment',
        'hr',
        'contacts',
        'web',
        'portal',
        'digest',
    ],
    'data': [
        # Security - groups must be loaded FIRST
        'security/security_groups.xml',
        'security/ir.model.access.csv',
        
        # Data
        'data/recruitment_sequence.xml',
        'data/email_templates.xml',
        'data/automation_rules.xml',
        'data/scheduled_actions.xml',
        'data/llm_providers_data.xml',
        
        # Views - Phase 2: UI Layer (Core models with full interface)
        'views/recruitment_client_views.xml',
        'views/recruitment_job_order_views.xml',
        'views/recruitment_candidate_views.xml',
        'views/recruitment_placement_views.xml',
        'views/uae_visa_processing_views.xml',
        'views/recruitment_dashboard_views.xml',
        'views/llm_provider_views.xml',
        'views/menu_views.xml',
        'wizards/wizard_views.xml',
    ],
    'assets': {},
    'external_dependencies': {
        'python': ['requests', 'openai'],
    },
    'images': [
        'static/description/icon.png',
    ],
}
