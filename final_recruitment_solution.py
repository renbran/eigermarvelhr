#!/usr/bin/env python3
"""
FINAL WORKING SOLUTION: Create Mock Data and Send ALL Recruitment Emails
Using: hr.candidate, hr.applicant, hr.employee, mail.template
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

print_header('🎯 COMPLETE RECRUITMENT EMAIL TESTING')
print(f'\n📧 Target Email: {TEST_EMAIL}')
print(f'🕐 Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')

print_section('AUTHENTICATION')

print('🔐 Connecting to Odoo...')
cookies = authenticate()

if not cookies:
    print('❌ Authentication failed')
    sys.exit(1)

print('✅ Successfully authenticated\n')

# ============= GET BASIC DATA =============
print_section('FETCHING BASE DATA')

# Jobs
success, jobs = call_rpc(cookies, 'search_read', 'hr.job', kwargs={'limit': 1, 'fields': ['id', 'name']})
if success and jobs:
    job_id = jobs[0]['id']
    print(f'✅ Job: {jobs[0]["name"]} (ID: {job_id})')
else:
    print('❌ No jobs found')
    sys.exit(1)

# Stages
success, stages = call_rpc(cookies, 'search_read', 'hr.recruitment.stage', kwargs={'limit': 1, 'fields': ['id']})
stage_id = stages[0]['id'] if success and stages else 1
print(f'✅ Stage (ID: {stage_id})')

# Client
success, clients = call_rpc(cookies, 'search_read', 'recruitment.client', kwargs={'limit': 1, 'fields': ['id', 'name']})
if success and clients:
    client_id = clients[0]['id']
    print(f'✅ Client: {clients[0]["name"]} (ID: {client_id})')
else:
    print('❌ No client')
    sys.exit(1)

print()

# ============= CREATE CANDIDATES =============
print_section('CREATING TEST CANDIDATES')

candidate_ids = []
candidate_names = ['Ahmed Hassan', 'Fatima Al Mansouri', 'Mohammed Al Mazrouei']

for i, name in enumerate(candidate_names, 1):
    success, cand_id = call_rpc(
        cookies,
        'create',
        'hr.candidate',
        args=[[{
            'name': name,
            'email': f'candidate{i}@test.com',
            'phone': f'+971{50000000 + i}',
        }]]
    )
    
    if success:
        candidate_ids.append(cand_id)
        print(f'✅ Candidate {i}: {name} (ID: {cand_id})')
    else:
        print(f'❌ Candidate {i} failed: {cand_id}')

if not candidate_ids:
    print('⚠️  Could not create candidates - proceeding with applicants only')

print()

# ============= CREATE APPLICANTS =============
print_section('CREATING TEST APPLICANTS')

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
                'partner_name': f'Applicant {i}',
                'email_from': f'applicant{i}@test.com',
            }]]
        )
        
        if success:
            applicant_ids.append(app_id)
            print(f'✅ Applicant {i} (ID: {app_id})')
        else:
            print(f'❌ Applicant {i}: {str(app_id)[:50]}')

print()

# ============= CREATE PLACEMENTS =============
print_section('CREATING TEST PLACEMENTS')

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
        print(f'⚠️  Placement {i}: {str(place_id)[:40]}')

print()

# ============= CREATE VISAS =============
print_section('CREATING TEST VISA RECORDS')

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
        print(f'⚠️  Visa {i}: {str(visa_id)[:40]}')

print()

# ============= GET TEMPLATES =============
print_section('LOADING EMAIL TEMPLATES')

success, templates = call_rpc(
    cookies,
    'search_read',
    'mail.template',
    kwargs={'domain': [('name', 'ilike', 'Recruitment')], 'limit': 20, 'fields': ['id', 'name', 'model']}
)

if success and templates:
    print(f'✅ Found {len(templates)} recruitment templates\n')
    for tpl in templates:
        print(f'   - {tpl["name"]}')
else:
    print('❌ No templates found')
    sys.exit(1)

print()

# ============= SEND EMAILS =============
print_section(f'SENDING EMAILS TO {TEST_EMAIL}')

template_map = {
    'Recruitment - Client Welcome': ('client', client_id),
    'Recruitment - Client Verified': ('client', client_id),
    'Recruitment - Application Received': ('applicant', applicant_ids[0] if applicant_ids else None),
    'Recruitment - Interview Scheduled': ('applicant', applicant_ids[1] if len(applicant_ids) > 1 else (applicant_ids[0] if applicant_ids else None)),
    'Recruitment - Placement Offer': ('placement', placement_ids[0] if placement_ids else None),
    'Recruitment - Placement Confirmed': ('placement', placement_ids[1] if len(placement_ids) > 1 else (placement_ids[0] if placement_ids else None)),
    'Recruitment - Visa Documents Needed': ('visa', visa_ids[0] if visa_ids else None),
    'Recruitment - Medical Exam Scheduled': ('visa', visa_ids[1] if len(visa_ids) > 1 else (visa_ids[0] if visa_ids else None)),
    'Recruitment - Visa Completed': ('visa', visa_ids[0] if visa_ids else None),
}

sent_count = 0
failed_count = 0
skipped_count = 0

print()

for i, template in enumerate(templates, 1):
    template_name = template['name']
    template_id = template['id']
    
    if template_name not in template_map:
        continue
    
    rec_type, record_id = template_map[template_name]
    
    if not record_id:
        print(f'{i}. ⏭️  {template_name:45} [No data]')
        skipped_count += 1
        continue
    
    print(f'{i}. 📧 {template_name:45}', end=' ')
    
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
        print(f'✅ (ID: {msg_id})')
        sent_count += 1
    else:
        print(f'❌')
        failed_count += 1

# ============= FINAL REPORT =============
print_header('📊 FINAL REPORT')

print(f'\n✅ DATA CREATED:')
print(f'   • Candidates:      {len(candidate_ids)}')
print(f'   • Applicants:      {len(applicant_ids)}')
print(f'   • Placements:      {len(placement_ids)}')
print(f'   • Visa Records:    {len(visa_ids)}')

print(f'\n📧 EMAIL DELIVERY ({TEST_EMAIL}):')
print(f'   ✅ Sent:          {sent_count}')
print(f'   ❌ Failed:        {failed_count}')
print(f'   ⏭️  Skipped:       {skipped_count}')
print(f'   ━━━━━━━━━━━━━━━')
print(f'   📊 Total:         {sent_count + failed_count + skipped_count}')

success_rate = round((sent_count / (sent_count + failed_count) * 100)) if (sent_count + failed_count) > 0 else 0
print(f'\n✨ SUCCESS RATE: {success_rate}%')

print(f'\n🎯 CHECK YOUR EMAIL: {TEST_EMAIL}')
print()
