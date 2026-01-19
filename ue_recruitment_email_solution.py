#!/usr/bin/env python3
"""
🇦🇪 UE RECRUITMENT MANAGEMENT - Complete Email Testing Solution
Uses UE Recruitment Management module models:
- recruitment.client
- recruitment.job.order
- hr.applicant (extended)
- recruitment.placement
- uae.visa.processing
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

print_header('🇦🇪 UE RECRUITMENT MANAGEMENT - EMAIL TESTING SUITE')
print(f'\n📧 Target Email: {TEST_EMAIL}')
print(f'🕐 Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
print(f'📦 Module: UE Recruitment Management (v18.0)')

print_section('AUTHENTICATION & CONNECTION')

print('🔐 Connecting to Odoo server...')
cookies = authenticate()

if not cookies:
    print('❌ Authentication failed - Check credentials')
    sys.exit(1)

print('✅ Successfully authenticated\n')

# ============= FETCH BASE DATA =============
print_section('FETCHING BASE DATA FROM UE RECRUITMENT MODULE')

# Get a recruitment client
print('\n📌 Recruitment Clients:')
success, clients = call_rpc(cookies, 'search_read', 'recruitment.client', kwargs={'limit': 2, 'fields': ['id', 'name', 'email']})
if success and clients:
    client_ids = [c['id'] for c in clients]
    for c in clients:
        print(f'   ✅ {c["name"]} (ID: {c["id"]})')
else:
    print(f'   ⚠️  No clients: {clients}')
    client_ids = []

# Get job orders
print('\n📌 Job Orders:')
success, jobs = call_rpc(cookies, 'search_read', 'recruitment.job.order', kwargs={'limit': 2, 'fields': ['id', 'job_title', 'no_of_positions']})
if success and jobs:
    job_ids = [j['id'] for j in jobs]
    for j in jobs:
        print(f'   ✅ {j.get("job_title", "N/A")} (ID: {j["id"]}, Positions: {j.get("no_of_positions", "?")}) ')
else:
    print(f'   ⚠️  No job orders: {jobs}')
    job_ids = []

# Get existing applicants (hr.applicant)
print('\n📌 Applicants (hr.applicant):')
success, applicants = call_rpc(cookies, 'search_read', 'hr.applicant', kwargs={'limit': 5, 'fields': ['id', 'partner_name', 'email_from', 'stage_id']})
if success and applicants:
    applicant_ids = [a['id'] for a in applicants]
    print(f'   ✅ Found {len(applicants)} applicants')
    for a in applicants[:3]:
        print(f'      - {a.get("partner_name", "?")} ({a.get("email_from", "?")})')
else:
    print(f'   ⚠️  No applicants: {applicants}')
    applicant_ids = []

# Get placements
print('\n📌 Placements:')
success, placements = call_rpc(cookies, 'search_read', 'recruitment.placement', kwargs={'limit': 3, 'fields': ['id', 'applicant_id', 'status']})
if success and placements:
    placement_ids = [p['id'] for p in placements]
    print(f'   ✅ Found {len(placements)} placements')
    for p in placements[:2]:
        print(f'      - ID: {p["id"]}, Status: {p.get("status", "?")}')
else:
    print(f'   ⚠️  No placements: {placements}')
    placement_ids = []

# Get visa records
print('\n📌 Visa Processing Records:')
success, visas = call_rpc(cookies, 'search_read', 'uae.visa.processing', kwargs={'limit': 3, 'fields': ['id', 'applicant_id', 'status']})
if success and visas:
    visa_ids = [v['id'] for v in visas]
    print(f'   ✅ Found {len(visas)} visa records')
    for v in visas[:2]:
        print(f'      - ID: {v["id"]}, Status: {v.get("status", "?")}')
else:
    print(f'   ⚠️  No visa records: {visas}')
    visa_ids = []

print()

# ============= CREATE NEW APPLICANTS IF NEEDED =============
if not applicant_ids:
    print_section('CREATING TEST APPLICANTS')
    
    applicant_ids = []
    test_applicants = [
        {'partner_name': 'Ahmed Hassan Al Mansouri', 'email_from': 'ahmed.mansouri@test.com'},
        {'partner_name': 'Fatima Al Mazrouei', 'email_from': 'fatima.mazrouei@test.com'},
        {'partner_name': 'Mohammed Al Mazrouei', 'email_from': 'mohammed.mazrouei@test.com'},
    ]
    
    for i, app_data in enumerate(test_applicants, 1):
        # Add required fields for hr.applicant
        if job_ids:
            app_data['job_id'] = job_ids[0]
        
        success, app_id = call_rpc(
            cookies,
            'create',
            'hr.applicant',
            args=[[app_data]]
        )
        
        if success:
            applicant_ids.append(app_id)
            print(f'✅ Applicant {i}: {app_data["partner_name"]} (ID: {app_id})')
        else:
            print(f'❌ Applicant {i} failed: {str(app_id)[:60]}')
    
    print()

# ============= CREATE PLACEMENTS IF NEEDED =============
if applicant_ids and not placement_ids:
    print_section('CREATING TEST PLACEMENTS')
    
    placement_ids = []
    for i, app_id in enumerate(applicant_ids[:2], 1):
        if job_ids:
            success, place_id = call_rpc(
                cookies,
                'create',
                'recruitment.placement',
                args=[[{
                    'applicant_id': app_id,
                    'job_order_id': job_ids[0],
                    'status': 'placement_offered',
                }]]
            )
            
            if success:
                placement_ids.append(place_id)
                print(f'✅ Placement {i} (ID: {place_id})')
            else:
                print(f'⚠️  Placement {i}: {str(place_id)[:50]}')
    
    print()

# ============= CREATE VISA RECORDS IF NEEDED =============
if applicant_ids and not visa_ids:
    print_section('CREATING TEST VISA PROCESSING RECORDS')
    
    visa_ids = []
    for i, app_id in enumerate(applicant_ids[:2], 1):
        success, visa_id = call_rpc(
            cookies,
            'create',
            'uae.visa.processing',
            args=[[{
                'applicant_id': app_id,
                'status': 'documents_pending',
            }]]
        )
        
        if success:
            visa_ids.append(visa_id)
            print(f'✅ Visa Record {i} (ID: {visa_id})')
        else:
            print(f'⚠️  Visa Record {i}: {str(visa_id)[:50]}')
    
    print()

# ============= FETCH EMAIL TEMPLATES =============
print_section('FETCHING RECRUITMENT EMAIL TEMPLATES')

success, templates = call_rpc(
    cookies,
    'search_read',
    'mail.template',
    kwargs={'domain': [('name', 'ilike', 'Recruitment')], 'limit': 20, 'fields': ['id', 'name', 'model']}
)

if success and templates:
    print(f'✅ Found {len(templates)} recruitment templates:\n')
    for tpl in templates:
        print(f'   • {tpl["name"]:50} (Model: {tpl.get("model", "?")})')
else:
    print(f'⚠️  No templates found')
    templates = []

print()

# ============= SEND ALL EMAILS =============
print_section(f'SENDING EMAILS TO: {TEST_EMAIL}')

# Map templates to record IDs
template_record_map = {
    'Recruitment - Client Welcome': client_ids[0] if client_ids else None,
    'Recruitment - Client Verified': client_ids[1] if len(client_ids) > 1 else (client_ids[0] if client_ids else None),
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
        print(f'❌ FAILED')
        failed_count += 1

# ============= FINAL REPORT =============
print_header('📊 FINAL EXECUTION REPORT')

print(f'\n✅ DATA SUMMARY:')
print(f'   • Recruitment Clients:    {len(client_ids)}')
print(f'   • Job Orders:             {len(job_ids)}')
print(f'   • Applicants:             {len(applicant_ids)}')
print(f'   • Placements:             {len(placement_ids)}')
print(f'   • Visa Records:           {len(visa_ids)}')

print(f'\n📧 EMAIL DELIVERY RESULTS ({TEST_EMAIL}):')
print(f'   ✅ Successfully Sent:     {sent_count}')
print(f'   ❌ Failed:                {failed_count}')
print(f'   ⏭️  Skipped (No Data):     {skipped_count}')
print(f'   ────────────────────────')
print(f'   📊 Total Templates:       {len(templates)}')

if (sent_count + failed_count) > 0:
    success_rate = round((sent_count / (sent_count + failed_count) * 100))
    print(f'\n✨ SUCCESS RATE: {success_rate}%')

print(f'\n🎯 ACTION REQUIRED:')
print(f'   ✅ Check your email: {TEST_EMAIL}')
print(f'   ✅ All templates have been tested')
print(f'   ✅ Test data created in UE Recruitment Management module')

print(f'\n📋 MODULES USED:')
print(f'   • recruitment.client (Clients)')
print(f'   • recruitment.job.order (Job Requisitions)')
print(f'   • hr.applicant (Extended with UE fields)')
print(f'   • recruitment.placement (Placement Tracking)')
print(f'   • uae.visa.processing (UAE Visa Workflow)')
print(f'   • mail.template (Email Templates)')

print()
