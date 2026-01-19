# Safe Odoo Module Deployment with Rollback
# Deploys uae_recruitment_mgmt to eigermarvelhr with automatic backup and rollback capability

param(
    [string]$RemoteHost = "65.20.72.53",
    [string]$RemoteUser = "root",
    [int]$RemotePort = 22,
    [string]$Database = "eigermarvel",
    [string]$ModuleName = "uae_recruitment_mgmt",
    [string]$LocalModulePath = "D:\01_WORK_PROJECTS\EM WEBSITE\eiger-marvel-hr-plat\odoo_modules\uae_recruitment_mgmt",
    [string]$RemoteAddonsPath = "/var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84",
    [string]$OdooBase = "/var/odoo/eigermarvel",
    [string]$VenvPython = "/var/odoo/eigermarvel/venv/bin/python3",
    [string]$OdooBin = "/var/odoo/eigermarvel/src/odoo-bin",
    [string]$OdooConf = "/var/odoo/eigermarvel/odoo.conf",
    [string]$LogFile = "/var/odoo/eigermarvel/logs/odoo.log",
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$sshCmd = "ssh -p $RemotePort $RemoteUser@$RemoteHost"
$scpCmd = "scp -P $RemotePort"

function Write-Step {
    param([string]$Message)
    Write-Host "`n================================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "================================================`n" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

# Validate local module
Write-Step "STEP 1: Validating Local Module"
if (!(Test-Path -Path $LocalModulePath)) {
    Write-Error-Custom "Module not found: $LocalModulePath"
    exit 1
}
Write-Success "Module found at: $LocalModulePath"

# Check required files
$requiredFiles = @("__manifest__.py", "__init__.py", "models", "views", "security")
foreach ($file in $requiredFiles) {
    $path = Join-Path $LocalModulePath $file
    if (!(Test-Path $path)) {
        Write-Warning-Custom "Missing: $file (may cause installation issues)"
    } else {
        Write-Success "Found: $file"
    }
}

if ($DryRun) {
    Write-Warning-Custom "DRY RUN MODE - No changes will be made"
    Write-Host ""
}

# Step 2: Create database backup
Write-Step "STEP 2: Creating Database Backup"
$backupTimestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "/tmp/eigermarvel_backup_$backupTimestamp.sql"

$backupCmd = @"
pg_dump -U odoo -d $Database -F c -f $backupFile && echo 'Backup created: $backupFile'
"@

if (!$DryRun) {
    Write-Host "Creating PostgreSQL backup..."
    cmd /c $sshCmd "$backupCmd"
    Write-Success "Database backup created: $backupFile"
} else {
    Write-Host "[DRY-RUN] Would create backup: $backupFile"
}

# Step 3: Backup existing module
Write-Step "STEP 3: Backing Up Existing Module (if exists)"
$moduleBackupPath = "$RemoteAddonsPath/${ModuleName}_backup_$backupTimestamp"

$backupModuleCmd = @"
if [ -d '$RemoteAddonsPath/$ModuleName' ]; then
    cp -r '$RemoteAddonsPath/$ModuleName' '$moduleBackupPath'
    echo 'Module backup created: $moduleBackupPath'
else
    echo 'No existing module to backup'
fi
"@

if (!$DryRun) {
    cmd /c $sshCmd "$backupModuleCmd"
} else {
    Write-Host "[DRY-RUN] Would backup module to: $moduleBackupPath"
}

# Step 4: Upload new module
Write-Step "STEP 4: Uploading New Module to Remote Server"
$remoteTmpPath = "/tmp/$ModuleName"

if (!$DryRun) {
    Write-Host "Uploading module to $remoteTmpPath..."
    cmd /c $scpCmd -r "$LocalModulePath" "$RemoteUser@${RemoteHost}:$remoteTmpPath"
    Write-Success "Module uploaded successfully"
} else {
    Write-Host "[DRY-RUN] Would upload module to: $remoteTmpPath"
}

# Step 5: Install dependencies
Write-Step "STEP 5: Installing Python Dependencies"
$dependencies = @("requests", "openai", "psycopg2-binary")

$installDepsCmd = @"
sudo -u odoo $VenvPython -m pip install --upgrade pip
sudo -u odoo $VenvPython -m pip install $($dependencies -join ' ')
echo 'Dependencies installed'
"@

if (!$DryRun) {
    Write-Host "Installing: $($dependencies -join ', ')"
    cmd /c $sshCmd "$installDepsCmd"
    Write-Success "Dependencies installed"
} else {
    Write-Host "[DRY-RUN] Would install: $($dependencies -join ', ')"
}

# Step 6: Deploy module
Write-Step "STEP 6: Deploying Module to Addons Path"
$deployCmd = @"
if [ -d '$RemoteAddonsPath/$ModuleName' ]; then
    rm -rf '$RemoteAddonsPath/$ModuleName'
fi
mv '$remoteTmpPath' '$RemoteAddonsPath/$ModuleName'
chown -R odoo:odoo '$RemoteAddonsPath/$ModuleName'
echo 'Module deployed to $RemoteAddonsPath/$ModuleName'
"@

if (!$DryRun) {
    cmd /c $sshCmd "$deployCmd"
    Write-Success "Module deployed successfully"
} else {
    Write-Host "[DRY-RUN] Would deploy module to: $RemoteAddonsPath/$ModuleName"
}

# Step 7: Update module in Odoo
Write-Step "STEP 7: Installing/Updating Module in Odoo"
$updateCmd = @"
cd $OdooBase && sudo -u odoo $VenvPython $OdooBin -c $OdooConf -d $Database --no-http --stop-after-init -u $ModuleName
"@

if (!$DryRun) {
    Write-Host "Running Odoo update (this may take a minute)..."
    cmd /c $sshCmd "$updateCmd"
    
    # Check for errors in log
    Write-Host "`nChecking installation logs..."
    $logCheck = cmd /c $sshCmd "tail -n 50 $LogFile | grep -i -E 'error|exception|failed|traceback' || echo 'No errors found'"
    
    if ($logCheck -match "No errors found") {
        Write-Success "Module installed successfully - No errors detected"
    } else {
        Write-Warning-Custom "Potential errors detected in logs:"
        Write-Host $logCheck -ForegroundColor Yellow
        
        # Ask for rollback
        $response = Read-Host "`nErrors detected. Rollback to previous version? (y/n)"
        if ($response -eq 'y') {
            Write-Step "ROLLING BACK CHANGES"
            
            # Restore module
            $rollbackModuleCmd = @"
if [ -d '$moduleBackupPath' ]; then
    rm -rf '$RemoteAddonsPath/$ModuleName'
    mv '$moduleBackupPath' '$RemoteAddonsPath/$ModuleName'
    echo 'Module restored from backup'
fi
"@
            cmd /c $sshCmd "$rollbackModuleCmd"
            
            # Restore database
            $rollbackDbCmd = @"
dropdb -U odoo $Database --if-exists
createdb -U odoo $Database
pg_restore -U odoo -d $Database -F c $backupFile
echo 'Database restored from backup'
"@
            cmd /c $sshCmd "$rollbackDbCmd"
            
            Write-Success "Rollback completed successfully"
            exit 1
        }
    }
} else {
    Write-Host "[DRY-RUN] Would run: $updateCmd"
}

# Step 8: Verify installation
Write-Step "STEP 8: Verifying Installation"
$verifyCmd = @"
cd $OdooBase && sudo -u odoo $VenvPython $OdooBin shell -c $OdooConf -d $Database <<'PYTHON'
import sys
try:
    env['ir.module.module'].search([('name', '=', '$ModuleName')])
    module = env['ir.module.module'].search([('name', '=', '$ModuleName')])
    if module:
        print(f'Module: {module.name}')
        print(f'State: {module.state}')
        print(f'Installed: {module.state == \"installed\"}')
        sys.exit(0 if module.state == 'installed' else 1)
    else:
        print('Module not found')
        sys.exit(1)
except Exception as e:
    print(f'Error: {e}')
    sys.exit(1)
PYTHON
"@

if (!$DryRun) {
    $verifyResult = cmd /c $sshCmd "$verifyCmd"
    Write-Host $verifyResult
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Module verification passed"
    } else {
        Write-Warning-Custom "Module verification failed"
    }
} else {
    Write-Host "[DRY-RUN] Would verify module installation"
}

