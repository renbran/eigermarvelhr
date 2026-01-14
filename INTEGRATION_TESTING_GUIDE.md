# Complete Integration & Testing Guide

## 📋 Overview

This document provides comprehensive instructions for:
1. **Testing the Odoo MCP Integration**
2. **Setting up User Portals** (Candidate & Admin)
3. **Integrating All Available Odoo Modules**
4. **Monitoring & Troubleshooting**

---

## 🧪 Part 1: Integration Testing

### Test Suite Components

The integration test suite (`src/lib/odoo-integration-tests.ts`) performs 6 critical tests:

#### Test 1: MCP Connection
- **Purpose:** Verify Odoo MCP server is accessible
- **Validates:** Network connectivity to MCP server
- **Success:** Can establish connection to eigermarvelhr instance
- **Failure Handling:** Check if MCP server is running at `d:/01_WORK_PROJECTS/odoo-mcp-server/dist/index.js`

#### Test 2: Odoo Models Availability
- **Purpose:** Verify all required Odoo models are accessible
- **Models Checked:**
  - `hr.job` - Job listings
  - `hr.applicant` - Job applicants
  - `hr.employee` - Employees
  - `hr.department` - Departments
  - `res.company` - Company info
- **Success:** All 5 models available
- **Warning:** If some models missing, non-critical functionality may be unavailable

#### Test 3: Data Fetching
- **Purpose:** Verify data can be retrieved from Odoo
- **Data Fetched:**
  - Jobs from hr.job
  - Applicants from hr.applicant
  - Employees from hr.employee
  - Departments from hr.department
- **Success Criteria:** Successfully fetch records from all models
- **Warning:** No records fetched but connection works

#### Test 4: Sync Manager
- **Purpose:** Verify sync system initialization and functionality
- **Checks:**
  - Sync manager initializes without errors
  - Auto-sync mechanism is functional
  - Status tracking is working
- **Success:** Sync manager ready and auto-sync active

#### Test 5: Data Mapping
- **Purpose:** Verify Odoo data maps correctly to website format
- **Mapping:**
  - Odoo Job → JobListing
  - Odoo JobApplicant → JobApplication
  - Odoo Employee → CandidateProfile
- **Success:** All data transformations work correctly

#### Test 6: Portal Readiness
- **Purpose:** Verify all portal components are available
- **Checks:**
  - React hooks present
  - Portal components ready
  - UI infrastructure complete

### Running Integration Tests

#### Option 1: Via Component
```typescript
import { IntegrationTestVerification } from '@/components/IntegrationTestVerification';

export function TestPage() {
  return <IntegrationTestVerification />;
}
```

#### Option 2: Programmatically
```typescript
import integrationTests from '@/lib/odoo-integration-tests';

const results = await integrationTests.runAllTests();
console.table(results);

// Get summary
const summary = integrationTests.getSummary();
console.log(`Tests: ${summary.total}, Passed: ${summary.passed}, Failed: ${summary.failed}`);

// Export results
const jsonResults = integrationTests.exportResults();
```

### Test Results Interpretation

**Passed Tests (✅)**
- Green indicator
- Feature working correctly
- No action needed

**Failed Tests (❌)**
- Red indicator
- Feature not working
- **Action Required:** Check error message and troubleshoot

**Warning Tests (⚠️)**
- Yellow indicator
- Feature partially working
- **Action:** Monitor and verify functionality

---

## 👥 Part 2: User Portals

### Candidate Portal

**Location:** `src/components/portals/CandidatePortal.tsx`

**Features:**

#### 1. Browse Jobs Tab
- Display all active job listings from Odoo
- Search and filter functionality
- View job details in modal
- Real-time availability status

**Usage:**
```typescript
import { CandidatePortal } from '@/components/portals/CandidatePortal';

export function CandidatesPage() {
  return <CandidatePortal />;
}
```

#### 2. My Applications Tab
- View all submitted applications
- Track application status:
  - Draft
  - Submitted
  - Screening
  - Interview
  - Offered
  - Rejected
  - Hired
- See application dates and notes
- Real-time status updates

#### 3. Saved Jobs Tab
- Save jobs for later
- Quick access to saved positions
- Apply from saved list

**Application Flow:**
1. Browse available jobs
2. Click "View Details"
3. Fill application form:
   - Name
   - Email
   - Phone
   - Cover message
4. Submit to Odoo
5. Track in "My Applications"

**Data Integration:**
- Uses `useOdooJobs()` hook to fetch jobs
- Uses `useJobApplications()` to track applications
- Uses `useJobApplication()` to submit new applications

---

### Admin Portal

