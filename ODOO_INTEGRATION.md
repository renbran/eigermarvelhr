# Odoo Integration Guide - Eiger Marvel HR Platform

## Overview

This document explains how the Eiger Marvel HR website integrates with the Odoo database (eigermarvelhr instance) through the Odoo MCP Server for real-time data synchronization.

## Architecture

```
┌─────────────────────────────────┐
│   React Website (Frontend)      │
│   - Job Listings                │
│   - Candidate Dashboard         │
│   - Job Applications            │
└──────────────┬──────────────────┘
               │
               │ HTTP/RPC Calls
               │
┌──────────────▼──────────────────┐
│    Odoo MCP Server              │
│  (d:/01_WORK_PROJECTS/          │
│   odoo-mcp-server/dist/index.js)│
└──────────────┬──────────────────┘
               │
               │ RPC Calls
               │
┌──────────────▼──────────────────┐
│  Odoo v18 Database              │
│  (eigermarvelhr)                │
│  - HR Module                    │
│  - Jobs                         │
│  - Job Applicants               │
│  - Employees                    │
│  - Departments                  │
└─────────────────────────────────┘
```

## Connection Configuration

The MCP configuration is in your `mcp.json`:

```json
{
  "odoo/database-instances": {
    "type": "stdio",
    "command": "node",
    "args": ["d:/01_WORK_PROJECTS/odoo-mcp-server/dist/index.js"],
    "env": {
      "ODOO_INSTANCES": "{...eigermarvelhr config...}"
    }
  }
}
```

**Eigermarvelhr Instance Details:**
- URL: `https://eigermarvelhr.com`
- Database: `eigermarvel`
- Username: `admin`
- Version: `v18`
- Provider: `CloudPepper`
- IP: `65.20.72.53`

## File Structure

### Core Integration Files

1. **`src/lib/odoo-models.ts`**
   - TypeScript interfaces for all Odoo models
   - HR module models: Employee, Job, JobApplicant, Department, Company
   - Website-specific models: CandidateProfile, JobListing, JobApplication
   - Field mappings and sync configuration

2. **`src/lib/odoo-service.ts`**
   - Direct communication with Odoo MCP server
   - Methods for CRUD operations on Odoo models
   - RPC call handling
   - Error handling and logging

3. **`src/lib/sync-manager.ts`**
   - Manages bidirectional sync between website and Odoo
   - Auto-sync configuration with configurable intervals
   - Data mapping and transformation
   - Conflict resolution
   - Local caching in localStorage

4. **`src/hooks/useOdooSync.ts`**
   - React hooks for component integration
   - `useSyncStatus()` - Monitor sync status
   - `useOdooJobs()` - Fetch jobs from Odoo
   - `useJobApplication()` - Submit job applications
   - `useOdooSync()` - Manage sync lifecycle
   - `useSyncLogs()` - Access debug logs

5. **`src/components/OdooDashboard.tsx`**
   - React component to display sync status
   - Manual sync trigger button
   - Connection status and error display
   - Configuration information

## Odoo Models & Fields

### HR Module Models

#### Job (hr.job)
```typescript
id: number
name: string                          // Job title
department_id: [number, string]       // Department
user_id: [number, string]             // Hiring manager
description: string                   // Job description
expected_employees: number            // Positions available
no_of_hired_employee: number          // Filled positions
company_id: [number, string]          // Company
no_of_recruitment: number             // Recruitment count
active: boolean
create_date: string
write_date: string
```

#### Job Applicant (hr.applicant)
```typescript
id: number
name: string                          // Applicant name
email_from: string                    // Email
phone: string
job_id: [number, string]              // Applied job
partner_id: [number, string]          // Contact
stage_id: [number, string]            // Application stage
user_id: [number, string]             // Assigned user
company_id: [number, string]
active: boolean
create_date: string
write_date: string
source: string                        // Application source (website)
description: string                   // Cover letter/notes
```

