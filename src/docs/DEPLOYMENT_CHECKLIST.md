# CharityHub Production Deployment Checklist

## Pre-Launch (T-7 days)

### Infrastructure & Security
- [ ] SSL certificates valid (expires > 30 days)
- [ ] Database backups tested (restore to staging, verify data)
- [ ] CDN configured and cache rules set
- [ ] WAF rules enabled (rate limiting, bot protection)
- [ ] Security headers configured (CORS, CSP, X-Frame-Options)
- [ ] Secrets rotated (API keys, DB passwords, Stripe keys)

### Testing
- [ ] Critical path tests passed (runCriticalPathTests function)
- [ ] Load test completed (loadTest function at 1000 concurrent users)
- [ ] Smoke tests pass (basic signup, login, donation, report)
- [ ] Payment flows tested with Stripe test mode
- [ ] Email templates tested end-to-end
- [ ] Mobile app tested on iOS and Android

### Documentation
- [ ] Deployment runbook reviewed by 2+ team members
- [ ] Incident response plan shared with team
- [ ] Support playbook finalized
- [ ] Status page created (https://status.charityhub.com)

### Operations
- [ ] On-call schedule set up (24/7 coverage Week 1)
- [ ] Monitoring alerts configured and tested
- [ ] Support ticket system live and staffed
- [ ] Database failover procedure practiced
- [ ] Rollback procedure documented and practiced

---

## Launch Day (T-0)

### Morning (6 AM - 10 AM)
- [ ] Final production backup taken
- [ ] Health checks pass (database, API, frontend)
- [ ] Team gathered in war room (Slack/Zoom)
- [ ] All team members briefed on deployment plan
- [ ] Rollback decision criteria defined

### Deployment (10 AM - 12 PM)
1. [ ] **Enable feature flag** `launch_soft_mode` = true
   - Disables new signups, redirects to waitlist
   - Only invited users can access

2. [ ] **Deploy code** to production
   - Backend functions deployed
   - Frontend assets deployed
   - Database migrations run

3. [ ] **Run smoke tests**
   - Login works
   - Donations process
   - Emails send
   - API responds
   - Reports generate

4. [ ] **Verify monitoring**
   - Error rate < 0.1%
   - Response times < 500ms
   - Database queries < 200ms
   - CPU/Memory normal

5. [ ] **Test payment processing**
   - Test charge succeeds
   - Webhook received
   - Invoice generated
   - Email sent

### Launch Validation (12 PM - 2 PM)
- [ ] Invite 10 test charities
- [ ] Test signup flow
- [ ] Test onboarding flow
- [ ] Monitor error logs (should be clean)
- [ ] Monitor performance (no spikes)

### Post-Launch (2 PM onwards)
- [ ] Announce launch to early access list
- [ ] Monitor support tickets (should be < 5)
- [ ] Monitor system health every 15 minutes
- [ ] Keep on-call team in war room for 2 hours
- [ ] Stand down escalation after 4 hours if stable

---

## Post-Launch (T+1 to T+7)

### Daily (Every Morning)
- [ ] Run health checks (dailySystemHealthCheck)
- [ ] Review error logs (should be near zero)
- [ ] Check support tickets (respond within 2 hours)
- [ ] Monitor performance baselines
- [ ] Verify backups completed

### Day 2-7
- [ ] Gradually increase user access (disable soft_mode for 50 users/day)
- [ ] Monitor churn (should be 0%)
- [ ] Verify trial expiration logic (send emails)
- [ ] Test payment retry logic
- [ ] Monitor database growth

### End of Week 1
- [ ] Retrospective meeting (what went well, what to improve)
- [ ] Performance report (uptime %, response times, errors)
- [ ] Customer feedback review
- [ ] Plan for scaling if demand exceeds expectations

---

## Rollback Procedure

### If Launch Fails (Before 100 Users)

1. **Immediate** (within 5 minutes)
   - [ ] Toggle feature flag `launch_soft_mode` = true (blocks new signups)
   - [ ] Post status update to status page
   - [ ] Notify all early access users

2. **Within 30 minutes**
   - [ ] Revert code to last known good version
   - [ ] Restore database from pre-launch backup
   - [ ] Clear all caches
   - [ ] Run smoke tests to verify rollback

3. **Post-Rollback**
   - [ ] Debug root cause (check error logs, deployment logs)
   - [ ] Fix issue in staging
   - [ ] Re-run full test suite
   - [ ] Schedule new launch window (minimum 24 hours later)

### If Service Degrades After Launch

**Response time > 1 second:**
- Scale up database connections
- Clear cache
- Monitor for 5 minutes
- If persists: enable read-only mode for non-critical features

**Error rate > 1%:**
- Page errors in real-time
- Alert team immediately
- Investigate root cause
- Deploy hotfix if identified
- If not identified within 1 hour: consider rollback

**Downtime > 15 minutes:**
- Declare incident (Level 2 or 3 based on user impact)
- Notify all users via status page
- Initiate incident response procedure
- See INCIDENT_RESPONSE.md

---

## Success Criteria

Launch is considered successful if:
- ✅ 100+ users signed up
- ✅ > 10 donations processed
- ✅ 0 downtime (99.99% uptime)
- ✅ Average response time < 500ms
- ✅ Error rate < 0.1%
- ✅ 0 critical bugs
- ✅ All monitoring alerts working

---

## Rollback Decision Tree

```
Is the system down?
├─ YES: Rollback immediately
└─ NO: Continue

Is error rate > 5%?
├─ YES: Rollback
└─ NO: Continue

Is payment processing broken?
├─ YES: Rollback (revenue impact)
└─ NO: Continue

Is data integrity compromised?
├─ YES: Rollback immediately (restore from backup)
└─ NO: Continue

Has issue persisted > 30 minutes?
├─ YES: Investigate hotfix vs rollback (team decision)
└─ NO: Monitor for 10 more minutes
```

---

## Post-Launch Monitoring

### Every 15 minutes (Week 1)
- Check error logs
- Verify database health
- Monitor response times
- Check payment processing

### Every Hour (Week 1)
- Review support tickets
- Monitor user growth
- Check backup status
- Verify email delivery

### Daily (Week 2+)
- Run health check function
- Review error logs
- Monitor SLAs
- Customer health scores

### Weekly
- Performance report
- Security audit
- Database optimization
- Feature flag review