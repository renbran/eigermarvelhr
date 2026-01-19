#!/usr/bin/env python3
"""
Create Comprehensive Test Data for ALL Email Templates
Creates mock entries for applicants, placements, visa records, etc.
"""

import json
import requests
import sys
from datetime import datetime, timedelta

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
                print(f'❌ Authentication failed')
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

def get_model_fields(cookies, model_name):
    """Get all fields of a model"""
    success, fields = call_rpc(
        cookies,
        'fields_get',
        model_name,
        args=[],
        kwargs={'attributes': ['string', 'type', 'required', 'readonly']}
    )
    
    if success:
        return fields
    return None

def main():
    # Suppress SSL warnings
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    print_header('CREATE COMPREHENSIVE TEST DATA FOR ALL EMAIL TEMPLATES')
    
    # Authenticate
    cookies, session = authenticate()
    
    if not cookies or not session:
        print('❌ Cannot continue without authentication')
        sys.exit(1)
    
    test_data = {}
    
    # ============= STEP 1: Get Jobs =============
    print_section('STEP 1: GETTING AVAILABLE JOBS')
    
    success, jobs = call_rpc(
        cookies,
        'search_read',
        'hr.job',
        kwargs={'fields': ['id', 'name'], 'limit': 5}
    )
    
    if success and jobs:
        print(f'✅ Found {len(jobs)} job(s):\n')
        for job in jobs:
            print(f'   • {job["name"]} (ID: {job["id"]})')
        job_id = jobs[0]['id']
        job_name = jobs[0]['name']
        print()
    else:
        print('❌ No jobs found')
        sys.exit(1)
    
    # ============= STEP 2: Create Stage for Applicant =============
    print_section('STEP 2: GETTING APPLICANT STAGES')
    
    success, stages = call_rpc(
        cookies,
        'search_read',
        'hr.recruitment.stage',
        kwargs={'fields': ['id', 'name'], 'limit': 1}
    )
    
    stage_id = None
    if success and stages:
        stage_id = stages[0]['id']
        print(f'✅ Found stage: {stages[0]["name"]} (ID: {stage_id})\n')
    else:
        print('⚠️  No stages found - will use default\n')
    
    # ============= STEP 3: Create Test Applicant =============
    print_section('STEP 3: CREATING TEST APPLICANT')
    
    success, applicant_id = call_rpc(
        cookies,
        'create',
        'hr.applicant',
        args=[[{
            'partner_name': f'Test Applicant - {datetime.now().strftime("%Y-%m-%d %H:%M")}',
            'email_from': f'test.applicant{datetime.now().strftime("%Y%m%d%H%M%S")}@example.com',
            'job_id': job_id,
            'stage_id': stage_id,
        }]]
    )
    
    if success:
        print(f'✅ Created test applicant (ID: {applicant_id})')
        test_data['applicant'] = applicant_id
        print()
    else:
        print(f'❌ Failed to create applicant: {applicant_id}')
        print('   Trying alternate approach...\n')
        
        # Try getting existing applicant
        success, existing = call_rpc(
            cookies,
            'search_read',
            'hr.applicant',
            kwargs={'fields': ['id', 'partner_name'], 'limit': 1}
        )
        if success and existing:
            applicant_id = existing[0]['id']
            print(f'✅ Using existing applicant: {existing[0]["partner_name"]} (ID: {applicant_id})\n')
            test_data['applicant'] = applicant_id
        else:
            print('❌ Could not create or find applicant\n')
            applicant_id = None
    
    # ============= STEP 4: Create Test Placement =============
    print_section('STEP 4: CREATING TEST PLACEMENT')
    
    if applicant_id:
        # Get fields to understand structure
        success, placement_id = call_rpc(
            cookies,
            'create',
            'recruitment.placement',
            args=[[{
                'applicant_id': applicant_id,
                'job_order_id': job_id,
                'state': 'offer',
                'salary_package': 5000.0,
            }]]
        )
        
        if success:
            print(f'✅ Created test placement (ID: {placement_id})')
            test_data['placement'] = placement_id
            print()
        else:
            print(f'⚠️  Failed to create placement: {str(placement_id)[:100]}')
            print('   Trying with minimal fields...\n')
            
            # Try minimal creation
            success, placement_id = call_rpc(
                cookies,
                'create',
                'recruitment.placement',
                args=[[{
                    'applicant_id': applicant_id,
                }]]
            )
            
            if success:
                print(f'✅ Created test placement (minimal) (ID: {placement_id})')
                test_data['placement'] = placement_id
                print()
            else:
                print(f'⚠️  Could not create placement\n')
    
    # ============= STEP 5: Create Test Visa Record =============
    print_section('STEP 5: CREATING TEST VISA RECORD')
    
    if applicant_id:
        success, visa_id = call_rpc(
            cookies,
            'create',
            'uae.visa.processing',
            args=[[{
                'applicant_id': applicant_id,
                'state': 'documents_pending',
            }]]
        )
        
        if success:
            print(f'✅ Created test visa record (ID: {visa_id})')
            test_data['visa'] = visa_id
            print()
        else:
            print(f'⚠️  Failed to create visa record: {str(visa_id)[:100]}')
            print('   Trying with minimal fields...\n')
            
            # Try minimal creation
            success, visa_id = call_rpc(
                cookies,
                'create',
                'uae.visa.processing',
                args=[[{
                    'applicant_id': applicant_id,
                }]]
            )
            
            if success:
                print(f'✅ Created test visa record (minimal) (ID: {visa_id})')
                test_data['visa'] = visa_id
                print()
            else:
                print(f'⚠️  Could not create visa record\n')
    
    # ============= STEP 6: Get/Create Test Client =============
    print_section('STEP 6: GETTING TEST CLIENT')
    
    success, clients = call_rpc(
        cookies,
        'search_read',
        'recruitment.client',
        kwargs={'fields': ['id', 'name'], 'limit': 1}
    )
    
    if success and clients:
        client_id = clients[0]['id']
        print(f'✅ Using existing client: {clients[0]["name"]} (ID: {client_id})')
        test_data['client'] = client_id
        print()
    else:
        print('⚠️  No clients found\n')
    
    # ============= STEP 7: Summary =============
    print_header('TEST DATA CREATED')
    
    print('\n✅ Available Test Data:')
    if test_data.get('client'):
        print(f'   📧 Client: ID {test_data["client"]}')
    if test_data.get('applicant'):
        print(f'   👤 Applicant: ID {test_data["applicant"]}')
    if test_data.get('placement'):
        print(f'   🎯 Placement: ID {test_data["placement"]}')
    if test_data.get('visa'):
        print(f'   🛂 Visa: ID {test_data["visa"]}')
    
    print(f'\n📧 Email Templates that can now be tested:')
    if test_data.get('client'):
        print(f'   ✅ Recruitment - Client Welcome')
        print(f'   ✅ Recruitment - Client Verified')
    if test_data.get('applicant'):
        print(f'   ✅ Recruitment - Application Received')
        print(f'   ✅ Recruitment - Interview Scheduled')
    if test_data.get('placement'):
        print(f'   ✅ Recruitment - Placement Offer')
        print(f'   ✅ Recruitment - Placement Confirmed')
    if test_data.get('visa'):
        print(f'   ✅ Recruitment - Visa Documents Needed')
        print(f'   ✅ Recruitment - Medical Exam Scheduled')
        print(f'   ✅ Recruitment - Visa Completed')
    
    print(f'\n✨ Ready to send emails!')
    print(f'📧 All emails will be sent to: {TEST_EMAIL}')
    print(f'\nRun: python send_all_template_emails.py')
    print()

if __name__ == '__main__':
    main()
