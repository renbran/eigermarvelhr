#!/usr/bin/env python3
"""
Create Candidates and Test Data for All Email Templates
"""

import requests
import sys

ODOO_URL = 'https://eigermarvelhr.com'
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'

def authenticate():
    url = f'{ODOO_URL}/web/session/authenticate'
    payload = {
        'jsonrpc': '2.0',
        'method': 'call',
        'params': {
            'db': ODOO_DB,
            'login': ODOO_USER,
            'password': ODOO_PASSWORD,
        },
        'id': 1,
    }
    
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
    return False, None

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

print('='*70)
print('  CREATE CANDIDATES FOR EMAIL TEMPLATE TESTING')
print('='*70)

print('\n🔐 Authenticating...')
cookies = authenticate()

if not cookies:
    print('❌ Authentication failed')
    sys.exit(1)

print('✅ Authenticated\n')

# Get country
print('Getting country...')
success, countries = call_rpc(cookies, 'search_read', 'res.country', kwargs={'fields': ['id', 'name'], 'limit': 1})
country_id = countries[0]['id'] if success and countries else None
print(f'✅ Country ID: {country_id}\n')

# Create 3 candidates
print('Creating candidates...\n')

for i in range(1, 4):
    success, result = call_rpc(
        cookies,
        'create',
        'recruitment.candidate',
        args=[[{
            'name': f'Test Candidate {i}',
            'email': f'candidate{i}@example.com',
            'phone': f'+971501234{i:03d}',
            'country_id': country_id,
        }]]
    )
    
    if success:
        print(f'✅ Created Candidate {i} (ID: {result})')
    else:
        print(f'❌ Failed: {str(result)[:80]}')

print('\n✨ Candidates created!')
print('Now run: python send_all_recruitment_emails.py')
print()
