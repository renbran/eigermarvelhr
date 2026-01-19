#!/usr/bin/env python3
"""
Recruitment Email Template Sender
Sends all recruitment module email templates for testing
Target: renbranmadelogmail.com
"""

import odoorpc
from datetime import datetime, timedelta
import sys

# Configuration
ODOO_HOST = 'localhost'
ODOO_PORT = 8069
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'
TEST_EMAIL = 'renbranmadelogmail.com'  # Target email for testing

def connect_odoo():
    """Connect to Odoo server"""
    try:
        odoo = odoorpc.ODOO(ODOO_HOST, port=ODOO_PORT)
        odoo.login(ODOO_DB, ODOO_USER, ODOO_PASSWORD)
        print('✅ Connected to Odoo successfully\n')
        return odoo
    except Exception as e:
        print(f'❌ Failed to connect to Odoo: {str(e)}')
        sys.exit(1)

def check_smtp_config(odoo):
    """Verify SMTP configuration"""
    try:
        MailServer = odoo.env['ir.mail_server']
        servers = MailServer.search([])
        
        if servers:
            print('📧 SMTP Configuration Found:')
            for server_id in servers:
                server = MailServer.browse(server_id)
                print(f'   • Server: {server.name}')
                print(f'   • Host: {server.smtp_host}:{server.smtp_port}')
                print(f'   • Encryption: {server.smtp_encryption}')
                print(f'   • Active: {server.active}\n')
            return True
        else:
            print('⚠️  No SMTP server configured')
            return False
    except Exception as e:
        print(f'⚠️  Could not check SMTP: {str(e)}\n')
        return False

def send_email_template(odoo, template_name, record_obj, record_id, test_email):
    """Send an email template to a record"""
    try:
        MailTemplate = odoo.env['mail.template']
        template = MailTemplate.search([('name', '=', template_name)], limit=1)
        
        if not template:
            return False, f'Template not found: {template_name}'
        
        if not record_id:
            return False, 'No record available'
        
        # Send email with force_send=True for immediate SMTP sending
        MailTemplate.send_mail(
            template[0],
            record_id,
            force_send=True,
            email_values={'email_to': test_email}
        )
        return True, 'Sent successfully'
        
    except Exception as e:
        return False, str(e)[:150]

