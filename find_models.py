#!/usr/bin/env python3
"""
Find available recruitment models
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
    return False, f'HTTP {response.status_code}: {response.text[:200]}'

cookies = authenticate()

# Try different recruitment model names
models_to_try = [
    'recruitment.candidate',
    'hr.candidate',
    'recruitment_candidate',
    'hr_candidate',
    'hr.recruitment.candidate',
    'hr.job.candidate',
    'res.partner',
    'mail.template',
]

print('\n🔍 Testing model names...\n')

for model in models_to_try:
    success, result = call_rpc(cookies, 'search_read', model, kwargs={'limit': 1, 'fields': ['id']})
    status = '✅' if success else '❌'
    msg = f'Found {len(result)} records' if success else str(result)[:60]
    print(f'{status} {model:40} {msg}')

print()
