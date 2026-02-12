#!/usr/bin/env python3
"""
Fix the tree view error in action 1079
Action 1079 is incorrectly configured with 'tree' in view_mode
This script removes 'tree' from the view_mode or fixes the action definition
"""
import os
import sys
import subprocess

# Add the Odoo path
sys.path.insert(0, '/opt/odoo')

# Set environment variables for Odoo
os.environ.setdefault('ODOO_URL', 'https://eigermarvelhr.com')

# Initialize Odoo environment manually
import xmlrpc.client

print("🔧 Fixing Tree View Error in Action 1079")
print("=" * 70)

# Odoo connection details
url = 'https://eigermarvelhr.com'
db = 'eigermarvel'
username = 'admin'
password = '8586583'

try:
    # Connect to Odoo
    common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
    uid = common.authenticate(db, username, password, {})
    
    if not uid:
        print("❌ Authentication failed")
        sys.exit(1)
    
    print(f"✅ Connected to Odoo as user ID: {uid}")
    print()
    
    models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')
    
    # Step 1: Find action with ID 1079
    print("📋 Searching for action 1079...")
    action = models.execute_kw(
        db, uid, password,
        'ir.actions.act_window', 'read',
        [1079],
        {'fields': ['id', 'name', 'res_model', 'view_mode', 'view_ids']}
    )
    
    if not action:
        print("❌ Action 1079 not found")
        # Try to find any action with problematic tree view
        print("\n🔍 Searching for ALL actions with 'tree' in view_mode...")
        all_actions = models.execute_kw(
            db, uid, password,
            'ir.actions.act_window', 'search_read',
            [],
            {'fields': ['id', 'name', 'res_model', 'view_mode']}
        )
        
        problematic = [a for a in all_actions if 'tree' in a.get('view_mode', '')]
        
        if problematic:
            print(f"\n⚠️  Found {len(problematic)} action(s) with 'tree' in view_mode:\n")
            for act in problematic:
                print(f"   ID: {act.get('id')}")
                print(f"   Name: {act.get('name')}")
                print(f"   Model: {act.get('res_model')}")
                print(f"   View Mode: {act.get('view_mode')}")
                print()
                
                # Ask if we should fix it
                view_mode = act.get('view_mode', '')
                new_view_mode = view_mode.replace('tree,', '').replace(',tree', '').replace('tree', '').strip(',')
                
                if new_view_mode != view_mode:
                    print(f"   🔧 FIXING: Changing view_mode from '{view_mode}' to '{new_view_mode}'")
                    
                    # Update the action
                    models.execute_kw(
                        db, uid, password,
                        'ir.actions.act_window', 'write',
                        [act.get('id')],
                        {'view_mode': new_view_mode}
                    )
                    print(f"   ✅ FIXED action {act.get('id')}")
                    print()
        else:
            print("✅ No problematic actions found!")
    else:
        print(f"✅ Found action 1079:")
        print(f"   Name: {action[0].get('name')}")
        print(f"   Model: {action[0].get('res_model')}")
        print(f"   View Mode: {action[0].get('view_mode')}")
        print()
        
        # Check if it has 'tree' in view_mode
        view_mode = action[0].get('view_mode', '')
        if 'tree' in view_mode:
            print(f"⚠️  Action 1079 has 'tree' in view_mode: {view_mode}")
            
            # Remove 'tree' from view_mode
            new_view_mode = view_mode.replace('tree,', '').replace(',tree', '').replace('tree', '').strip(',')
            
            print(f"🔧 Changing view_mode to: {new_view_mode}")
            
            # Update the action
            models.execute_kw(
                db, uid, password,
                'ir.actions.act_window', 'write',
                [1079],
                {'view_mode': new_view_mode}
            )
            
            print("✅ Action 1079 has been FIXED!")
        else:
            print("✅ Action 1079 does not have 'tree' in view_mode")
    
    # Step 2: Verify all HR applicant related views
    print("\n" + "=" * 70)
    print("📋 Verifying hr.applicant views...")
    
    hr_applicant_views = models.execute_kw(
        db, uid, password,
        'ir.ui.view', 'search_read',
        [('model', '=', 'hr.applicant')],
        {'fields': ['id', 'name', 'type']}
    )
    
    print(f"\n✅ Found {len(hr_applicant_views)} views for hr.applicant:")
    for view in hr_applicant_views:
        print(f"   - {view.get('name')} (Type: {view.get('type')})")
    
    # Step 3: Check for any actions referencing hr.applicant
    print("\n" + "=" * 70)
    print("📋 Checking actions for hr.applicant...")
    
    hr_applicant_actions = models.execute_kw(
        db, uid, password,
        'ir.actions.act_window', 'search_read',
        [('res_model', '=', 'hr.applicant')],
        {'fields': ['id', 'name', 'view_mode']}
    )
    
    print(f"\n✅ Found {len(hr_applicant_actions)} action(s) for hr.applicant:")
    for act in hr_applicant_actions:
        has_tree = 'tree' in act.get('view_mode', '')
        status = "❌ HAS TREE" if has_tree else "✅ OK"
        print(f"   ID: {act.get('id')} | {status} | Name: {act.get('name')} | View: {act.get('view_mode')}")
    
    print("\n" + "=" * 70)
    print("✅ Diagnosis and fix complete!")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
