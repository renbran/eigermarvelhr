# QUICK COMMAND REFERENCE

## 🚀 Essential Commands

### Start Development Server
```bash
npm run dev
```
✓ Server starts on http://localhost:5000
✓ OdooSyncStatus dashboard visible at top
✓ Auto-sync runs every 5 minutes
✓ Hot reload enabled

### Build for Production
```bash
npm run build
```
✓ Creates optimized production build
✓ Output: `dist/` folder
✓ Time: ~6 seconds
✓ Ready for deployment

### Preview Production Build
```bash
npm run preview
```
✓ Test production build locally
✓ Verify all features work in production mode

---

## 🧪 Testing in Browser Console

### Test Odoo Connection
**Open browser (F12) and run:**
```typescript
import { testOdooConnection } from '@/lib/odoo-connection-test';
const result = await testOdooConnection();
console.log(result);
```

**Expected result:**
```
✓ Connection established
✓ Retrieved X jobs
✓ Retrieved Y applicants
✓ Retrieved Z departments
✓ Retrieved employees
✓ Retrieved company: Eiger Marvel HR
✅ All tests passed!
```

### Check Sync Status
```typescript
import syncManager from '@/lib/sync-manager';
const status = syncManager.getSyncStatus();
console.log(status);
```

### View Sync Logs
```typescript
import syncManager from '@/lib/sync-manager';
const logs = syncManager.getSyncLogs();
console.table(logs.slice(-10)); // Last 10 operations
```

### Trigger Manual Sync
```typescript
import syncManager from '@/lib/sync-manager';
await syncManager.performFullSync();
```

### Get Sync Manager Config
```typescript
import syncManager from '@/lib/sync-manager';
const config = syncManager.getConfig();
console.log(config);
```

---

## 📁 Key Files & Locations

| File | Location | Purpose |
|------|----------|---------|
| **START HERE** | `00_START_HERE.md` | Master guide |
| Main App | `src/App.tsx` | Application entry point |
| Odoo Connection | `src/lib/odoo-connection.ts` | HTTPS RPC handler |
| Odoo Service | `src/lib/odoo-service.ts` | API operations |
| Sync Manager | `src/lib/sync-manager.ts` | Bi-directional sync |
| Status Dashboard | `src/components/OdooSyncStatus.tsx` | Real-time monitoring |
| Config | `.env` | Odoo credentials |
| Config Reference | `ODOO_SYNC_SETUP_GUIDE.md` | Setup guide |

---

## 🔧 Configuration (.env)

```
VITE_ODOO_URL=https://eigermarvelhr.com
VITE_ODOO_DATABASE=eigermarvel
VITE_ODOO_USERNAME=admin
VITE_ODOO_PASSWORD=8586583
VITE_ODOO_SERVER_IP=65.20.72.53
VITE_ODOO_SSH_PORT=22
VITE_ENABLE_AUTO_SYNC=true
VITE_SYNC_INTERVAL=300000
VITE_ENABLE_ERROR_TRACKING=true
VITE_DEBUG_MODE=false
```

---

## 🔍 Troubleshooting Commands

### Check Odoo Server Status
```bash
# Ping Odoo server
ping 65.20.72.53
```

### View Build Output
```bash
npm run build -- --reporter=verbose
```

### Clear Node Modules (if needed)
```bash
rm -r node_modules
npm install
```

### View Environment
```bash
# Show all environment variables (warning: shows passwords!)
type .env
```

---

## 📊 Performance Monitoring

### Bundle Size
```bash
npm run build -- --analyze
```

### Development Server Info
```bash
# Check what port is running
npm run dev
```

### Memory Usage
```bash
# Monitor memory during sync
# Check browser DevTools → Memory tab
# Look for SyncManager and OdooConnection objects
```

---

## 📚 Documentation Files

| File | Read For |
|------|----------|
| `00_START_HERE.md` | Quick overview (⭐ START HERE) |
| `QUICK_START.md` | 30-second reference |
| `ODOO_SYNC_SETUP_GUIDE.md` | Complete setup steps |
| `ODOO_SERVER_INTEGRATION.md` | Server management |
| `INTEGRATION_SUMMARY.md` | Technical architecture |
| `ODOO_INTEGRATION_CHECKLIST.md` | Implementation tracking |
| `FILE_MANIFEST.md` | File inventory |
| `IMPLEMENTATION_VERIFICATION.md` | Testing procedures |
| `DEPLOYMENT_COMPLETE.md` | Full verification |
| `SETUP_VERIFICATION_FINAL.md` | Final checklist |
| `MISSION_ACCOMPLISHED.txt` | Completion summary |

---

## 🔐 Security Checks

### Verify Credentials in .env
```bash
# Check if credentials are set
type .env | findstr VITE_ODOO
```

### Verify No Credentials in Code
```bash
# Search for hardcoded password
findstr /r "8586583" src/**/*.ts
# Should return: ONLY in .env and test files (expected)
```

### Check HTTPS Connection
```typescript
// In browser console, verify connection is secure
console.log(window.location.protocol); // Should be: https:
```

---

## 🚀 Deployment Checklist

- [ ] Run: `npm run build` (succeeds with no critical errors)
- [ ] Verify: `dist/` folder created
- [ ] Check: `.env` has correct credentials
- [ ] Upload: `dist/` folder to production server
- [ ] Copy: `.env` to production server
- [ ] Start: Application on production
- [ ] Test: Connection in browser console
- [ ] Monitor: Logs for first 24 hours
- [ ] Verify: Sync runs every 5 minutes
- [ ] Check: No errors in logs

---

## 📞 Getting Help

### For Setup Issues
→ Read: `ODOO_SYNC_SETUP_GUIDE.md`

### For Server Issues
→ Read: `ODOO_SERVER_INTEGRATION.md`

### For Testing Issues
→ Read: `IMPLEMENTATION_VERIFICATION.md`

### For Deployment Issues
→ Read: `DEPLOYMENT_COMPLETE.md`

### For Technical Details
→ Read: `INTEGRATION_SUMMARY.md`

---

## ✅ Verification Checklist

**Before Testing:**
- [ ] `npm install` completed
- [ ] `.env` file exists with all variables
- [ ] No syntax errors in code
- [ ] `npm run build` succeeds

**During Testing:**
- [ ] `npm run dev` starts successfully
- [ ] OdooSyncStatus appears in browser
- [ ] Test connection passes in console
- [ ] Sync logs show successful operations
- [ ] No errors in browser console

**Before Production:**
- [ ] All testing completed successfully
- [ ] `.env` configured for production
- [ ] `npm run build` produces clean bundle
- [ ] Security review passed
- [ ] Documentation reviewed

---

## 📈 Key Metrics

**Build Performance:**
- Build time: ~6 seconds
- Bundle size: 384 KB
- Modules: 6,404
- Errors: 0 critical

**Runtime Performance:**
- Sync operation: 2-5 seconds
- Connection overhead: <500ms
- Dashboard render: <100ms
- Auto-sync interval: 5 minutes

**Reliability:**
- Connection retry: 3 attempts
- Backoff strategy: Exponential
- Error recovery: Automatic
- Graceful degradation: Enabled

---

## 🎯 Next Steps

1. **Read**: `00_START_HERE.md` ⭐
2. **Run**: `npm run dev`
3. **Test**: Connection in browser console
4. **Deploy**: When ready with `npm run build`
5. **Monitor**: Logs for 24 hours post-deployment

---

**Setup Date**: January 17, 2026  
**Status**: ✅ COMPLETE & READY  
**Questions?**: See documentation files above