#### Employee (hr.employee)
```typescript
id: number
name: string
email: string
phone: string
department_id: [number, string]
job_title: string
user_id: [number, string]
active: boolean
company_id: [number, string]
resource_id: [number, string]
```

#### Department (hr.department)
```typescript
id: number
name: string
company_id: [number, string]
parent_id: [number, string] | false
complete_name: string
manager_id: [number, string] | false
active: boolean
```

#### Company (res.company)
```typescript
id: number
name: string
street: string
city: string
state_id: [number, string] | false
country_id: [number, string]
zip: string
phone: string
email: string
website: string
logo: string
currency_id: [number, string]
```

## Usage Examples

### Initialize Sync on App Load

```typescript
// In your main App.tsx
import { useOdooSync } from '@/hooks/useOdooSync';

export function App() {
  const { performSync } = useOdooSync(true); // Auto-initialize

  return (
    <div>
      {/* Your app components */}
      <OdooDashboard /> {/* Shows sync status */}
    </div>
  );
}
```

### Display Jobs from Odoo

```typescript
import { useOdooJobs } from '@/hooks/useOdooSync';

function JobsList() {
  const { jobs, loading, error } = useOdooJobs();

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {jobs.map((job) => (
        <div key={job.odooId}>
          <h3>{job.title}</h3>
          <p>{job.department}</p>
          <p>Positions: {job.position - job.filled} available</p>
        </div>
      ))}
    </div>
  );
}
```

### Submit Job Application

```typescript
import { useJobApplication } from '@/hooks/useOdooSync';

function JobApplicationForm({ jobId }) {
  const { submit, submitting, error, success } = useJobApplication();

  const handleSubmit = async (formData) => {
    try {
      const applicantId = await submit({
        candidateName: formData.name,
        candidateEmail: formData.email,
        candidatePhone: formData.phone,
        jobId: jobId,
        message: formData.message,
      });
      console.log('Application submitted:', applicantId);
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Apply'}
      </button>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Application submitted!</div>}
    </form>
  );
}
```

### Monitor Sync Status

```typescript
import { useSyncStatus } from '@/hooks/useOdooSync';

function SyncMonitor() {
  const status = useSyncStatus();

  return (
    <div>
      <p>Status: {status.isActive ? 'Syncing' : 'Idle'}</p>
      <p>Items Synced: {status.itemsSynced}</p>
      <p>Last Sync: {status.lastSyncTime}</p>
      {status.lastError && <p className="error">{status.lastError}</p>}
    </div>
  );
}
```

## Sync Configuration

### Default Configuration

```typescript
const config: SyncConfig = {
  autoSync: true,           // Automatically sync data
  syncInterval: 300000,     // Every 5 minutes
  conflictResolution: 'odoo_wins', // Odoo takes precedence on conflicts
};
```

### Customize Sync Behavior

```typescript
import syncManager from '@/lib/sync-manager';

// Update configuration
syncManager.updateConfig({
  autoSync: true,
  syncInterval: 60000, // Sync every minute
  conflictResolution: 'manual',
});

// Manual sync control
syncManager.startAutoSync();
syncManager.stopAutoSync();

// Perform immediate sync
await syncManager.performFullSync();

// Clear cache
syncManager.clearCache();
```

## Data Flow

### Pulling Data from Odoo

```
App Initialize
    ↓
useOdooSync(true)
    ↓
syncManager.initialize()
    ↓
odooService.initConnection()
    ↓
startAutoSync() (every 5 minutes)
    ↓
performFullSync()
    ↓
odooService.syncFromOdoo()
    ├── fetchJobs()
    ├── fetchJobApplicants()
    ├── fetchDepartments()
    └── fetchCompany()
    ↓
Map Odoo data to website format
    ↓
Store in localStorage
    ↓
Components access via useOdooJobs(), useJobApplications()
```

### Pushing Data to Odoo

```
User submits job application
    ↓
useJobApplication().submit()
    ↓
syncManager.submitJobApplication()
    ↓
odooService.createJobApplicant()
    ↓
MCP Server RPC Call
    ↓
Create hr.applicant in Odoo
    ↓
Return applicant ID
    ↓
Update UI / Show success message
```

