#!/usr/bin/env python3
"""
Final Email Sending - With Correct Email Address
Sends working templates to renbranmadelo@gmail.com
"""

import requests
import sys
from datetime import datetime

ODOO_URL = 'https://eigermarvelhr.com'
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'
TEST_EMAIL = 'renbranmadelo@gmail.com'

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

print('='*70)
print('  SEND ALL RECRUITMENT EMAILS')
print('='*70)
print(f'\n📧 Email: {TEST_EMAIL}')
print(f'🕐 Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}\n')

# Authenticate
print('🔐 Authenticating...')
cookies = authenticate()

if not cookies:
    print('❌ Auth failed')
    sys.exit(1)

print('✅ Authenticated\n')

# Get client
print('Getting recruitment client...')
success, clients = call_rpc(cookies, 'search_read', 'recruitment.client', kwargs={'fields': ['id', 'name'], 'limit': 1})

if not success or not clients:
    print('❌ No client found')
    sys.exit(1)

client_id = clients[0]['id']
client_name = clients[0]['name']
print(f'✅ Using: {client_name} (ID: {client_id})\n')

# Get all templates
print('Getting email templates...')
success, templates = call_rpc(cookies, 'search_read', 'mail.template', kwargs={'domain': [('name', 'ilike', 'Recruitment')], 'fields': ['id', 'name', 'model_id']})

if not success or not templates:
    print('❌ No templates found')
    sys.exit(1)

print(f'✅ Found {len(templates)} templates\n')

# Send emails
print('='*70)
print('SENDING EMAILS')
print('='*70 + '\n')

sent = []
failed = []
skipped = []

for i, template in enumerate(templates, 1):
    template_name = template['name']
    template_id = template['id']
    
    # Only send Client-related templates that work with existing data
    client_templates = [
        'Recruitment - Client Welcome',
        'Recruitment - Client Verified',
    ]
    
    if template_name not in client_templates:
        print(f'{i}. ⏭️  {template_name}')
        print(f'   └─ Skipped (requires other data)\n')
        skipped.append(template_name)
        continue
    
    print(f'{i}. 📧 {template_name}')
    
    # Send email
    success, msg_id = call_rpc(
        cookies,
        'send_mail',
        'mail.template',
        args=[template_id],
        kwargs={
            'res_id': client_id,
            'force_send': True,
            'email_values': {'email_to': TEST_EMAIL}
        }
    )
    
    if success:
        print(f'   ✅ SENT (Message ID: {msg_id})')
        sent.append((template_name, msg_id))
    else:
        print(f'   ❌ FAILED: {str(msg_id)[:50]}')
        failed.append(template_name)
    
    print()

# Summary
print('='*70)
print('SUMMARY')
print('='*70)

print(f'\n📧 Email: {TEST_EMAIL}')
print(f'\n✅ SENT ({len(sent)} emails):')
for name, msg_id in sent:
    print(f'   • {name} (ID: {msg_id})')

if failed:
    print(f'\n❌ FAILED ({len(failed)}):')
    for name in failed:
        print(f'   • {name}')

if skipped:
    print(f'\n⏭️  SKIPPED ({len(skipped)}):')
    for name in skipped[:3]:
        print(f'   • {name}')
    if len(skipped) > 3:
        print(f'   ... and {len(skipped) - 3} more')

print(f'\n✨ Check your Gmail inbox at {TEST_EMAIL}')
print(f'   You should receive {len(sent)} email(s)')
print()
