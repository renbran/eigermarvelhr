#!/usr/bin/env python3
"""
🇦🇪 FINAL WORKING: UE Recruitment Management - Complete Email & Data Solution
Creates candidates → applicants → placements → visas → sends all emails
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
    print('\n' + '='*75)
    print(f'  {title}')
    print('='*75)

def print_section(title):
    print(f'\n{title}')
    print('-' * 75)

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

print_header('🇦🇪 UE RECRUITMENT MANAGEMENT - COMPLETE SOLUTION')
print(f'\n📧 Email: {TEST_EMAIL}')
print(f'🕐 Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')

print_section('AUTHENTICATION')

cookies = authenticate()
if not cookies:
    print('❌ Failed')
    sys.exit(1)

print('✅ Connected\n')

# ============= GET BASE DATA =============
print_section('GETTING BASE DATA')

# Client
success, clients = call_rpc(cookies, 'search_read', 'recruitment.client', kwargs={'limit': 1, 'fields': ['id', 'name']})
client_id = clients[0]['id'] if success and clients else None
print(f'{"✅" if client_id else "❌"} Client: {clients[0]["name"] if client_id else "NOT FOUND"} (ID: {client_id})')

# Job
success, jobs = call_rpc(cookies, 'search_read', 'recruitment.job.order', kwargs={'limit': 1, 'fields': ['id', 'name']})
job_id = jobs[0]['id'] if success and jobs else None
print(f'{"✅" if job_id else "❌"} Job: {jobs[0]["name"] if job_id else "NOT FOUND"} (ID: {job_id})')

# Stage
success, stages = call_rpc(cookies, 'search_read', 'hr.recruitment.stage', kwargs={'limit': 1, 'fields': ['id']})
stage_id = stages[0]['id'] if success and stages else 1
print(f'✅ Stage (ID: {stage_id})')

if not (client_id and job_id):
    print('\n❌ Missing base data')
    sys.exit(1)

print()

# ============= CREATE CANDIDATES =============
print_section('CREATING CANDIDATES')

candidate_ids = []
candidates = [
    {'partner_name': 'Ahmed Al Mansouri', 'email_from': 'ahmed@test.ae'},
    {'partner_name': 'Fatima Al Mazrouei', 'email_from': 'fatima@test.ae'},
    {'partner_name': 'Mohammed Al Mansouri', 'email_from': 'mohammed@test.ae'},
]

for i, cand_data in enumerate(candidates, 1):
    success, cand_id = call_rpc(cookies, 'create', 'hr.candidate', args=[[cand_data]])
    
    if success:
        candidate_ids.append(cand_id)
        print(f'✅ {i}. {cand_data["partner_name"]} (ID: {cand_id})')
    else:
        print(f'❌ {i}. Failed: {str(cand_id)[:50]}')

if not candidate_ids:
    print('⚠️  Could not create candidates')

print()

# ============= CREATE APPLICANTS =============
print_section('CREATING APPLICANTS')

applicant_ids = []

for i, cand_id in enumerate(candidate_ids, 1):
    # Extract ID if it's a list
    actual_cand_id = cand_id[0] if isinstance(cand_id, list) else cand_id
    
    app_data = {
        'candidate_id': actual_cand_id,
        'job_id': job_id,
        'stage_id': stage_id,
        'partner_name': f'Applicant {i}',
        'email_from': f'app{i}@test.ae',
        'kanban_state': 'normal',
    }
    
    success, app_id = call_rpc(cookies, 'create', 'hr.applicant', args=[[app_data]])
    
    if success:
        applicant_ids.append(app_id)
        print(f'✅ {i}. Applicant (ID: {app_id})')
    else:
        print(f'❌ {i}. Failed: {str(app_id)[:50]}')

print()

# ============= CREATE PLACEMENTS =============
print_section('CREATING PLACEMENTS')

placement_ids = []
today = datetime.now().strftime('%Y-%m-%d')

for i, app_id in enumerate(applicant_ids[:2], 1):
    place_data = {
        'applicant_id': app_id,
        'client_id': client_id,
        'job_order_id': job_id,
        'placement_date': today,
    }
    
    success, place_id = call_rpc(cookies, 'create', 'recruitment.placement', args=[[place_data]])
    
    if success:
        placement_ids.append(place_id)
        print(f'✅ {i}. Placement (ID: {place_id})')
    else:
        print(f'⚠️  {i}. {str(place_id)[:40]}')

print()

# ============= CREATE VISA RECORDS =============
print_section('CREATING VISA RECORDS')

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
        print(f'✅ {i}. Visa (ID: {visa_id})')
    else:
        print(f'⚠️  {i}. {str(visa_id)[:40]}')

print()

# ============= SEND EMAILS =============
print_section('SENDING EMAILS')

success, templates = call_rpc(cookies, 'search_read', 'mail.template', kwargs={'domain': [('name', 'ilike', 'Recruitment')], 'limit': 20, 'fields': ['id', 'name']})

if not (success and templates):
    print('❌ No templates')
    sys.exit(1)

template_map = {
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

sent = failed = skipped = 0

print()

for i, tpl in enumerate(templates, 1):
    name = tpl['name']
    tpl_id = tpl['id']
    
    if name not in template_map:
        continue
    
    rec_id = template_map[name]
    
    if not rec_id:
        print(f'{i}. ⏭️  {name:50}')
        skipped += 1
        continue
    
    print(f'{i}. 📧 {name:50}', end=' ')
    
    success, msg_id = call_rpc(cookies, 'send_mail', 'mail.template', args=[tpl_id], kwargs={'res_id': rec_id, 'force_send': True, 'email_values': {'email_to': TEST_EMAIL}})
    
    if success:
        print(f'✅')
        sent += 1
    else:
        print(f'❌')
        failed += 1

# ============= REPORT =============
print_header('📊 FINAL REPORT')

print(f'\n✅ DATA CREATED:')
print(f'   Candidates:   {len(candidate_ids)}')
print(f'   Applicants:   {len(applicant_ids)}')
print(f'   Placements:   {len(placement_ids)}')
print(f'   Visas:        {len(visa_ids)}')

print(f'\n📧 EMAILS ({TEST_EMAIL}):')
print(f'   ✅ Sent:      {sent}')
print(f'   ❌ Failed:    {failed}')
print(f'   ⏭️  Skipped:   {skipped}')

if (sent + failed) > 0:
    rate = round((sent / (sent + failed) * 100))
    print(f'\n✨ SUCCESS: {rate}%')

print(f'\n✅ Check your email: {TEST_EMAIL}')
print()
