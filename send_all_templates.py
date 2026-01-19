#!/usr/bin/env python3
import odoorpc
from datetime import datetime, timedelta

o = odoorpc.ODOO('localhost', port=8069)
o.login('eigermarvel', 'admin', '8586583')

MailTemplate = o.env['mail.template']
Client = o.env['recruitment.client']
Applicant = o.env['recruitment.applicant']
Placement = o.env['recruitment.placement']
Visa = o.env['recruitment.visa']

test_email = 'renbranmadelo@gmail.com'

print('='*70)
print('SENDING ALL EMAIL TEMPLATES TO:', test_email)
print('='*70)
print()

# Template 1: Client Welcome (already tested, but send again)
print('📧 Template 1: Client Welcome')
template1 = MailTemplate.search([('name', '=', 'Recruitment - Client Welcome')], limit=1)
clients = Client.search([], limit=1)
if template1 and clients:
    try:
        MailTemplate.send_mail(template1[0], clients[0], True, {'email_to': test_email})
        print('   ✅ Sent successfully')
    except Exception as e:
        print(f'   ❌ Error: {str(e)[:150]}')
else:
    print('   ⚠️  No client data available')
print()

# Template 2: Application Received
print('📧 Template 2: Application Received')
template2 = MailTemplate.search([('name', '=', 'Recruitment - Application Received')], limit=1)
applicants = Applicant.search([], limit=1)
if template2:
    if applicants:
        try:
            MailTemplate.send_mail(template2[0], applicants[0], True, {'email_to': test_email})
            print('   ✅ Sent successfully')
        except Exception as e:
            print(f'   ❌ Error: {str(e)[:150]}')
    else:
        print('   ⚠️  No applicant data - creating test applicant...')
        try:
            # Create test applicant
            test_applicant = Applicant.create({
                'name': 'Test Applicant',
                'email': test_email,
                'phone': '+971501234567',
                'position': 'Software Developer',
            })
            MailTemplate.send_mail(template2[0], test_applicant, True, {'email_to': test_email})
            print('   ✅ Created test data and sent successfully')
        except Exception as e:
            print(f'   ❌ Error: {str(e)[:150]}')
print()

# Template 3: Interview Scheduled
print('📧 Template 3: Interview Scheduled')
template3 = MailTemplate.search([('name', '=', 'Recruitment - Interview Scheduled')], limit=1)
if template3:
    applicants = Applicant.search([], limit=1)
    if applicants:
        try:
            MailTemplate.send_mail(template3[0], applicants[0], True, {'email_to': test_email})
            print('   ✅ Sent successfully')
        except Exception as e:
            print(f'   ❌ Error: {str(e)[:150]}')
    else:
        print('   ⚠️  No applicant data available')
print()

# Template 4: Placement Offer
print('📧 Template 4: Placement Offer')
template4 = MailTemplate.search([('name', '=', 'Recruitment - Placement Offer')], limit=1)
placements = Placement.search([], limit=1)
if template4:
    if placements:
        try:
            MailTemplate.send_mail(template4[0], placements[0], True, {'email_to': test_email})
            print('   ✅ Sent successfully')
        except Exception as e:
            print(f'   ❌ Error: {str(e)[:150]}')
    else:
        print('   ⚠️  No placement data - attempting with client data...')
        clients = Client.search([], limit=1)
        if clients:
            try:
                # Try creating a placement if we have a client
                applicants = Applicant.search([], limit=1)
                if applicants:
                    test_placement = Placement.create({
                        'client_id': clients[0],
                        'applicant_id': applicants[0],
                        'position': 'Test Position',
                        'salary': 5000.0,
                    })
                    MailTemplate.send_mail(template4[0], test_placement, True, {'email_to': test_email})
                    print('   ✅ Created test data and sent successfully')
                else:
                    print('   ❌ Cannot create placement without applicant')
            except Exception as e:
                print(f'   ⚠️  Skipped: {str(e)[:100]}')
print()

# Template 5: Visa Documents Needed
print('📧 Template 5: Visa Documents Needed')
template5 = MailTemplate.search([('name', '=', 'Recruitment - Visa Documents Needed')], limit=1)
visas = Visa.search([], limit=1)
if template5:
    if visas:
        try:
            MailTemplate.send_mail(template5[0], visas[0], True, {'email_to': test_email})
            print('   ✅ Sent successfully')
        except Exception as e:
            print(f'   ❌ Error: {str(e)[:150]}')
    else:
        print('   ⚠️  No visa data - attempting to create test record...')
        applicants = Applicant.search([], limit=1)
        if applicants:
            try:
                test_visa = Visa.create({
                    'applicant_id': applicants[0],
                    'visa_type': 'employment',
                })
                MailTemplate.send_mail(template5[0], test_visa, True, {'email_to': test_email})
                print('   ✅ Created test data and sent successfully')
            except Exception as e:
                print(f'   ⚠️  Skipped: {str(e)[:100]}')
print()

# Template 6: Medical Exam Scheduled
print('📧 Template 6: Medical Exam Scheduled')
template6 = MailTemplate.search([('name', '=', 'Recruitment - Medical Exam Scheduled')], limit=1)
if template6:
    visas = Visa.search([], limit=1)
    if visas:
        try:
            MailTemplate.send_mail(template6[0], visas[0], True, {'email_to': test_email})
            print('   ✅ Sent successfully')
        except Exception as e:
            print(f'   ❌ Error: {str(e)[:150]}')
    else:
        print('   ⚠️  No visa data available')
print()

print('='*70)
print('✅ EMAIL TEMPLATE TESTING COMPLETE')
print('='*70)
print()
print(f'📧 Check {test_email} for all test emails')
print()
