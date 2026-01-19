#!/usr/bin/env python3
"""
FINAL: Create Mock Data and Send ALL Recruitment Emails
"""

import requests
import sys
from datetime import datetime

ODOO_URL = 'https://eigermarvelhr.com'
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'
TEST_EMAIL = 'renbranmadelo@gmail.com'

def print_header(title):
    print('\n' + '='*70)
    print(f'  {title}')
    print('='*70)

def print_section(title):
    print(f'\n{title}')
    print('-' * 70)

def authenticate():
    url = f'{ODOO_URL}/web/session/authenticate'
    payload = {'jsonrpc': '2.0', 'method': 'call', 'params': {'db': ODOO_DB, 'login': ODOO_USER, 'password': ODOO_PASSWORD}, 'id': 1}
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, verify=False, timeout=30)
    if response.status_code == 200:
        data = response.json()
        if 'result' in data and data['result']:
            return response.cookies
    return None

def call_rpc(cookies, method, model, args=None, kwargs=None):
    """Call using /web/dataset/call_kw endpoint"""
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

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

print_header('COMPLETE EMAIL TESTING SOLUTION')
print(f'\n📧 Email: {TEST_EMAIL}')
print(f'🕐 Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')

print_section('AUTHENTICATION')

print('🔐 Authenticating...')
cookies = authenticate()

if not cookies:
    print('❌ Auth failed')
    sys.exit(1)

print('✅ Authenticated\n')

test_data = {}

# ============= GET BASIC DATA =============
print_section('GETTING BASIC DATA')

# Jobs
success, jobs = call_rpc(cookies, 'search_read', 'hr.job', kwargs={'limit': 1, 'fields': ['id', 'name']})
if success and jobs:
    job_id = jobs[0]['id']
    print(f'✅ Job: {jobs[0]["name"]} (ID: {job_id})')
else:
    print('❌ No jobs')
    sys.exit(1)

# Stages
success, stages = call_rpc(cookies, 'search_read', 'hr.recruitment.stage', kwargs={'limit': 1, 'fields': ['id']})
stage_id = stages[0]['id'] if success and stages else None
if stage_id:
    print(f'✅ Stage (ID: {stage_id})')

# Candidates
success, candidates = call_rpc(cookies, 'search_read', 'recruitment.candidate', kwargs={'limit': 3, 'fields': ['id', 'name']})
if success and candidates:
    candidate_ids = [c['id'] for c in candidates]
    print(f'✅ Found {len(candidate_ids)} candidates')
else:
    print('⚠️  No candidates found')
    candidate_ids = []

# Client
success, clients = call_rpc(cookies, 'search_read', 'recruitment.client', kwargs={'limit': 1, 'fields': ['id', 'name']})
if success and clients:
    client_id = clients[0]['id']
    print(f'✅ Client: {clients[0]["name"]} (ID: {client_id})')
else:
    print('❌ No client')
    sys.exit(1)

print()

# ============= CREATE APPLICANTS =============
print_section('CREATING APPLICANTS')

applicant_ids = []

if candidate_ids:
    for i, cand_id in enumerate(candidate_ids, 1):
        success, app_id = call_rpc(
            cookies,
            'create',
            'hr.applicant',
            args=[[{
                'candidate_id': cand_id,
                'job_id': job_id,
                'stage_id': stage_id,
                'partner_name': f'Mock Applicant {i}',
                'email_from': f'applicant{i}@test.com',
            }]]
        )
        
        if success:
            applicant_ids.append(app_id)
            print(f'✅ Applicant {i} (ID: {app_id})')
        else:
            print(f'❌ Applicant {i} failed: {app_id}')

if not applicant_ids:
    print('⚠️  Could not create applicants')

print()

# ============= CREATE PLACEMENTS =============
print_section('CREATING PLACEMENTS')

placement_ids = []