**Location:** `src/components/portals/AdminPortal.tsx`

**Features:**

#### 1. Dashboard Tab
- System status overview
- Sync health monitoring
- Connection status
- Recent activity log

**Module Status Cards:**
- **HR Module** - Jobs, Employees, Departments (✅ Connected)
- **CRM Module** - Leads, Opportunities (✅ Connected)
- **Payroll Module** - Salaries, Payslips (✅ Connected)
- **Time Off Module** - Leave, Attendance (✅ Connected)

#### 2. Jobs Management Tab
- Create new job postings
- Edit existing jobs
- View job statistics
- Manage open positions

#### 3. Applicants Tab
- View all job applications
- Review applicant details
- Change application status
- Bulk operations

**Application Statistics:**
- New applications count
- Pending reviews
- Shortlisted candidates
- Rejected applicants

#### 4. Integration Testing Tab
- Run full integration test suite
- View test results in real-time
- Check each module's status
- Export test results

#### 5. Settings Tab
- Odoo instance configuration
- Database information
- Sync interval settings
- Module preferences

---

## 🔗 Part 3: Odoo Module Integrations

### Available Modules

#### 1. HR Module (Core) ✅
**Already Integrated**
- hr.job - Job listings
- hr.applicant - Job applicants
- hr.employee - Employee records
- hr.department - Department structure
- hr.position - Job positions
- hr.job.title - Job titles

#### 2. CRM Module 🔄
**Available Integration:**
```typescript
import { crmService } from '@/lib/odoo-expanded-services';

// Fetch leads
const leads = await crmService.fetchLeads();

// Create lead from candidate
const leadId = await crmService.createLead({
  name: 'John Doe',
  email_from: 'john@example.com',
  phone: '+1234567890',
});
```

**Use Cases:**
- Convert candidates to CRM leads
- Track lead pipeline
- Integration with sales team
- Prospect management

#### 3. Payroll Module 💰
**Available Integration:**
```typescript
import { payrollService } from '@/lib/odoo-expanded-services';

// Fetch payslips for employee
const payslips = await payrollService.fetchPayslips(employeeId);

// Get salary structure
const salaryStructure = await payrollService.fetchSalaryStructures(employeeId);

// Generate payslip
const payslipId = await payrollService.generatePayslip(
  employeeId,
  '2024-01-01',
  '2024-01-31'
);
```

**Use Cases:**
- Employee compensation tracking
- Payslip generation
- Salary structure management
- Payroll reporting

#### 4. Time Off Module 📅
**Available Integration:**
```typescript
import { timeOffService } from '@/lib/odoo-expanded-services';

// Fetch leave requests
const leaves = await timeOffService.fetchLeaveRequests(employeeId);

// Get available leave types
const leaveTypes = await timeOffService.fetchLeaveTypes();

// Fetch attendance records
const attendance = await timeOffService.fetchAttendance(employeeId);

// Request leave
const requestId = await timeOffService.requestLeave({
  employee_id: employeeId,
  leave_type_id: leaveTypeId,
  date_from: '2024-02-01',
  date_to: '2024-02-05',
});
```

**Use Cases:**
- Leave management
- Attendance tracking
- Absence management
- Work schedule coordination

#### 5. Performance & Goals Module 🎯
**Available Integration:**
```typescript
import { performanceService } from '@/lib/odoo-expanded-services';

// Fetch performance reviews
const reviews = await performanceService.fetchPerformanceReviews(employeeId);

// Get employee goals
const goals = await performanceService.fetchGoals(employeeId);

// Submit review
const reviewId = await performanceService.submitReview({
  employee_id: employeeId,
  reviewer_id: reviewerId,
  rating: 4,
  summary: 'Excellent performance this period',
});
```

**Use Cases:**
- Performance appraisals
- Goal tracking
- Feedback management
- Career development

#### 6. Projects Module 📊
**Available Integration:**
```typescript
import { projectsService } from '@/lib/odoo-expanded-services';

// Fetch projects
const projects = await projectsService.fetchProjects();

// Get project tasks
const tasks = await projectsService.fetchTasks(projectId);

// Assign tasks to employees
// (Extends HR with project management)
```

**Use Cases:**
- Team project assignments
- Task management
- Team collaboration
- Project-based recruiting

---

## 🔧 Integration Implementation Checklist

### Setup Phase
- [ ] Verify Odoo MCP server running
- [ ] Check mcp.json configuration
- [ ] Test initial connection
- [ ] Run integration test suite

### Core Integration
- [ ] Deploy OdooService
- [ ] Deploy SyncManager
- [ ] Create sync hooks
- [ ] Implement localStorage caching

