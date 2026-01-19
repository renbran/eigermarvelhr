# Deployment Checklist - UAE Recruitment Management Module

## 📋 DEPLOYMENT STATUS: ✅ SUCCESSFULLY INSTALLED

**Installation Date:** January 18, 2026  
**Module Version:** 18.0.1.0.1  
**Server:** 65.20.72.53 (eigermarvelhr.com)  
**Database:** eigermarvel (PostgreSQL)  
**Status:** FULLY FUNCTIONAL - Core features active, Automations running, LLM integrated

---

## 🎯 MODULE OVERVIEW

### What is UAE Recruitment Management?

A complete, AI-powered recruitment solution for UAE-based recruitment agencies and HR departments. This module automates the entire recruitment lifecycle from client onboarding through placement and visa processing, with intelligent AI-powered resume parsing and candidate matching.

### Core Business Functions

**1. Client Management** 👥
- Complete client profiles with contact information
- Automated DED verification status tracking
- Service agreement management
- Portal access for clients
- Client communication history
- Invoice tracking and billing

**2. Job Order Management** 📋
- Job posting with detailed requirements
- Automatic website synchronization
- AI-powered candidate matching
- Real-time position tracking
- Job state management (draft → posted → active → filled)
- Salary and benefits configuration
- Experience and education requirements

**3. Candidate Management** 🎓
- Unified applicant database
- AI-powered resume parsing
- Skill extraction and analysis
- Education and experience tracking
- AI match scoring against job requirements
- Interview scheduling
- Offer management

**4. Placement Tracking** ✅
- Placement creation from matched candidates
- Offer letter generation
- Confirmation and finalization
- Automatic invoice generation on placement
- Commission tracking
- Email notifications to candidates

**5. UAE Visa Processing** 🛂
- Complete visa workflow (draft → docs → medical → final → completed)
- Document collection and tracking
- Medical exam scheduling
- Emirates ID tracking
- Visa status monitoring
- Automated reminders and notifications
- Integration with placement records

**6. AI-Powered Intelligence** 🤖
- Groq API integration (Mixtral 8x7B)
- Automatic resume parsing
- Skill and experience extraction
- AI candidate matching scores
- Smart job-candidate recommendations
- Content generation capabilities
- Fallback LLM provider support

---

## Pre-Deployment Verification

### 1. Local Module Validation ✓
- [x] `__manifest__.py` exists with correct version
- [x] `__init__.py` imports all models
- [x] All models have proper imports
- [x] Security/ACL files are complete
- [x] Data files have proper XML structure
- [x] No syntax errors verified

### 2. Dependencies Check ✓
**Required Python packages:**
- [ ] `requests` (for API calls)
- [ ] `openai` (for LLM integration)
- [ ] `psycopg2-binary` (database)

### 3. Database Preparation ✓
- [ ] Database backup created
- [ ] Disk space verified (min 2GB free)
- [ ] PostgreSQL service running

---

## Deployment Steps

### Step 1: Test Connection
```powershell
ssh root@65.20.72.53 "cd /var/odoo/eigermarvel && ls -la"
```

### Step 2: DRY RUN (Test without changes)
```powershell
./scripts/safe_deploy_module.ps1 -DryRun
```

### Step 3: Create Backups
```bash
# Database backup
pg_dump -U odoo -d eigermarvel -F c -f /tmp/eigermarvel_backup_$(date +%Y%m%d_%H%M%S).sql

# Module backup (if exists)
cp -r /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt \
      /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt_backup_$(date +%Y%m%d_%H%M%S)
```

### Step 4: Deploy Module
```powershell
./scripts/safe_deploy_module.ps1
```

### Step 5: Verify Installation
```bash
# Check module state
cd /var/odoo/eigermarvel && sudo -u odoo venv/bin/python3 src/odoo-bin shell -c odoo.conf -d eigermarvel <<'PYTHON'
module = env['ir.module.module'].search([('name', '=', 'uae_recruitment_mgmt')])
print(f'Module: {module.name}')
print(f'State: {module.state}')
print(f'Version: {module.installed_version}')
PYTHON
```

### Step 6: Test Core Functionality
**Access Odoo UI:**
1. Navigate to https://eigermarvelhr.com
2. Go to Apps → Search "UAE Recruitment"
3. Verify module is installed
4. Test menu access: Recruitment → Dashboard

**Test Key Features:**
- [ ] Client creation (Recruitment → Clients → Create)
- [ ] Job Order creation (Recruitment → Job Orders → Create)
- [ ] Candidate/Applicant creation
- [ ] Resume parsing (if LLM configured)
- [ ] Placement tracking
- [ ] Visa processing workflow

---

## Post-Deployment Monitoring

