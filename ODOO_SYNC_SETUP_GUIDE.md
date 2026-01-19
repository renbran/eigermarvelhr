# Odoo Database Sync Setup Guide - Eiger Marvel HR Platform

## Overview

Your Eiger Marvel HR website is now fully configured to sync with the **eigermarvelhr** Odoo v18 database. This setup enables real-time synchronization of:

- **Jobs** (hr.job) - Job postings from Odoo
- **Job Applicants** (hr.applicant) - Applications submitted through the website
- **Employees** (hr.employee) - Employee records
- **Departments** (hr.department) - Department information
- **Company** (res.company) - Company details

---

## ✅ Configuration Status

### Current Setup
- **Odoo Instance**: eigermarvelhr
- **Database**: eigermarvel
- **URL**: https://eigermarvelhr.com
- **Version**: Odoo v18
- **Authentication**: admin / [configured in .env]

### Environment Variables (.env)
```dotenv
VITE_ODOO_URL=https://eigermarvelhr.com
VITE_ODOO_DATABASE=eigermarvel
VITE_ODOO_USERNAME=admin
VITE_ODOO_PASSWORD=admin
VITE_ENABLE_AUTO_SYNC=true
VITE_SYNC_INTERVAL=300000  # 5 minutes
```

---

## 🚀 Quick Start

### 1. Test the Connection

The easiest way to verify the Odoo connection is to test it from the browser console:

```typescript
import { testOdooConnection } from '@/lib/odoo-connection-test';

// Run the test
const result = await testOdooConnection();
console.log(result);
```

Expected output:
```
✓ Connection established
✓ Retrieved X jobs
✓ Retrieved Y applicants
✓ Retrieved Z departments
✓ Retrieved company info

✅ All tests passed!
```

### 2. Integrate Sync Status into Your App

Add the `OdooSyncStatus` component to show sync status:

```tsx
import { OdooSyncStatus } from '@/components/OdooSyncStatus';

function App() {
  return (
    <div>
      <OdooSyncStatus /> {/* Shows connection and sync status */}
      {/* Rest of your app */}
    </div>
  );
}
```

### 3. Enable Auto-Sync

The system is configured to automatically sync every 5 minutes. You can customize this:

```typescript
import syncManager from '@/lib/sync-manager';

// Start auto-sync (happens on initialization)
await syncManager.initialize();

// Change sync interval (in milliseconds)
syncManager.updateConfig({
  autoSync: true,
  syncInterval: 10 * 60 * 1000, // 10 minutes
});
```

---

## 🔄 Sync Operations

### Manual Full Sync

```typescript
import syncManager from '@/lib/sync-manager';

await syncManager.performFullSync();
```

### Sync Only Jobs

```typescript
import odooService from '@/lib/odoo-service';

const jobs = await odooService.fetchJobs();
console.log(`Fetched ${jobs.length} jobs from Odoo`);
```

### Sync Only Applicants

```typescript
import odooService from '@/lib/odoo-service';

const applicants = await odooService.fetchJobApplicants();
console.log(`Fetched ${applicants.length} applicants from Odoo`);
```

### Submit Job Application to Odoo

```typescript
import odooService from '@/lib/odoo-service';

const applicantId = await odooService.createJobApplicant({
  name: 'John Doe',
  email_from: 'john@example.com',
  phone: '+1234567890',
  job_id: 123, // Odoo job ID
  description: 'I am interested in this position...'
});

console.log(`Created applicant: ${applicantId}`);
```

---

## 📊 Data Mapping

### Jobs (Odoo → Website)

| Odoo Field | Website Field | Description |
|------------|---------------|-------------|
| `id` | `odooId` | Unique identifier |
| `name` | `title` | Job title |
| `department_id` | `department` | Department name |
| `description` | `description` | Job description |
| `expected_employees` | `position` | Number of positions |
| `no_of_hired_employee` | `filled` | Positions filled |
| `active` | `active` | Is job active |
| `company_id` | `companyId` | Company ID |

### Job Applicants (Odoo → Website)

| Odoo Field | Website Field | Description |
|------------|---------------|-------------|
| `id` | `odooId` | Unique identifier |
| `partner_id` | `candidateId` | Candidate/Partner ID |
| `job_id` | `jobId` | Applied job ID |
| `stage_id` | `status` | Application status |
| `create_date` | `appliedDate` | Application date |
| `description` | `notes` | Application notes |

---

## 🔍 Monitoring & Debugging

### View Sync Logs

```typescript
import syncManager from '@/lib/sync-manager';

const logs = syncManager.getSyncLogs();
console.table(logs);
```

### Check Sync Status

```typescript
import syncManager from '@/lib/sync-manager';

const status = syncManager.getSyncStatus();
console.log({
  isActive: status.isActive,
  lastSyncTime: status.lastSyncTime,
  itemsSynced: status.itemsSynced,
  lastError: status.lastError,
  successCount: status.successCount,
  failureCount: status.failureCount,
});
```

### Listen to Sync Events

