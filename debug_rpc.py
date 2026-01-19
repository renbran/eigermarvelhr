#!/usr/bin/env python3
"""
Debug RPC Calls
"""

import requests
import json

ODOO_URL = 'https://eigermarvelhr.com'
ODOO_DB = 'eigermarvel'
ODOO_USER = 'admin'
ODOO_PASSWORD = '8586583'

def authenticate():
    url = f'{ODOO_URL}/web/session/authenticate'
    payload = {'jsonrpc': '2.0', 'method': 'call', 'params': {'db': ODOO_DB, 'login': ODOO_USER, 'password': ODOO_PASSWORD}, 'id': 1}
    response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, verify=False, timeout=30)
    if response.status_code == 200:
        data = response.json()
        if 'result' in data and data['result']:
            return response.cookies
    return None

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

print('Authenticating...')
cookies = authenticate()
if not cookies:
    print('❌ Auth failed')
else:
    print('✅ Authenticated\n')
    
    # Try different RPC endpoints
    endpoints = [
        '/web/dataset/call_kw',
        '/web/dataset/execute_kw',
        '/web/dataset/search_read',
    ]
    
    for endpoint in endpoints:
        print(f'\nTrying {endpoint}...')
        
        url = f'{ODOO_URL}{endpoint}'
        
        # Try call_kw format
        payload = {
            'jsonrpc': '2.0',
            'method': 'call',
            'params': {
                'model': 'hr.job',
                'method': 'search_read',
                'args': [],
                'kwargs': {'limit': 1, 'fields': ['id', 'name']},
            },
            'id': 1,
        }
        
        response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, cookies=cookies, verify=False, timeout=30)
        
        print(f'  Status: {response.status_code}')
        
        if response.status_code == 200:
            try:
                data = response.json()
                if 'result' in data:
                    print(f'  ✅ Success! Got result: {data.get("result")}')
                    break
                else:
                    print(f'  ❌ Error in response: {json.dumps(data, indent=2)[:200]}')
            except:
                print(f'  ❌ Could not parse response')
        else:
            print(f'  ❌ HTTP error')
