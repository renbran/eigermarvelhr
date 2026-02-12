#!/usr/bin/env python3
"""
Diagnose and fix tree view action errors
"""
import xmlrpc.client

# Odoo connection details
url = 'https://eigermarvelhr.com'
db = 'eigermarvel'
username = 'admin'
password = '8586583'

print("🔍 Diagnosing Tree View Action Errors")
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
    
    # Step 1: Find all act_window actions from recruitment module
    print("\n📋 Scanning for problematic act_window actions...")
    actions = models.execute_kw(
        db, uid, password,
        'ir.actions.act_window', 'search_read',
        [],
        {'fields': ['name', 'res_model', 'view_mode', 'view_ids']}
    )
    
    problematic_actions = []
    recruitment_actions = []
    
    for action in actions:
        # Focus on recruitment module actions
        if 'recruitment' in action.get('name', '').lower() or 'uae_visa' in action.get('res_model', '').lower():
            recruitment_actions.append(action)
            
            # Check if action references tree view
            view_mode = action.get('view_mode', '')
            if 'tree' in view_mode:
                problematic_actions.append(action)
    
    print(f"\n✅ Found {len(recruitment_actions)} recruitment-related actions")
    
    if problematic_actions:
        print(f"\n⚠️  Found {len(problematic_actions)} action(s) with tree views:")
        for action in problematic_actions:
            print(f"   ❌ {action['name']}")
            print(f"      Model: {action.get('res_model', 'N/A')}")
            print(f"      View Mode: {action.get('view_mode', 'N/A')}")
            print(f"      ID: {action.get('id', 'N/A')}")
    else:
        print(f"\n✅ No problematic tree view actions found in recruitment module")
    
    # Step 2: Check for missing view definitions
    print("\n🔍 Checking for missing view definitions...")
    
    # Get all views referenced by recruitment actions
    all_view_ids = []
    for action in recruitment_actions:
        view_ids = action.get('view_ids', [])
        if view_ids:
            all_view_ids.extend(view_ids)
    
    if all_view_ids:
        views = models.execute_kw(
            db, uid, password,
            'ir.ui.view', 'read',
            [list(set(all_view_ids))],
            {'fields': ['name', 'type', 'model']}
        )
        
        tree_views = [v for v in views if v.get('type') == 'tree']
        if tree_views:
            print(f"\n✅ Found {len(tree_views)} actual tree views:")
            for view in tree_views:
                print(f"   - {view['name']} (Model: {view.get('model', 'N/A')})")
        else:
            print(f"\n✅ No tree views found (all views are correct)")
    
    # Step 3: Look for misnamed views
    print("\n🔎 Looking for potentially misnamed view records...")
    
    misnamed_views = models.execute_kw(
        db, uid, password,
        'ir.ui.view', 'search_read',
        [[('name', 'ilike', 'tree'), ('model', 'ilike', 'recruitment')]],
        {'fields': ['name', 'type', 'model', 'id']}
    )
    
    if misnamed_views:
        print(f"\n✅ Found {len(misnamed_views)} views with 'tree' in name:")
        for view in misnamed_views:
            print(f"   - {view['name']}")
            print(f"     Type: {view.get('type')} | Model: {view.get('model')}")
            if view.get('type') != 'tree':
                print(f"     ⚠️  Naming mismatch: name has 'tree' but type is '{view.get('type')}'")
    
    print("\n" + "=" * 60)
    print("✅ Diagnosis Complete!")
    
    if problematic_actions:
        print("\n⚠️  ISSUE FOUND:")
        print("   The following actions need to be fixed:")
        for action in problematic_actions:
            print(f"   - {action['name']} (ID: {action.get('id')})")
        
        print("\n🔧 FIX: Change view_mode from containing 'tree' to 'list'")
    else:
        print("\n✅ No problematic actions found!")
        print("   The issue may be:")
        print("   - From a different module")
        print("   - From custom client code")
        print("   - From cached browser data (try cache clear)")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
