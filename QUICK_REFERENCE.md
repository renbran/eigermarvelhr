# Quick Reference Card - Odoo Integration

## 🎯 At a Glance

| Component | Purpose | Location | Status |
|-----------|---------|----------|--------|
| **Integration Tests** | Verify all systems working | `src/lib/odoo-integration-tests.ts` | ✅ Ready |
| **Candidate Portal** | Job browsing & applications | `src/components/portals/CandidatePortal.tsx` | ✅ Ready |
| **Admin Portal** | HR management & monitoring | `src/components/portals/AdminPortal.tsx` | ✅ Ready |
| **Test Verification UI** | Visual test runner | `src/components/IntegrationTestVerification.tsx` | ✅ Ready |
| **Core Services** | Odoo communication | `src/lib/odoo-service.ts` + `sync-manager.ts` | ✅ Ready |
| **Expanded Services** | CRM, Payroll, TimeOff, etc. | `src/lib/odoo-expanded-services.ts` | ✅ Ready |

---

## 🪝 Essential Hooks

### Core HR Integration
```typescript
// Jobs & Applications
useOdooJobs()              // Get all jobs
useJobApplication()        // Submit application
useJobApplications()       // View my applications

// Monitoring
useSyncStatus()            // Real-time sync status
useSyncLogs()             // Debug logs
```

### CRM Module
```typescript
useCrmLeads()             // Fetch CRM leads
useCreateCrmLead()        // Convert candidate to lead
```

### Payroll Module
```typescript
usePayslips()             // Get payslips
useSalaryStructures()     // View salary structure
useGeneratePayslip()      // Create new payslip
```

### Time Off Module
```typescript
useLeaveRequests()        // View leave requests
useLeaveTypes()           // Get available leave types
useAttendance()           // Check-in/check-out records
useRequestLeave()         // Submit leave request
```

### Performance Module
```typescript
usePerformanceReviews()   // View reviews
useEmployeeGoals()        // Track goals
useSubmitReview()         // Submit review
```

### Projects Module
```typescript
useProjects()             // List projects
useTasks()               // Get tasks
```

---

## 📁 File Structure

```
src/
├── lib/
│   ├── odoo-models.ts              ← Core Odoo types
│   ├── odoo-expanded-models.ts     ← CRM, Payroll, etc. types
│   ├── odoo-service.ts             ← HR operations
│   ├── odoo-expanded-services.ts   ← CRM, Payroll, TimeOff services
│   ├── sync-manager.ts             ← Auto-sync & data mapping
│   └── odoo-integration-tests.ts   ← Test suite
│
├── hooks/
│   ├── useOdooSync.ts              ← Core hooks
│   └── useOdooExpanded.ts          ← CRM, Payroll, etc. hooks
│
└── components/
    ├── OdooDashboard.tsx           ← Sync status display
    ├── IntegrationTestVerification.tsx
    └── portals/
        ├── CandidatePortal.tsx     ← Job browsing & applications
        └── AdminPortal.tsx         ← HR management
```

---

## 🚀 Usage Patterns

### Pattern 1: Fetch Data
```typescript
function MyComponent() {
  const { jobs, loading, error } = useOdooJobs();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return jobs.map(job => <JobCard key={job.odooId} job={job} />);
}
```

### Pattern 2: Submit Data
```typescript
function ApplyForm({ jobId }) {
  const { submit, submitting, error } = useJobApplication();
  
  const handleSubmit = async (data) => {
    await submit({
      candidateName: data.name,
      candidateEmail: data.email,
      candidatePhone: data.phone,
      jobId: jobId,
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Pattern 3: Monitor Status
```typescript
function StatusPanel() {
  const status = useSyncStatus();
  
  return (
    <div>
      Status: {status.isActive ? 'Syncing' : 'Idle'}
      Items: {status.itemsSynced}
      Last: {status.lastSyncTime}
    </div>
  );
}
```

---

## 🧪 Integration Testing

### Run All Tests
```typescript
import integrationTests from '@/lib/odoo-integration-tests';

const results = await integrationTests.runAllTests();
console.table(results);
```

### View Test Results
```typescript
import { IntegrationTestVerification } from '@/components/IntegrationTestVerification';

<IntegrationTestVerification />
```

### Get Summary
```typescript
const summary = integrationTests.getSummary();
// { total: 6, passed: 6, failed: 0, warnings: 0, successRate: '100%' }
```

---

## 🔧 Configuration

### Sync Settings
```typescript
import syncManager from '@/lib/sync-manager';

