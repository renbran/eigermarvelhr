Param(
    [string]$RemoteUser = "root",
    [string]$RemoteHost = "65.20.72.53",
    [int]$RemotePort = 22,
    [string]$RemoteAddonsPath = "/var/odoo/eigermarvel/src/addons",
    [string]$OdooConf = "/var/odoo/eigermarvel/odoo.conf",
    [string]$VenvPython = "/var/odoo/eigermarvel/venv/bin/python3",
    [string]$OdooBin = "/var/odoo/eigermarvel/src/odoo-bin",
    [string]$DbName = "eigermarvel",
    [string[]]$RemoveModules = @(
        "recruitment_uae",
        "recruitment_uae_improvements",
        "recruitment_uae_improvements.bak",
        "recruitment_uae_odoo18",
        "hr_recruitment_scholarix",
        "recruitment_twitter"
    ),
    [switch]$DryRun
)

$ssh = "ssh -p $RemotePort $RemoteUser@$RemoteHost"

Write-Host "Cleaning old recruitment modules from addons..." -ForegroundColor Cyan

# 1) Show current matching modules
$lsCmd = "ls -1 $RemoteAddonsPath | grep -E 'recruitment|hr_recruitment' || true"
cmd /c $ssh "$lsCmd"

# 2) Remove listed modules (if exist)
foreach ($mod in $RemoveModules) {
    $rmCmd = "if [ -d '$RemoteAddonsPath/$mod' ]; then echo Removing $mod; rm -rf '$RemoteAddonsPath/$mod'; fi"
    if ($DryRun) {
        Write-Host "DRY-RUN: $rmCmd" -ForegroundColor Yellow
    } else {
        cmd /c $ssh "$rmCmd"
    }
}

# 3) Fix ownership for addons dir
if (-not $DryRun) {
    cmd /c $ssh "chown -R odoo:odoo '$RemoteAddonsPath'"
}

# 4) Refresh Apps List via Odoo shell (update_list)
Write-Host "Refreshing Apps List in Odoo..." -ForegroundColor Yellow
$py = @"
from odoo import api, SUPERUSER_ID
import sys
try:
    env = api.Environment(cr, SUPERUSER_ID, {})
    env['ir.module.module'].sudo().update_list()
    print('Apps list refreshed')
except Exception as e:
    print('Error refreshing apps list:', e)
"@

$refreshCmd = "cd /var/odoo/eigermarvel && sudo -u odoo $VenvPython $OdooBin -c $OdooConf -d $DbName --no-http --stop-after-init --shell <<'PY'
$py
PY"

if ($DryRun) {
    Write-Host "DRY-RUN: $refreshCmd" -ForegroundColor Yellow
} else {
    cmd /c $ssh "$refreshCmd"
}

# 5) Optional: restart Odoo service if managed by systemd (commented)
# cmd /c $ssh "systemctl restart odoo || true"

Write-Host "Cleanup complete." -ForegroundColor Green
