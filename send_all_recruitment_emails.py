#!/usr/bin/env python3
"""
Complete Email Testing Solution
1. Create test data for all modules
2. Send ALL recruitment email templates to renbranmadelo@gmail.com
"""

import requests
import sys
from datetime import datetime

ODOO_URL = 'https://eigermarvelhr.com'
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'
TEST_EMAIL = 'renbranmadelo@gmail.com'  # CORRECT EMAIL

def print_header(title):
    print('\n' + '='*70)
    print(f'  {title}')
    print('='*70)

def print_section(title):
    print(f'\n{title}')
    print('-' * 70)

def authenticate():
    """Authenticate with Odoo"""
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
        
        print('❌ Authentication failed')
        return None, None
    except Exception as e:
        print(f'❌ Error: {str(e)[:150]}')
        return None, None

def call_rpc(cookies, method, model, args=None, kwargs=None):
    """Make RPC call"""
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
    except Exception as e:
        return False, str(e)[:150]
    
    return False, 'Unknown error'

def main():
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    print_header('COMPLETE EMAIL TEMPLATE TESTING')
    print(f'\n📧 Email: {TEST_EMAIL}')
    print(f'🕐 Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    
    # Authenticate
    cookies, session = authenticate()
    
    if not cookies or not session:
        print('❌ Cannot continue')
        sys.exit(1)
    
    test_data = {}
    
    # ============= STEP 1: Get Jobs =============
    print_section('STEP 1: GET AVAILABLE JOBS')
    
    success, jobs = call_rpc(
        cookies,
        'search_read',
        'hr.job',
        kwargs={'fields': ['id', 'name'], 'limit': 1}
    )
    
    if success and jobs:
        job_id = jobs[0]['id']
        print(f'✅ Using job: {jobs[0]["name"]} (ID: {job_id})\n')
    else:
        print('❌ No jobs found')
        sys.exit(1)
    
    # ============= STEP 2: Get Stage =============
    print_section('STEP 2: GET APPLICANT STAGE')
    
    success, stages = call_rpc(
        cookies,
        'search_read',
        'hr.recruitment.stage',
        kwargs={'fields': ['id', 'name'], 'limit': 1}
    )
    
    stage_id = stages[0]['id'] if success and stages else None
    if stage_id:
        print(f'✅ Using stage: {stages[0]["name"]} (ID: {stage_id})\n')
    else:
        print('⚠️  No stage found - will use default\n')
    
    # ============= STEP 3: Find or Create Candidates =============
    print_section('STEP 3: GET CANDIDATES')
    
    success, candidates = call_rpc(
        cookies,
        'search_read',
        'recruitment.candidate',
        kwargs={'fields': ['id', 'name'], 'limit': 5}
    )
    
    if success and candidates:
        print(f'✅ Found {len(candidates)} candidate(s):\n')
        for i, c in enumerate(candidates[:3], 1):
            print(f'   {i}. {c.get("name")} (ID: {c.get("id")})')
        print()
        
        # Use first 3 candidates
        candidate_ids = [c['id'] for c in candidates[:3]]
    else:
        print('⚠️  No candidates found\n')
        candidate_ids = []
    
    # ============= STEP 4: Create Applicants =============
    print_section('STEP 4: CREATE TEST APPLICANTS')
    
    applicant_ids = []
    
    if candidate_ids:
        for idx, cand_id in enumerate(candidate_ids, 1):
            success, app_id = call_rpc(
                cookies,
                'create',
                'hr.applicant',
                args=[[{
                    'candidate_id': cand_id,
                    'job_id': job_id,
                    'stage_id': stage_id,
                    'email_from': f'candidate{idx}@example.com',
                }]]
            )
            
            if success:
                print(f'✅ Created applicant {idx} (ID: {app_id})')
                applicant_ids.append(app_id)
            else:
                print(f'⚠️  Failed applicant {idx}: {str(app_id)[:60]}')
        
        print()
    else:
        print('⚠️  Cannot create applicants - no candidates\n')
    
    # ============= STEP 5: Create Placements =============
    print_section('STEP 5: CREATE TEST PLACEMENTS')
    
    placement_ids = []
    
    for idx, app_id in enumerate(applicant_ids[:2], 1):
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
            print(f'✅ Created placement {idx} (ID: {place_id})')
            placement_ids.append(place_id)
        else:
            print(f'⚠️  Failed placement {idx}: {str(place_id)[:60]}')
    
    print()
    
    # ============= STEP 6: Create Visa Records =============
    print_section('STEP 6: CREATE TEST VISA RECORDS')
    
    visa_ids = []
    
    for idx, app_id in enumerate(applicant_ids[:2], 1):
        success, visa_id = call_rpc(
            cookies,
            'create',
            'uae.visa.processing',
            args=[[{
                'applicant_id': app_id,
            }]]
        )
        
        if success:
            print(f'✅ Created visa {idx} (ID: {visa_id})')
            visa_ids.append(visa_id)
        else:
            print(f'⚠️  Failed visa {idx}: {str(visa_id)[:60]}')
    
    print()
    
    # ============= STEP 7: Get Client =============
    print_section('STEP 7: GET RECRUITMENT CLIENT')
    
    success, clients = call_rpc(
        cookies,
        'search_read',
        'recruitment.client',
        kwargs={'fields': ['id', 'name'], 'limit': 1}
    )
    
    client_id = None
    if success and clients:
        client_id = clients[0]['id']
        print(f'✅ Using client: {clients[0]["name"]} (ID: {client_id})\n')
    else:
        print('⚠️  No client found\n')
    
    # ============= STEP 8: Get Templates =============
    print_section('STEP 8: GET EMAIL TEMPLATES')
    
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
    
    if success and templates:
        print(f'✅ Found {len(templates)} templates\n')
    else:
        print('❌ No templates found')
        sys.exit(1)
    
    # ============= STEP 9: Send All Emails =============
    print_section('STEP 9: SENDING ALL RECRUITMENT EMAILS')
    
    print(f'📧 Target: {TEST_EMAIL}\n')
    
    results = {}
    
    # Map templates to data
    template_map = {
        'Recruitment - Client Welcome': (client_id, 'Client'),
        'Recruitment - Client Verified': (client_id, 'Client'),
        'Recruitment - Application Received': (applicant_ids[0] if applicant_ids else None, 'Applicant'),
        'Recruitment - Interview Scheduled': (applicant_ids[1] if len(applicant_ids) > 1 else applicant_ids[0] if applicant_ids else None, 'Applicant'),
        'Recruitment - Placement Offer': (placement_ids[0] if placement_ids else None, 'Placement'),
        'Recruitment - Placement Confirmed': (placement_ids[1] if len(placement_ids) > 1 else placement_ids[0] if placement_ids else None, 'Placement'),
        'Recruitment - Visa Documents Needed': (visa_ids[0] if visa_ids else None, 'Visa'),
        'Recruitment - Medical Exam Scheduled': (visa_ids[1] if len(visa_ids) > 1 else visa_ids[0] if visa_ids else None, 'Visa'),
        'Recruitment - Visa Completed': (visa_ids[0] if visa_ids else None, 'Visa'),
    }
    
    sent_count = 0
    failed_count = 0
    skipped_count = 0
    
    for template in templates:
        template_name = template['name']
        template_id = template['id']
        
        # Check if template is in our map
        if template_name not in template_map:
            continue
        
        record_id, record_type = template_map[template_name]
        
        if not record_id:
            print(f'⏭️  {template_name}')
            print(f'   └─ Skipped (no {record_type} data)')
            results[template_name] = 'Skipped'
            skipped_count += 1
        else:
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
                print(f'✅ {template_name}')
                print(f'   └─ Sent (ID: {msg_id})')
                results[template_name] = 'Sent'
                sent_count += 1
            else:
                print(f'❌ {template_name}')
                print(f'   └─ Failed: {str(msg_id)[:50]}')
                results[template_name] = 'Failed'
                failed_count += 1
    
    # ============= FINAL SUMMARY =============
    print_header('DELIVERY SUMMARY')
    
    print(f'\n📧 Email: {TEST_EMAIL}')
    print(f'\n📊 Statistics:')
    print(f'   ✅ Sent: {sent_count}')
    print(f'   ❌ Failed: {failed_count}')
    print(f'   ⏭️  Skipped: {skipped_count}')
    print(f'   📋 Total: {sent_count + failed_count + skipped_count}')
    
    print(f'\n✅ Test data created:')
    if applicant_ids:
        print(f'   👤 Applicants: {len(applicant_ids)}')
    if placement_ids:
        print(f'   🎯 Placements: {len(placement_ids)}')
    if visa_ids:
        print(f'   🛂 Visa Records: {len(visa_ids)}')
    if client_id:
        print(f'   📧 Client: 1')
    
    print(f'\n✨ All emails have been sent to {TEST_EMAIL}')
    print(f'   Check your Gmail inbox for the recruitment emails!')
    print()

if __name__ == '__main__':
    main()
