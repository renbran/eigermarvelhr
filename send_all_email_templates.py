#!/usr/bin/env python3
import odoorpc
from datetime import datetime, timedelta

# Connect to Odoo
odoo = odoorpc.ODOO('localhost', port=8069)
odoo.login('eigermarvel', 'admin', '8586583')

test_email = 'renbranmadelo@gmail.com'
MailTemplate = odoo.env['mail.template']

print('Sending all email templates (using existing data)...\n')

# 1. Client Welcome Email
try:
    print('1. Client Welcome Email...')
    template = MailTemplate.search([('name', '=', 'Recruitment - Client Welcome')], limit=1)
    clients = odoo.env['recruitment.client'].search([], limit=1)
    if template and clients:
        MailTemplate.send_mail(template[0], clients[0], force_send=True, email_values={'email_to': test_email})
        print('   ✓ Sent successfully')
    else:
        print('   ✗ Template or client not found')
except Exception as e:
    print(f'   ✗ Error: {str(e)[:100]}')

# 2. Application Received Email - Use existing or create minimal applicant
try:
    print('2. Application Received Email...')
    Applicant = odoo.env['hr.applicant']
    Job = odoo.env['hr.job']
    
    # Check for existing applicant first
    applicants = Applicant.search([], limit=1)
    
    if not applicants:
        # Get any job
        jobs = Job.search([], limit=1)
        if jobs:
            # Create minimal applicant without partner
            applicant_id = Applicant.create({
                'partner_name': 'Test Candidate',
                'email_from': 'candidate@example.com',
                'job_id': jobs[0],
            })
        else:
            applicant_id = None
    else:
        applicant_id = applicants[0]
    
    if applicant_id:
        template = MailTemplate.search([('name', '=', 'Recruitment - Application Received')], limit=1)
        if template:
            MailTemplate.send_mail(template[0], applicant_id, force_send=True, email_values={'email_to': test_email})
            print('   ✓ Sent successfully')
        else:
            print('   ✗ Template not found')
    else:
        print('   ✗ Could not find or create applicant')
except Exception as e:
    print(f'   ✗ Error: {str(e)[:100]}')

# 3. Interview Scheduled Email - Use same applicant
try:
    print('3. Interview Scheduled Email...')
    if applicant_id:
        template = MailTemplate.search([('name', '=', 'Recruitment - Interview Scheduled')], limit=1)
        if template:
            MailTemplate.send_mail(template[0], applicant_id, force_send=True, email_values={'email_to': test_email})
            print('   ✓ Sent successfully')
        else:
            print('   ✗ Template not found')
    else:
        print('   ✗ No applicant available')
except Exception as e:
    print(f'   ✗ Error: {str(e)[:100]}')

# 4. Placement Offer Email
try:
    print('4. Placement Offer Email...')
    Placement = odoo.env['recruitment.placement']
    
    # Check for existing placement
    placements = Placement.search([], limit=1)
    
    if placements:
        placement_id = placements[0]
        template = MailTemplate.search([('name', '=', 'Recruitment - Placement Offer')], limit=1)
        if template:
            MailTemplate.send_mail(template[0], placement_id, force_send=True, email_values={'email_to': test_email})
            print('   ✓ Sent successfully')
        else:
            print('   ✗ Template not found')
    else:
        print('   ℹ No placement records in database - skipping')
except Exception as e:
    print(f'   ✗ Error: {str(e)[:100]}')

# 5. Visa Documents Needed Email
try:
    print('5. Visa Documents Needed Email...')
    Visa = odoo.env['uae.visa.processing']
    
    # Check for existing visa record
    visas = Visa.search([], limit=1)
    
    if visas:
        visa_id = visas[0]
        template = MailTemplate.search([('name', '=', 'Recruitment - Visa Documents Needed')], limit=1)
        if template:
            MailTemplate.send_mail(template[0], visa_id, force_send=True, email_values={'email_to': test_email})
            print('   ✓ Sent successfully')
        else:
            print('   ✗ Template not found')
    else:
        print('   ℹ No visa records in database - skipping')
except Exception as e:
    print(f'   ✗ Error: {str(e)[:100]}')

# 6. Visa Medical Exam Email
try:
    print('6. Visa Medical Exam Email...')
    Visa = odoo.env['uae.visa.processing']
    
    # Check for existing visa record
    visas = Visa.search([], limit=1)
    
    if visas:
        visa_id = visas[0]
        template = MailTemplate.search([('name', '=', 'Recruitment - Medical Exam Scheduled')], limit=1)
        if template:
            MailTemplate.send_mail(template[0], visa_id, force_send=True, email_values={'email_to': test_email})
            print('   ✓ Sent successfully')
        else:
            print('   ✗ Template not found')
    else:
        print('   ℹ No visa records in database - skipping')
except Exception as e:
    print(f'   ✗ Error: {str(e)[:100]}')

print('\n✅ Email template test complete!')
print('📧 Check renbranmadelo@gmail.com for delivered emails.')
print('\nNote: Some templates may be skipped if no sample data exists in the database.')
print('You can test those templates once you create records through the Odoo UI.')
