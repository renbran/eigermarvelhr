#!/usr/bin/env python3
"""
Clean up orphan models, views, and actions that don't have backing models
"""
import xmlrpc.client

# Odoo connection details
url = 'https://eigermarvelhr.com'
db = 'eigermarvel'
username = 'admin'
password = '8586583'

print("🧹 Cleaning up orphan models, views, and actions")
print("=" * 60)

try:
    # Connect to Odoo
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})
    
    if not uid:
        print("❌ Authentication failed")
        exit(1)
    
    print(f"✅ Connected to Odoo as user ID: {uid}")
    
    models_obj = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
    
    orphan_models = ['recruitment.audit.log', 'recruitment.followup']
    
    for model_name in orphan_models:
        print(f"\n🗑️  Removing orphan: {model_name}")
        print("-" * 60)
        
        # Step 1: Delete actions
        print(f"   Removing actions...")
        action_ids = models_obj.execute_kw(
            db, uid, password,
            'ir.actions.act_window', 'search',
            [[('res_model', '=', model_name)]]
        )
        
        if action_ids:
            models_obj.execute_kw(
                db, uid, password,
                'ir.actions.act_window', 'unlink',
                [action_ids]
            )
            print(f"   ✅ Deleted {len(action_ids)} action(s)")
        else:
            print(f"   ℹ️  No actions found")
        
        # Step 2: Delete views
        print(f"   Removing views...")
        view_ids = models_obj.execute_kw(
            db, uid, password,
            'ir.ui.view', 'search',
            [[('model', '=', model_name)]]
        )
        
        if view_ids:
            models_obj.execute_kw(
                db, uid, password,
                'ir.ui.view', 'unlink',
                [view_ids]
            )
            print(f"   ✅ Deleted {len(view_ids)} view(s)")
        else:
            print(f"   ℹ️  No views found")
        
        # Step 3: Delete menu items
        print(f"   Removing menu items...")
        menu_ids = models_obj.execute_kw(
            db, uid, password,
            'ir.ui.menu', 'search',
            [[('action', 'like', model_name)]]
        )
        
        if menu_ids:
            models_obj.execute_kw(
                db, uid, password,
                'ir.ui.menu', 'unlink',
                [menu_ids]
            )
            print(f"   ✅ Deleted {len(menu_ids)} menu item(s)")
        else:
            print(f"   ℹ️  No menu items found")
    
    print("\n" + "=" * 60)
    print("✅ Cleanup Complete!")
    print("\n📋 Summary:")
    print("   Removed orphan model records, views, actions, and menus")
    print("   These were not defined in module XML, just left over data")
    print("\n✅ The 'tree view not found' error should be resolved!")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
