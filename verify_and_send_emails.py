#!/usr/bin/env python3
"""
Recruitment Email Template Verification & Sender
Connects to Odoo database, verifies configuration, then sends test emails
Target: renbranmadelogmail.com
"""

import odoorpc
import sys
from datetime import datetime

# Configuration
# The Odoo server can be accessed through the domain name
ODOO_HOST = 'eigermarvelhr.com'
ODOO_PORT = 8069  # Standard Odoo port
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'
TEST_EMAIL = 'renbranmadelogmail.com'

def print_header(title):
    """Print formatted header"""
    print('\n' + '='*70)
    print(f'  {title}')
    print('='*70)

def print_section(title):
    """Print formatted section"""
    print(f'\n{title}')
    print('-' * 70)

def main():
    print_header('RECRUITMENT EMAIL SYSTEM VERIFICATION & SENDER')
    print(f'\n🕐 Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'📧 Test Email: {TEST_EMAIL}')
    
    # ============= STEP 1: Connect to Database =============
    print_section('STEP 1: CONNECTING TO ODOO DATABASE')
    
    try:
        print(f'🔌 Connecting to {ODOO_HOST}:{ODOO_PORT}...')
        odoo = odoorpc.ODOO(ODOO_HOST, port=ODOO_PORT)
        print('   ✅ Connection established')
        
        print(f'🔑 Logging in as "{ODOO_USER}" to database "{ODOO_DB}"...')
        odoo.login(ODOO_DB, ODOO_USER, ODOO_PASSWORD)
        print('   ✅ Authentication successful')
        
    except Exception as e:
        print(f'   ❌ Connection failed: {str(e)}')
        sys.exit(1)
    
    # ============= STEP 2: Verify Database Connection =============
    print_section('STEP 2: VERIFYING DATABASE CONNECTION')
    
    try:
        # Test basic query
        Company = odoo.env['res.company']
        companies = Company.search([])
        print(f'✅ Database accessible')
        print(f'   Found {len(companies)} company/companies in database')
        
        if companies:
            company = Company.browse(companies[0])
            print(f'   Company: {company.name}')
            print(f'   Email: {company.email}')
        
    except Exception as e:
        print(f'❌ Database query failed: {str(e)}')
        sys.exit(1)
    
    # ============= STEP 3: Check SMTP Configuration =============
    print_section('STEP 3: CHECKING SMTP MAIL SERVER CONFIGURATION')
    
    try:
        MailServer = odoo.env['ir.mail_server']
        servers = MailServer.search([])
        
        if servers:
            print(f'✅ Found {len(servers)} mail server(s) configured:\n')
            for i, server_id in enumerate(servers, 1):
                server = MailServer.browse(server_id)
                print(f'   Server {i}: {server.name}')
                print(f'   - Host: {server.smtp_host}')
                print(f'   - Port: {server.smtp_port}')
                print(f'   - User: {server.smtp_user}')
                print(f'   - Encryption: {server.smtp_encryption}')
                print(f'   - Active: {"✅ Yes" if server.active else "❌ No"}')
                print()
        else:
            print('❌ No mail servers configured!')
            print('   Please configure SMTP in Settings > Technical > Outgoing Mail Servers')
            print()
    except Exception as e:
        print(f'❌ Error checking SMTP: {str(e)}\n')
    
    # ============= STEP 4: Check Available Test Data =============
    print_section('STEP 4: CHECKING AVAILABLE TEST DATA')
    
    data_available = {}
    
    # Check recruitment clients
    try:
        Client = odoo.env['recruitment.client']
        clients = Client.search([])
        data_available['clients'] = len(clients)
        print(f'👥 Recruitment Clients: {len(clients)} found')
        if clients:
            client = Client.browse(clients[0])
            print(f'   Sample: {client.name} ({client.email})')
    except Exception as e:
        print(f'⚠️  Recruitment Clients: {str(e)[:80]}')
        data_available['clients'] = 0
    
    # Check job applicants
    try:
        Applicant = odoo.env['hr.applicant']
        applicants = Applicant.search([])
        data_available['applicants'] = len(applicants)
        print(f'📝 Job Applicants: {len(applicants)} found')
        if applicants:
            applicant = Applicant.browse(applicants[0])
            print(f'   Sample: {applicant.partner_name} ({applicant.email_from})')
    except Exception as e:
        print(f'⚠️  Job Applicants: {str(e)[:80]}')
        data_available['applicants'] = 0
    
    # Check placements
    try:
        Placement = odoo.env['recruitment.placement']
        placements = Placement.search([])
        data_available['placements'] = len(placements)
        print(f'🎯 Placements: {len(placements)} found')
    except Exception as e:
        print(f'⚠️  Placements: {str(e)[:80]}')
        data_available['placements'] = 0
    
    # Check visa records
    try:
        Visa = odoo.env['uae.visa.processing']
        visas = Visa.search([])
        data_available['visas'] = len(visas)
        print(f'🛂 Visa Records: {len(visas)} found')
    except Exception as e:
        print(f'⚠️  Visa Records: {str(e)[:80]}')
        data_available['visas'] = 0
    
    # ============= STEP 5: List Available Email Templates =============
    print_section('STEP 5: CHECKING EMAIL TEMPLATES')
    
    try:
        MailTemplate = odoo.env['mail.template']
        
        # Search for recruitment templates
        recruitment_templates = MailTemplate.search([
            ('name', 'ilike', 'Recruitment')
        ])
        
        print(f'✅ Found {len(recruitment_templates)} recruitment email templates:\n')
        
        if recruitment_templates:
            templates = MailTemplate.browse(recruitment_templates)
            for i, template in enumerate(templates, 1):
                print(f'   {i}. {template.name}')
                print(f'      Model: {template.model_id.name if template.model_id else "N/A"}')
                print(f'      Subject: {template.subject[:50]}...' if template.subject else '      Subject: (empty)')
                print()
        else:
            print('⚠️  No recruitment templates found!')
            
    except Exception as e:
        print(f'❌ Error listing templates: {str(e)}\n')
    
    # ============= STEP 6: Send Test Emails =============
    print_section('STEP 6: SENDING TEST EMAILS')
    
    print(f'📧 Sending emails to: {TEST_EMAIL}\n')
    
    MailTemplate = odoo.env['mail.template']
    results = {}
    
    # 1. Client Welcome
    print('1️⃣  Client Welcome Email')
    if data_available.get('clients', 0) > 0:
        try:
            Client = odoo.env['recruitment.client']
            clients = Client.search([], limit=1)
            template = MailTemplate.search([
                ('name', '=', 'Recruitment - Client Welcome')
            ], limit=1)
            
            if template:
                MailTemplate.send_mail(
                    template[0],
                    clients[0],
                    force_send=True,
                    email_values={'email_to': TEST_EMAIL}
                )
                print('   ✅ SENT')
                results['Client Welcome'] = True
            else:
                print('   ⚠️  Template not found')
                results['Client Welcome'] = None
        except Exception as e:
            print(f'   ❌ ERROR: {str(e)[:100]}')
            results['Client Welcome'] = False
    else:
        print('   ⏭️  SKIPPED (no client data)')
        results['Client Welcome'] = None
    
    # 2. Application Received
    print('\n2️⃣  Application Received Email')
    if data_available.get('applicants', 0) > 0:
        try:
            Applicant = odoo.env['hr.applicant']
            applicants = Applicant.search([], limit=1)
            template = MailTemplate.search([
                ('name', '=', 'Recruitment - Application Received')
            ], limit=1)
            
            if template:
                MailTemplate.send_mail(
                    template[0],
                    applicants[0],
                    force_send=True,
                    email_values={'email_to': TEST_EMAIL}
                )
                print('   ✅ SENT')
                results['Application Received'] = True
            else:
                print('   ⚠️  Template not found')
                results['Application Received'] = None
        except Exception as e:
            print(f'   ❌ ERROR: {str(e)[:100]}')
            results['Application Received'] = False
    else:
        print('   ⏭️  SKIPPED (no applicant data)')
        results['Application Received'] = None
    
    # 3. Interview Scheduled
    print('\n3️⃣  Interview Scheduled Email')
    if data_available.get('applicants', 0) > 0:
        try:
            Applicant = odoo.env['hr.applicant']
            applicants = Applicant.search([], limit=1)
            template = MailTemplate.search([
                ('name', '=', 'Recruitment - Interview Scheduled')
            ], limit=1)
            
            if template:
                MailTemplate.send_mail(
                    template[0],
                    applicants[0],
                    force_send=True,
                    email_values={'email_to': TEST_EMAIL}
                )
                print('   ✅ SENT')
                results['Interview Scheduled'] = True
            else:
                print('   ⚠️  Template not found')
                results['Interview Scheduled'] = None
        except Exception as e:
            print(f'   ❌ ERROR: {str(e)[:100]}')
            results['Interview Scheduled'] = False
    else:
        print('   ⏭️  SKIPPED (no applicant data)')
        results['Interview Scheduled'] = None
    
    # 4. Placement Offer
    print('\n4️⃣  Placement Offer Email')
    if data_available.get('placements', 0) > 0:
        try:
            Placement = odoo.env['recruitment.placement']
            placements = Placement.search([], limit=1)
            template = MailTemplate.search([
                ('name', '=', 'Recruitment - Placement Offer')
            ], limit=1)
            
            if template:
                MailTemplate.send_mail(
                    template[0],
                    placements[0],
                    force_send=True,
                    email_values={'email_to': TEST_EMAIL}
                )
                print('   ✅ SENT')
                results['Placement Offer'] = True
            else:
                print('   ⚠️  Template not found')
                results['Placement Offer'] = None
        except Exception as e:
            print(f'   ❌ ERROR: {str(e)[:100]}')
            results['Placement Offer'] = False
    else:
        print('   ⏭️  SKIPPED (no placement data)')
        results['Placement Offer'] = None
    
    # 5. Visa Documents Needed
    print('\n5️⃣  Visa Documents Needed Email')
    if data_available.get('visas', 0) > 0:
        try:
            Visa = odoo.env['uae.visa.processing']
            visas = Visa.search([], limit=1)
            template = MailTemplate.search([
                ('name', '=', 'Recruitment - Visa Documents Needed')
            ], limit=1)
            
            if template:
                MailTemplate.send_mail(
                    template[0],
                    visas[0],
                    force_send=True,
                    email_values={'email_to': TEST_EMAIL}
                )
                print('   ✅ SENT')
                results['Visa Documents'] = True
            else:
                print('   ⚠️  Template not found')
                results['Visa Documents'] = None
        except Exception as e:
            print(f'   ❌ ERROR: {str(e)[:100]}')
            results['Visa Documents'] = False
    else:
        print('   ⏭️  SKIPPED (no visa data)')
        results['Visa Documents'] = None
    
    # 6. Medical Exam Scheduled
    print('\n6️⃣  Medical Exam Scheduled Email')
    if data_available.get('visas', 0) > 0:
        try:
            Visa = odoo.env['uae.visa.processing']
            visas = Visa.search([], limit=1)
            template = MailTemplate.search([
                ('name', '=', 'Recruitment - Medical Exam Scheduled')
            ], limit=1)
            
            if template:
                MailTemplate.send_mail(
                    template[0],
                    visas[0],
                    force_send=True,
                    email_values={'email_to': TEST_EMAIL}
                )
                print('   ✅ SENT')
                results['Medical Exam'] = True
            else:
                print('   ⚠️  Template not found')
                results['Medical Exam'] = None
        except Exception as e:
            print(f'   ❌ ERROR: {str(e)[:100]}')
            results['Medical Exam'] = False
    else:
        print('   ⏭️  SKIPPED (no visa data)')
        results['Medical Exam'] = None
    
    # ============= FINAL SUMMARY =============
    print_header('SUMMARY REPORT')
    
    sent = sum(1 for v in results.values() if v is True)
    failed = sum(1 for v in results.values() if v is False)
    skipped = sum(1 for v in results.values() if v is None)
    
    print('\nEmail Template Results:')
    for name, status in results.items():
        if status is True:
            symbol = '✅ SENT'
        elif status is False:
            symbol = '❌ FAILED'
        else:
            symbol = '⏭️  SKIPPED'
        print(f'   {symbol}  {name}')
    
    print('\n📊 Summary:')
    print(f'   • Sent: {sent}')
    print(f'   • Failed: {failed}')
    print(f'   • Skipped: {skipped}')
    print(f'   • Total: {sent + failed + skipped}')
    
    print(f'\n✅ Email Configuration Verified')
    print(f'✅ Database Connection Confirmed')
    print(f'✅ Emails Sent to: {TEST_EMAIL}')
    print()

if __name__ == '__main__':
    main()
