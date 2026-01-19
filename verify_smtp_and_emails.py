#!/usr/bin/env python3
"""
Verify SMTP Configuration and Check Email Logs
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
print('  SMTP CONFIGURATION & EMAIL DELIVERY VERIFICATION')
print('='*70)

print('\n🔐 Authenticating...')
cookies = authenticate()

if not cookies:
    print('❌ Authentication failed')
    sys.exit(1)

print('✅ Authenticated\n')

# Check SMTP Configuration
print('='*70)
print('SMTP MAIL SERVER CONFIGURATION')
print('='*70 + '\n')

success, servers = call_rpc(cookies, 'search_read', 'ir.mail_server', kwargs={'fields': ['id', 'name', 'smtp_host', 'smtp_port', 'smtp_encryption', 'smtp_user', 'active']})

if success and servers:
    print(f'✅ Found {len(servers)} mail server(s):\n')
    for i, server in enumerate(servers, 1):
        print(f'Server {i}: {server.get("name")}')
        print(f'   Host: {server.get("smtp_host")}')
        print(f'   Port: {server.get("smtp_port")}')
        print(f'   User: {server.get("smtp_user")}')
        print(f'   Encryption: {server.get("smtp_encryption")}')
        print(f'   Active: {"✅ Yes" if server.get("active") else "❌ No"}')
        print()
else:
    print('❌ No mail servers configured!\n')

# Check Mail Message Log
print('='*70)
print('RECENT EMAIL MESSAGES SENT')
print('='*70 + '\n')

success, messages = call_rpc(
    cookies,
    'search_read',
    'mail.mail',
    kwargs={
        'fields': ['id', 'subject', 'email_to', 'state', 'failure_reason', 'date_millis'],
        'order': 'date_millis desc',
        'limit': 10
    }
)

if success and messages:
    print(f'✅ Found {len(messages)} recent emails:\n')
    for i, msg in enumerate(messages, 1):
        print(f'{i}. {msg.get("subject")}')
        print(f'   To: {msg.get("email_to")}')
        print(f'   State: {msg.get("state")}')
        if msg.get("failure_reason"):
            print(f'   ❌ Failure: {msg.get("failure_reason")[:100]}')
        print(f'   Date: {msg.get("date_millis")}')
        print()
else:
    print('⚠️  No email messages found or error retrieving them\n')

# Check Email Address Validation
print('='*70)
print('EMAIL ADDRESS VALIDATION')
print('='*70 + '\n')

test_email = 'renbranmadelogmail.com'

print(f'🔍 Email Address: {test_email}')

if '@' not in test_email:
    print('❌ INVALID EMAIL ADDRESS!')
    print(f'   Missing @ symbol. Email addresses must be in format: username@domain.com')
    print(f'\n✅ Correct format examples:')
    print(f'   • renbran@renbranmadelogmail.com')
    print(f'   • test@renbranmadelogmail.com')
    print(f'   • admin@renbranmadelogmail.com')
else:
    print(f'✅ Valid email format')

print('\n' + '='*70)
print('RECOMMENDATION')
print('='*70 + '\n')

print('⚠️  The email address provided is INVALID:')
print(f'   Provided: renbranmadelogmail.com (this is a DOMAIN, not email)')
print(f'   Correct format: username@renbranmadelogmail.com')
print(f'\n✅ Please provide your actual email address in the correct format')
print(f'   Example: renbran@renbranmadelogmail.com')
print()

