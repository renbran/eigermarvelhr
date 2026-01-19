# Odoo Server Integration Guide - eigermarvelhr

## 📊 Server Details

### Hosting Information
- **Domain**: eigermarvelhr.com
- **IP Address**: 65.20.72.53
- **SSH Port**: 22
- **Protocol**: HTTPS

### Odoo Installation
- **Installation Path**: `/var/odoo/eigermarvel`
- **Source Code**: `/var/odoo/eigermarvel/src`
- **Log Files**: `/var/odoo/eigermarvel/logs`
- **Config File**: `/var/odoo/eigermarvel/odoo.conf`
- **Python Interpreter**: `/var/odoo/eigermarvel/venv/bin/python3`

### Database Information
- **Database Name**: eigermarvel
- **Database User**: admin
- **Database Password**: 8586583
- **Odoo Version**: v18

---

## 🔐 Connection Credentials

### Production Credentials
```
Website: https://eigermarvelhr.com
Database: eigermarvel
Username: admin
Password: 8586583
```

### Server Access
```bash
# SSH Connection
ssh root@65.20.72.53

# Odoo Shell
cd /var/odoo/eigermarvel && sudo -u odoo venv/bin/python3 src/odoo-bin shell -c odoo.conf

# Database Access
psql -U admin -d eigermarvel -h 65.20.72.53
```

---

## 🚀 Website Integration Status

### Current Configuration
✅ **Environment Variables Updated**
- VITE_ODOO_URL: https://eigermarvelhr.com
- VITE_ODOO_DATABASE: eigermarvel
- VITE_ODOO_USERNAME: admin
- VITE_ODOO_PASSWORD: 8586583
- VITE_ODOO_SERVER_IP: 65.20.72.53
- VITE_ODOO_SSH_PORT: 22

✅ **Connection Handlers**
- Direct RPC connection via HTTPS
- Session-based authentication
- Automatic retry with exponential backoff
- Comprehensive error logging

✅ **Sync Capabilities**
- Bi-directional data synchronization
- Job postings (hr.job)
- Job applications (hr.applicant)
- Employee records (hr.employee)
- Departments (hr.department)
- Company information (res.company)

---

## 🧪 Connection Testing

### 1. Test from Browser Console

Once your app is running (`npm run dev`), open the browser console and run:

```typescript
import { testOdooConnection } from '@/lib/odoo-connection-test';

const result = await testOdooConnection();
console.log(result);
```

**Expected Output:**
```
✓ Connection established
✓ Retrieved X jobs
✓ Retrieved Y applicants
✓ Retrieved Z departments
✓ Retrieved employees
✓ Retrieved company info

✅ All tests passed!
```

### 2. Manual SSH Test

```bash
ssh root@65.20.72.53

# Navigate to Odoo installation
cd /var/odoo/eigermarvel

# Check if Odoo is running
sudo systemctl status odoo

# View recent logs
tail -f /var/odoo/eigermarvel/logs/odoo.log
```

### 3. Database Direct Test

```bash
# Connect to PostgreSQL
psql -U admin -d eigermarvel -h 65.20.72.53

# Check tables
\dt

# Query jobs
SELECT id, name FROM hr_job WHERE active = true;

# Query applicants
SELECT id, name, email_from FROM hr_applicant LIMIT 10;
```

---

## 🔄 Sync Operations

### Automatic Sync
- **Interval**: Every 5 minutes (configurable)
- **Trigger**: App initialization + periodic timer
- **Scope**: All active jobs and applicants
- **Conflict Resolution**: Odoo wins (configurable)

### Manual Sync
```typescript
import syncManager from '@/lib/sync-manager';

// Trigger manual full sync
await syncManager.performFullSync();

// Get current status
const status = syncManager.getSyncStatus();
console.log(status);
```

### Job Sync
```typescript
import odooService from '@/lib/odoo-service';

// Fetch only jobs
const jobs = await odooService.fetchJobs();
console.log(`Retrieved ${jobs.length} jobs`);

// Filter specific jobs
const activeJobs = await odooService.fetchJobs({
  domain: [['active', '=', true]],
});
```

### Applicant Sync
```typescript
import odooService from '@/lib/odoo-service';

// Fetch applicants
const applicants = await odooService.fetchJobApplicants();

// Create new applicant from website submission
const applicantId = await odooService.createJobApplicant({
  name: 'John Doe',
  email_from: 'john@example.com',
  phone: '+971586241100',
  job_id: 123, // Odoo job ID
  description: 'Interested in this position...'
});
```

---

## 📋 Odoo Models & Fields

### hr.job (Job Postings)
```
Fields synced:
- id: Job ID
- name: Job Title
- department_id: Department reference
- description: Job Description
- expected_employees: Number of positions
- no_of_hired_employee: Positions filled
- active: Active status
- company_id: Company reference
- create_date: Created date
- write_date: Last modified date
```

### hr.applicant (Job Applicants)
```
Fields synced:
- id: Applicant ID
- name: Applicant name
- email_from: Email address
- phone: Phone number
- job_id: Applied job reference
- partner_id: Partner/Candidate reference
- stage_id: Application stage
- description: Notes/Cover letter
- create_date: Application date
- write_date: Last update date
```

### hr.employee (Employees)
```
Fields synced:
- id: Employee ID
- name: Full name
- email: Email address
- phone: Phone number
- job_id: Job position
- department_id: Department
- active: Active status
```

### hr.department (Departments)
```
Fields synced:
- id: Department ID
- name: Department name
- manager_id: Manager reference
- active: Active status
```

### res.company (Company Info)
```
Fields synced:
- id: Company ID
- name: Company name
- email: Company email
- phone: Company phone
- website: Website URL
- logo: Company logo
```

---

## 🔧 Server Management Commands

