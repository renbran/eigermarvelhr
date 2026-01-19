#!/usr/bin/env python3
"""
Inspect Odoo model fields to determine correct field names
"""

import xmlrpc.client

# Connection details
URL = "https://eigermarvelhr.com"
DB = "eigermarvel"
USERNAME = "admin"
PASSWORD = "8586583"

def connect_odoo():
    """Connect to Odoo"""
    print(f"Connecting to {URL}...")
    common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
    uid = common.authenticate(DB, USERNAME, PASSWORD, {})
    
    if not uid:
        raise Exception("Authentication failed!")
    
    print(f"Authenticated as UID: {uid}\n")
    models = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/object')
    return models, uid

def get_model_fields(models, uid, model_name):
    """Get all fields for a model"""
    print(f"\n{'='*60}")
    print(f"Fields for model: {model_name}")
    print('='*60)
    
    try:
        fields = models.execute_kw(
            DB, uid, PASSWORD,
            model_name, 'fields_get',
            [], {'attributes': ['string', 'type', 'required', 'readonly']}
        )
        
        # Print fields sorted by name
        for field_name in sorted(fields.keys()):
            field_info = fields[field_name]
            print(f"  {field_name:30} - {field_info.get('string', 'N/A'):30} ({field_info.get('type', 'N/A')})")
        
        return fields
    except Exception as e:
        print(f"ERROR: {e}")
        return {}

def main():
    models, uid = connect_odoo()
    
    # Check the models that failed
    get_model_fields(models, uid, 'hr.applicant')
    get_model_fields(models, uid, 'recruitment.client')
    get_model_fields(models, uid, 'recruitment.job.order')

if __name__ == '__main__':
    main()
