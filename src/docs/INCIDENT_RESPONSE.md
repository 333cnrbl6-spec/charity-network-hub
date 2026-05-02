# CharityHub Incident Response Runbook

## Incident Classification

### Level 1: Critical
**Impact:** Complete service outage or data loss  
**Users affected:** 100%  
**Response time:** Immediate (< 5 min)  
**Example:** Database down, payment processing broken, data corruption

### Level 2: High
**Impact:** Major feature broken, severe degradation  
**Users affected:** 25-99%  
**Response time:** 15 minutes  
**Example:** Signup broken, donations not logging, reports failing

### Level 3: Medium
**Impact:** Non-critical feature broken, workaround exists  
**Users affected:** < 25%  
**Response time:** 1 hour  
**Example:** Email sending slow, API rate limit hit, export failing

### Level 4: Low
**Impact:** Minor cosmetic issue, no workaround needed  
**Users affected:** < 5%  
**Response time:** 24 hours  
**Example:** UI bug, typo, styling issue

---

## Step 1: Detect Incident (Automated)

**Monitoring triggers:**
- Uptime check fails (3 consecutive failures = alert)
- Error rate > 1% for 5 minutes = Level 3
- Error rate > 5% for 2 minutes = Level 2
- Database unavailable = Level 1
- Payment processing fails = Level 1

**Alert destinations:**
- Slack: #ops-alerts
- Email: ops-team@charityhub.com
- SMS: On-call manager (Level 1 only)

---

## Step 2: Initial Response (0-5 min)

