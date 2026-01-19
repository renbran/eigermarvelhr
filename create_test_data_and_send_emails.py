#!/usr/bin/env python3
import odoorpc
from datetime import datetime, timedelta

# Connect to Odoo
odoo = odoorpc.ODOO('localhost', port=8069)
odoo.login('eigermarvel', 'admin', '8586583')

test_email = 'renbranmadelo@gmail.com'
MailTemplate = odoo.env['mail.template']

print('Creating test data and sending all email templates...\n')

# Initialize variables for later use
applicant_id = None
placement_id = None
visa_id = None

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
    print(f'   ✗ Error: {e}')

# 2. Application Received Email - Create test applicant if needed
try:
    print('2. Application Received Email...')
    Applicant = odoo.env['hr.applicant']
    Job = odoo.env['hr.job']
    Partner = odoo.env['res.partner']
    
    # Create a partner (candidate) first
    partner_id = Partner.create({
        'name': 'John Doe',
        'email': 'john.doe@example.com',
        'phone': '+971501234567',
    })
    
    # Get or create a job position
    jobs = Job.search([], limit=1)
    if not jobs:
        job_id = Job.create({
            'name': 'Software Engineer',
            'no_of_recruitment': 1,
        })
    else:
        job_id = jobs[0]
    
    # Create test applicant
    applicant_id = Applicant.create({
        'partner_name': 'John Doe',
        'email_from': 'john.doe@example.com',
        'candidate_id': partner_id,
        'job_id': job_id,
    })
    
    template = MailTemplate.search([('name', '=', 'Recruitment - Application Received')], limit=1)
    if template:
        MailTemplate.send_mail(template[0], applicant_id, force_send=True, email_values={'email_to': test_email})
        print('   ✓ Sent successfully')
    else:
        print('   ✗ Template not found')
except Exception as e:
    print(f'   ✗ Error: {e}')

# 3. Interview Scheduled Email - Use same applicant
try:
    print('3. Interview Scheduled Email...')
    template = MailTemplate.search([('name', '=', 'Recruitment - Interview Scheduled')], limit=1)
    if template and applicant_id:
        MailTemplate.send_mail(template[0], applicant_id, force_send=True, email_values={'email_to': test_email})
        print('   ✓ Sent successfully')
    else:
        print('   ✗ Template or applicant not found')
except Exception as e:
    print(f'   ✗ Error: {e}')

# 4. Placement Offer Email - Create test placement
try:
    print('4. Placement Offer Email...')
    Placement = odoo.env['recruitment.placement']
    JobOrder = odoo.env['recruitment.job.order']
    Client = odoo.env['recruitment.client']
    Currency = odoo.env['res.currency']
    
    # Get currency
    currency = Currency.search([('name', '=', 'AED')], limit=1)
    if not currency:
        currency = Currency.search([], limit=1)
    
    # Get or use existing client
    clients = Client.search([], limit=1)
    client_id = clients[0] if clients else None
    
    # Create job order if client exists
    if client_id:
        job_order = JobOrder.search([], limit=1)
        if not job_order:
            job_order_id = JobOrder.create({
                'name': 'Senior Developer Position',
                'client_id': client_id,
                'position_qty': 1,
            })
        else:
            job_order_id = job_order[0]
        
        # Create placement
        placement_id = Placement.create({
            'applicant_id': applicant_id,
            'job_order_id': job_order_id,
            'client_id': client_id,
            'gross_salary': 15000.0,
            'currency_id': currency[0] if currency else False,
            'joining_date': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            'confirmation_period_days': 90,
        })
        
        template = MailTemplate.search([('name', '=', 'Recruitment - Placement Offer')], limit=1)
        if template:
            MailTemplate.send_mail(template[0], placement_id, force_send=True, email_values={'email_to': test_email})
            print('   ✓ Sent successfully')
        else:
            print('   ✗ Template not found')
    else:
        print('   ✗ No client found to create placement')
except Exception as e:
    print(f'   ✗ Error: {e}')

# 5. Visa Documents Needed Email - Create test visa record
try:
    print('5. Visa Documents Needed Email...')
    Visa = odoo.env['uae.visa.processing']
    Client = odoo.env['recruitment.client']
    
    # Get client
    clients = Client.search([], limit=1)
    client_id = clients[0] if clients else None
    
    if client_id and applicant_id:
        # Create visa record
        visa_id = Visa.create({
            'applicant_id': applicant_id,
            'client_id': client_id,
            'visa_type': 'employment',
        })
        template = MailTemplate.search([('name', '=', 'Recruitment - Visa Documents Needed')], limit=1)
        if template:
            MailTemplate.send_mail(template[0], visa_id, force_send=True, email_values={'email_to': test_email})
            print('   ✓ Sent successfully')
        else:
            print('   ✗ Template not found')
    else:
        print('   ✗ Missing client or applicant')
except Exception as e:
    print(f'   ✗ Error: {e}')

# 6. Visa Medical Exam Email - Use same visa record
try:
    print('6. Visa Medical Exam Email...')
    if visa_id:
        # Update visa with medical exam details
        Visa.write([visa_id], {
            'medical_exam_date': (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d'),
            'medical_exam_location': 'Dubai Health Authority Medical Center',
        })
        
        template = MailTemplate.search([('name', '=', 'Recruitment - Medical Exam Scheduled')], limit=1)
        if template:
            MailTemplate.send_mail(template[0], visa_id, force_send=True, email_values={'email_to': test_email})
            print('   ✓ Sent successfully')
        else:
            print('   ✗ Template not found')
    else:
        print('   ✗ Visa record not found')
except Exception as e:
    print(f'   ✗ Error: {e}')

print('\n✅ All tests complete! Check renbranmadelo@gmail.com for all 6 emails.')