def main():
    print('='*70)
    print('  RECRUITMENT EMAIL TEMPLATE SENDER')
    print('='*70)
    print(f'\n📧 Target Email: {TEST_EMAIL}')
    print(f'🕐 Date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n')
    
    # Connect to Odoo
    odoo = connect_odoo()
    
    # Check SMTP configuration
    smtp_ok = check_smtp_config(odoo)
    
    if not smtp_ok:
        print('⚠️  Warning: SMTP may not be configured. Emails may not send.')
        print('    Configure SMTP in Odoo: Settings > Technical > Outgoing Mail Servers\n')
    
    # Get models
    MailTemplate = odoo.env['mail.template']
    
    print('='*70)
    print('SENDING RECRUITMENT EMAIL TEMPLATES')
    print('='*70 + '\n')
    
    results = []
    
    # ========== 1. Client Welcome Email ==========
    print('1️⃣  Client Welcome Email')
    try:
        Client = odoo.env['recruitment.client']
        clients = Client.search([], limit=1)
        
        if clients:
            success, message = send_email_template(
                odoo,
                'Recruitment - Client Welcome',
                Client,
                clients[0],
                TEST_EMAIL
            )
            if success:
                print('   ✅ ' + message)
                results.append(('Client Welcome', True))
            else:
                print(f'   ❌ {message}')
                results.append(('Client Welcome', False))
        else:
            print('   ⚠️  No client records found (create one in Odoo to test)')
            results.append(('Client Welcome', None))
    except Exception as e:
        print(f'   ❌ Error: {str(e)[:100]}')
        results.append(('Client Welcome', False))
    print()
    
    # ========== 2. Application Received Email ==========
    print('2️⃣  Application Received Email')
    try:
        Applicant = odoo.env['hr.applicant']
        applicants = Applicant.search([], limit=1)
        
        if not applicants:
            # Try to create one if there's a job available
            Job = odoo.env['hr.job']
            jobs = Job.search([], limit=1)
            if jobs:
                print('   Creating test applicant...')
                applicant_id = Applicant.create({
                    'partner_name': 'Test Candidate',
                    'email_from': 'candidate@example.com',
                    'job_id': jobs[0],
                })
                applicants = [applicant_id]
                print('   ✓ Test applicant created')
        
        if applicants:
            success, message = send_email_template(
                odoo,
                'Recruitment - Application Received',
                Applicant,
                applicants[0],
                TEST_EMAIL
            )
            if success:
                print('   ✅ ' + message)
                results.append(('Application Received', True))
            else:
                print(f'   ❌ {message}')
                results.append(('Application Received', False))
        else:
            print('   ⚠️  No applicant records found')
            results.append(('Application Received', None))
    except Exception as e:
        print(f'   ❌ Error: {str(e)[:100]}')
        results.append(('Application Received', False))
    print()
    
    # ========== 3. Interview Scheduled Email ==========
    print('3️⃣  Interview Scheduled Email')
    try:
        Applicant = odoo.env['hr.applicant']
        applicants = Applicant.search([], limit=1)
        
        if applicants:
            success, message = send_email_template(
                odoo,
                'Recruitment - Interview Scheduled',
                Applicant,
                applicants[0],
                TEST_EMAIL
            )
            if success:
                print('   ✅ ' + message)
                results.append(('Interview Scheduled', True))
            else:
                print(f'   ❌ {message}')
                results.append(('Interview Scheduled', False))
        else:
            print('   ⚠️  No applicant records found')
            results.append(('Interview Scheduled', None))
    except Exception as e:
        print(f'   ❌ Error: {str(e)[:100]}')
        results.append(('Interview Scheduled', False))
    print()
    
    # ========== 4. Placement Offer Email ==========
    print('4️⃣  Placement Offer Email')
    try:
        Placement = odoo.env['recruitment.placement']
        placements = Placement.search([], limit=1)
        
        if placements:
            success, message = send_email_template(
                odoo,
                'Recruitment - Placement Offer',
                Placement,
                placements[0],
                TEST_EMAIL
            )
            if success:
                print('   ✅ ' + message)
                results.append(('Placement Offer', True))
            else:
                print(f'   ❌ {message}')
                results.append(('Placement Offer', False))
        else:
            print('   ⚠️  No placement records found')
            results.append(('Placement Offer', None))
    except Exception as e:
        print(f'   ❌ Error: {str(e)[:100]}')
        results.append(('Placement Offer', False))
    print()
    
    # ========== 5. Visa Documents Needed Email ==========
    print('5️⃣  Visa Documents Needed Email')
    try:
        Visa = odoo.env['uae.visa.processing']
        visas = Visa.search([], limit=1)
        
        if visas:
            success, message = send_email_template(
                odoo,
                'Recruitment - Visa Documents Needed',
                Visa,
                visas[0],
                TEST_EMAIL
            )
            if success:
                print('   ✅ ' + message)
                results.append(('Visa Documents', True))
            else:
                print(f'   ❌ {message}')
                results.append(('Visa Documents', False))
        else:
            print('   ⚠️  No visa records found')
            results.append(('Visa Documents', None))
    except Exception as e:
        print(f'   ❌ Error: {str(e)[:100]}')
        results.append(('Visa Documents', False))
    print()
    
    # ========== 6. Medical Exam Scheduled Email ==========
    print('6️⃣  Medical Exam Scheduled Email')
    try:
        Visa = odoo.env['uae.visa.processing']
        visas = Visa.search([], limit=1)
        
        if visas:
            success, message = send_email_template(
                odoo,
                'Recruitment - Medical Exam Scheduled',
                Visa,
                visas[0],
                TEST_EMAIL
            )
            if success:
                print('   ✅ ' + message)
                results.append(('Medical Exam', True))
            else:
                print(f'   ❌ {message}')
                results.append(('Medical Exam', False))
        else:
            print('   ⚠️  No visa records found')
            results.append(('Medical Exam', None))
    except Exception as e:
        print(f'   ❌ Error: {str(e)[:100]}')
        results.append(('Medical Exam', False))
    print()
    
    # ========== Summary ==========
    print('='*70)
    print('SUMMARY')
    print('='*70)
    
    success_count = sum(1 for _, result in results if result is True)
    fail_count = sum(1 for _, result in results if result is False)
    skip_count = sum(1 for _, result in results if result is None)
    
    for template_name, result in results:
        if result is True:
            status = '✅ SENT'
        elif result is False:
            status = '❌ FAILED'
        else:
            status = '⏭️  SKIPPED'
        print(f'{status}  {template_name}')
    
    print()
    print(f'📊 Results: {success_count} sent, {fail_count} failed, {skip_count} skipped')
    print(f'📧 All emails sent to: {TEST_EMAIL}')
    print()
    
    if fail_count > 0:
        print('⚠️  Some emails failed. Check SMTP configuration and data availability.')
    else:
        print('✅ All recruitment email templates processed successfully!')
    
    print()

if __name__ == '__main__':
    main()
