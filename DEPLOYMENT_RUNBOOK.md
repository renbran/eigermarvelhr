# Deployment Runbook - Eiger Marvel HR Platform

## Overview

This runbook provides step-by-step procedures for deploying the Eiger Marvel HR Platform to production. It includes pre-deployment checks, deployment steps, monitoring procedures, and rollback procedures.

**Last Updated:** 2024
**Version:** 1.0
**Target Environment:** Production (staging available)
**Platform:** Node.js + React + Vite

---

## 1. Pre-Deployment Checklist

### A. System Prerequisites

- [ ] **Node.js**: v18.x or higher (`node -v`)
- [ ] **npm**: v9.x or higher (`npm -v`)
- [ ] **Git**: Latest version (`git --version`)
- [ ] **Disk Space**: Minimum 2GB available
- [ ] **Memory**: Minimum 4GB RAM recommended
- [ ] **Network**: Stable internet connection (10 Mbps+)

### B. Code Repository

- [ ] Latest code pulled from `main` branch
  ```bash
  git pull origin main
  ```
- [ ] No uncommitted changes
  ```bash
  git status
  ```
- [ ] All dependencies installed
  ```bash
  npm install
  ```

### C. Configuration Files

- [ ] `.env` file configured with:
  - `NODE_ENV=production`
  - `VITE_API_URL=https://eigermarvelhr.com`
  - All Odoo credentials
  - MCP server URL and credentials

- [ ] `vite.config.ts` reviewed and correct
- [ ] `tsconfig.json` optimized for production
- [ ] `package.json` dependencies up-to-date

### D. External Services

- [ ] Odoo instance (v18) is running and accessible
  ```bash
  curl -I https://eigermarvelhr.com
  ```
- [ ] MCP server is operational
  ```bash
  node /path/to/mcp-server/dist/index.js
  ```
- [ ] Database has valid data and backups
- [ ] HTTPS certificates are valid

### E. Security Review

- [ ] No secrets hardcoded in code
- [ ] All API keys in environment variables
- [ ] CORS policies reviewed and correct
- [ ] Authentication/authorization working
- [ ] Security scan completed (no critical vulnerabilities)

---

## 2. Pre-Deployment Verification

### Run Automated Checks

Execute the pre-deployment verification script:

```bash
node pre-deployment-checks.js
```

**Expected Output:**
```
✅ Environment Variables: PASSED
✅ Dependencies: PASSED
✅ Build Configuration: PASSED
✅ Integration Tests: PASSED
✅ Odoo Connection: PASSED
✅ MCP Server: PASSED
✅ Cache System: PASSED

📊 Summary: 7 checks | 7 passed | 0 failed | 0 warnings
Exit Code: 0 (Ready to deploy)
```

### Troubleshooting Pre-Checks

| Check | Error | Solution |
|-------|-------|----------|
| Environment Variables | FAILED | Run: `cp .env.example .env` and fill values |
| Dependencies | FAILED | Run: `npm install --no-optional` |
| Build Configuration | FAILED | Verify `vite.config.ts` and `tsconfig.json` |
| Integration Tests | FAILED | Run: `npm test` to diagnose |
| Odoo Connection | FAILED | Verify URL, network, HTTPS certificate |
| MCP Server | FAILED | Check MCP server is running: `ps aux \| grep mcp` |
| Cache System | FAILED | Clear cache: `npm run clear-cache` |

---

## 3. Building the Application

### Step 1: Install Dependencies

```bash
npm install
```

**Expected Output:**
```
added 1,234 packages in 45s
```

### Step 2: Build for Production

```bash
npm run build
```

**Build Output Should Be:**
- `dist/` folder created (~2-3MB)
- No TypeScript errors
- All assets optimized
- Source maps generated (optional)

**Expected Build Time:** 2-5 minutes

### Step 3: Verify Build

```bash
ls -lh dist/
```

**Check:**
- [ ] `index.html` present (~5KB)
- [ ] JavaScript bundles present (~800KB-1.2MB)
- [ ] CSS files present (~150-200KB)
- [ ] Assets folder present
- [ ] No `.ts` files in output (should be compiled)

### Build Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| TypeScript errors | Invalid syntax | Run: `npm run type-check` to fix |
| Module not found | Missing dependency | Run: `npm install` again |
| Out of memory | Large project | Use: `NODE_OPTIONS=--max-old-space-size=4096 npm run build` |
| Slow build | Many files | Enable Vite caching (default) |

---

## 4. Testing

### Unit Tests

```bash
npm test
```

**Expected:** All tests pass, coverage > 80%

### Integration Tests

```bash
npm run test:integration
```

**Expected:** 6/6 tests passing
- ✅ MCP Connection Test
- ✅ Models Availability Test
- ✅ Data Fetching Test
- ✅ Sync Manager Test
- ✅ Data Mapping Test
- ✅ Portal Readiness Test

### Health Check

```bash
npm run health-check
```

---

## 5. Pre-Deployment Backup

### Create System Backup

```bash
npm run backup
```

**This creates:**
- Database snapshot
- Current version backup
- Configuration backup
- Environment variables backup

**Backup Location:** `/backups/deployment-${timestamp}/`

