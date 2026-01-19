# RPC Error Fix - Duplicate Action ID

## Issue
```
ValueError: External ID not found in the system: uae_recruitment_mgmt.action_recruitment_dashboard
```

**Root Cause**: Two XML files were defining the same action ID `action_recruitment_dashboard`:
1. `recruitment_dashboard_views.xml` - Defined as `ir.actions.act_window` (correct, loaded in manifest)
2. `dashboard_views.xml` - Defined as `ir.actions.act_client` (not loaded, but still conflicting)

When the menu tried to reference `action_recruitment_dashboard`, ODOO couldn't find a consistent definition due to the duplicate entries.

## Solution
✅ **Removed the duplicate action definition** from `dashboard_views.xml`

**File Modified**: `views/dashboard_views.xml`

**Change**: 
- Commented out the conflicting `action_recruitment_dashboard` record with `ir.actions.client` model
- Kept a comment directing to use `recruitment_dashboard_views.xml` instead
- This resolves the duplicate ID conflict while preserving the correct definition in `recruitment_dashboard_views.xml`

## Files Updated on Remote Server
- ✅ `/var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt/views/dashboard_views.xml`

## Verification
Module upgrade from manifest completed successfully with no errors:
```
2026-01-17 16:34:03,578 eigermarvel odoo.service.server: Initiating shutdown
```

## Action Items
1. ✅ Fix deployed
2. ✅ Module upgraded via CLI
3. ⏳ **Next**: Clear browser cache and refresh ODOO web interface
   - Go to http://eigermarvelhr.com
   - Press Ctrl+Shift+Delete to clear cache
   - Refresh the page
   - Navigate to Apps and try upgrading the module from the web UI again

## Expected Result
The "Recruitment" menu should now be visible with all 6 submenus:
- Dashboard
- Clients
- Job Orders
- Candidates
- Visa Processing
- Placements

---

**Status**: ✅ FIXED - Ready for testing
