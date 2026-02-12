#!/usr/bin/env python3
"""
Check for actions related to audit log and followup models
"""
import xmlrpc.client

# Odoo connection details
url = 'https://eigermarvelhr.com'
db = 'eigermarvel'
username = 'admin'
password = '8586583'

print("🔍 Checking Actions for Audit Log and Followup Models")
print("=" * 60)

try:
    # Connect to Odoo
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})
    
    if not uid:
        print("❌ Authentication failed")
        exit(1)
    
    print(f"✅ Connected to Odoo as user ID: {uid}")
    
    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
    
    # Check for actions related to these models
    models_to_check = ['recruitment.audit.log', 'recruitment.followup']
    
    for model_name in models_to_check:
        print(f"\n📋 Checking actions for: {model_name}")
        print("-" * 60)
        
        # Find actions for this model
        actions = models.execute_kw(
            db, uid, password,
            'ir.actions.act_window', 'search_read',
            [[('res_model', '=', model_name)]],
            {'fields': ['name', 'res_model', 'view_mode', 'id']}
        )
        
        if actions:
            print(f"✅ Found {len(actions)} action(s):")
            for action in actions:
                print(f"   - {action['name']}")
                print(f"     View Mode: {action.get('view_mode', 'N/A')}")
                print(f"     ID: {action.get('id')}")
                
                # If tree is in view_mode, this is the problem!
                if 'tree' in action.get('view_mode', ''):
                    print(f"     ❌ PROBLEM: Contains 'tree' in view_mode!")
        else:
            print(f"ℹ️  No actions found for this model")
    
    # Also check if these models even exist
    print(f"\n🔎 Checking if models exist...")
    print("-" * 60)
    
    for model_name in models_to_check:
        try:
            model_ids = models.execute_kw(
                db, uid, password,
                'ir.model', 'search',
                [[('model', '=', model_name)]]
            )
            
            if model_ids:
                print(f"✅ Model exists: {model_name}")
            else:
                print(f"❌ Model DOES NOT exist: {model_name}")
                print(f"   This model has views but no model definition!")
        except Exception as e:
            print(f"⚠️  Error checking {model_name}: {str(e)}")
    
    print("\n" + "=" * 60)
    print("✅ Check Complete!")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