# Step 9: Display recent logs
Write-Step "STEP 9: Recent Installation Logs"
if (!$DryRun) {
    $logs = cmd /c $sshCmd "tail -n 100 $LogFile"
    Write-Host $logs
} else {
    Write-Host "[DRY-RUN] Would display logs from: $LogFile"
}

# Summary
Write-Step "DEPLOYMENT SUMMARY"
Write-Host "Module Name:      $ModuleName" -ForegroundColor White
Write-Host "Database:         $Database" -ForegroundColor White
Write-Host "Server:           $RemoteHost" -ForegroundColor White
Write-Host "Addons Path:      $RemoteAddonsPath" -ForegroundColor White
Write-Host "Database Backup:  $backupFile" -ForegroundColor White
Write-Host "Module Backup:    $moduleBackupPath" -ForegroundColor White
Write-Host ""

if (!$DryRun) {
    Write-Success "Deployment completed successfully!"
    Write-Host "`nNext steps:"
    Write-Host "1. Access Odoo: https://eigermarvelhr.com"
    Write-Host "2. Check module: Apps -> Search '$ModuleName'"
    Write-Host "3. Test functionality in Recruitment menu"
    Write-Host "`nRollback command (if needed):"
    Write-Host "ssh root@$RemoteHost 'cd $OdooBase && sudo -u odoo $VenvPython $OdooBin -c $OdooConf -d $Database --no-http --stop-after-init -u $ModuleName && pg_restore -U odoo -d $Database $backupFile'" -ForegroundColor Yellow
} else {
    Write-Host "DRY RUN COMPLETED - No changes were made" -ForegroundColor Yellow
    Write-Host "Run without -DryRun flag to execute deployment"
}
