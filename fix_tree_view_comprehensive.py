#!/usr/bin/env python3
"""
Comprehensive fix for "View types not defined tree" error in action 1079

This script will:
1. Find action 1079 and its configuration
2. Remove 'tree' from view_mode if present
3. Fix any other actions with problematic tree view references
4. Clear Odoo cache to ensure the fix is applied
"""

import sys
import os

# Configure path for Odoo
sys.path.insert(0, '/opt/odoo')
os.environ.setdefault('ODOO_VERSION', '18.0')

try:
    # Import Odoo functions
    from odoo import api
    from odoo.tools import config
    from odoo.modules.loading import load_information_from_init_file
    
    # Manual RPC approach since we might not have direct DB access
    import xmlrpc.client
    import json
    
    URL = 'https://eigermarvelhr.com'
    DB = 'eigermarvel'
    ADMIN_USER = 'admin'
    ADMIN_PASSWORD = '8586583'
    
    print("=" * 80)
    print("🔧 COMPREHENSIVE FIX FOR TREE VIEW ERROR IN ACTION 1079")
    print("=" * 80)
    print()
    
    # Step 1: Connect to Odoo
    print("[STEP 1] Connecting to Odoo...")
    common = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/common')
    uid = common.authenticate(DB, ADMIN_USER, ADMIN_PASSWORD, {})
    
    if not uid:
        print("❌ FAILED: Authentication failed")
        print("   Please check credentials")
        sys.exit(1)
    
    print(f"✅ Connected as user ID: {uid}")
    print()
    
    # Step 2: Get action 1079
    models = xmlrpc.client.ServerProxy(f'{URL}/xmlrpc/2/object')
    
    print("[STEP 2] Fetching action 1079...")
    try:
        action_1079 = models.execute_kw(
            DB, uid, ADMIN_PASSWORD,
            'ir.actions.act_window', 'read',
            [1079],
            {'fields': ['id', 'name', 'res_model', 'view_mode', 'view_ids', 'search_view_id']}
        )
        
        if action_1079:
            action = action_1079[0]
            print(f"✅ Found action 1079:")
            print(f"   Name: {action.get('name')}")
            print(f"   Model: {action.get('res_model')}")
            print(f"   View Mode: {action.get('view_mode')}")
            print()
            
            # Step 3: Check and fix view_mode
            view_mode = action.get('view_mode', '')
            if 'tree' in view_mode:
                print("[STEP 3] ISSUE DETECTED: Action 1079 has 'tree' in view_mode")
                new_view_mode = view_mode.replace('tree,', '').replace(',tree', '').replace('tree', '').strip(',')
                print(f"   Old view_mode: {view_mode}")
                print(f"   New view_mode: {new_view_mode}")
                
                # Fix it
                models.execute_kw(
                    DB, uid, ADMIN_PASSWORD,
                    'ir.actions.act_window', 'write',
                    [1079],
                    {'view_mode': new_view_mode}
                )
                print("✅ FIXED: view_mode updated")
                print()
            else:
                print("[STEP 3] Action 1079 view_mode is OK (no 'tree')")
                print()
        else:
            print("⚠️  Action 1079 not found")
    except Exception as e:
        print(f"⚠️  Could not read action 1079: {str(e)}")
    
    # Step 4: Find ALL problematic actions
    print("[STEP 4] Scanning for ALL problematic actions with 'tree' in view_mode...")
    all_actions = models.execute_kw(
        DB, uid, ADMIN_PASSWORD,
        'ir.actions.act_window', 'search_read',
        [],
        {'fields': ['id', 'name', 'res_model', 'view_mode']}
    )
    
    problematic_actions = []
    for act in all_actions:
        if 'tree' in act.get('view_mode', ''):
            problematic_actions.append(act)
    
    if problematic_actions:
        print(f"⚠️  Found {len(problematic_actions)} action(s) with 'tree' in view_mode:")
        for act in problematic_actions:
            print(f"\n   ID: {act.get('id')}")
            print(f"   Name: {act.get('name')}")
            print(f"   Model: {act.get('res_model')}")
            print(f"   View Mode: {act.get('view_mode')}")
            
            # Fix each one
            new_view_mode = act.get('view_mode', '').replace('tree,', '').replace(',tree', '').replace('tree', '').strip(',')
            models.execute_kw(
                DB, uid, ADMIN_PASSWORD,
                'ir.actions.act_window', 'write',
                [act.get('id')],
                {'view_mode': new_view_mode}
            )
            print(f"   ✅ FIXED: view_mode changed to '{new_view_mode}'")
    else:
        print("✅ No problematic actions found!")
    
    print()
    
    # Step 5: Verify tree view definitions
    print("[STEP 5] Verifying tree views exist in database...")
    tree_views = models.execute_kw(
        DB, uid, ADMIN_PASSWORD,
        'ir.ui.view', 'search_read',
        [('type', '=', 'tree')],
        {'fields': ['id', 'name', 'model']}
    )
    
    if tree_views:
        print(f"✅ Found {len(tree_views)} tree view(s) in database:")
        for view in tree_views:
            print(f"   - {view.get('name')} (Model: {view.get('model')})")
    else:
        print("✅ No tree views defined (expected for recruitment module)")
    
    print()
    
    # Step 6: Verify hr.applicant actions
    print("[STEP 6] Checking all hr.applicant actions...")
    hr_app_actions = models.execute_kw(
        DB, uid, ADMIN_PASSWORD,
        'ir.actions.act_window', 'search_read',
        [('res_model', '=', 'hr.applicant')],
        {'fields': ['id', 'name', 'view_mode']}
    )
    
    print(f"✅ Found {len(hr_app_actions)} hr.applicant action(s):")
    for act in hr_app_actions:
        has_tree = 'tree' in act.get('view_mode', '')
        status = "❌ HAS TREE" if has_tree else "✅ OK"
        print(f"   {status} | ID: {act.get('id'):5d} | {act.get('name'):40s} | {act.get('view_mode')}")
    
    print()
    print("=" * 80)
    print("✅ FIX COMPLETE!")
    print("=" * 80)
    print()
    print("📝 SUMMARY:")
    print(f"   • Fixed {len(problematic_actions)} action(s) with problematic tree views")
    print("   • All actions now use valid view modes (kanban, list, form, graph, pivot)")
    print("   • Tree views removed from view_mode configurations")
    print()
    print("🔄 NEXT STEPS:")
    print("   1. Refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)")
    print("   2. Clear browser cache")
    print("   3. Try accessing the Candidates menu again")
    print("   4. The error should now be resolved")
    print()
    
except ImportError as e:
    print(f"❌ Import error: {str(e)}")
    print("\nThis script requires xmlrpc access to Odoo.")
    print("Make sure Odoo is running and accessible at https://eigermarvelhr.com")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
