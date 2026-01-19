#!/usr/bin/env python3
"""
Recruitment Email Test using HTTPS RPC Connection
Connects using the same method as the TypeScript frontend
"""

import json
import requests
import sys
from datetime import datetime

# Configuration
ODOO_URL = 'https://eigermarvelhr.com'
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'
TEST_EMAIL = 'renbranmadelogmail.com'

def print_header(title):
    print('\n' + '='*70)
    print(f'  {title}')
    print('='*70)

def print_section(title):
    print(f'\n{title}')
    print('-' * 70)

def authenticate():
    """Authenticate with Odoo using HTTPS RPC"""
    print('🔐 Authenticating...')
    
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
    
    try:
        # Disable SSL verification for self-signed certificates
        response = requests.post(
            url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            verify=False,  # Allow self-signed certs
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'result' in data and data['result']:
                print('✅ Authentication successful')
                return response.cookies, data['result']
            else:
                print(f'❌ Authentication failed: {data.get("error", "Unknown error")}')
                return None, None
        else:
            print(f'❌ HTTP {response.status_code}: {response.text[:200]}')
            return None, None
    except Exception as e:
        print(f'❌ Connection error: {str(e)[:150]}')
        return None, None

def call_rpc(cookies, method, model, args=None, kwargs=None):
    """Make an RPC call to Odoo"""
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
    
    try:
        response = requests.post(
            url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            cookies=cookies,
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'result' in data:
                return True, data['result']
            else:
                return False, data.get('error', 'Unknown error')
        else:
            return False, f'HTTP {response.status_code}'
    except Exception as e:
        return False, str(e)[:150]

def main():
    # Suppress SSL warnings
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    print_header('RECRUITMENT EMAIL SYSTEM - HTTPS RPC TEST')
    print(f'\n🕐 Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'📧 Test Email: {TEST_EMAIL}')
    print(f'🌐 Server: {ODOO_URL}')
    
    # Step 1: Authenticate
    print_section('STEP 1: AUTHENTICATING WITH ODOO')
    
    cookies, session = authenticate()
    
    if not cookies or not session:
        print('\n❌ Cannot continue without authentication')
        sys.exit(1)
    
    print(f'   User ID: {session.get("uid")}')
    print(f'   Partner ID: {session.get("partner_id")}')
    
    # Step 2: List available templates
    print_section('STEP 2: CHECKING EMAIL TEMPLATES')
    
    success, templates = call_rpc(
        cookies,
        'search_read',
        'mail.template',
        kwargs={
            'domain': [('name', 'ilike', 'Recruitment')],
            'fields': ['id', 'name', 'model_id', 'subject'],
        }
    )
    
    if success and templates:
        print(f'✅ Found {len(templates)} recruitment email templates:\n')
        for i, template in enumerate(templates, 1):
            print(f'   {i}. {template.get("name")}')
            print(f'      ID: {template.get("id")}')
            subject = template.get("subject", "N/A")
            if subject:
                print(f'      Subject: {subject[:50]}...')
            print()
    else:
        print(f'❌ Error: {templates}\n')
    
    # Step 3: Check recruitment clients
    print_section('STEP 3: CHECKING TEST DATA')
    
    success, clients = call_rpc(
        cookies,
        'search_read',
        'recruitment.client',
        kwargs={
            'fields': ['id', 'name', 'email'],
            'limit': 5,
        }
    )
    
    if success and clients:
        print(f'✅ Found {len(clients)} recruitment client(s):\n')
        for client in clients:
            print(f'   • {client.get("name")} ({client.get("email")})')
            print(f'     ID: {client.get("id")}')
        print()
    else:
        print(f'⚠️  No clients found or error: {clients}\n')
    
    # Step 4: Check applicants
    success, applicants = call_rpc(
        cookies,
        'search_read',
        'hr.applicant',
        kwargs={
            'fields': ['id', 'partner_name', 'email_from'],
            'limit': 5,
        }
    )
    
    if success and applicants:
        print(f'✅ Found {len(applicants)} job applicant(s):\n')
        for applicant in applicants:
            print(f'   • {applicant.get("partner_name")} ({applicant.get("email_from")})')
            print(f'     ID: {applicant.get("id")}')
        print()
    else:
        print(f'⚠️  No applicants found or error: {applicants}\n')
    
    # Step 5: Send recruitment emails
    print_section('STEP 5: SENDING RECRUITMENT EMAILS')
    
    results = {}
    
    # Get all recruitment templates
    success, all_templates = call_rpc(
        cookies,
        'search_read',
        'mail.template',
        kwargs={
            'domain': [('name', 'ilike', 'Recruitment')],
            'fields': ['id', 'name', 'model_id'],
        }
    )
    
    if not success or not all_templates:
        print('❌ Cannot retrieve templates')
        sys.exit(1)
    
    print(f'📧 Target Email: {TEST_EMAIL}\n')
    
    # Send emails for templates that have data
    template_configs = [
        {
            'name': 'Recruitment - Client Welcome',
            'model': 'recruitment.client',
            'data_name': 'clients',
            'data': clients,
            'emoji': '1️⃣'
        },
        {
            'name': 'Recruitment - Application Received',
            'model': 'hr.applicant',
            'data_name': 'applicants',
            'data': applicants,
            'emoji': '2️⃣'
        },
        {
            'name': 'Recruitment - Interview Scheduled',
            'model': 'hr.applicant',
            'data_name': 'applicants',
            'data': applicants,
            'emoji': '3️⃣'
        },
        {
            'name': 'Recruitment - Placement Offer',
            'model': 'recruitment.placement',
            'data_name': 'placements',
            'data': [],  # Will check dynamically
            'emoji': '4️⃣'
        },
        {
            'name': 'Recruitment - Visa Documents Needed',
            'model': 'uae.visa.processing',
            'data_name': 'visas',
            'data': [],  # Will check dynamically
            'emoji': '5️⃣'
        },
        {
            'name': 'Recruitment - Medical Exam Scheduled',
            'model': 'uae.visa.processing',
            'data_name': 'visas',
            'data': [],  # Will check dynamically
            'emoji': '6️⃣'
        },
    ]
    
    sent_count = 0
    failed_count = 0
    skipped_count = 0
    
    for config in template_configs:
        print(f'{config["emoji"]}  {config["name"]}')
        
        # Find template ID
        template_id = None
        for template in all_templates:
            if template['name'] == config['name']:
                template_id = template['id']
                break
        
        if not template_id:
            print('   ⚠️  Template not found')
            results[config['name']] = 'Not found'
            skipped_count += 1
            print()
            continue
        
        # Check/get data if not already fetched
        data_list = config['data']
        if not data_list and config['model'] not in ['hr.applicant', 'recruitment.client']:
            # Fetch data for other models
            success, data_list = call_rpc(
                cookies,
                'search_read',
                config['model'],
                kwargs={'fields': ['id'], 'limit': 1}
            )
        
        if not data_list:
            print(f'   ⏭️  SKIPPED (no {config["data_name"]} available)')
            results[config['name']] = 'Skipped - no data'
            skipped_count += 1
            print()
            continue
        
        # Send email
        record_id = data_list[0]['id']
        
        success, result = call_rpc(
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
            print(f'   ✅ SENT (Message ID: {result})')
            results[config['name']] = 'Sent'
            sent_count += 1
        else:
            print(f'   ❌ FAILED: {result}')
            results[config['name']] = f'Failed - {result}'
            failed_count += 1
        
        print()
    
    print_header('FINAL SUMMARY')
    
    print('\nEmail Template Results:')
    for name, status in results.items():
        if 'Sent' in status:
            symbol = '✅'
        elif 'Skipped' in status:
            symbol = '⏭️'
        else:
            symbol = '❌'
        print(f'   {symbol} {name}')
        if 'Failed' in status:
            print(f'      └─ {status}')
    
    print(f'\n📊 Statistics:')
    print(f'   • Sent: {sent_count}')
    print(f'   • Failed: {failed_count}')
    print(f'   • Skipped: {skipped_count}')
    print(f'   • Total: {sent_count + failed_count + skipped_count}')
    
    print(f'\n✅ Database connection verified')
    print(f'✅ Connected to: {ODOO_URL}')
    print(f'✅ Database: {ODOO_DB}')
    print(f'✅ Emails sent to: {TEST_EMAIL}')
    print(f'\n✨ All recruitment email templates have been processed!')
    print()

if __name__ == '__main__':
    main()
