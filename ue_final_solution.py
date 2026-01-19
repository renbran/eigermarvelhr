#!/usr/bin/env python3
"""
🇦🇪 FINAL: UE RECRUITMENT MANAGEMENT - Complete Email Solution
Creates test data using correct fields and sends all recruitment emails
"""

import requests
import sys
from datetime import datetime, timedelta

ODOO_URL = 'https://eigermarvelhr.com'
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'
TEST_EMAIL = 'renbranmadelo@gmail.com'

def print_header(title):
    print('\n' + '='*75)
    print(f'  {title}')
    print('='*75)

def print_section(title):
    print(f'\n{title}')
    print('-' * 75)

def authenticate():
    """Authenticate with Odoo"""
    url = f'{ODOO_URL}/web/session/authenticate'
    payload = {'jsonrpc': '2.0', 'method': 'call', 'params': {'db': ODOO_DB, 'login': ODOO_USER, 'password': ODOO_PASSWORD}, 'id': 1}
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, verify=False, timeout=30)
    if response.status_code == 200:
        data = response.json()
        if 'result' in data and data['result']:
            return response.cookies
    return None

def call_rpc(cookies, method, model, args=None, kwargs=None):
    """Call /web/dataset/call_kw RPC endpoint"""
    url = f'{ODOO_URL}/web/dataset/call_kw'
    payload = {
        'jsonrpc': '2.0',
        'method': 'call',
        'params': {
            'model': model,
            'method': method,
            'args': args or [],
            'kwargs': kwargs or {},
        },
        'id': 1,
    }
    
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, cookies=cookies, verify=False, timeout=30)
    if response.status_code == 200:
        data = response.json()
        if 'result' in data:
            return True, data['result']
        else:
            msg = data.get('error', {})
            if isinstance(msg, dict):
                msg = msg.get('data', {}).get('message', str(msg))
            return False, str(msg)[:100]
    return False, f'HTTP {response.status_code}'

# Suppress SSL warnings
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

print_header('🇦🇪 UE RECRUITMENT MANAGEMENT - COMPLETE EMAIL SOLUTION')
print(f'\n📧 Target Email: {TEST_EMAIL}')
print(f'🕐 Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')

print_section('AUTHENTICATION')

cookies = authenticate()
if not cookies:
    print('❌ Authentication failed')
    sys.exit(1)

print('✅ Connected to Odoo server\n')

# ============= FETCH EXISTING DATA =============
print_section('FETCHING EXISTING DATA')

# Get client
success, clients = call_rpc(cookies, 'search_read', 'recruitment.client', kwargs={'limit': 1, 'fields': ['id', 'name']})
client_id = clients[0]['id'] if success and clients else None
if client_id:
    print(f'✅ Client: {clients[0]["name"]} (ID: {client_id})')
else:
    print('❌ No client found')
    sys.exit(1)

# Get job order
success, jobs = call_rpc(cookies, 'search_read', 'recruitment.job.order', kwargs={'limit': 1, 'fields': ['id', 'name']})
job_id = jobs[0]['id'] if success and jobs else None
if job_id:
    print(f'✅ Job Order: {jobs[0]["name"]} (ID: {job_id})')
else:
    print('❌ No job order found')
    sys.exit(1)

# Get or create recruitment stage
success, stages = call_rpc(cookies, 'search_read', 'hr.recruitment.stage', kwargs={'limit': 1, 'fields': ['id']})
stage_id = stages[0]['id'] if success and stages else 1
print(f'✅ Stage (ID: {stage_id})')

print()

# ============= CREATE APPLICANTS =============
print_section('CREATING TEST APPLICANTS')

applicant_ids = []
test_applicants = [
    {'partner_name': 'Ahmed Al Mansouri', 'email_from': 'ahmed.mansouri@test.ae', 'job_id': job_id},
    {'partner_name': 'Fatima Al Mazrouei', 'email_from': 'fatima.mazrouei@test.ae', 'job_id': job_id},
    {'partner_name': 'Mohammed Al Mansouri', 'email_from': 'mohammed.mansouri@test.ae', 'job_id': job_id},
]

for i, app_data in enumerate(test_applicants, 1):
    success, app_id = call_rpc(cookies, 'create', 'hr.applicant', args=[[app_data]])
    
    if success:
        applicant_ids.append(app_id)
        print(f'✅ Applicant {i}: {app_data["partner_name"]} (ID: {app_id})')
    else:
        print(f'❌ Applicant {i} failed: {str(app_id)[:50]}')

if not applicant_ids:
    print('⚠️  Could not create applicants')

print()

