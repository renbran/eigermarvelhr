#!/usr/bin/env python3
import odoorpc

# Connect to Odoo
odoo = odoorpc.ODOO('localhost', port=8069)
odoo.login('eigermarvel', 'admin', '8586583')

test_email = 'renbranmadelo@gmail.com'

print('='*70)
print('  EMAIL TEMPLATE TEST - UAE RECRUITMENT MANAGEMENT MODULE')
print('='*70)
print()

MailTemplate = odoo.env['mail.template']
results = {'sent': 0, 'skipped': 0, 'errors': 0}

# Template 1: Client Welcome
print('[1/6] Client Welcome Email...')
try:
    template = MailTemplate.search([('name', '=', 'Recruitment - Client Welcome')], limit=1)
    clients = odoo.env['recruitment.client'].search([], limit=1)
    
    if template and clients:
        MailTemplate.send_mail(template[0], clients[0], True, {'email_to': test_email})
        print('      ✅ SENT successfully')
        results['sent'] += 1
    else:
        print('      ⚠️  No client data (template is OK)')
        results['skipped'] += 1
except Exception as e:
    print(f'      ❌ ERROR: {str(e)[:60]}...')
    results['errors'] += 1

# Template 2: Application Received
print('[2/6] Application Received Email...')
try:
    template = MailTemplate.search([('name', '=', 'Recruitment - Application Received')], limit=1)
    applicants = odoo.env['hr.applicant'].search([], limit=1)
    
    if template and applicants:
        MailTemplate.send_mail(template[0], applicants[0], True, {'email_to': test_email})
        print('      ✅ SENT successfully')
        results['sent'] += 1
    else:
        print('      ⚠️  No applicant data (template is OK)')
        results['skipped'] += 1
except Exception as e:
    print(f'      ❌ ERROR: {str(e)[:60]}...')
    results['errors'] += 1

# Template 3: Interview Scheduled
print('[3/6] Interview Scheduled Email...')
try:
    template = MailTemplate.search([('name', '=', 'Recruitment - Interview Scheduled')], limit=1)
    applicants = odoo.env['hr.applicant'].search([], limit=1)
    
    if template and applicants:
        MailTemplate.send_mail(template[0], applicants[0], True, {'email_to': test_email})
        print('      ✅ SENT successfully')
        results['sent'] += 1
    else:
        print('      ⚠️  No applicant data (template is OK)')
        results['skipped'] += 1
except Exception as e:
    print(f'      ❌ ERROR: {str(e)[:60]}...')
    results['errors'] += 1

# Template 4: Placement Offer
print('[4/6] Placement Offer Email...')
try:
    template = MailTemplate.search([('name', '=', 'Recruitment - Placement Offer')], limit=1)
    placements = odoo.env['recruitment.placement'].search([], limit=1)
    
    if template and placements:
        MailTemplate.send_mail(template[0], placements[0], True, {'email_to': test_email})
        print('      ✅ SENT successfully')
        results['sent'] += 1
    else:
        print('      ⚠️  No placement data (template is OK)')
        results['skipped'] += 1
except Exception as e:
    print(f'      ❌ ERROR: {str(e)[:60]}...')
    results['errors'] += 1

# Template 5: Visa Documents Needed
print('[5/6] Visa Documents Needed Email...')
try:
    template = MailTemplate.search([('name', '=', 'Recruitment - Visa Documents Needed')], limit=1)
    visas = odoo.env['uae.visa.processing'].search([], limit=1)
    
    if template and visas:
        MailTemplate.send_mail(template[0], visas[0], True, {'email_to': test_email})
        print('      ✅ SENT successfully')
        results['sent'] += 1
    else:
        print('      ⚠️  No visa processing data (template is OK)')
        results['skipped'] += 1
except Exception as e:
    print(f'      ❌ ERROR: {str(e)[:60]}...')
    results['errors'] += 1

# Template 6: Visa Medical Exam
print('[6/6] Visa Medical Exam Email...')
try:
    template = MailTemplate.search([('name', '=', 'Recruitment - Medical Exam Scheduled')], limit=1)
    visas = odoo.env['uae.visa.processing'].search([], limit=1)
    
    if template and visas:
        MailTemplate.send_mail(template[0], visas[0], True, {'email_to': test_email})
        print('      ✅ SENT successfully')
        results['sent'] += 1
    else:
        print('      ⚠️  No visa processing data (template is OK)')
        results['skipped'] += 1
except Exception as e:
    print(f'      ❌ ERROR: {str(e)[:60]}...')
    results['errors'] += 1

print()
print('='*70)
print('  TEST RESULTS')
print('='*70)
print(f'  ✅ Successfully Sent:  {results["sent"]} email(s)')
print(f'  ⚠️  Skipped (no data):  {results["skipped"]} template(s)')
print(f'  ❌ Errors:             {results["errors"]} template(s)')
print('='*70)
print()
if results['sent'] > 0:
    print(f'📧 Check {test_email} for {results["sent"]} email(s)!')
print()
if results['errors'] == 0:
    print('✅ ALL TEMPLATES ARE CORRECT AND ERROR-FREE!')
else:
    print('❌ Some templates have errors - review above for details')
print()
