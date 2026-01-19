#!/usr/bin/env python3
"""
Check Candidate Model Fields and Create with Proper Setup
"""

import requests
import sys

ODOO_URL = 'https://eigermarvelhr.com'
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'

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
    payload = {'jsonrpc': '2.0', 'method': 'call', 'params': {'model': model, 'method': method, 'args': args or [], 'kwargs': kwargs or {}}, 'id': 1}
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, cookies=cookies, verify=False, timeout=30)
    if response.status_code == 200:
        data = response.json()
        if 'result' in data:
            return True, data['result']
    return False, None

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

print('Authenticating...')
cookies = authenticate()
if not cookies:
    print('❌ Auth failed')
    sys.exit(1)

print('✅ Authenticated\n')

# Check fields
print('Getting recruitment.candidate fields...\n')
success, fields = call_rpc(cookies, 'fields_get', 'recruitment.candidate', kwargs={'attributes': ['string', 'type', 'required']})

if success and fields:
    print('✅ Required fields:\n')
    for field_name, field_info in list(fields.items())[:20]:
        if field_info.get('required'):
            print(f'   • {field_name}: {field_info.get("string")} ({field_info.get("type")})')

# Try to create with just required fields
print('\n\nCreating candidate with minimal data...\n')

success, result = call_rpc(
    cookies,
    'create',
    'recruitment.candidate',
    args=[[{'name': 'Test Candidate Simple'}]]
)

if success:
    print(f'✅ Created! ID: {result}')
    
    # Now try to create applicant with this candidate
    print(f'\nCreating applicant with candidate ID {result}...\n')
    
    success, jobs = call_rpc(cookies, 'search_read', 'hr.job', kwargs={'fields': ['id'], 'limit': 1})
    if success and jobs:
        job_id = jobs[0]['id']
        
        success, app_result = call_rpc(
            cookies,
            'create',
            'hr.applicant',
            args=[[{
                'candidate_id': result,
                'job_id': job_id,
                'email_from': 'test@example.com',
            }]]
        )
        
        if success:
            print(f'✅ Applicant created! ID: {app_result}')
        else:
            print(f'❌ Applicant failed: {app_result}')
else:
    print(f'❌ Failed to create candidate: {result}')

print('\nNow run: python send_all_recruitment_emails.py')
