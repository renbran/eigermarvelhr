#!/usr/bin/env python3
"""
Check dashboard configuration and modules
"""

import xmlrpc.client

# Connection details
URL = "https://eigermarvelhr.com"
DB = "eigermarvel"
USERNAME = "admin"
PASSWORD = "8586583"

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

def check_installed_modules(models, uid):
    """Check installed modules related to dashboard/recruitment"""
    print("="*60)
    print("INSTALLED MODULES")
    print("="*60)
    
    module_ids = models.execute_kw(
        DB, uid, PASSWORD,
        'ir.module.module', 'search',
        [[('state', '=', 'installed'), ('name', 'ilike', 'recruitment')]]
    )
    
    modules = models.execute_kw(
        DB, uid, PASSWORD,
        'ir.module.module', 'read',
        [module_ids], {'fields': ['name', 'shortdesc', 'state']}
    )
    
    for mod in modules:
        print(f"  {mod['name']:40} - {mod['shortdesc']}")
    
    # Check dashboard modules
    print("\nDASHBOARD MODULES:")
    dash_module_ids = models.execute_kw(
        DB, uid, PASSWORD,
        'ir.module.module', 'search',
        [[('state', '=', 'installed'), ('name', 'ilike', 'dashboard')]]
    )
    
    dash_modules = models.execute_kw(
        DB, uid, PASSWORD,
        'ir.module.module', 'read',
        [dash_module_ids], {'fields': ['name', 'shortdesc', 'state']}
    )
    
    for mod in dash_modules:
        print(f"  {mod['name']:40} - {mod['shortdesc']}")

def check_dashboard_views(models, uid):
    """Check dashboard views"""
    print("\n" + "="*60)
    print("DASHBOARD/KANBAN VIEWS")
    print("="*60)
    
    # Check for board/dashboard views
    view_ids = models.execute_kw(
        DB, uid, PASSWORD,
        'ir.ui.view', 'search',
        [[('type', 'in', ['kanban', 'graph', 'pivot', 'dashboard'])]]
    )
    
    views = models.execute_kw(
        DB, uid, PASSWORD,
        'ir.ui.view', 'read',
        [view_ids[:20]], {'fields': ['name', 'model', 'type']}
    )
    
    for view in views:
        print(f"  {view.get('type', 'N/A'):10} - {view.get('model', 'N/A'):30} - {view.get('name', 'N/A')}")

def check_actions(models, uid):
    """Check window actions for recruitment"""
    print("\n" + "="*60)
    print("RECRUITMENT MENU ACTIONS")
    print("="*60)
    
    action_ids = models.execute_kw(
        DB, uid, PASSWORD,
        'ir.actions.act_window', 'search',
        [[('res_model', 'ilike', 'recruitment')]]
    )
    
    actions = models.execute_kw(
        DB, uid, PASSWORD,
        'ir.actions.act_window', 'read',
        [action_ids], {'fields': ['name', 'res_model', 'view_mode']}
    )
    
    for action in actions:
        print(f"  {action.get('res_model', 'N/A'):40} - {action.get('view_mode', 'N/A'):20} - {action.get('name', 'N/A')}")

def main():
    try:
        models, uid = connect_odoo()
        check_installed_modules(models, uid)
        check_dashboard_views(models, uid)
        check_actions(models, uid)
        return 0
    except Exception as e:
        print(f"\n✗ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    exit(main())
