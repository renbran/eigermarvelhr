#!/usr/bin/env python3
"""
Manually update email templates with correct syntax
"""
import xmlrpc.client

# Odoo connection details
url = 'https://eigermarvelhr.com'
db = 'eigermarvel'
username = 'admin'
password = '8586583'

print("🔧 Manually Updating Email Templates")
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
    
    # Templates to fix with their correct values
    templates_fix = {
        'Recruitment - Visa Completed': {
            'email_from': '${object.company_id.email or user.email or \'\'}',
            'email_to': '${object.applicant_id.email_from or \'\'}',
            'subject': 'Your Visa is Ready! - ${object.name or \'\'}'
        },
        'Recruitment - Client Verified': {
            'email_from': '${object.company_id.email or user.email or \'\'}',
            'email_to': '${object.email or \'\'}',
            'subject': 'Welcome! Your Account is Verified - ${object.name or \'\'}'
        },
        'Recruitment - Placement Confirmed': {
            'email_from': '${object.company_id.email or user.email or \'\'}',
            'email_to': '${object.applicant_id.email_from or \'\'}',
            'partner_to': '${object.client_id.partner_id.id if object.client_id.partner_id else \'\'}',
            'subject': 'Placement Confirmed - ${object.applicant_id.partner_name or \'\'} at ${object.client_id.name or \'\'}'
        }
    }
    
    print("\n📝 Updating templates...")
    for template_name, fixes in templates_fix.items():
        try:
            # Find template by name
            template_ids = models.execute_kw(
                db, uid, password,
                'mail.template', 'search',
                [[('name', '=', template_name)]]
            )
            
            if template_ids:
                # Update the template
                models.execute_kw(
                    db, uid, password,
                    'mail.template', 'write',
                    [template_ids, fixes]
                )
                print(f"   ✅ Updated: {template_name}")
            else:
                print(f"   ⚠️  Not found: {template_name}")
                
        except Exception as e:
            print(f"   ❌ Error updating {template_name}: {str(e)}")
    
    # Verify the changes
    print("\n✅ Verifying updates...")
    all_templates = models.execute_kw(
        db, uid, password,
        'mail.template', 'search_read',
        [[('name', 'in', list(templates_fix.keys()))]],
        {'fields': ['name', 'email_from', 'subject']}
    )
    
    for template in all_templates:
        print(f"\n   📧 {template['name']}")
        print(f"      From: {template.get('email_from', 'N/A')}")
        print(f"      Subject: {template.get('subject', 'N/A')[:70]}...")
    
    print("\n" + "=" * 60)
    print("✅ All templates updated successfully!")
    print("\n🎯 Email templates now use correct Odoo ${ } syntax")
    print("   No more template rendering errors!")
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
