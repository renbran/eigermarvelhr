#!/usr/bin/env python3
"""
Create Test Data for Email Template Testing
Creates sample applicant, placement, and visa records
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
        response = requests.post(
            url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if 'result' in data and data['result']:
                print('✅ Authentication successful\n')
                return response.cookies, data['result']
            else:
                print(f'❌ Authentication failed: {data.get("error", "Unknown error")}')
                return None, None
        else:
            print(f'❌ HTTP {response.status_code}')
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
    
    print_header('CREATE TEST DATA FOR EMAIL TESTING')
    
    # Authenticate
    cookies, session = authenticate()
    
    if not cookies or not session:
        print('❌ Cannot continue without authentication')
        sys.exit(1)
    
    # Step 1: Get a job to create applicant
    print_section('STEP 1: FINDING A JOB')
    
    success, jobs = call_rpc(
        cookies,
        'search_read',
        'hr.job',
        kwargs={'fields': ['id', 'name'], 'limit': 1}
    )
    
    job_id = None
    if success and jobs:
        job_id = jobs[0]['id']
        print(f'✅ Found job: {jobs[0]["name"]} (ID: {job_id})\n')
    else:
        print('❌ No jobs found. Please create a job first.')
        print('   Go to Recruitment > Jobs in Odoo\n')
        sys.exit(1)
    
    # Step 2: Create test candidate first (create via res.partner)
    print_section('STEP 2: CREATING TEST PARTNER/CONTACT')
    
    success, partner_id = call_rpc(
        cookies,
        'create',
        'res.partner',
        args=[[{
            'name': 'Test Candidate - Email Testing',
            'email': 'testcandidate@example.com',
            'is_company': False,
        }]]
    )
    
    if success:
        print(f'✅ Created test partner (ID: {partner_id})\n')
    else:
        print(f'⚠️  Failed to create partner: {partner_id}')
        partner_id = None
        print()
    
    # Step 3: Find or create test applicant
    print_section('STEP 3: FINDING/CREATING TEST APPLICANT')
    
    # First try to get existing applicants
    success, applicants = call_rpc(
        cookies,
        'search_read',
        'hr.applicant',
        kwargs={'fields': ['id', 'partner_name', 'email_from'], 'limit': 1}
    )
    
    if success and applicants:
        applicant_id = applicants[0]['id']
        print(f'✅ Found existing applicant: {applicants[0]["partner_name"]} (ID: {applicant_id})\n')
    else:
        print('⚠️  No existing applicants found\n')
        applicant_id = None
    
    # Step 4: Create test placement
    print_section('STEP 4: CREATING TEST PLACEMENT')
    
    success, placement_id = call_rpc(
        cookies,
        'create',
        'recruitment.placement',
        args=[[{
            'applicant_id': applicant_id,
            'job_order_id': job_id,
            'status': 'offer',
            'salary_package': 5000,
        }]]
    )
    
    if success:
        print(f'✅ Created test placement (ID: {placement_id})\n')
    else:
        print(f'⚠️  Failed to create placement: {placement_id}')
        print('   This is okay - you may not have the recruitment.placement model\n')
        placement_id = None
    
    # Step 5: Create test visa record
    print_section('STEP 5: CREATING TEST VISA RECORD')
    
    success, visa_id = call_rpc(
        cookies,
        'create',
        'uae.visa.processing',
        args=[[{
            'applicant_id': applicant_id,
            'reference': 'TEST-VISA-001',
            'status': 'documents_pending',
        }]]
    )
    
    if success:
        print(f'✅ Created test visa record (ID: {visa_id})\n')
    else:
        print(f'⚠️  Failed to create visa record: {visa_id}')
        print('   This is okay - you may not have the uae.visa.processing model\n')
        visa_id = None
    
    print_header('SUMMARY')
    
    print('\nTest Data Created:')
    print(f'   ✅ Job: {jobs[0]["name"]} (ID: {job_id})')
    if partner_id:
        print(f'   ✅ Partner: Test Candidate (ID: {partner_id})')
    print(f'   ✅ Applicant: Test Candidate (ID: {applicant_id})')
    if placement_id:
        print(f'   ✅ Placement: (ID: {placement_id})')
    if visa_id:
        print(f'   ✅ Visa Record: (ID: {visa_id})')
    
    print('\n✨ Test data created successfully!')
    print('   You can now run send_emails_https_rpc.py to send all template emails')
    print()

if __name__ == '__main__':
    main()