### Verify Backup

```bash
ls -la /backups/
du -sh /backups/deployment-*/
```

---

## 6. Deployment Execution

### Execute Deployment Script

```bash
node deploy.js staging
```

**Deployment Stages:**

```
📍 [1/11] Environment Validation
   Checking Node.js version...
   Validating environment variables...
   ✅ Environment ready

📍 [2/11] Dependency Check
   Installing dependencies...
   ✅ Dependencies ready

📍 [3/11] Pre-Deployment Tests
   Running pre-deployment checks...
   ✅ All checks passed

📍 [4/11] Code Build
   Building application...
   TypeScript compilation...
   Bundle optimization...
   ✅ Build completed successfully

📍 [5/11] Integration Testing
   Running 6 integration tests...
   ✅ Test 1: MCP Connection - PASSED
   ✅ Test 2: Models Availability - PASSED
   ✅ All tests passed (100%)

📍 [6/11] Database Migration
   Checking for migrations...
   No pending migrations
   ✅ Database ready

📍 [7/11] Cache System Initialization
   Initializing localStorage cache...
   Starting auto-sync service (5-min interval)...
   ✅ Cache system ready

📍 [8/11] Error Tracking Setup
   Starting error tracker...
   Initializing logging service...
   Setting alert thresholds...
   ✅ Monitoring active

📍 [9/11] Health Checks
   Checking MCP connection...
   ✓ MCP: Connected
   Checking Odoo database...
   ✓ Odoo: Healthy
   Checking cache system...
   ✓ Cache: Operational

📍 [10/11] Deployment to Environment
   Deploying to staging...
   Uploading build artifacts...
   Starting application services...
   Performing health check...
   ✅ Deployment successful

📍 [11/11] Post-Deployment Verification
   Verifying application endpoints...
   ✓ All endpoints responding
   Verifying data sync...
   ✓ Sync operational
   Verifying error tracking...
   ✓ Monitoring active
```

**Expected Duration:** 10-15 minutes

### Monitor Deployment

Open the Deployment Monitor dashboard in browser:

```
http://localhost:3000/deployment-monitor
```

**Dashboard Shows:**
- Real-time progress (0-100%)
- Current deployment phase
- System metrics (memory, CPU, response time)
- Error count and alerts
- Active warning messages
- Live error log

---

## 7. Post-Deployment Verification

### Verify Deployment Success

```bash
npm run verify-deployment
```

**Checks:**
- [ ] Application is running
- [ ] All endpoints responding (200 OK)
- [ ] Database connected
- [ ] MCP server connected
- [ ] Error tracking active
- [ ] Cache system operational
- [ ] Sync service active

### Smoke Tests

```bash
npm run smoke-tests
```

**Test Scenarios:**
1. User login
2. Job listing page loads
3. Job application submission
4. Data sync to Odoo
5. Error tracking captures events
6. Dashboard loads without errors

### Performance Baseline

```bash
npm run perf-test
```

**Expected Metrics:**
- Page load time: < 3 seconds
- First Contentful Paint: < 2 seconds
- API response time: < 500ms average
- Memory usage: < 150MB
- CPU usage: < 60%

### Verify with Real Data

1. Login to application
2. Navigate to each page
3. Check data loads correctly
4. Submit a test form
5. Verify data in Odoo
6. Check error logs are empty

---

## 8. Monitoring During First 24 Hours

### Continuous Monitoring

Keep the Deployment Monitor dashboard open:

```bash
npm run monitor
```

**Alert Thresholds:**
- Critical errors: > 10 total
- Warnings: > 50 total
- Response time: > 5 seconds
- Memory usage: > 85%
- CPU usage: > 80%

### Log Monitoring

Monitor application logs in real-time:

```bash
tail -f deployment-*.log
```

### User Feedback

- Monitor support channels for reports
- Have team available for quick response
- Document any issues encountered

### Rollback Trigger Points

Immediately rollback if:
- Critical errors exceed 15
- Response time consistently > 10s
- Database connectivity lost
- Odoo sync not working
- Security vulnerability discovered

---

## 9. Rollback Procedure

### When to Rollback

- Critical functionality broken
- Data corruption detected
- Security breach discovered
- Performance degradation (> 50% slower)
- Deployment caused system outage

### Execute Rollback

```bash
npm run rollback
```

**Rollback Steps:**
1. Stop current deployment
2. Restore previous version from backup
3. Restore database from snapshot
4. Restart services
5. Verify system health
6. Notify stakeholders

**Expected Duration:** 2-5 minutes

### Post-Rollback

```bash
npm run verify-rollback
```

Verify:
- [ ] Application is responsive
- [ ] All endpoints working
- [ ] Data integrity intact
- [ ] Users can login
- [ ] No errors in logs
- [ ] System metrics normal

### Document Issue

Create post-mortem:
1. What went wrong
2. Root cause analysis
3. Prevention for next time
4. Timeline of events
5. Lessons learned

---

## 10. Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| DevOps Lead | [Name] | [Phone] | [Email] |
| Backend Lead | [Name] | [Phone] | [Email] |
| Frontend Lead | [Name] | [Phone] | [Email] |
| Odoo Admin | [Name] | [Phone] | [Email] |
| On-Call | [Name] | [Phone] | [Email] |