### Incident Commander
- [ ] Page on-call engineer
- [ ] Start incident call (Zoom: https://incident.charityhub.com)
- [ ] Create incident ticket (log in SupportPortal)
- [ ] Post to #incident-response Slack
- [ ] Get brief status from whoever detected it

### On-Call Engineer
- [ ] Join incident call
- [ ] Check monitoring dashboard
- [ ] Determine severity (Level 1-4)
- [ ] Get brief situation report

### Sample Slack Message (automatically posted)
```
:warning: INCIDENT DETECTED
Level: [2]
Status: Database responding slowly
Affected: Donations, exports
Users impacted: ~200
Time detected: 2026-05-02 14:32:00 UTC
Incident call: https://zoom.us/j/incident
```

---

## Step 3: Triage & Diagnosis (5-15 min)

### Check Standard Issues (in order)
1. **Is the service actually down?**
   - [ ] Check uptime: https://status.charityhub.com
   - [ ] Hit health endpoint: https://api.charityhub.com/health
   - [ ] Try login manually

2. **Check infrastructure**
   - [ ] Database status (connection pool, query latency)
   - [ ] API server status (CPU, memory, disk)
   - [ ] Cache (Redis, clear if needed)
   - [ ] External services (Stripe, email provider)

3. **Check logs**
   - [ ] Application error logs (last 5 min)
   - [ ] Database logs (slow queries, locks)
   - [ ] Access logs (spike in traffic, unusual patterns)

4. **Escalate if needed**
   - If database issue: page database admin
   - If Stripe issue: check Stripe status page
   - If unknown: page team lead

### Sample Diagnosis (database slow)
```
Slow query detected: SELECT * FROM donations (5-second latency)
Index missing on created_date column
Solution: Add index in migration OR kill long-running queries
```

---

## Step 4: Resolution

### Common Issues & Fixes

#### **API returning 500 errors**
```bash
# Check error logs
Check logs in monitoring dashboard for past 5 min

# Common causes:
- Database connection pooled out → scale up connections
- Memory leak → restart API server
- Bad deployment → rollback to previous version
```

#### **Database slow/unresponsive**
```bash
# Kill long-running queries
SELECT * FROM pg_stat_activity WHERE duration > 60000

# Scale connections or restart database

# If still broken: failover to replica
```

#### **Payment processing broken**
```bash
# Check Stripe status page
# Check webhook endpoint (is it receiving events?)
# Manually verify last few charges in Stripe dashboard

# Rollback payment code if recently deployed
```

#### **Email not sending**
```bash
# Check email service status
# Verify API keys are correct
# Check email queue (any stuck messages?)

# Temporary fix: Retry failed emails (retryFailedPayments function)
```

#### **Data integrity issue detected**
```bash
# STOP: Do not proceed without database team approval

# Options:
1. Restore from backup (lose last X minutes of data)
2. Fix with targeted SQL (risky, do in staging first)

# Always validate fix in staging before production
```

### Escalation Matrix

| Issue | Owner | Escalation |
|-------|-------|------------|
| API error | On-call engineer | Tech lead if > 30 min |
| Database | Database admin | CTO if data loss risk |
| Stripe | Payment engineer | Stripe support if > 1 hour |
| Security breach | Security lead | CEO + Legal |

---

## Step 5: Communication (Ongoing)

### Customer Communication

**At detection:**
```
We're investigating elevated error rates affecting some features.
Updates in 15 minutes. Thanks for your patience!
```

**At 15 min (if not fixed):**
```
We've identified the issue and are implementing a fix.
ETA: 30 minutes. We'll update you when service is restored.
```

**At resolution:**
```
Service restored. Root cause: [brief description].
No data was lost. We've prevented this from happening again.
```

### Internal Communication
- Post updates to #incident-response every 15 minutes
- Keep Slack thread updated with status
- After resolution: post retrospective findings

### Status Page Updates
- Update https://status.charityhub.com every 15 min
- Mark status as "Investigating" → "Degraded" → "Resolved"
- Include incident duration and impact

---

## Step 6: Resolution & Verification (15-60 min)

### Verify Fix
- [ ] Service responding normally (health check passes)
- [ ] Error rate back to baseline (< 0.1%)
- [ ] Response times normal (< 500ms)
- [ ] Payments processing
- [ ] Emails sending
- [ ] Sample user signup works end-to-end

### Notify Users
- [ ] Update status page to "Resolved"
- [ ] Post final update to support tickets
- [ ] Send email to affected users (if data loss)

### Clean Up
- [ ] Document incident in #incident-response
- [ ] Create ticket for post-mortem
- [ ] Archive incident call recording
- [ ] Update runbook if new edge case discovered

---

## Step 7: Post-Mortem (Within 24 hours)

### Incident Report Template
```
Incident: [name]
Severity: Level [1-4]
Duration: 15 minutes
Root Cause: Database index missing
Timeline:
  14:30 - Monitoring alert fires (error rate spike)
  14:35 - On-call engineer diagnosed slow query
  14:40 - Added database index
  14:45 - Service recovered

Impact:
  - Users affected: 200
  - Donations processed: 0 (during incident)
  - Revenue lost: ~£50

Prevention:
  - Add missing index to production (DONE)
  - Add monitoring for slow queries (ASSIGNED)
  - Improve index review in deployment checklist (ASSIGNED)
```

### Follow-up Actions
- [ ] Assign owner to each prevention action
- [ ] Schedule completion date (within 1 week for Level 1)
- [ ] Track completion in GitHub issues

---

## On-Call Responsibilities

### You are on-call if:
- You're listed in the on-call schedule
- You receive a page from the alerting system
- Incident commander calls you

### You should:
- ✅ Join incident call within 5 minutes
- ✅ Respond to questions immediately
- ✅ Escalate if you don't know the answer
- ✅ Document actions in Slack thread
- ✅ Participate in post-mortem

### You should NOT:
- ❌ Fix production issues without second pair of eyes (except obvious fixes)
- ❌ Make database changes without DBA approval
- ❌ Deploy code during an incident (unless rolling back)
- ❌ Ignore page/alerts (respond within 5 min even if just to say "I'm looking")

---

## War Room Setup

### When to escalate to war room (Level 1-2 only)
- Issue not resolved within 15 minutes
- Multiple systems affected
- Data loss or security risk

### Who joins:
- Incident Commander (leads)
- On-call engineer (executes)
- Tech lead (approves major changes)
- Product/business (communicates to users)

### What happens:
- Real-time problem-solving
- Running list of actions
- 15-min status updates
- Recorded for post-mortem

---

## Quick Reference

**Incident Call:** https://zoom.us/j/incident  
**Status Page:** https://status.charityhub.com  
**Monitoring:** https://monitoring.charityhub.com  
**On-call Schedule:** Google Calendar "CharityHub On-Call"  
**Slack Channel:** #incident-response

**Emergency Contacts:**
- Tech Lead: [name] [phone]
- Database Admin: [name] [phone]
- CEO: [name] [phone]