## Error Handling & Troubleshooting

### Common Issues

#### 1. MCP Server Not Running
**Error:** "Failed to connect to Odoo"

**Solution:**
- Verify the MCP server is running: `node d:/01_WORK_PROJECTS/odoo-mcp-server/dist/index.js`
- Check `mcp.json` configuration
- Ensure ODOO_INSTANCES environment variable is set correctly

#### 2. Sync Failures
**Error:** Sync logs show "failed" status

**Solution:**
- Check `useSyncLogs()` hook for detailed error messages
- Verify Odoo instance credentials in `mcp.json`
- Check network connectivity to Odoo instance
- Review browser console for errors

#### 3. Data Not Syncing
**Problem:** Jobs or applicants not appearing in the website

**Solution:**
- Check localStorage with browser DevTools
- Verify sync is running with `useSyncStatus()`
- Manually trigger sync with `OdooDashboard` component
- Check if data exists in Odoo

### Debug Mode

```typescript
import syncManager from '@/lib/sync-manager';

// Get sync logs
const logs = syncManager.getSyncLogs();
console.table(logs);

// Get sync status
const status = syncManager.getSyncStatus();
console.log(status);

// Clear logs
syncManager.clearSyncLogs();
```

## Security Considerations

1. **API Keys**: Never commit credentials to Git
   - Store in `mcp.json` (local, not in repo)
   - Use environment variables for deployment

2. **Data Validation**:
   - All Odoo data is typed with TypeScript interfaces
   - Validate data before storing/using

3. **Error Handling**:
   - Errors are caught and logged
   - Sensitive data is not exposed in error messages

4. **CORS**: Ensure proper CORS configuration on Odoo instance

## Performance Optimization

1. **Caching**: Data is cached in localStorage between syncs
2. **Batch Operations**: Sync fetches multiple models in parallel
3. **Interval Control**: Adjust `syncInterval` based on your needs
4. **Pagination**: OdooService limits results to 100-500 records

## Next Steps

1. ✅ **Verify MCP Connection**: Test the Odoo MCP server connection
2. **Integrate Components**: Add `OdooDashboard` to your main layout
3. **Update Job Pages**: Use `useOdooJobs()` in JobsPage component
4. **Update Job Cards**: Map Odoo data to JobCard component
5. **Test Submissions**: Test job applications through the form
6. **Monitor Logs**: Use sync logs to verify data flow
7. **Optimize Sync**: Adjust sync interval based on your needs

## API Reference

### OdooService Methods

```typescript
initConnection(): Promise<boolean>
fetchJobs(filters?): Promise<OdooJob[]>
fetchJobApplicants(filters?): Promise<OdooJobApplicant[]>
fetchEmployees(filters?): Promise<OdooEmployee[]>
fetchDepartments(): Promise<OdooDepartment[]>
fetchCompany(): Promise<OdooCompany | null>
createJobApplicant(data): Promise<number>
updateJobApplicant(id, data): Promise<boolean>
getSyncLogs(): SyncLog[]
```

### SyncManager Methods

```typescript
initialize(): Promise<void>
startAutoSync(): void
stopAutoSync(): void
performFullSync(): Promise<void>
submitJobApplication(data): Promise<number>
getLocalData<T>(key): T | null
getSyncStatus(): SyncStatus
updateConfig(config): void
clearCache(): void
destroy(): void
```

### Hooks

```typescript
useSyncStatus()
useOdooJobs()
useJobApplication()
useOdooSync(autoStart?)
useJobApplications()
useSyncLogs()
```

## Support & Documentation

- Odoo Documentation: https://www.odoo.com/documentation
- Odoo HR Module: https://www.odoo.com/app/hr
- MCP Server Repo: d:/01_WORK_PROJECTS/odoo-mcp-server

---

**Last Updated:** January 2026
**Status:** Production Ready