# ============= CREATE PLACEMENTS =============
print_section('CREATING TEST PLACEMENTS')

placement_ids = []
today = datetime.now().strftime('%Y-%m-%d')

for i, app_id in enumerate(applicant_ids[:2], 1):
    placement_data = {
        'applicant_id': app_id,
        'client_id': client_id,
        'job_order_id': job_id,
        'placement_date': today,
    }
    
    success, place_id = call_rpc(cookies, 'create', 'recruitment.placement', args=[[placement_data]])
    
    if success:
        placement_ids.append(place_id)
        print(f'✅ Placement {i} (ID: {place_id})')
    else:
        print(f'⚠️  Placement {i}: {str(place_id)[:50]}')

print()

# ============= CREATE VISA RECORDS =============
print_section('CREATING TEST VISA RECORDS')

visa_ids = []

for i, app_id in enumerate(applicant_ids[:2], 1):
    visa_data = {
        'applicant_id': app_id,
        'client_id': client_id,
        'visa_type': 'employment',
    }
    
    success, visa_id = call_rpc(cookies, 'create', 'uae.visa.processing', args=[[visa_data]])
    
    if success:
        visa_ids.append(visa_id)
        print(f'✅ Visa Record {i} (ID: {visa_id})')
    else:
        print(f'⚠️  Visa Record {i}: {str(visa_id)[:50]}')

print()

# ============= FETCH EMAIL TEMPLATES =============
print_section('LOADING RECRUITMENT EMAIL TEMPLATES')

success, templates = call_rpc(
    cookies,
    'search_read',
    'mail.template',
    kwargs={'domain': [('name', 'ilike', 'Recruitment')], 'limit': 20, 'fields': ['id', 'name', 'model']}
)

if success and templates:
    print(f'✅ Found {len(templates)} templates\n')
else:
    print('⚠️  No templates found')
    templates = []

print()

# ============= SEND EMAILS =============
print_section(f'SENDING EMAILS TO: {TEST_EMAIL}')

template_record_map = {
    'Recruitment - Client Welcome': client_id,
    'Recruitment - Client Verified': client_id,
    'Recruitment - Application Received': applicant_ids[0] if applicant_ids else None,
    'Recruitment - Interview Scheduled': applicant_ids[1] if len(applicant_ids) > 1 else None,
    'Recruitment - Placement Offer': placement_ids[0] if placement_ids else None,
    'Recruitment - Placement Confirmed': placement_ids[1] if len(placement_ids) > 1 else None,
    'Recruitment - Visa Documents Needed': visa_ids[0] if visa_ids else None,
    'Recruitment - Medical Exam Scheduled': visa_ids[1] if len(visa_ids) > 1 else None,
    'Recruitment - Visa Completed': visa_ids[0] if visa_ids else None,
}

sent_count = 0
failed_count = 0
skipped_count = 0

print()

for i, template in enumerate(templates, 1):
    template_name = template['name']
    template_id = template['id']
    
    if template_name not in template_record_map:
        continue
    
    record_id = template_record_map[template_name]
    
    if not record_id:
        print(f'{i}. ⏭️  {template_name:50} [No data]')
        skipped_count += 1
        continue
    
    print(f'{i}. 📧 {template_name:50}', end=' ')
    
    success, msg_id = call_rpc(
        cookies,
        'send_mail',
        'mail.template',
        args=[template_id],
        kwargs={
            'res_id': record_id,
            'force_send': True,
            'email_values': {'email_to': TEST_EMAIL}
        }
    )
    
    if success:
        print(f'✅ SENT (ID: {msg_id})')
        sent_count += 1
    else:
        print(f'❌')
        failed_count += 1

# ============= FINAL REPORT =============
print_header('📊 EXECUTION SUMMARY')

print(f'\n✅ DATA CREATED:')
print(f'   • Applicants:          {len(applicant_ids)}')
print(f'   • Placements:          {len(placement_ids)}')
print(f'   • Visa Records:        {len(visa_ids)}')

print(f'\n📧 EMAIL RESULTS ({TEST_EMAIL}):')
print(f'   ✅ Sent:               {sent_count}')
print(f'   ❌ Failed:             {failed_count}')
print(f'   ⏭️  Skipped:            {skipped_count}')
print(f'   {'─' * 35}')
print(f'   📊 Total:              {len(templates)}')

if (sent_count + failed_count) > 0:
    rate = round((sent_count / (sent_count + failed_count) * 100))
    print(f'\n✨ SUCCESS RATE: {rate}%')

print(f'\n🎯 CHECK YOUR EMAIL: {TEST_EMAIL}')
print(f'\n✅ Solution Complete!')
print()
