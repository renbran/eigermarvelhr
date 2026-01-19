#!/usr/bin/env python3
"""
Clean up missing model references from Odoo database
"""

import xmlrpc.client

# Connection details
URL = "https://eigermarvelhr.com"
DB = "eigermarvel"
USERNAME = "admin"
PASSWORD = "8586583"

MISSING_MODELS = [
    'recruitment.job.requisition',
    'recruitment.candidate',
    'recruitment.job.category',
    'recruitment.retention',
    'recruitment.application',
    'recruitment.subscription',
    'recruitment.supplier',
    'recruitment.followup',
    'recruitment.contract',
    'recruitment.deployment',
    'recruitment.audit.log',
]

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

def cleanup_missing_models(models, uid):
    """Remove references to missing models"""
    print("="*60)
    print("CLEANING UP MISSING MODEL REFERENCES")
    print("="*60)
    
    for model_name in MISSING_MODELS:
        print(f"\nCleaning references to: {model_name}")
        
        try:
            # Delete from ir.model
            model_ids = models.execute_kw(
                DB, uid, PASSWORD,
                'ir.model', 'search',
                [[('model', '=', model_name)]]
            )
            
            if model_ids:
                print(f"  Found {len(model_ids)} ir.model record(s)")
                models.execute_kw(
                    DB, uid, PASSWORD,
                    'ir.model', 'unlink',
                    [model_ids]
                )
                print(f"  ✓ Deleted ir.model records")
            
            # Delete from ir.model.fields
            field_ids = models.execute_kw(
                DB, uid, PASSWORD,
                'ir.model.fields', 'search',
                [[('model', '=', model_name)]]
            )
            
            if field_ids:
                print(f"  Found {len(field_ids)} ir.model.fields record(s)")
                models.execute_kw(
                    DB, uid, PASSWORD,
                    'ir.model.fields', 'unlink',
                    [field_ids]
                )
                print(f"  ✓ Deleted ir.model.fields records")
            
            # Delete from ir.model.access
            access_ids = models.execute_kw(
                DB, uid, PASSWORD,
                'ir.model.access', 'search',
                [[('model_id.model', '=', model_name)]]
            )
            
            if access_ids:
                print(f"  Found {len(access_ids)} ir.model.access record(s)")
                models.execute_kw(
                    DB, uid, PASSWORD,
                    'ir.model.access', 'unlink',
                    [access_ids]
                )
                print(f"  ✓ Deleted ir.model.access records")
            
            if not model_ids and not field_ids and not access_ids:
                print(f"  No references found")
                
        except Exception as e:
            print(f"  ERROR: {e}")
    
    print("\n" + "="*60)
    print("CLEANUP COMPLETE")
    print("="*60)
    print("\nPlease restart Odoo server:")
    print('  ssh -i "C:\\Users\\branm\\.ssh\\id_rsa" root@65.20.72.53 "systemctl restart odona-eigermarvel.service"')

def main():
    try:
        models, uid = connect_odoo()
        cleanup_missing_models(models, uid)
        return 0
    except Exception as e:
        print(f"\n✗ FATAL ERROR: {e}")
        return 1

if __name__ == '__main__':
    exit(main())