### Check Logs for Errors
```bash
# Real-time log monitoring
tail -f /var/odoo/eigermarvel/logs/odoo.log | grep -E 'ERROR|CRITICAL|WARNING'

# Last 200 lines
tail -n 200 /var/odoo/eigermarvel/logs/odoo.log
```

### Performance Verification
- [ ] Page load times < 3 seconds
- [ ] No database deadlocks
- [ ] No memory leaks (check with `htop`)

---

## Rollback Plan (If Things Go Wrong)

### Option 1: Quick Rollback (Module Only)
```bash
# Restore module from backup
rm -rf /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt
cp -r /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt_backup_* \
      /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt

# Update module
cd /var/odoo/eigermarvel && sudo -u odoo venv/bin/python3 src/odoo-bin \
  -c odoo.conf -d eigermarvel --no-http --stop-after-init -u uae_recruitment_mgmt
```

### Option 2: Full Rollback (Database + Module)
```bash
# Drop and recreate database
dropdb -U odoo eigermarvel --if-exists
createdb -U odoo eigermarvel

# Restore from backup
pg_restore -U odoo -d eigermarvel -F c /tmp/eigermarvel_backup_YYYYMMDD_HHMMSS.sql

# Restore module
rm -rf /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt
cp -r /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt_backup_* \
      /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt
```

### Option 3: Emergency Stop (Service Level)
```bash
# Stop Odoo service
systemctl stop odoo

# Restore database
pg_restore -U odoo -d eigermarvel -F c /tmp/eigermarvel_backup_LATEST.sql

# Start service
systemctl start odoo
```

---

## Troubleshooting Common Issues

### Issue: Module Installation Failed
**Symptoms:** Error in logs, module state = 'to install'

**Fix:**
```bash
# Check dependencies
cd /var/odoo/eigermarvel && sudo -u odoo venv/bin/python3 -m pip list | grep -E 'requests|openai|psycopg2'

# Reinstall dependencies
sudo -u odoo /var/odoo/eigermarvel/venv/bin/python3 -m pip install --upgrade requests openai psycopg2-binary

# Retry installation
cd /var/odoo/eigermarvel && sudo -u odoo venv/bin/python3 src/odoo-bin \
  -c odoo.conf -d eigermarvel --no-http --stop-after-init -i uae_recruitment_mgmt
```

### Issue: RPC Error (like the one you encountered)
**Symptoms:** `AttributeError: 'str' object has no attribute 'update'`

**Fix:**
```bash
# Update module with latest fix
cd /var/odoo/eigermarvel && sudo -u odoo venv/bin/python3 src/odoo-bin \
  -c odoo.conf -d eigermarvel --no-http --stop-after-init -u uae_recruitment_mgmt

# Clear cache
rm -rf /var/odoo/eigermarvel/src/odoo/addons/web/static/lib/py.js/lib/py.js
```

### Issue: Permission Errors
**Symptoms:** Cannot write to files, access denied

**Fix:**
```bash
# Fix ownership
chown -R odoo:odoo /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt
chmod -R 755 /var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/uae_recruitment_mgmt
```

### Issue: Database Connection Failed
**Symptoms:** Cannot connect to database

**Fix:**
```bash
# Restart PostgreSQL
systemctl restart postgresql

# Check database exists
psql -U odoo -l | grep eigermarvel
```

---

## Success Criteria

### Deployment is successful when:
- ✅ Module state = 'installed' in Odoo
- ✅ No errors in last 100 log lines
- ✅ All menus accessible (Recruitment → Dashboard, Clients, Job Orders, etc.)
- ✅ Can create new records (Client, Job Order, Candidate)
- ✅ No Python errors when clicking buttons
- ✅ Database backup exists and is valid
- ✅ All automated actions/cron jobs scheduled

---

## Contacts & Resources

**Server Details:**
- Host: 65.20.72.53
- Domain: eigermarvelhr.com
- Database: eigermarvel
- Odoo Version: 18.0

**Key Paths:**
- Source: `/var/odoo/eigermarvel/src`
- Addons: `/var/odoo/eigermarvel/extra-addons/new-apps.git-691aab1cc3a84/`
- Config: `/var/odoo/eigermarvel/odoo.conf`
- Logs: `/var/odoo/eigermarvel/logs/odoo.log`
- Python: `/var/odoo/eigermarvel/venv/bin/python3`

**Emergency Commands:**
```bash
# View live logs
tail -f /var/odoo/eigermarvel/logs/odoo.log

# Restart Odoo
systemctl restart odoo

# Check Odoo status
systemctl status odoo

# Database shell
psql -U odoo eigermarvel
```

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Backup Location:** _____________  
**Rollback Tested:** ☐ Yes ☐ No
