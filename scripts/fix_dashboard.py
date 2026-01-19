#!/usr/bin/env python3
"""
Fix recruitment dashboard - remove missing models and update with correct ones
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

def remove_invalid_actions(models, uid):
    """Remove actions for models that don't exist"""
    print("="*60)
    print("REMOVING INVALID MENU ACTIONS")
    print("="*60)
    
    invalid_models = [
        'recruitment.job.requisition',
        'recruitment.candidate',
        'recruitment.job.category',
        'recruitment.retention',
        'recruitment.application',
        'recruitment.subscription',
        'recruitment.supplier',
        'recruitment.followup',
        'recruitment.contract',
        'recruitment.deployment',
        'recruitment.audit.log',
    ]
    
    for model_name in invalid_models:
        try:
            # Find actions
            action_ids = models.execute_kw(
                DB, uid, PASSWORD,
                'ir.actions.act_window', 'search',
                [[('res_model', '=', model_name)]]
            )
            
            if action_ids:
                print(f"\n  Removing actions for: {model_name}")
                print(f"    Found {len(action_ids)} action(s)")
                
                # Get menu items using these actions
                menu_ids = models.execute_kw(
                    DB, uid, PASSWORD,
                    'ir.ui.menu', 'search',
                    [[('action', 'in', [f'ir.actions.act_window,{aid}' for aid in action_ids])]]
                )
                
                if menu_ids:
                    print(f"    Found {len(menu_ids)} menu item(s)")
                    models.execute_kw(
                        DB, uid, PASSWORD,
                        'ir.ui.menu', 'unlink',
                        [menu_ids]
                    )
                    print(f"    ✓ Deleted menu items")
                
                # Delete actions
                models.execute_kw(
                    DB, uid, PASSWORD,
                    'ir.actions.act_window', 'unlink',
                    [action_ids]
                )
                print(f"    ✓ Deleted actions")
            
        except Exception as e:
            print(f"    ERROR: {e}")

def check_dashboard_action(models, uid):
    """Check the recruitment dashboard action"""
    print("\n" + "="*60)
    print("CHECKING RECRUITMENT DASHBOARD")
    print("="*60)
    
    try:
        # Find dashboard action
        action_ids = models.execute_kw(
            DB, uid, PASSWORD,
            'ir.actions.act_window', 'search',
            [[('res_model', '=', 'recruitment.dashboard')]]
        )
        
        if action_ids:
            actions = models.execute_kw(
                DB, uid, PASSWORD,
                'ir.actions.act_window', 'read',
                [action_ids], {'fields': ['name', 'res_model', 'view_mode', 'view_id']}
            )
            
            for action in actions:
                print(f"\n  Dashboard Action Found:")
                print(f"    Name: {action.get('name')}")
                print(f"    Model: {action.get('res_model')}")
                print(f"    View Mode: {action.get('view_mode')}")
                print(f"    View ID: {action.get('view_id')}")
                
        # Check if recruitment.dashboard model exists
        model_ids = models.execute_kw(
            DB, uid, PASSWORD,
            'ir.model', 'search',
            [[('model', '=', 'recruitment.dashboard')]]
        )
        
        if not model_ids:
            print("\n  ⚠ WARNING: recruitment.dashboard model does not exist!")
            print("  This is likely why the dashboard is not working.")
            
    except Exception as e:
        print(f"  ERROR: {e}")

def main():
    try:
        models, uid = connect_odoo()
        remove_invalid_actions(models, uid)
        check_dashboard_action(models, uid)
        
        print("\n" + "="*60)
        print("NEXT STEPS")
        print("="*60)
        print("1. Upgrade the uae_recruitment_mgmt module")
        print("2. Or check if the module needs to be reinstalled")
        print("3. Restart Odoo server after cleanup")
        
        return 0
    except Exception as e:
        print(f"\n✗ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == '__main__':
    exit(main())
