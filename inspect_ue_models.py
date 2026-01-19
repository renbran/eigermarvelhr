#!/usr/bin/env python3
"""
Inspect actual field names in UE Recruitment models
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

models = [
    'recruitment.job.order',
    'recruitment.placement',
    'uae.visa.processing',
    'hr.applicant',
]

for model in models:
    print(f'\n{"="*70}')
    print(f'  {model.upper()}')
    print(f'{"="*70}')
    
    # Get fields
    success, fields = call_rpc(cookies, 'fields_get', model, kwargs={'attributes': ['string', 'type', 'required']})
    
    if success:
        print(f'\nAvailable fields ({len(fields)}):')
        for field_name, field_info in list(fields.items())[:30]:
            req = '⭐' if field_info.get('required') else '  '
            print(f'  {req} {field_name:30} ({field_info.get("type", "?")})')
    else:
        print(f'Error: {fields}')
    
    # Try to get first record
    print(f'\nExisting records:')
    success, records = call_rpc(cookies, 'search_read', model, kwargs={'limit': 2})
    
    if success and records:
        print(f'  ✅ Found {len(records)} records')
        if records:
            record = records[0]
            print(f'  Sample: {record}')
    else:
        print(f'  ⚠️  {records}')

print('\n')