---

## 11. Deployment Checklist

### Before Starting

- [ ] All team members notified
- [ ] Backup created and verified
- [ ] Staging environment tested
- [ ] Pre-deployment checks passed
- [ ] Maintenance window scheduled (if needed)
- [ ] Monitoring dashboard ready
- [ ] Emergency contacts available

### During Deployment

- [ ] Monitor progress dashboard
- [ ] Watch error logs for issues
- [ ] Check system metrics
- [ ] Verify each deployment step
- [ ] Keep team informed of status
- [ ] Be ready to rollback

### After Deployment

- [ ] Run post-deployment verification
- [ ] Perform smoke tests
- [ ] Check application performance
- [ ] Monitor for 24 hours
- [ ] Document any issues
- [ ] Update deployment log
- [ ] Celebrate success! 🎉

---

## 12. Deployment Log Template

```
===========================================
Deployment Log - [Date & Time]
===========================================

Environment: Production
Deployed By: [Name]
Start Time: [Time]
End Time: [Time]
Duration: [Minutes]

Pre-Deployment Checks:
✅ [Check 1]
✅ [Check 2]
✅ [Check 3]

Build Results:
- Build Time: [Duration]
- Bundle Size: [Size]
- No. of Files: [Count]

Test Results:
- Unit Tests: [Pass/Fail]
- Integration Tests: [Pass/Fail]
- Smoke Tests: [Pass/Fail]

Deployment Steps:
✅ [Step 1]
✅ [Step 2]
✅ [Step 3]

Post-Deployment Results:
✅ [Verification 1]
✅ [Verification 2]
✅ [Verification 3]

Issues Found:
- [Issue 1] - [Resolution]
- [Issue 2] - [Resolution]

Notes:
[Any additional notes]

Sign-off: _________________ Date: _________
```

---

## 13. Quick Reference Commands

```bash
# Pre-deployment
npm install                          # Install dependencies
node pre-deployment-checks.js        # Run pre-checks
npm run backup                       # Create backup

# Build and Test
npm run build                        # Build for production
npm test                             # Run unit tests
npm run test:integration             # Run integration tests

# Deploy
node deploy.js staging               # Deploy to staging
npm run verify-deployment            # Verify deployment
npm run monitor                      # Open monitoring dashboard

# Rollback
npm run rollback                     # Rollback deployment
npm run verify-rollback              # Verify rollback

# Monitoring
tail -f deployment-*.log             # View logs
npm run health-check                 # Run health checks
npm run perf-test                    # Performance test

# Cleanup
npm run clear-cache                  # Clear cache
npm run clear-logs                   # Clear old logs
npm run cleanup                      # Full cleanup
```

---

## 14. Troubleshooting Guide

### Deployment Fails at Build Stage

**Error:** "TypeScript compilation failed"

**Solution:**
```bash
npm run type-check              # Find type errors
npm run lint --fix              # Auto-fix linting
npm run build                   # Rebuild
```

### Deployment Fails at Testing

**Error:** "Integration tests failed"

**Solution:**
```bash
npm test -- --verbose           # Run with details
npm run test:integration:debug  # Debug mode
# Fix broken test or code
npm run test:integration        # Rerun tests
```

### Odoo Connection Failed

**Error:** "Cannot reach Odoo server"

**Solution:**
```bash
# Verify Odoo is running
curl -I https://eigermarvelhr.com

# Check MCP server
ps aux | grep mcp

# Check network
ping eigermarvelhr.com

# Verify credentials in .env
cat .env | grep VITE_
```

### High Memory Usage

**Error:** "JavaScript heap out of memory"

**Solution:**
```bash
# Increase Node memory
export NODE_OPTIONS=--max-old-space-size=4096
npm run build

# Or directly
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Database Lock

**Error:** "Database is locked"

**Solution:**
```bash
# Wait a moment
sleep 30

# Or restart services
npm run restart

# Or clear locks
npm run clear-db-locks
```

---

## 15. Success Criteria

Deployment is considered **SUCCESSFUL** when:

✅ All pre-deployment checks passed
✅ Build completed without errors
✅ All integration tests passing (6/6)
✅ Application deployed to environment
✅ All health checks passing
✅ No critical errors in logs
✅ Performance metrics within targets
✅ User can successfully login
✅ Data syncs with Odoo correctly
✅ Error tracking operational
✅ Dashboard accessible and responsive

---

## 16. Post-Deployment Documentation

After successful deployment, document:

1. **What was deployed:** Version, commit hash, changes
2. **When deployed:** Date, time, duration
3. **Who deployed:** Name, team
4. **Metrics:** Performance, errors, user activity
5. **Issues:** Any problems encountered
6. **Lessons learned:** What to improve next time
7. **Stakeholder notification:** Who was informed when

---

**Questions?** Contact DevOps Team
**Escalation?** Call on-call engineer
**Emergency?** Activate Rollback Procedure

---

*Last Updated: 2024 | Runbook Version 1.0 | Eiger Marvel HR Platform*
