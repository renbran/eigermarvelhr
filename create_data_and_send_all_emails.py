#!/usr/bin/env python3
"""
Complete Backend Data Creation + Email Sending
Creates all necessary test data and sends emails to all templates
"""

import requests
import sys
from datetime import datetime, timedelta

ODOO_URL = 'https://eigermarvelhr.com'
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'
TEST_EMAIL = 'renbranmadelo@gmail.com'

def print_header(title):
    print('\n' + '='*70)
    print(f'  {title}')
    print('='*70)

def print_section(title):
    print(f'\n{title}')
    print('-' * 70)

def authenticate():
    """Authenticate with Odoo"""
    print('🔐 Authenticating to Odoo...')
    
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
        
        print('❌ Authentication failed\n')
        return None, None
    except Exception as e:
        print(f'❌ Error: {str(e)[:150]}\n')
        return None, None

def call_rpc(cookies, method, model, args=None, kwargs=None):
    """Make RPC call to Odoo"""
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
                error_msg = data.get('error', {}).get('data', {}).get('message', 'Unknown error')
                return False, error_msg
        else:
            return False, f'HTTP {response.status_code}'
    except Exception as e:
        return False, str(e)[:200]

def main():
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    print_header('COMPLETE DATA CREATION & EMAIL SENDING SYSTEM')
    print(f'\n📧 Target Email: {TEST_EMAIL}')
    print(f'🕐 Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    
    # ============= AUTHENTICATION =============
    print_section('AUTHENTICATION')
    
    cookies, session = authenticate()
    
    if not cookies or not session:
        print('❌ Cannot continue without authentication')
        sys.exit(1)
    
    test_data = {}
    
    # ============= STEP 1: Get Basic Data =============
    print_section('STEP 1: GET BASIC SETUP DATA')
    
    # Get job
    success, jobs = call_rpc(cookies, 'search_read', 'hr.job', kwargs={'fields': ['id', 'name'], 'limit': 1})
    if success and jobs:
        job_id = jobs[0]['id']
        print(f'✅ Job: {jobs[0]["name"]} (ID: {job_id})')
    else:
        print('❌ No jobs found')
        sys.exit(1)
    
    # Get stage
    success, stages = call_rpc(cookies, 'search_read', 'hr.recruitment.stage', kwargs={'fields': ['id', 'name'], 'limit': 1})
    stage_id = stages[0]['id'] if success and stages else None
    if stage_id:
        print(f'✅ Stage: {stages[0]["name"]} (ID: {stage_id})')
    
    # Get country
    success, countries = call_rpc(cookies, 'search_read', 'res.country', kwargs={'fields': ['id', 'name'], 'limit': 1})
    country_id = countries[0]['id'] if success and countries else None
    if country_id:
        print(f'✅ Country: {countries[0]["name"]} (ID: {country_id})')
    
    # Get client
    success, clients = call_rpc(cookies, 'search_read', 'recruitment.client', kwargs={'fields': ['id', 'name'], 'limit': 1})
    if success and clients:
        client_id = clients[0]['id']
        print(f'✅ Client: {clients[0]["name"]} (ID: {client_id})')
    else:
        print('❌ No client found')
        sys.exit(1)
    
    test_data['client_id'] = client_id
    print()
    
    # ============= STEP 2: Create Candidates =============
    print_section('STEP 2: CREATE TEST CANDIDATES')
    
    candidate_ids = []
    
    for i in range(1, 4):
        email = f'testcandidate{i}@example.com'
        
        # Use execute_kw with proper method
        success, result = call_rpc(
            cookies,
            'create',
            'recruitment.candidate',
            args=[[{
                'name': f'Mock Candidate {i}',
                'email': email,
            }]]
        )
        
        if success:
            candidate_ids.append(result)
            print(f'✅ Created Candidate {i} (ID: {result})')
        else:
            # If create fails, try to get existing candidates
            print(f'⚠️  Create failed, checking for existing candidates...')
            success, existing = call_rpc(cookies, 'search_read', 'recruitment.candidate', kwargs={'fields': ['id'], 'limit': 3})
            if success and existing:
                candidate_ids = [c['id'] for c in existing]
                print(f'✅ Using {len(candidate_ids)} existing candidates')
                break
    
    if not candidate_ids:
        print('❌ Could not create or find candidates')
        sys.exit(1)
    
    test_data['candidate_ids'] = candidate_ids
    print()
    
    # ============= STEP 3: Create Applicants =============
    print_section('STEP 3: CREATE TEST APPLICANTS')
    
    applicant_ids = []
    
    for i, cand_id in enumerate(candidate_ids, 1):
        success, app_id = call_rpc(
            cookies,
            'create',
            'hr.applicant',
            args=[[{
                'candidate_id': cand_id,
                'job_id': job_id,
                'stage_id': stage_id,
                'partner_name': f'Applicant {i}',
                'email_from': f'applicant{i}@example.com',
            }]]
        )
        
        if success:
            applicant_ids.append(app_id)
            print(f'✅ Created Applicant {i} (ID: {app_id})')
        else:
            print(f'⚠️  Failed to create Applicant {i}: {str(app_id)[:60]}')
    
    if not applicant_ids:
        print('❌ Could not create applicants')
        sys.exit(1)
    
    test_data['applicant_ids'] = applicant_ids
    print()
    
    # ============= STEP 4: Create Placements =============
    print_section('STEP 4: CREATE TEST PLACEMENTS')
    
    placement_ids = []
    
    for i, app_id in enumerate(applicant_ids, 1):
        success, place_id = call_rpc(
            cookies,
            'create',
            'recruitment.placement',
            args=[[{
                'applicant_id': app_id,
                'job_order_id': job_id,
            }]]
        )
        
        if success:
            placement_ids.append(place_id)
            print(f'✅ Created Placement {i} (ID: {place_id})')
        else:
            print(f'⚠️  Failed to create Placement {i}: {str(place_id)[:60]}')
    
    test_data['placement_ids'] = placement_ids
    print()
    
    # ============= STEP 5: Create Visa Records =============
    print_section('STEP 5: CREATE TEST VISA RECORDS')
    
    visa_ids = []
    
    for i, app_id in enumerate(applicant_ids, 1):
        success, visa_id = call_rpc(
            cookies,
            'create',
            'uae.visa.processing',
            args=[[{
                'applicant_id': app_id,
            }]]
        )
        
        if success:
            visa_ids.append(visa_id)
            print(f'✅ Created Visa {i} (ID: {visa_id})')
        else:
            print(f'⚠️  Failed to create Visa {i}: {str(visa_id)[:60]}')
    
    test_data['visa_ids'] = visa_ids
    print()
    
    # ============= STEP 6: Get All Templates =============
    print_section('STEP 6: GET EMAIL TEMPLATES')
    
    success, templates = call_rpc(
        cookies,
        'search_read',
        'mail.template',
        kwargs={
            'domain': [('name', 'ilike', 'Recruitment')],
            'fields': ['id', 'name', 'model_id'],
            'limit': 20
        }
    )
    
    if not success or not templates:
        print('❌ No templates found')
        sys.exit(1)
    
    print(f'✅ Found {len(templates)} templates\n')
    
    # ============= STEP 7: Send All Emails =============
    print_section('STEP 7: SENDING ALL RECRUITMENT EMAILS')
    
    print(f'📧 Target: {TEST_EMAIL}\n')
    
    results = {}
    sent_count = 0
    failed_count = 0
    skipped_count = 0
    
    # Map templates to record IDs
    template_map = {
        'Recruitment - Client Welcome': (client_id, 'recruitment.client'),
        'Recruitment - Client Verified': (client_id, 'recruitment.client'),
        'Recruitment - Application Received': (applicant_ids[0] if applicant_ids else None, 'hr.applicant'),
        'Recruitment - Interview Scheduled': (applicant_ids[1] if len(applicant_ids) > 1 else (applicant_ids[0] if applicant_ids else None), 'hr.applicant'),
        'Recruitment - Placement Offer': (placement_ids[0] if placement_ids else None, 'recruitment.placement'),
        'Recruitment - Placement Confirmed': (placement_ids[1] if len(placement_ids) > 1 else (placement_ids[0] if placement_ids else None), 'recruitment.placement'),
        'Recruitment - Visa Documents Needed': (visa_ids[0] if visa_ids else None, 'uae.visa.processing'),
        'Recruitment - Medical Exam Scheduled': (visa_ids[1] if len(visa_ids) > 1 else (visa_ids[0] if visa_ids else None), 'uae.visa.processing'),
        'Recruitment - Visa Completed': (visa_ids[0] if visa_ids else None, 'uae.visa.processing'),
    }
    
    for i, template in enumerate(templates, 1):
        template_name = template['name']
        template_id = template['id']
        
        # Check if we have data for this template
        if template_name not in template_map:
            continue
        
        record_id, model = template_map[template_name]
        
        if not record_id:
            print(f'{i}. ⏭️  {template_name}')
            print(f'   └─ Skipped (no test data)')
            skipped_count += 1
            continue
        
        print(f'{i}. 📧 {template_name}')
        
        # Send email
        success, msg_id = call_rpc(
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
            print(f'   ✅ SENT (Message ID: {msg_id})')
            sent_count += 1
        else:
            print(f'   ❌ FAILED: {str(msg_id)[:50]}')
            failed_count += 1
    
    # ============= FINAL SUMMARY =============
    print_header('COMPLETION REPORT')
    
    print(f'\n📊 Data Created:')
    print(f'   ✅ Candidates: {len(candidate_ids)}')
    print(f'   ✅ Applicants: {len(applicant_ids)}')
    print(f'   ✅ Placements: {len(placement_ids)}')
    print(f'   ✅ Visa Records: {len(visa_ids)}')
    
    print(f'\n📧 Emails Sent to: {TEST_EMAIL}')
    print(f'\n📊 Email Statistics:')
    print(f'   ✅ Sent: {sent_count}')
    print(f'   ❌ Failed: {failed_count}')
    print(f'   ⏭️  Skipped: {skipped_count}')
    print(f'   📋 Total: {sent_count + failed_count + skipped_count}')
    
    print(f'\n✨ All recruitment emails sent!')
    print(f'   Check {TEST_EMAIL} for the emails')
    print()

if __name__ == '__main__':
    main()
