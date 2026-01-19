#!/usr/bin/env python3
import odoorpc

# Connect to Odoo
odoo = odoorpc.ODOO('localhost', port=8069)
odoo.login('eigermarvel', 'admin', '8586583')

test_email = 'renbranmadelo@gmail.com'
MailTemplate = odoo.env['mail.template']

print('Testing all email templates...')
print()

# Test 1: Client Welcome
try:
    print('1. Client Welcome Email...')
    template = MailTemplate.search([('name', '=', 'Recruitment - Client Welcome')], limit=1)
    clients = odoo.env['recruitment.client'].search([], limit=1)
    if template and clients:
        MailTemplate.send_mail(template[0], clients[0], force_send=True, email_values={'email_to': test_email})
        print('   ✓ Sent successfully')
    else:
        print('   ✗ Template or data not found')
except Exception as e:
    print(f'   ✗ Error: {e}')

# Test 2: Application Received
try:
    print('2. Application Received Email...')
    template = MailTemplate.search([('name', '=', 'Recruitment - Application Received')], limit=1)
    applicants = odoo.env['hr.applicant'].search([], limit=1)
    if template and applicants:
        MailTemplate.send_mail(template[0], applicants[0], force_send=True, email_values={'email_to': test_email})
        print('   ✓ Sent successfully')
    else:
        print('   ✗ Template or data not found')
except Exception as e:
    print(f'   ✗ Error: {e}')

# Test 3: Interview Scheduled
try:
    print('3. Interview Scheduled Email...')
    template = MailTemplate.search([('name', '=', 'Recruitment - Interview Scheduled')], limit=1)
    applicants = odoo.env['hr.applicant'].search([], limit=1)
    if template and applicants:
        MailTemplate.send_mail(template[0], applicants[0], force_send=True, email_values={'email_to': test_email})
        print('   ✓ Sent successfully')
    else:
        print('   ✗ Template or data not found')
except Exception as e:
    print(f'   ✗ Error: {e}')

# Test 4: Placement Offer
try:
    print('4. Placement Offer Email...')
    template = MailTemplate.search([('name', '=', 'Recruitment - Placement Offer')], limit=1)
    placements = odoo.env['recruitment.placement'].search([], limit=1)
    if template and placements:
        MailTemplate.send_mail(template[0], placements[0], force_send=True, email_values={'email_to': test_email})
        print('   ✓ Sent successfully')
    else:
        print('   ✗ Template or data not found')
except Exception as e:
    print(f'   ✗ Error: {e}')

# Test 5: Visa Documents Needed
try:
    print('5. Visa Documents Needed Email...')
    template = MailTemplate.search([('name', '=', 'Recruitment - Visa Documents Needed')], limit=1)
    visas = odoo.env['uae.visa.processing'].search([], limit=1)
    if template and visas:
        MailTemplate.send_mail(template[0], visas[0], force_send=True, email_values={'email_to': test_email})
        print('   ✓ Sent successfully')
    else:
        print('   ✗ Template or data not found')
except Exception as e:
    print(f'   ✗ Error: {e}')

# Test 6: Visa Medical Exam
try:
    print('6. Visa Medical Exam Email...')
    template = MailTemplate.search([('name', '=', 'Recruitment - Visa Medical Exam')], limit=1)
    visas = odoo.env['uae.visa.processing'].search([], limit=1)
    if template and visas:
        MailTemplate.send_mail(template[0], visas[0], force_send=True, email_values={'email_to': test_email})
        print('   ✓ Sent successfully')
    else:
        print('   ✗ Template or data not found')
except Exception as e:
    print(f'   ✗ Error: {e}')

print()
print('All tests complete! Check renbranmadelo@gmail.com for emails.')
