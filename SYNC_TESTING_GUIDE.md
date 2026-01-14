# Sync Testing Guide
**Eiger Marvel HR Platform - Website ↔ Odoo Database Synchronization**

---

## 🎯 Overview

This guide walks you through testing the bidirectional synchronization between your website and the Odoo database. You'll verify that:
- ✅ Website data syncs to Odoo
- ✅ Odoo data syncs to website
- ✅ Changes are reflected in real-time
- ✅ Error handling works correctly

---

## 📋 Prerequisites

Before testing, ensure:
- ✅ Website is deployed (`npm run dev` or deployment active)
- ✅ Odoo instance is running (https://eigermarvelhr.com)
- ✅ MCP server is active (started with VS Code)
- ✅ All pre-deployment checks passed

---

## 🧪 Test Suite: Automated Sync Verification

### Step 1: Run Sync Tests

```bash
node test-sync.js
```

**Expected Output:**
```
🧪 DATABASE SYNC TEST SUITE
============================================================

🔌 TEST 1: Odoo Database Connection
✅ Odoo instance is accessible
   Status: 303 (See Other)
   URL: https://eigermarvelhr.com

🔌 TEST 2: MCP Server Connection
⚠️  MCP Server (may be in VS Code)
   Note: MCP runs in VS Code for this project

📦 TEST 3: Sync Manager Availability
✅ initializeSync - Present
✅ startAutoSync - Present
✅ syncOdooData - Present
✅ getLocalData - Present
✅ Sync Manager is properly configured

📊 TEST 4: Data Models and Types
✅ OdooJob - Defined
✅ OdooJobApplicant - Defined
✅ OdooEmployee - Defined
✅ OdooDepartment - Defined

💾 TEST 5: Cache System (localStorage)
✅ Cache system is configured
   Type: localStorage (browser-based)
   Sync interval: 5 minutes

🔍 TEST 6: Error Tracking System
✅ Error tracking system is available
   Captures: Errors, warnings, performance metrics

🧪 TEST 7: Integration Tests
✅ Found 6 integration tests

🔄 TEST 8: Bidirectional Sync Readiness
✅ Bidirectional sync is configured
   Website → Odoo: Creating/updating records
   Odoo → Website: Fetching/displaying records

📊 TEST SUMMARY
============================================================
Results: 8 passed, 0 failed, 0 warnings

✅ ALL SYNC TESTS PASSED
Your website and database are ready to sync!
```

**What This Tests:**
1. Odoo connectivity (HTTPS)
2. MCP server availability
3. Sync manager functions
4. Data models defined
5. Cache system operational
6. Error tracking active
7. Integration tests ready
8. Bidirectional sync configured

---

## 📊 Monitor Sync in Real-Time

### Open Sync Monitor Dashboard

1. **In your browser, navigate to:**
   ```
   http://localhost:3000/sync-monitor
   ```

2. **Dashboard shows:**
   - Success rate (%)
   - Records synced to Odoo
   - Records synced from Odoo
   - Pending syncs
   - Real-time sync events log
   - Manual sync trigger
   - Auto-sync toggle

3. **Key features:**
   - ✅ Success rate tracking
   - ✅ Bidirectional sync visual
   - ✅ Live event log
   - ✅ Manual sync button
   - ✅ Auto-sync control

---

## 🔄 Manual Sync Test: Website → Odoo

### Scenario: Create a Job Application

**Step 1: Add a Test Job to Website**
```
1. Go to http://localhost:3000/jobs
2. Click "Browse Jobs"
3. Select any job
4. Click "Apply Now"
5. Fill form:
   - Name: "Test Applicant"
   - Email: "test@example.com"
   - Phone: "+1234567890"
   - Cover Letter: "Testing sync"
6. Click "Submit Application"
```

**Step 2: Watch Sync Monitor**
- Dashboard shows: "Synced 1 record to Odoo"
- Event log displays: "Application submitted and synced"
- Records synced counter increments

**Step 3: Verify in Odoo**
```
1. Login to Odoo (https://eigermarvelhr.com)
2. Navigate to HR → Applicants
3. Look for "Test Applicant"
4. Verify details match website form
```

**Expected Results:**
- ✅ Application appears in Odoo
- ✅ Data matches exactly
- ✅ Timestamp recorded
- ✅ Sync log shows success

---

## 🔄 Manual Sync Test: Odoo → Website

### Scenario: Create a Job in Odoo

**Step 1: Add a Test Job to Odoo**
```
1. Login to Odoo (https://eigermarvelhr.com)
2. Navigate to HR → Recruitment → Jobs
3. Click "Create"
4. Fill form:
   - Job Title: "Test Position - Sync Test"
   - Department: Sales
   - Location: Remote
   - Description: "Testing bidirectional sync"
5. Click "Save"
```

**Step 2: Wait for Auto-Sync (5 minutes)**
Or manually trigger:
```
In Sync Monitor dashboard:
- Click "Sync Now" button
- Watch event log for completion
```

**Step 3: Verify on Website**
```
1. Go to http://localhost:3000/jobs
2. Look for "Test Position - Sync Test"
3. Verify all details appear
```

**Expected Results:**
- ✅ Job appears on website
- ✅ All details displayed
- ✅ Sync Monitor shows "Synced from Odoo"
- ✅ Records count increments

---

## 🔄 Bidirectional Sync Test: Update Job

### Scenario: Modify Job in Odoo → Verify on Website

**Step 1: Update Job in Odoo**
```
1. In Odoo, open the test job
2. Change description
3. Update salary range
4. Click "Save"
```

**Step 2: Trigger Sync**
```
In Sync Monitor:
- Click "Sync Now"
- Watch status change to "completed"
- Check event log for confirmation
```

**Step 3: Verify on Website**
```
1. Refresh job page
2. Verify changes appear
3. Check all updated fields
```

**Expected Results:**
- ✅ Changes appear on website
- ✅ No duplicate records
- ✅ Sync status shows success
- ✅ Timestamp updated

---

## 💾 Cache Testing

### Verify Local Cache Works

**Step 1: Test Offline Cache**
```
1. Open Sync Monitor
2. Note current record count
3. Simulate offline: Open DevTools → Network → Offline
4. Click "Sync Now"
5. See cache provides data (no live sync)
```

**Step 2: Test Cache Persistence**
```
1. Refresh browser (F5)
2. Data should still appear (from cache)
3. Try navigating to different pages
4. Cache persists across navigation
```

**Expected Results:**
- ✅ Cache works without network
- ✅ Data persists on refresh
- ✅ Graceful degradation
- ✅ Errors handled properly

---

## ⚠️ Error Handling Test

### Simulate Connection Issues

**Step 1: Break Odoo Connection**
```
1. Stop Odoo instance (simulate outage)
2. Try sync in dashboard: Click "Sync Now"
3. Watch error handling
```

**Step 2: Check Error Log**
```
1. Error Tracking shows:
   - Connection timeout
   - Error severity
   - Timestamp
   - Retry logic
```

**Step 3: Restore Connection**
```
1. Restart Odoo
2. Auto-sync should recover
3. Data should catch up
```

**Expected Results:**
- ✅ Errors caught and logged
- ✅ User sees friendly message
- ✅ Automatic retry works
- ✅ No data loss

---

## 📈 Performance Testing

### Monitor Sync Speed

**In Sync Monitor Dashboard:**
- Watch "Avg Time" metric
- Expected: 500-2000ms per sync
- Alert if > 5000ms

**Optimize if Slow:**
```
1. Check network speed
2. Verify Odoo responsiveness
3. Check database load
4. Review error tracking logs
```

---

## ✅ Complete Sync Checklist

### Auto-Sync Verification
- [ ] Auto-sync interval is 5 minutes
- [ ] Syncs run without manual intervention
- [ ] Sync Monitor shows active syncs
- [ ] Event log records all syncs
- [ ] Success rate > 90%

### Website → Odoo Sync
- [ ] Can create job application
- [ ] Application appears in Odoo
- [ ] Data matches exactly
- [ ] Timestamps correct
- [ ] No duplicate records

### Odoo → Website Sync
- [ ] Can create job in Odoo
- [ ] Job appears on website
- [ ] All details display correctly
- [ ] Images sync properly
- [ ] Updates reflect quickly

### Bidirectional Sync
- [ ] Updates in Odoo appear on website
- [ ] Updates on website appear in Odoo
- [ ] No data corruption
- [ ] Conflict resolution works
- [ ] Proper versioning maintained

### Error Handling
- [ ] Errors logged properly
- [ ] User-friendly error messages
- [ ] Automatic retry on failure
- [ ] No silent failures
- [ ] Error tracking captures all issues

### Performance
- [ ] Sync completes in < 2 seconds
- [ ] No memory leaks
- [ ] No duplicate syncs
- [ ] Database queries optimized
- [ ] Network usage reasonable

### Cache System
- [ ] Local cache stores data
- [ ] Cache persists on refresh
- [ ] Works offline gracefully
- [ ] No stale data served
- [ ] Cache invalidation works

---

## 🐛 Troubleshooting

### Issue: Sync Not Working

**Solution:**
```bash
# 1. Check pre-deployment tests
node pre-deployment-checks.js

# 2. Run sync tests
node test-sync.js

# 3. Check error logs
tail -f deployment-*.log

# 4. Verify Odoo running
curl -I https://eigermarvelhr.com

# 5. Check browser console for errors
DevTools → Console tab
```

### Issue: Slow Sync

**Solution:**
```
1. Check network speed: DevTools → Network
2. Check Odoo load: Admin → Monitoring
3. Reduce sync frequency (in .env)
4. Clear browser cache
```

### Issue: Data Not Syncing

**Solution:**
```
1. Manual sync: Click "Sync Now" in dashboard
2. Check error tracking logs
3. Verify data format matches models
4. Check MCP server logs
5. Review error-tracking.ts for clues
```

### Issue: Duplicate Records

**Solution:**
```
1. Check sync log for multiple syncs
2. Verify primary keys in data
3. Review conflict resolution logic
4. Manual cleanup if needed
5. Monitor for pattern
```

---

## 📊 Monitoring Commands

```bash
# Test sync functionality
node test-sync.js

# View deployment logs
tail -f deployment-*.log

# Check pre-deployment status
node pre-deployment-checks.js

# Monitor sync in browser
# Open: http://localhost:3000/sync-monitor
```

---

## 🎉 Success Indicators

Your sync is working when:

✅ Sync Monitor dashboard shows:
- Success rate > 90%
- Regular sync events in log
- Records incrementing for both directions
- No error spikes

✅ Data appears correctly:
- Website → Odoo syncs in < 2 seconds
- Odoo → Website syncs in < 5 seconds
- All fields match
- Timestamps align

✅ Error handling:
- Errors logged but not blocking
- Auto-retry working
- No data loss
- Clear error messages

✅ Performance:
- No lag during sync
- Smooth user experience
- Memory stable
- CPU usage normal

---

## 📞 Need Help?

If sync isn't working:

1. **Check error logs** - deployment-*.log
2. **Run test suite** - `node test-sync.js`
3. **Verify connectivity** - Odoo, MCP, database
4. **Review browser console** - DevTools
5. **Check error tracking** - src/lib/error-tracking.ts

---

**Sync testing complete! Your website and Odoo are connected and syncing.** 🎊

