#!/usr/bin/env python3
"""
Check Available Models and Create Candidates Properly
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

print('Authenticating...')
cookies = authenticate()

if cookies:
    print('✅ Authenticated\n')
    
    # Try to find candidate model and understand its structure
    print('Checking for candidates...')
    success, candidates = call_rpc(cookies, 'search_read', 'recruitment.candidate', kwargs={'fields': ['id', 'name'], 'limit': 5})
    
    if success and candidates:
        print(f'✅ Found {len(candidates)} candidates:')
        for c in candidates:
            print(f'   • {c.get("name")} (ID: {c.get("id")})')
        
        # Let's use first candidate to create applicant
        candidate_id = candidates[0]['id']
        
        print(f'\n✅ Using existing candidate ID: {candidate_id}')
        
        # Get job
        success, jobs = call_rpc(cookies, 'search_read', 'hr.job', kwargs={'fields': ['id', 'name'], 'limit': 1})
        if success and jobs:
            job_id = jobs[0]['id']
            print(f'✅ Using job ID: {job_id}')
            
            # Get stage
            success, stages = call_rpc(cookies, 'search_read', 'hr.recruitment.stage', kwargs={'fields': ['id', 'name'], 'limit': 1})
            stage_id = stages[0]['id'] if success and stages else None
            
            # Create applicant with candidate_id
            print(f'\n✏️  Creating applicant...')
            success, result = call_rpc(
                cookies,
                'create',
                'hr.applicant',
                args=[[{
                    'candidate_id': candidate_id,
                    'partner_name': f'Test Applicant {candidate_id}',
                    'job_id': job_id,
                    'stage_id': stage_id,
                    'email_from': f'test{candidate_id}@example.com',
                }]]
            )
            
            if success:
                print(f'✅ Created applicant ID: {result}')
                
                # Now create placement
                print(f'\n✏️  Creating placement...')
                success, result = call_rpc(
                    cookies,
                    'create',
                    'recruitment.placement',
                    args=[[{
                        'applicant_id': result,
                        'job_order_id': job_id,
                    }]]
                )
                
                if success:
                    print(f'✅ Created placement ID: {result}')
                else:
                    print(f'❌ Placement error: {result}')
                
                # Now create visa
                print(f'\n✏️  Creating visa record...')
                success, result = call_rpc(
                    cookies,
                    'create',
                    'uae.visa.processing',
                    args=[[{
                        'applicant_id': result,
                    }]]
                )
                
                if success:
                    print(f'✅ Created visa ID: {result}')
                else:
                    print(f'❌ Visa error: {result}')
            else:
                print(f'❌ Error creating applicant: {result}')
    else:
        print('⚠️  No candidates found')
        print('   Go to Recruitment > Candidates and create one first')
