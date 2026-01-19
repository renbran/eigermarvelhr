# Odoo Deep Cleanup (Residual Apps)

This guide purges legacy/non-installable modules from all addons paths, clears caches, refreshes the Apps list, and reinstalls the target module.

## Prerequisites
- Server: Odoo 18.0, Python venv at `/var/odoo/eigermarvel/venv/bin/python3`
- Config: `/var/odoo/eigermarvel/odoo.conf` with correct `addons_path`
- Access: SSH and SCP from your Windows machine

## Quick Run (Windows PowerShell)
1. Upload and execute cleanup:

```powershell
# From repo root
$Host = "65.20.72.53"
$User = "root"
$DbName = "eigermarvel"
$OdooBase = "/var/odoo/eigermarvel"
$OdooUser = "odoo"
$ModuleName = "uae_recruitment_mgmt"
$IdentityFile = "$HOME/.ssh/id_rsa" # or your .ppk via Pageant/converted key

# Patterns to remove (extend if needed)
$RemovePatterns = "recruitment_uae recruitment_uae_improvements"

# Run helper
./scripts/odoo_deep_cleanup.ps1 -Host $Host -User $User -DbName $DbName -OdooBase $OdooBase -OdooUser $OdooUser -ModuleName $ModuleName -IdentityFile $IdentityFile -RemovePatterns $RemovePatterns
```

2. Verify logs and Apps:
```powershell
ssh -i $IdentityFile $User@$Host "tail -n 200 /var/odoo/eigermarvel/logs/odoo.log"
```
Open Apps in Odoo UI, toggle Developer Mode, click "Update Apps List" and confirm legacy modules no longer appear.

## Manual Server Steps (SSH)
If running directly on the server:
```bash
sudo DB_NAME=eigermarvel \
     ODOO_BASE=/var/odoo/eigermarvel \
     ODOO_USER=odoo \
     MODULE_NAME=uae_recruitment_mgmt \
     REMOVE_PATTERNS="recruitment_uae recruitment_uae_improvements" \
     bash /tmp/odoo_deep_cleanup.sh
```

## Troubleshooting
- Missing logs path: ensure `/var/odoo/eigermarvel/logs` exists and `odoo.conf` has `logfile=/var/odoo/eigermarvel/logs/odoo.log`.
- Residual modules still listed: ensure all addons paths are cleaned (see `addons_path` in `odoo.conf`). Re-run cleanup and then update Apps list.
- Authentication prompts: use `-i` with your SSH key or configure `~/.ssh/config` for host.
- Odoo user home cache: script cleans `~odoo/.local/share/Odoo`; verify path if Odoo runs under a different user.

## Notes
- The script upgrades `base` to force manifest rescan, then upgrades `uae_recruitment_mgmt`.
- Avoid `-u all` unless necessary; targeted upgrades reduce interference from legacy modules.