### Portal Implementation
- [ ] Create CandidatePortal component
- [ ] Create AdminPortal component
- [ ] Connect to hooks
- [ ] Style responsive UI

### Module Integration
- [ ] Integrate CRM module
- [ ] Integrate Payroll module
- [ ] Integrate Time Off module
- [ ] Integrate Performance module
- [ ] Integrate Projects module

### Testing & Validation
- [ ] Run integration tests
- [ ] Test candidate portal workflow
- [ ] Test admin portal features
- [ ] Monitor sync logs
- [ ] Verify all data flows

### Deployment
- [ ] Build production bundle
- [ ] Test in staging
- [ ] Deploy to production
- [ ] Monitor sync health

---

## 📊 Monitoring & Logs

### Sync Status
```typescript
import { useSyncStatus } from '@/hooks/useOdooSync';

function MonitorSync() {
  const status = useSyncStatus();
  
  return (
    <div>
      <p>Status: {status.isActive ? 'Syncing' : 'Idle'}</p>
      <p>Items: {status.itemsSynced}</p>
      <p>Last Sync: {status.lastSyncTime}</p>
      <p>Errors: {status.lastError}</p>
    </div>
  );
}
```

### Debug Logs
```typescript
import { useSyncLogs } from '@/hooks/useOdooSync';

function DebugPanel() {
  const logs = useSyncLogs();
  
  return (
    <pre>
      {JSON.stringify(logs, null, 2)}
    </pre>
  );
}
```

---

## 🚨 Troubleshooting

### Common Issues

**Issue: MCP Connection Failed**
```
Error: Failed to connect to Odoo MCP server
```

**Solution:**
1. Verify MCP server running: `node d:/01_WORK_PROJECTS/odoo-mcp-server/dist/index.js`
2. Check ODOO_INSTANCES environment variable in mcp.json
3. Verify network connectivity to Odoo instance
4. Check mcp.json syntax

**Issue: No Data Fetched**
```
Warning: No records fetched from Odoo
```

**Solution:**
1. Verify data exists in Odoo database
2. Check filters in query
3. Verify user permissions
4. Check authentication credentials

**Issue: Sync Failures**
```
Error: Sync failed - Connection timeout
```

**Solution:**
1. Check internet connectivity
2. Verify Odoo instance availability
3. Check sync logs for details
4. Restart MCP server

---

## 📈 Performance Optimization

### Sync Configuration
```typescript
import syncManager from '@/lib/sync-manager';

// Optimize for your use case
syncManager.updateConfig({
  syncInterval: 60000,     // Sync every minute (instead of 5)
  autoSync: true,          // Automatic syncing
  conflictResolution: 'odoo_wins', // Odoo is source of truth
});
```

### Data Caching
- Browser localStorage caches data between syncs
- Reduces API calls
- Improves UI responsiveness
- Auto-clears on logout

### Pagination
- Jobs: Limited to 100 per query
- Applicants: Limited to 500 per query
- Add pagination UI for large datasets

---

## 📚 API Reference

### OdooService
```typescript
initConnection(): Promise<boolean>
fetchJobs(filters?): Promise<OdooJob[]>
fetchJobApplicants(filters?): Promise<OdooJobApplicant[]>
fetchEmployees(filters?): Promise<OdooEmployee[]>
fetchDepartments(): Promise<OdooDepartment[]>
createJobApplicant(data): Promise<number>
```

### SyncManager
```typescript
initialize(): Promise<void>
startAutoSync(): void
stopAutoSync(): void
performFullSync(): Promise<void>
submitJobApplication(data): Promise<number>
getSyncStatus(): SyncStatus
```

### Services
```typescript
// CRM
crmService.fetchLeads()
crmService.createLead(data)

// Payroll
payrollService.fetchPayslips(employeeId?)
payrollService.generatePayslip(id, from, to)

// Time Off
timeOffService.fetchLeaveRequests(employeeId?)
timeOffService.requestLeave(data)

// Performance
performanceService.fetchPerformanceReviews(employeeId?)
performanceService.submitReview(data)

// Projects
projectsService.fetchProjects()
projectsService.fetchTasks(projectId?)
```

---

## ✅ Success Criteria

Your integration is successful when:

1. ✅ All integration tests pass
2. ✅ MCP connection stable
3. ✅ Data syncing every 5 minutes
4. ✅ Candidate portal fully functional
5. ✅ Admin portal showing live data
6. ✅ Job applications submitted to Odoo
7. ✅ No console errors
8. ✅ All modules responding

---

**Status:** Production Ready
**Last Updated:** January 14, 2026
**Version:** 1.0
