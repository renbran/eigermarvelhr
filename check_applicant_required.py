#!/usr/bin/env python3
"""Check required fields for hr.applicant"""

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
    payload = {'jsonrpc': '2.0', 'method': 'call', 'params': {'model': model, 'method': method, 'args': args or [], 'kwargs': kwargs or {}}, 'id': 1}
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

# Get all fields
success, fields = call_rpc(cookies, 'fields_get', 'hr.applicant', kwargs={'attributes': ['string', 'type', 'required', 'readonly']})

if success:
    print('\n🔴 REQUIRED fields for hr.applicant:\n')
    for field_name, field_info in fields.items():
        if field_info.get('required'):
            readonly = '(readonly)' if field_info.get('readonly') else ''
            print(f'  ⭐ {field_name:30} ({field_info.get("type", "?")}) {readonly}')
    
    print('\n🟡 IMPORTANT fields:\n')
    important = ['partner_name', 'email_from', 'job_id', 'stage_id', 'company_id', 'user_id']
    for field_name in important:
        if field_name in fields:
            field_info = fields[field_name]
            print(f'  {field_name:30} ({field_info.get("type", "?")}) required={field_info.get("required", False)}')
else:
    print(f'Error: {fields}')

print()
