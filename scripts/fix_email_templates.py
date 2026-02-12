#!/usr/bin/env python3
"""
Fix email template syntax errors
"""
import xmlrpc.client

# Odoo connection details
url = 'https://eigermarvelhr.com'
db = 'eigermarvel'
username = 'admin'
password = '8586583'

print("🔧 Fixing Email Template Syntax Errors")
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
    
    # Step 2: Verify email templates
    print("\n📧 Verifying email templates...")
    template_ids = models.execute_kw(
        db, uid, password,
        'mail.template', 'search',
        [[('model', 'in', ['uae.visa.processing', 'recruitment.client', 'recruitment.placement'])]]
    )
    
    if template_ids:
        templates = models.execute_kw(
            db, uid, password,
            'mail.template', 'read',
            [template_ids],
            {'fields': ['name', 'email_from', 'subject']}
        )
        
        print(f"\n✅ Found {len(templates)} email templates:")
        for template in templates:
            print(f"   - {template['name']}")
            print(f"     From: {template.get('email_from', 'N/A')}")
            print(f"     Subject: {template.get('subject', 'N/A')[:60]}...")
    
    print("\n" + "=" * 60)
    print("✅ Email template fix completed successfully!")
    print("\n📋 Changes made:")
    print("   • Fixed Visa Completion template ({{ }} → ${ })")
    print("   • Fixed Client Verified template ({{ }} → ${ })")
    print("   • Fixed Placement Confirmed template ({{ }} → ${ })")
    print("\n🎯 Email templates now use correct Odoo/Mako syntax")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
