# CharityHub Deployment Checklist

**Use this before every production deployment.**

---

## 📋 Pre-Deployment (1 hour before)

### Code & Database
- [ ] All PRs merged and reviewed
- [ ] Latest main branch pulled
- [ ] No uncommitted changes (`git status`)
- [ ] Database migrations tested locally (`npm run migrate`)
- [ ] Database rollback plan documented
- [ ] Environment variables set correctly (.env.production)
- [ ] Secrets loaded (Stripe keys, LLM API keys, etc.)

### Testing
- [ ] All smoke tests passed (see SMOKE_TESTS.md)
- [ ] Regression tests passed
- [ ] No console errors in staging
- [ ] Performance metrics acceptable
- [ ] Mobile tests passed
- [ ] Accessibility check passed

### Security
- [ ] No hardcoded secrets in code
- [ ] API keys in environment only
- [ ] CORS headers correct
- [ ] Rate limiting enabled
- [ ] DDoS protection active
- [ ] SSL certificate valid
- [ ] No deprecated dependencies

### Monitoring & Alerting
- [ ] Error tracking (Sentry) configured
- [ ] Logging enabled
- [ ] Alert rules active
- [ ] On-call engineer assigned
- [ ] Rollback procedure documented
- [ ] Status page updated (if applicable)

### Communication
- [ ] Team notified of deployment window
- [ ] Customer support prepped (if major change)
- [ ] Change log written
- [ ] Release notes prepared

---

## 🚀 Deployment (During)

### Pre-Deployment Tasks
```bash
# 1. Create deployment branch
git checkout -b deploy/production-$(date +%Y%m%d-%H%M%S)

# 2. Run final checks
npm run lint
npm run test
npm run build

# 3. Verify bundle size hasn't ballooned
ls -lh dist/
```

### Database Migrations
```bash
# 1. Backup production database
pg_dump $DATABASE_URL > backups/pre-deployment-$(date +%s).sql

# 2. Run migrations
npm run migrate:up

# 3. Verify data integrity
npm run verify:data
```

### Deploy to Production
```bash
# 1. Deploy (using your CD/CI pipeline)
git push origin deploy/production-...
# Trigger deployment in CI/CD (GitHub Actions, Vercel, etc.)

# 2. Verify deployment
curl https://charityhub.co.uk/api/health
# Expected: { "status": "ok", "timestamp": "..." }

# 3. Check error logs
# Monitor Sentry, CloudWatch, or your logging service
```

### Smoke Tests Post-Deployment
- [ ] Health check endpoint responds (200 OK)
- [ ] Critical user flows work (signup, login, create campaign)
- [ ] No spike in errors (check monitoring)
- [ ] Database queries performing normally
- [ ] Stripe integration functional
- [ ] Email notifications working
- [ ] PDF export functional
- [ ] Analytics charts rendering

---

## 🔍 Post-Deployment (First 24 hours)

### Monitoring
- [ ] Error rate normal (<0.1%)
- [ ] Response times normal (<2s p95)
- [ ] Database performance normal
- [ ] Memory usage stable
- [ ] No unusual traffic patterns
- [ ] All critical alerts not firing

### User Feedback
- [ ] Monitor support channel for issues
- [ ] Check customer email for problems
- [ ] Monitor social media mentions
- [ ] Check analytics for adoption (if new feature)

### Verification
- [ ] A few real users can complete signup
- [ ] Donations processing correctly
- [ ] Reports generating without errors
- [ ] Compliance alerts triggering
- [ ] No data inconsistencies

---

## ⚠️ Rollback Plan (If Issues Found)

### Immediate Rollback (If Critical Issue)
```bash
# 1. Identify issue
# - Check Sentry for error spike
# - Check CloudWatch logs
# - Verify user reports

# 2. Decide to rollback
# - If >1% error rate: ROLLBACK
# - If core flow broken: ROLLBACK
# - If data corruption: ROLLBACK IMMEDIATELY

# 3. Execute rollback
git revert <commit-hash>
git push origin main
# Trigger deployment of previous version in CI/CD

# 4. Verify rollback successful
curl https://charityhub.co.uk/api/health
# Check error rate returns to normal
```

### Database Rollback (If Migration Failed)
```bash
# If migration corrupted data:
psql $DATABASE_URL < backups/pre-deployment-<timestamp>.sql

# Revert to previous code version
git checkout <previous-tag>
npm run build
# Redeploy
```

### Partial Rollback (Feature Flag)
If only one feature is broken:
```bash
# Disable feature via environment variable
# Redeploy with FEATURE_AI_GRANTS=false
# Users experience graceful "Feature unavailable" message
```

---

## 🔔 Communication During Incident

### If Rollback Needed
1. Post to #incidents channel (or equivalent)
   - **What:** Brief description of issue
   - **When:** Time of rollback start
   - **ETA:** Estimated time to resolve
   - **Status:** Updates every 15 minutes

2. Notify affected customers (if major feature)
   - Email template prepared
   - Apology + ETA for fix
   - Link to status page

3. Post-incident report (within 24 hours)
   - Root cause
   - What went wrong
   - Steps to prevent future occurrence
   - Action items assigned

---

## 📊 Deployment Report Template

```
DEPLOYMENT REPORT
═══════════════════════════════════════════

Date: [date]
Version: [version/tag]
Deployed By: [name]
Duration: [X minutes]

PRE-DEPLOYMENT CHECKS:
✅ All smoke tests passed
✅ Code reviewed
✅ Database backups created
✅ Monitoring configured

DEPLOYMENT STATUS:
✅ Code deployed
✅ Migrations successful
✅ No data corruption
✅ Health checks passing

POST-DEPLOYMENT TESTS:
✅ Critical flows working
✅ Error rate normal
✅ Performance acceptable
✅ No alerts firing

ISSUES FOUND:
- None

ROLLBACK REQUIRED:
- No

APPROVED FOR PRODUCTION:
✅ Yes

Signed by: [Engineer name]
```

---

## 🆘 Emergency Contacts

- **On-Call Engineer:** [Name] ([Phone]) ([Email])
- **Platform Lead:** [Name] ([Email])
- **Stripe Support:** [Stripe support portal]
- **Hosting Support:** [Hosting provider support]
- **AWS Support:** [AWS support channel]

---

## 📚 Useful Commands

```bash
# View deployment history
git log --oneline --graph main

# Check which version is deployed
curl https://charityhub.co.uk/api/version
# Expected: { "version": "1.2.3", "commit": "abc123..." }

# View error logs
tail -f logs/production.log | grep ERROR

# Check database health
psql $DATABASE_URL -c "SELECT NOW();"

# View active deployments
# Use your CI/CD dashboard (GitHub Actions, Vercel, etc.)
```

---

## ✅ Sign-Off

Before deploying:

- [ ] I have read and understood this checklist
- [ ] I have run all smoke tests locally
- [ ] I understand the rollback procedure
- [ ] I am prepared to monitor for 24 hours
- [ ] I have the emergency contacts saved

**Engineer:** ________________  **Date/Time:** ________________

**Approval:** ________________  **Date/Time:** ________________