syncManager.updateConfig({
  autoSync: true,
  syncInterval: 300000,        // 5 minutes
  conflictResolution: 'odoo_wins',
});

syncManager.startAutoSync();
syncManager.stopAutoSync();
```

### Manual Sync
```typescript
import syncManager from '@/lib/sync-manager';

await syncManager.performFullSync();
```

---

## 📊 Data Models

### Job (hr.job)
```typescript
{
  odooId: number
  title: string
  department: string
  description: string
  position: number      // Total positions
  filled: number        // Filled positions
}
```

### Application (hr.applicant)
```typescript
{
  odooId: number
  candidateId: number
  jobId: number
  status: 'submitted' | 'screening' | 'interview' | 'offered' | 'hired'
  appliedDate: string
}
```

### Lead (crm.lead)
```typescript
{
  id: number
  name: string
  email_from: string
  phone: string
  stage_id: [number, string]
  probability: number
}
```

### Payslip (hr.payslip)
```typescript
{
  id: number
  employee_id: [number, string]
  date_from: string
  date_to: string
  gross_salary: number
  net_salary: number
  state: string
}
```

---

## 🎯 Common Tasks

### Display Job List
```typescript
<CandidatePortal />  // Complete portal with jobs & applications
```

### Submit Job Application
```typescript
const { submit } = useJobApplication();
await submit({
  candidateName: 'John Doe',
  candidateEmail: 'john@example.com',
  candidatePhone: '+1234567890',
  jobId: 123,
});
```

### View Employee Payslips
```typescript
const { payslips } = usePayslips(employeeId);
payslips.forEach(p => console.log(`${p.date_from}: $${p.net_salary}`));
```

### Request Time Off
```typescript
const { request } = useRequestLeave();
await request({
  employee_id: 456,
  leave_type_id: 1,
  date_from: '2024-02-01',
  date_to: '2024-02-05',
});
```

### Submit Performance Review
```typescript
const { submit } = useSubmitReview();
await submit({
  employee_id: 789,
  reviewer_id: 1,
  rating: 4,
  summary: 'Great work this period',
});
```

---

## 🐛 Debugging

### Check Sync Logs
```typescript
import { useSyncLogs } from '@/hooks/useOdooSync';

const logs = useSyncLogs();
console.table(logs);
```

### Monitor Real-Time Status
```typescript
import { useSyncStatus } from '@/hooks/useOdooSync';

const status = useSyncStatus();
if (status.lastError) console.error(status.lastError);
```

### Export Test Results
```typescript
import integrationTests from '@/lib/odoo-integration-tests';

const json = integrationTests.exportResults();
// Save to file or send to server
```

---

## ⚡ Performance Tips

1. **Use local data first** - Data is cached in localStorage
2. **Adjust sync interval** - Set to match your needs
3. **Limit queries** - Use filters in fetch methods
4. **Pagination** - Implement for large datasets
5. **Lazy loading** - Load data when needed

---

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| `ODOO_INTEGRATION.md` | Complete technical reference |
| `INTEGRATION_TESTING_GUIDE.md` | Testing procedures |
| `IMPLEMENTATION_COMPLETE.md` | Feature overview |
| `ODOO_SETUP_COMPLETE.md` | Quick start guide |

---

## 🔗 Module Status

| Module | Status | Hooks Count | Services |
|--------|--------|-------------|----------|
| HR (Jobs, Applicants) | ✅ | 5 | odooService, syncManager |
| CRM | ✅ | 2 | crmService |
| Payroll | ✅ | 3 | payrollService |
| Time Off | ✅ | 4 | timeOffService |
| Performance | ✅ | 3 | performanceService |
| Projects | ✅ | 2 | projectsService |

---

## 🎓 Learning Path

1. **Start** → Read `ODOO_SETUP_COMPLETE.md`
2. **Understand** → Review `ODOO_INTEGRATION.md`
3. **Test** → Run `IntegrationTestVerification`
4. **Implement** → Add portals to app
5. **Extend** → Use expanded hooks for other modules
6. **Deploy** → Monitor with `OdooDashboard`

---

## ✅ Pre-Launch Checklist

- [ ] All 6 tests passing
- [ ] MCP server running
- [ ] Candidate portal responsive
- [ ] Admin portal accessible
- [ ] Test logs exporting
- [ ] No console errors
- [ ] Mobile tested
- [ ] Data syncing every 5 min

---

**Ready to Launch! 🚀**

Questions? Check the comprehensive documentation files.
