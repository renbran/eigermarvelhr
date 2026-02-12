#!/usr/bin/env python3
"""
Upgrade recruitment dashboard with live data
"""
import xmlrpc.client

# Odoo connection details
url = 'https://eigermarvelhr.com'
db = 'eigermarvel'
username = 'admin'
password = '8586583'

print("🔧 Upgrading Recruitment Dashboard with Live Data")
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
    
    # Step 1: Upgrade the module
    print("\n📦 Upgrading uae_recruitment_mgmt module...")
    module_ids = models.execute_kw(
        db, uid, password,
        'ir.module.module', 'search',
        [[('name', '=', 'uae_recruitment_mgmt')]]
    )
    
    if module_ids:
        models.execute_kw(
            db, uid, password,
            'ir.module.module', 'button_immediate_upgrade',
            [module_ids]
        )
        print("✅ Module upgrade initiated")
    else:
        print("❌ Module not found")
        exit(1)
    
    # Step 2: Create dashboard record if it doesn't exist
    print("\n📊 Creating/verifying dashboard record...")
    dashboard_ids = models.execute_kw(
        db, uid, password,
        'recruitment.dashboard', 'search',
        [[]]
    )
    
    if not dashboard_ids:
        dashboard_id = models.execute_kw(
            db, uid, password,
            'recruitment.dashboard', 'create',
            [{'name': 'Dashboard'}]
        )
        print(f"✅ Dashboard record created with ID: {dashboard_id}")
    else:
        print(f"✅ Dashboard record already exists (ID: {dashboard_ids[0]})")
        dashboard_id = dashboard_ids[0]
    
    # Step 3: Verify dashboard data
    print("\n📈 Fetching dashboard statistics...")
    dashboard_data = models.execute_kw(
        db, uid, password,
        'recruitment.dashboard', 'read',
        [[dashboard_id]],
        {'fields': [
            'active_jobs', 'total_candidates', 'placements_month',
            'total_revenue', 'visa_in_progress', 'visa_completed',
            'active_clients', 'total_clients'
        ]}
    )
    
    if dashboard_data:
        data = dashboard_data[0]
        print("\n✅ Dashboard Data:")
        print(f"   Active Jobs: {data.get('active_jobs', 0)}")
        print(f"   Total Candidates: {data.get('total_candidates', 0)}")
        print(f"   Placements (Month): {data.get('placements_month', 0)}")
        print(f"   Total Revenue: {data.get('total_revenue', 0):.2f}")
        print(f"   Visa In Progress: {data.get('visa_in_progress', 0)}")
        print(f"   Visa Completed: {data.get('visa_completed', 0)}")
        print(f"   Active Clients: {data.get('active_clients', 0)}")
        print(f"   Total Clients: {data.get('total_clients', 0)}")
    
    print("\n" + "=" * 60)
    print("✅ Dashboard upgrade completed successfully!")
    print("\n📋 Next steps:")
    print("   1. Refresh your browser")
    print("   2. Navigate to Recruitment > Dashboard")
    print("   3. You should now see live data!")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
