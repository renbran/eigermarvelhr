# Fix for "View types not defined tree found in act_window action 1079"

## Problem Description

Error Message:
```
UncaughtPromiseError
View types not defined tree found in act_window action 1079
```

This error occurs when:
- An action window (act_window) in Odoo is configured with `view_mode` containing "tree"
- But no corresponding tree view is defined for that model
- Or the tree view type is not properly registered in the system

## Root Cause

Action 1079 (likely the Candidates action for `hr.applicant` model) has "tree" in its `view_mode` configuration, but:
1. The recruitment module doesn't define tree views
2. The tree view type is not properly recognized by the Odoo system

## Solutions

### Solution 1: Fix via Database (Recommended)

Run the comprehensive fix script:

```bash
cd /opt/odoo
python3 /path/to/fix_tree_view_comprehensive.py
```

This script will:
- Find action 1079
- Remove "tree" from its view_mode
- Fix all other problematic actions
- Verify the fix was successful

### Solution 2: Manual Database Fix

If you have direct database access, run:

```sql
-- Remove 'tree' from any action with problematic view_mode
UPDATE ir_actions_act_window 
SET view_mode = 'kanban,list,form'
WHERE id = 1079 AND view_mode LIKE '%tree%';

-- Fix any other actions with tree in view_mode
UPDATE ir_actions_act_window 
SET view_mode = REPLACE(REPLACE(REPLACE(view_mode, 'tree,', ''), ',tree', ''), 'tree', '')
WHERE view_mode LIKE '%tree%';
```

### Solution 3: Fix via Odoo UI

1. Go to **Settings → Technical → Actions → Windows Actions**
2. Search for the action (ID 1079 or by name "Candidates")
3. Edit the action
4. In **View Mode** field, ensure it contains only: `kanban,list,form` (without "tree")
5. Save and reload the page

### Solution 4: Redeploy the Module

```bash
cd /opt/odoo
# Stop Odoo service
systemctl stop odoo

# Backup database (recommended)
pg_dump eigermarvel > eigermarvel_backup.sql

# Remove and reinstall the module
odoo-bin shell -d eigermarvel -c odoo.conf << EOF
env['ir.module.module'].search([('name', '=', 'uae_recruitment_mgmt')]).button_immediate_uninstall()
EOF

# Restart Odoo
systemctl start odoo

# The module will be automatically reinstalled
```

## Implemented Fix in Code

A fix has been implemented in:
- **File**: `odoo_modules/uae_recruitment_mgmt/data/fix_tree_view_actions.xml`
- **Updated**: `odoo_modules/uae_recruitment_mgmt/__manifest__.py`

This file explicitly redefines all recruitment actions to ensure they use only valid view modes:
- ✅ `kanban,list,form` (Candidates, Clients, Job Orders)
- ✅ `kanban,list,form,graph,pivot` (Placements)
- ❌ No "tree" views

## Verification

After applying the fix, verify:

1. **Browser Cache**
   - Clear cache: `Ctrl+Shift+Delete` (Chrome/Firefox) or `Cmd+Shift+Delete` (Mac)
   - Or refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`

2. **Database Check**
   ```python
   # Connect to Odoo and check
   models.execute_kw(
       db, uid, password,
       'ir.actions.act_window', 'read',
       [1079],
       {'fields': ['view_mode']}
   )
   # Should return view_mode = 'kanban,list,form' (without 'tree')
   ```

3. **Functional Test**
   - Navigate to **Recruitment → Candidates**
   - The error should no longer appear
   - You should see kanban/list/form views

## If Error Persists

1. **Clear Odoo Cache**
   ```bash
   rm -rf /opt/odoo/.cache
   ```

2. **Restart Odoo Service**
   ```bash
   systemctl restart odoo
   ```

3. **Update Database**
   ```bash
   cd /opt/odoo
   odoo-bin -d eigermarvel -u uae_recruitment_mgmt
   ```

4. **Check Module Status**
   - Go to **Apps → Installed Apps**
   - Search for "UAE Recruitment Management"
   - Verify it shows as "Installed"
   - If needed, click "Uninstall" then reinstall

## Prevention

To prevent this issue in the future:

1. **Never use 'tree' in view_mode** unless you have a corresponding tree view defined
2. **Valid view_modes for recruitment module**:
   - `kanban,list,form`
   - `kanban,list,form,graph,pivot`
   - `list,kanban,form`
   - Single views: `kanban`, `list`, `form`, `graph`, `pivot`

3. **Avoid**:
   - `tree,list,form`
   - `kanban,tree,form`
   - Any view_mode containing "tree" without a defined tree view

## Related Files

- Action Definition: [recruitment_candidate_views.xml](../odoo_modules/uae_recruitment_mgmt/views/recruitment_candidate_views.xml)
- View Definitions: [Views Directory](../odoo_modules/uae_recruitment_mgmt/views/)
- Fix Applied: [fix_tree_view_actions.xml](../odoo_modules/uae_recruitment_mgmt/data/fix_tree_view_actions.xml)

## Support

If the issue persists after applying the fix:

1. Check the Odoo server logs:
   ```bash
   tail -f /var/log/odoo/odoo-server.log | grep tree
   ```

2. Verify the action was updated:
   ```bash
   cd /opt/odoo
   python3 << 'EOF'
   import xmlrpc.client
   models = xmlrpc.client.ServerProxy('https://eigermarvelhr.com/xmlrpc/2/object')
   # Read action to verify fix
   EOF
   ```

3. Contact support with the fix script output and Odoo logs