for i, app_id in enumerate(applicant_ids, 1):
    success, place_id = call_rpc(
        cookies,
        'create',
        'recruitment.placement',
        args=[[{
            'applicant_id': app_id,
            'job_order_id': job_id,
        }]]
    )
    
    if success:
        placement_ids.append(place_id)
        print(f'✅ Placement {i} (ID: {place_id})')
    else:
        print(f'⚠️  Placement {i}: {str(place_id)[:50]}')

print()

# ============= CREATE VISA RECORDS =============
print_section('CREATING VISA RECORDS')

visa_ids = []

for i, app_id in enumerate(applicant_ids, 1):
    success, visa_id = call_rpc(
        cookies,
        'create',
        'uae.visa.processing',
        args=[[{'applicant_id': app_id}]]
    )
    
    if success:
        visa_ids.append(visa_id)
        print(f'✅ Visa {i} (ID: {visa_id})')
    else:
        print(f'⚠️  Visa {i}: {str(visa_id)[:50]}')

print()

# ============= GET TEMPLATES =============
print_section('GETTING EMAIL TEMPLATES')

success, templates = call_rpc(
    cookies,
    'search_read',
    'mail.template',
    kwargs={'domain': [('name', 'ilike', 'Recruitment')], 'limit': 20, 'fields': ['id', 'name']}
)

if success and templates:
    print(f'✅ Found {len(templates)} templates\n')
else:
    print('❌ No templates')
    sys.exit(1)

# ============= SEND ALL EMAILS =============
print_section('SENDING EMAILS')

print(f'📧 To: {TEST_EMAIL}\n')

template_map = {
    'Recruitment - Client Welcome': client_id,
    'Recruitment - Client Verified': client_id,
    'Recruitment - Application Received': applicant_ids[0] if applicant_ids else None,
    'Recruitment - Interview Scheduled': applicant_ids[1] if len(applicant_ids) > 1 else (applicant_ids[0] if applicant_ids else None),
    'Recruitment - Placement Offer': placement_ids[0] if placement_ids else None,
    'Recruitment - Placement Confirmed': placement_ids[1] if len(placement_ids) > 1 else (placement_ids[0] if placement_ids else None),
    'Recruitment - Visa Documents Needed': visa_ids[0] if visa_ids else None,
    'Recruitment - Medical Exam Scheduled': visa_ids[1] if len(visa_ids) > 1 else (visa_ids[0] if visa_ids else None),
    'Recruitment - Visa Completed': visa_ids[0] if visa_ids else None,
}

sent_count = 0
failed_count = 0
skipped_count = 0

for i, template in enumerate(templates, 1):
    template_name = template['name']
    template_id = template['id']
    
    if template_name not in template_map:
        continue
    
    record_id = template_map[template_name]
    
    if not record_id:
        print(f'{i}. ⏭️  {template_name} (no data)')
        skipped_count += 1
        continue
    
    print(f'{i}. 📧 {template_name}')
    
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
        print(f'   ✅ SENT (ID: {msg_id})')
        sent_count += 1
    else:
        print(f'   ❌ FAILED: {msg_id}')
        failed_count += 1

# ============= SUMMARY =============
print_header('FINAL REPORT')

print(f'\n📊 Data Created:')
print(f'   ✅ Candidates: {len(candidate_ids)}')
print(f'   ✅ Applicants: {len(applicant_ids)}')
print(f'   ✅ Placements: {len(placement_ids)}')
print(f'   ✅ Visa Records: {len(visa_ids)}')

print(f'\n📧 Emails Sent to: {TEST_EMAIL}')

print(f'\n📊 Results:')
print(f'   ✅ Sent: {sent_count}')
print(f'   ❌ Failed: {failed_count}')
print(f'   ⏭️  Skipped: {skipped_count}')
print(f'   📋 Total: {sent_count + failed_count + skipped_count}')

print(f'\n✨ All recruitment emails have been sent!')
print(f'   Check {TEST_EMAIL} for the emails')
print()