```typescript
import syncManager from '@/lib/sync-manager';

syncManager.addEventListener((event) => {
  console.log(`[${event.type}] ${event.message}`);
  
  if (event.progress) {
    console.log(`Progress: ${event.progress}%`);
  }
  
  if (event.data) {
    console.log('Data:', event.data);
  }
});
```

---

## ⚙️ Advanced Configuration

### Custom Sync Configuration

```typescript
import syncManager from '@/lib/sync-manager';

syncManager.updateConfig({
  autoSync: true,
  syncInterval: 10 * 60 * 1000,          // 10 minutes
  conflictResolution: 'odoo_wins',        // Odoo data takes precedence
  retryOnFailure: true,                   // Retry on sync failure
  maxRetries: 3,                          // Max retry attempts
});
```

### Direct RPC Calls

For advanced use cases, you can make direct RPC calls to Odoo:

```typescript
import OdooConnection from '@/lib/odoo-connection';

const config = {
  url: 'https://eigermarvelhr.com',
  database: 'eigermarvel',
  username: 'admin',
  password: 'admin',
  version: 'v18',
};

const connection = new OdooConnection(config);
await connection.authenticate();

// Call any Odoo model method
const result = await connection.rpcCall('hr.job', 'search_read', [], {
  domain: [['active', '=', true]],
  fields: ['id', 'name', 'department_id'],
  limit: 50,
});

console.log(result);
```

---

## 🔐 Security Notes

1. **Credentials**: The `.env` file contains Odoo credentials. **Never commit this to version control**.
2. **HTTPS**: All connections use HTTPS (https://eigermarvelhr.com).
3. **Session Management**: Credentials are only used during authentication; sessions are maintained by Odoo.
4. **Data Privacy**: Only sync necessary fields; configure domain filters as needed.

---

## 🐛 Troubleshooting

### Connection Failed Error

**Symptom**: "Failed to connect to Odoo instance"

**Solutions**:
1. Verify .env variables are correct
2. Check if https://eigermarvelhr.com is accessible
3. Ensure database name is correct: `eigermarvel`
4. Verify admin credentials
5. Check network/firewall settings

### Sync Hangs

**Symptom**: Sync seems stuck at a certain progress

**Solutions**:
1. Check browser console for errors
2. Increase timeout in .env: `VITE_MCP_TIMEOUT=30000`
3. Clear browser cache and reload
4. Restart the development server

### Jobs Not Syncing

**Symptom**: No jobs fetched from Odoo

**Solutions**:
1. Verify jobs exist in Odoo (https://eigermarvelhr.com/web/ir.ui.menu)
2. Check if jobs are marked as "Active"
3. Verify `hr.job` model is accessible
4. Check sync logs for error details

### Too Many Authentication Failures

**Symptom**: Repeated "Authentication failed" errors

**Solutions**:
1. Verify admin credentials in .env
2. Check if admin account is active in Odoo
3. Ensure session isn't locked
4. Try manual login at https://eigermarvelhr.com

---

## 📈 Performance Optimization

### Reduce Sync Interval

For less frequent syncing (reduces server load):

```typescript
syncManager.updateConfig({
  syncInterval: 30 * 60 * 1000, // 30 minutes instead of 5
});
```

### Filter Synced Data

Only sync necessary records:

```typescript
// Sync only active, recent jobs
const jobs = await odooService.fetchJobs({
  domain: [
    ['active', '=', true],
    ['create_date', '>=', '2024-01-01'],
  ],
});
```

### Cache Management

Clear cached data when not needed:

```typescript
import syncManager from '@/lib/sync-manager';

syncManager.clearCache();
```

---

## 📝 Files & Components

### Core Files
- `src/lib/odoo-connection.ts` - Direct Odoo RPC connection
- `src/lib/odoo-service.ts` - High-level Odoo operations
- `src/lib/sync-manager.ts` - Bidirectional sync coordination
- `src/lib/odoo-models.ts` - TypeScript types and interfaces
- `src/lib/odoo-connection-test.ts` - Connection testing utility

### React Components
- `src/components/OdooSyncStatus.tsx` - Sync status dashboard
- `src/hooks/useOdooSync.ts` - Custom hooks for sync operations

### Configuration
- `.env` - Environment variables
- `src/lib/odoo-models.ts` - Field definitions (ODOO_FIELDS, ODOO_MODELS)

---

## 🎯 Next Steps

1. ✅ Verify connection using `testOdooConnection()`
2. ✅ Add `OdooSyncStatus` component to your app
3. ✅ Test manual sync with `performFullSync()`
4. ✅ Verify jobs and applicants are syncing
5. ✅ Integrate sync status into your job listings page
6. ✅ Test job application submission to Odoo
7. ✅ Monitor sync logs and performance

---

## 📞 Support

For issues or questions:

1. Check the browser console for detailed error messages
2. Review sync logs in `OdooSyncStatus` component
3. Test connection with `testOdooConnection()`
4. Check Odoo instance at https://eigermarvelhr.com/web
5. Verify network connectivity and firewall rules

---

**Setup Date**: January 17, 2026  
**Status**: ✅ Ready for Production
