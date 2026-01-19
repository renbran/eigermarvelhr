#!/usr/bin/env python3
"""
Debug: Search candidates and create if needed
"""

import requests
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ODOO_URL = 'https://eigermarvelhr.com'
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'

def authenticate():
    url = f'{ODOO_URL}/web/session/authenticate'
    payload = {'jsonrpc': '2.0', 'method': 'call', 'params': {'db': ODOO_DB, 'login': ODOO_USER, 'password': ODOO_PASSWORD}, 'id': 1}
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, verify=False, timeout=30)
    return response.cookies

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
            return False, str(msg)
    return False, f'HTTP {response.status_code}'

cookies = authenticate()

# 1. Search candidates
print('\n1️⃣  Searching candidates...')
success, result = call_rpc(cookies, 'search_read', 'recruitment.candidate', kwargs={'limit': 10, 'fields': ['id', 'name', 'email']})
print(f'   Result: {result}')

# 2. Search applicants
print('\n2️⃣  Searching applicants...')
success, result = call_rpc(cookies, 'search_read', 'hr.applicant', kwargs={'limit': 10, 'fields': ['id', 'partner_name', 'email_from']})
print(f'   Found: {len(result)} applicants')
if result:
    for app in result[:3]:
        print(f'      - {app}')

# 3. Check if we can create candidates
print('\n3️⃣  Creating test candidate...')
success, result = call_rpc(
    cookies,
    'create',
    'recruitment.candidate',
    args=[[{'name': 'John Doe', 'email': 'john@test.com'}]]
)
print(f'   Success: {success}')
print(f'   Result: {result}')

# 4. If successful, try to create applicant with this candidate
if success:
    cand_id = result
    print(f'\n4️⃣  Creating applicant with candidate {cand_id}...')
    
    # First get job
    success, jobs = call_rpc(cookies, 'search_read', 'hr.job', kwargs={'limit': 1, 'fields': ['id']})
    job_id = jobs[0]['id'] if jobs else 1
    
    success, result = call_rpc(
        cookies,
        'create',
        'hr.applicant',
        args=[[{
            'candidate_id': cand_id,
            'job_id': job_id,
            'partner_name': 'John Doe Applicant',
            'email_from': 'john.app@test.com',
        }]]
    )
    print(f'   Success: {success}')
    print(f'   Result: {result}')

print()
