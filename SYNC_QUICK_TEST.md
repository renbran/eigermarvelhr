# 🔄 Quick Sync Testing Commands

## ✅ Verify Sync is Ready

```bash
node test-sync.js
```

**Expected Result:**
```
✅ ALL SYNC TESTS PASSED
Your website and database are ready to sync!
```

---

## 📊 Monitor Sync in Real-Time

Open in your browser:
```
http://localhost:3000/sync-monitor
```

**Dashboard shows:**
- ✅ Success rate (%)
- ✅ Records synced to Odoo
- ✅ Records synced from Odoo
- ✅ Real-time sync events
- ✅ Manual sync trigger button
- ✅ Auto-sync toggle

---

## 🧪 Test Scenarios

### Test 1: Website → Odoo (Create Application)

```
1. Go to http://localhost:3000/jobs
2. Click on any job → "Apply Now"
3. Fill form with test data
4. Submit application
5. Check Sync Monitor (should show success)
6. Verify in Odoo database
```

**Expected:**
- ✅ Application syncs to Odoo
- ✅ Data matches exactly
- ✅ Appears in Odoo within 2 seconds
- ✅ Sync Monitor shows success

---

### Test 2: Odoo → Website (Create Job)

```
1. Login to Odoo (https://eigermarvelhr.com)
2. Create new job in HR → Recruitment → Jobs
3. Save the job
4. Click "Sync Now" in Sync Monitor (or wait 5 min)
5. Refresh website jobs page
6. Look for new job
```

**Expected:**
- ✅ Job appears on website
- ✅ All fields display correctly
- ✅ Images load properly
- ✅ Sync Monitor shows success

---

### Test 3: Update & Verify Bidirectional

```
1. Update job in Odoo
2. Trigger manual sync in dashboard
3. Verify changes on website
4. Update on website
5. Verify update syncs back to Odoo
```

**Expected:**
- ✅ Changes sync both directions
- ✅ No duplicate records
- ✅ Timestamps update correctly
- ✅ No data loss

---

## 📈 Monitoring Metrics

In Sync Monitor dashboard, watch:

- **Success Rate** - Should be > 90%
- **Records Synced (To Odoo)** - Increments with new applications
- **Records Synced (From Odoo)** - Increments with new jobs
- **Average Time** - Should be < 2000ms
- **Pending Syncs** - Should be 0 normally

---

## 🐛 Troubleshooting

### Sync not working?

```bash
# 1. Check tests pass
node test-sync.js

# 2. Verify pre-deployment
node pre-deployment-checks.js

# 3. Check Odoo is running
curl -I https://eigermarvelhr.com

# 4. Check browser console for errors
# DevTools → Console tab
```

### Slow sync?

```
- Check network in DevTools (Network tab)
- Check Odoo server load
- Restart browser
- Clear browser cache
```

### Manual sync trigger

In Sync Monitor dashboard:
- Click "Sync Now" button
- Watch event log for completion
- Check success rate

---

## 📝 Test Checklist

After running tests, verify:

- [ ] `node test-sync.js` passes all 8 tests
- [ ] Sync Monitor dashboard opens
- [ ] Can create job application
- [ ] Application appears in Odoo
- [ ] Can create job in Odoo
- [ ] Job appears on website
- [ ] Success rate > 90%
- [ ] No errors in browser console
- [ ] Cache works offline
- [ ] Auto-sync runs every 5 minutes

---

## 🎉 Success!

When all above checks pass, your sync is working perfectly!

**You can:**
✅ Create jobs in Odoo → appear on website
✅ Submit applications → stored in Odoo
✅ Update data bidirectionally
✅ Monitor all syncs in real-time
✅ Trust error handling & retry logic

---

**Full Guide:** [SYNC_TESTING_GUIDE.md](SYNC_TESTING_GUIDE.md)

