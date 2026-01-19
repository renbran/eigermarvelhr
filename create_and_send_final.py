#!/usr/bin/env python3
"""
Create Test Data Using execute_kw RPC Method
"""

import requests
import sys

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

def execute_rpc(cookies, model, method, *args):
    """Execute RPC call"""
    url = f'{ODOO_URL}/web/dataset/execute_kw'
    
    payload = {
        'jsonrpc': '2.0',
        'method': 'call',
        'params': {
            'model': model,
            'method': method,
            'args': list(args),
        },
        'id': 1,
    }
    
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, cookies=cookies, verify=False, timeout=30)
    if response.status_code == 200:
        data = response.json()
        if 'result' in data:
            return True, data['result']
        else:
            return False, data.get('error', {}).get('data', {}).get('message', str(data.get('error')))
    
    return False, f'HTTP {response.status_code}'

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

print('='*70)
print('  CREATE TEST DATA - USING EXECUTE_KW')
print('='*70)

print('\n🔐 Authenticating...')
cookies = authenticate()

if not cookies:
    print('❌ Auth failed')
    sys.exit(1)

print('✅ Authenticated\n')

# Get basic info
print('Getting setup data...')
success, jobs = execute_rpc(cookies, 'hr.job', 'search_read', [], {'limit': 1, 'fields': ['id', 'name']})
if success and jobs:
    job_id = jobs[0]['id']
    print(f'✅ Job ID: {job_id}\n')
else:
    print('❌ No jobs')
    sys.exit(1)

success, stages = execute_rpc(cookies, 'hr.recruitment.stage', 'search_read', [], {'limit': 1, 'fields': ['id']})
stage_id = stages[0]['id'] if success and stages else None

# Try to get existing candidates
print('Checking for existing candidates...')
success, candidates = execute_rpc(cookies, 'recruitment.candidate', 'search_read', [], {'limit': 5, 'fields': ['id', 'name']})

if success and candidates:
    print(f'✅ Found {len(candidates)} existing candidates\n')
    candidate_ids = [c['id'] for c in candidates[:3]]
else:
    print('⚠️  No candidates found\n')
    candidate_ids = []

if candidate_ids:
    # Create applicants
    print(f'Creating applicants with candidates...\n')
    
    applicant_ids = []
    for i, cand_id in enumerate(candidate_ids, 1):
        print(f'Creating applicant {i}...')
        success, app_id = execute_rpc(
            cookies,
            'hr.applicant',
            'create',
            {
                'candidate_id': cand_id,
                'job_id': job_id,
                'stage_id': stage_id,
                'partner_name': f'Mock Applicant {i}',
                'email_from': f'applicant{i}@test.com',
            }
        )
        
        if success:
            applicant_ids.append(app_id)
            print(f'   ✅ Applicant {i} created (ID: {app_id})')
        else:
            print(f'   ❌ Failed: {str(app_id)[:60]}')
    
    print()
    
    # Create placements
    if applicant_ids:
        print(f'Creating placements...\n')
        
        placement_ids = []
        for i, app_id in enumerate(applicant_ids, 1):
            print(f'Creating placement {i}...')
            success, place_id = execute_rpc(
                cookies,
                'recruitment.placement',
                'create',
                {
                    'applicant_id': app_id,
                    'job_order_id': job_id,
                }
            )
            
            if success:
                placement_ids.append(place_id)
                print(f'   ✅ Placement {i} created (ID: {place_id})')
            else:
                print(f'   ❌ Failed: {str(place_id)[:60]}')
        
        print()
        
        # Create visa records
        if applicant_ids:
            print(f'Creating visa records...\n')
            
            visa_ids = []
            for i, app_id in enumerate(applicant_ids, 1):
                print(f'Creating visa {i}...')
                success, visa_id = execute_rpc(
                    cookies,
                    'uae.visa.processing',
                    'create',
                    {
                        'applicant_id': app_id,
                    }
                )
                
                if success:
                    visa_ids.append(visa_id)
                    print(f'   ✅ Visa {i} created (ID: {visa_id})')
                else:
                    print(f'   ❌ Failed: {str(visa_id)[:60]}')
            
            print()
            
            # Now send emails
            print('='*70)
            print('SENDING EMAILS')
            print('='*70 + '\n')
            
            # Get client
            success, clients = execute_rpc(cookies, 'recruitment.client', 'search_read', [], {'limit': 1, 'fields': ['id']})
            client_id = clients[0]['id'] if success and clients else None
            
            # Get templates
            success, templates = execute_rpc(
                cookies,
                'mail.template',
                'search_read',
                [['name', 'ilike', 'Recruitment']],
                {'fields': ['id', 'name']}
            )
            
            if success and templates:
                print(f'✅ Found {len(templates)} templates\n')
                
                template_map = {
                    'Recruitment - Client Welcome': client_id,
                    'Recruitment - Application Received': applicant_ids[0] if applicant_ids else None,
                    'Recruitment - Interview Scheduled': applicant_ids[1] if len(applicant_ids) > 1 else (applicant_ids[0] if applicant_ids else None),
                    'Recruitment - Placement Offer': placement_ids[0] if placement_ids else None,
                    'Recruitment - Placement Confirmed': placement_ids[1] if len(placement_ids) > 1 else (placement_ids[0] if placement_ids else None),
                    'Recruitment - Visa Documents Needed': visa_ids[0] if visa_ids else None,
                    'Recruitment - Medical Exam Scheduled': visa_ids[1] if len(visa_ids) > 1 else (visa_ids[0] if visa_ids else None),
                    'Recruitment - Visa Completed': visa_ids[0] if visa_ids else None,
                }
                
                sent = 0
                failed = 0
                skipped = 0
                
                for i, template in enumerate(templates, 1):
                    template_name = template['name']
                    template_id = template['id']
                    
                    if template_name not in template_map:
                        continue
                    
                    record_id = template_map[template_name]
                    
                    if not record_id:
                        print(f'{i}. ⏭️  {template_name} (skipped)')
                        skipped += 1
                        continue
                    
                    print(f'{i}. 📧 {template_name}')
                    
                    # Send email
                    success, msg_id = execute_rpc(
                        cookies,
                        'mail.template',
                        'send_mail',
                        template_id,
                        record_id,
                        True,
                        {'email_to': TEST_EMAIL}
                    )
                    
                    if success:
                        print(f'   ✅ SENT (ID: {msg_id})\n')
                        sent += 1
                    else:
                        print(f'   ❌ FAILED\n')
                        failed += 1
                
                print('='*70)
                print(f'✅ Sent: {sent} | ❌ Failed: {failed} | ⏭️  Skipped: {skipped}')
                print(f'📧 Check {TEST_EMAIL} for emails!')
                print('='*70 + '\n')

else:
    print('❌ No candidates to use for creating applicants\n')
