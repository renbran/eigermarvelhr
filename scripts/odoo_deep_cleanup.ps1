param(
    [string]$Host = "65.20.72.53",
    [string]$User = "root",
    [string]$DbName = "eigermarvel",
    [string]$OdooBase = "/var/odoo/eigermarvel",
    [string]$OdooUser = "odoo",
    [string]$ModuleName = "uae_recruitment_mgmt",
    [string]$IdentityFile = "$HOME/.ssh/id_rsa",
    [string]$RemovePatterns = "recruitment_uae recruitment_uae_improvements"
)

$ErrorActionPreference = 'Stop'

function Require-Command($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "Command '$name' not found in PATH. Please install OpenSSH client."
    }
}

Require-Command ssh
Require-Command scp

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$cleanupScriptLocal = Join-Path $repoRoot "scripts/odoo_deep_cleanup.sh"
if (-not (Test-Path $cleanupScriptLocal)) { throw "Cleanup script not found at $cleanupScriptLocal" }

$remoteTmp = "/tmp/odoo_deep_cleanup.sh"
Write-Host "Uploading cleanup script to $User@$Host:$remoteTmp"
scp -i $IdentityFile $cleanupScriptLocal "$User@$Host:$remoteTmp"

$envs = @(
    "DB_NAME=$DbName",
    "ODOO_BASE=$OdooBase",
    "ODOO_USER=$OdooUser",
    "MODULE_NAME=$ModuleName",
    "REMOVE_PATTERNS=$RemovePatterns"
) -join ' '

$remoteCmd = "sudo $envs bash $remoteTmp"
Write-Host "Executing remote cleanup..."
ssh -i $IdentityFile "$User@$Host" $remoteCmd

Write-Host "Cleanup executed. To verify, run: ssh -i $IdentityFile $User@$Host 'tail -n 200 /var/odoo/eigermarvel/logs/odoo.log'"