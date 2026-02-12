#!/usr/bin/env python3
"""
Force update email templates by deleting and recreating them
"""
import xmlrpc.client

# Odoo connection details
url = 'https://eigermarvelhr.com'
db = 'eigermarvel'
username = 'admin'
password = '8586583'

print("🔧 Force Updating Email Templates")
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
    
    # Templates to fix
    templates_to_fix = [
        'email_template_visa_completed',
        'email_template_client_verified',
        'email_template_placement_confirmed'
    ]
    
    print("\n🗑️  Deleting problematic templates...")
    for template_xmlid in templates_to_fix:
        try:
            # Get template ID from external ID
            external_id_data = models.execute_kw(
                db, uid, password,
                'ir.model.data', 'search_read',
                [[('name', '=', template_xmlid), ('module', '=', 'uae_recruitment_mgmt')]],
                {'fields': ['res_id']}
            )
            
            if external_id_data:
                template_id = external_id_data[0]['res_id']
                
                # Delete the template
                models.execute_kw(
                    db, uid, password,
                    'mail.template', 'unlink',
                    [[template_id]]
                )
                print(f"   ✅ Deleted {template_xmlid}")
            else:
                print(f"   ⚠️  Template {template_xmlid} not found")
                
        except Exception as e:
            print(f"   ⚠️  Could not delete {template_xmlid}: {str(e)}")
    
    # Step 2: Upgrade module to recreate templates
    print("\n📦 Upgrading module to recreate templates...")
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
        print("✅ Module upgrade initiated - templates will be recreated")
    
    print("\n" + "=" * 60)
    print("✅ Template fix completed!")
    print("\n📋 Next steps:")
    print("   1. Wait 30 seconds for module upgrade to complete")
    print("   2. Test sending emails from the system")
    print("   3. Templates should now use correct ${ } syntax")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