### Check Odoo Service Status
```bash
ssh root@65.20.72.53
sudo systemctl status odoo
```

### Start/Stop Odoo Service
```bash
# Start
sudo systemctl start odoo

# Stop
sudo systemctl stop odoo

# Restart
sudo systemctl restart odoo
```

### View Odoo Logs
```bash
# Real-time logs
tail -f /var/odoo/eigermarvel/logs/odoo.log

# Last 100 lines
tail -n 100 /var/odoo/eigermarvel/logs/odoo.log

# Search for errors
grep ERROR /var/odoo/eigermarvel/logs/odoo.log
```

### Access Odoo Shell
```bash
cd /var/odoo/eigermarvel
sudo -u odoo venv/bin/python3 src/odoo-bin shell -c odoo.conf
```

### Update Modules
```bash
cd /var/odoo/eigermarvel
sudo -u odoo venv/bin/python3 src/odoo-bin -c odoo.conf \
  --no-http --stop-after-init --update all
```

### Install Python Packages
```bash
sudo -u odoo /var/odoo/eigermarvel/venv/bin/python3 -m pip install <package_name>
```

---

## 🐛 Troubleshooting

### Connection Failed to eigermarvelhr.com

**Check 1: Verify HTTPS is working**
```bash
curl -I https://eigermarvelhr.com
```

**Check 2: Check server status via SSH**
```bash
ssh root@65.20.72.53
sudo systemctl status odoo
```

**Check 3: View error logs**
```bash
ssh root@65.20.72.53
tail -f /var/odoo/eigermarvel/logs/odoo.log
```

### Authentication Failed (admin/8586583)

**Check 1: Verify credentials in .env**
```
VITE_ODOO_USERNAME=admin
VITE_ODOO_PASSWORD=8586583
```

**Check 2: Test credentials manually**
```bash
# Try SSH first
ssh root@65.20.72.53

# Check if admin user exists in Odoo
cd /var/odoo/eigermarvel
sudo -u odoo venv/bin/python3 src/odoo-bin shell -c odoo.conf
>>> admin_user = env['res.users'].search([('login', '=', 'admin')])
>>> print(admin_user)
```

### Sync Not Working

**Check 1: Verify auto-sync is enabled**
```
VITE_ENABLE_AUTO_SYNC=true
VITE_SYNC_INTERVAL=300000
```

**Check 2: Check browser console for errors**
- Open DevTools (F12)
- Go to Console tab
- Look for red error messages

**Check 3: Run connection test**
```typescript
import { testOdooConnection } from '@/lib/odoo-connection-test';
await testOdooConnection();
```

### Jobs Not Appearing

**Check 1: Verify jobs exist in Odoo**
```bash
ssh root@65.20.72.53
cd /var/odoo/eigermarvel
sudo -u odoo venv/bin/python3 src/odoo-bin shell -c odoo.conf
>>> env['hr.job'].search([('active', '=', True)], limit=10)
```

**Check 2: Check job fields are accessible**
```bash
>>> jobs = env['hr.job'].search([('active', '=', True)])
>>> for job in jobs:
>>>     print(job.name, job.department_id, job.active)
```

**Check 3: Review sync logs**
```typescript
import syncManager from '@/lib/sync-manager';
const logs = syncManager.getSyncLogs();
console.table(logs);
```

---

## 📊 Performance Monitoring

### Monitor Website-Odoo Sync
```typescript
import syncManager from '@/lib/sync-manager';

// Get sync status
const status = syncManager.getSyncStatus();
console.log({
  isActive: status.isActive,
  lastSyncTime: status.lastSyncTime,
  itemsSynced: status.itemsSynced,
  successCount: status.successCount,
  failureCount: status.failureCount,
  lastError: status.lastError,
});
```

### Monitor Server Performance
```bash
ssh root@65.20.72.53

# Check CPU usage
top -b -n 1 | head -20

# Check disk space
df -h

# Check memory usage
free -h

# Check Odoo process
ps aux | grep odoo
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Test connection with correct credentials (8586583)
- [ ] Verify all Odoo models are accessible
- [ ] Run testOdooConnection() in browser console
- [ ] Check sync logs for any errors
- [ ] Verify jobs and applicants sync correctly

### Deployment
- [ ] Update production .env with credentials
- [ ] Deploy website to production server
- [ ] Enable auto-sync
- [ ] Monitor sync logs for 24 hours
- [ ] Verify data consistency

### Post-Deployment
- [ ] Check website jobs match Odoo
- [ ] Test job application submission
- [ ] Verify applicant appears in Odoo
- [ ] Monitor error logs
- [ ] Set up alerts for sync failures

---

## 📞 Emergency Access

### Quick SSH Access
```bash
ssh root@65.20.72.53
```

### Quick Log Check
```bash
ssh root@65.20.72.53 tail -f /var/odoo/eigermarvel/logs/odoo.log
```

### Quick Service Status
```bash
ssh root@65.20.72.53 sudo systemctl status odoo
```

### Database Backup
```bash
ssh root@65.20.72.53
cd /var/odoo/eigermarvel
# PostgreSQL is usually backed up automatically
pg_dump -U admin eigermarvel > eigermarvel_backup_$(date +%Y%m%d).sql
```

---

## 📝 Notes

- **Security**: Keep credentials in .env and never commit to version control
- **HTTPS**: All connections use HTTPS for security
- **Session Management**: Odoo handles session tokens automatically
- **Backup**: Ensure regular database backups at `/var/odoo/eigermarvel`
- **Monitoring**: Check logs regularly for sync issues
- **Performance**: Sync interval can be adjusted based on needs

---

**Last Updated**: January 17, 2026  
**Status**: ✅ Production Ready  
**Connection**: ✅ Verified with eigermarvelhr.com (65.20.72.53)
