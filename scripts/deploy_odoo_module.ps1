Param(
    [string]$RemoteUser = "root",
    [string]$RemoteHost = "65.20.72.53",
    [int]$RemotePort = 22,
    [string]$LocalModulePath = "D:\01_WORK_PROJECTS\EM WEBSITE\eiger-marvel-hr-plat\odoo_modules\uae_recruitment_mgmt",
    [string]$RemoteAddonsPath = "/var/odoo/eigermarvel/src/addons",
    [string]$RemoteTmpPath = "/var/odoo/eigermarvel/tmp",
    [string]$OdooConf = "/var/odoo/eigermarvel/odoo.conf",
    [string]$VenvPython = "/var/odoo/eigermarvel/venv/bin/python3",
    [string]$OdooBin = "/var/odoo/eigermarvel/src/odoo-bin",
    [string]$ModuleName = "uae_recruitment_mgmt"
)

Write-Host "Starting Odoo module deployment..." -ForegroundColor Cyan

# 1) Validate local module path
if (!(Test-Path -Path $LocalModulePath)) {
    Write-Error "Local module path not found: $LocalModulePath"
    exit 1
}

# 2) Create remote tmp dir and addons dir
$sshBase = "ssh -p $RemotePort $RemoteUser@$RemoteHost"
$scpBase = "scp -P $RemotePort"

Write-Host "Ensuring remote directories exist..." -ForegroundColor Yellow
cmd /c $sshBase "mkdir -p $RemoteTmpPath && mkdir -p $RemoteAddonsPath"

# 3) Copy module recursively via scp to tmp
Write-Host "Copying module to remote tmp directory..." -ForegroundColor Yellow
cmd /c $scpBase -r "$LocalModulePath" "$RemoteUser@$RemoteHost:$RemoteTmpPath/"

# 4) Move module into addons (replace existing), set ownership to odoo
Write-Host "Installing module into addons path..." -ForegroundColor Yellow
$remoteInstall = @"
set -e
MODULE_DIR=$RemoteTmpPath/$ModuleName
ADDONS_DIR=$RemoteAddonsPath
if [ -d "$ADDONS_DIR/$ModuleName" ]; then
  rm -rf "$ADDONS_DIR/$ModuleName"
fi
mv "$MODULE_DIR" "$ADDONS_DIR/"
chown -R odoo:odoo "$ADDONS_DIR/$ModuleName"
"@
cmd /c $sshBase "$remoteInstall"

# 5) Install Python dependencies
Write-Host "Installing Python dependencies (requests, openai, psycopg2-binary)..." -ForegroundColor Yellow
cmd /c $sshBase "sudo -u odoo $VenvPython -m pip install --upgrade pip"
cmd /c $sshBase "sudo -u odoo $VenvPython -m pip install requests openai psycopg2-binary"

# 6) Update only this module
Write-Host "Updating module in Odoo (non-HTTP mode)..." -ForegroundColor Yellow
$updateCmd = "cd /var/odoo/eigermarvel && sudo -u odoo $VenvPython $OdooBin -c $OdooConf --no-http --stop-after-init -u $ModuleName"
cmd /c $sshBase "$updateCmd"

# 7) Tail logs (last 100 lines)
Write-Host "Fetching last 100 log lines..." -ForegroundColor Yellow
cmd /c $sshBase "tail -n 100 /var/odoo/eigermarvel/logs/odoo.log" 

Write-Host "Deployment complete." -ForegroundColor Green
