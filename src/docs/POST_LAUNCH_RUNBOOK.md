# Post-Launch Operations Runbook

**For:** On-call engineers during first 30 days post-launch

---

## Daily Checklist (9 AM)

```
[ ] Check all 9 automations ran successfully (Logs → Automations)
[ ] Review error logs (should be near zero)
[ ] Check MRR on SaaSMetricsDashboard
[ ] Verify backup completed (check S3 timestamp)
[ ] Read weekly report email (if Monday)
[ ] Check support tickets (reply within 1 hour)
```

**Time needed:** 10 minutes

---

## Alert Response Guide

### 🚨 CRITICAL: Data Isolation Breach

**If:** SecurityAuditLog shows event_type='data_isolation_breach'

**Immediate action (0-5 min):**
1. STOP all operations on affected charity
2. Set Charity.subscription_status = 'suspended'
3. Create SecurityAuditLog entry with severity='critical'
4. Email affected customer: "We detected unusual activity. Account temporarily locked."
5. Notify CEO + security team immediately

**Investigation (5-30 min):**
1. Which user accessed which charity's data?
2. What data was exposed? (check query logs)
3. Was data downloaded/exported?
4. When did this start?
5. Document in incident report

**Resolution:**
1. Force password reset for affected accounts
2. Review API key permissions
3. Update data isolation rules if needed
4. Restore access once verified
5. Post-mortem within 24 hours

---

### ⚠️ HIGH: Payment System Failure

**If:** retryFailedPayments automation fails or Stripe webhook not received

**Immediate action (0-5 min):**
1. Check Stripe Dashboard → Events (any webhook errors?)
2. Verify webhook endpoint is responding: `curl https://charityhub.com/webhooks/stripe`
3. If endpoint down: redeploy immediately
4. Check STRIPE_WEBHOOK_SECRET is still valid

**Investigation (5-15 min):**
1. How many payments failed?
2. Which customers are affected?
3. Will automations retry automatically?
4. Are customers charged?

**Communication:**
- Email affected customers: "Payment failed, we're retrying. If issue persists, contact us."
- Post to status page: "Payment processing delayed"

**Resolution:**
1. Fix root cause (network, secret, Stripe account)
2. Re-run `retryFailedPayments` manually once fixed
3. Monitor for 1 hour for successful retries

---

### ⚠️ HIGH: Email System Down

**If:** EmailLog shows many status='failed' or SendGrid returning errors

**Immediate action (0-5 min):**
1. Verify SENDGRID_API_KEY is still valid
2. Check SendGrid Dashboard → Suppressions (are recipients bouncing?)
3. Call SendGrid API to verify account is active
4. Check if rate limit exceeded

**If rate limit:**
- Wait 1 hour, automations will retry automatically
- No action needed

**If invalid key:**
1. Update SENDGRID_API_KEY in environment variables
2. Re-run `sendTransactionalEmail` function manually for critical emails:
   - Trial expiring notifications
   - Payment failed alerts

**Communication:**
- Email: "Transactional emails temporarily delayed. We're investigating."
- Status page: "Email delivery degraded"

---

### ⚠️ MEDIUM: High Error Rate

**If:** dailySystemHealthCheck reports error_rate > 1%

**Immediate action:**
1. Check last 100 function logs for error patterns
2. Identify which function(s) are failing
3. Are errors in new code or existing?

**If recent deployment:**
- Rollback to previous version immediately
- Test in staging first before re-deploying

**If widespread errors:**
1. Check database connection pool
2. Check Stripe/SendGrid API status
3. Check if rate limits exceeded

**Communication:**
- Post to status page: "Some features temporarily unavailable"
- Email support team: "Increased error rate, investigating"

---

### ℹ️ INFO: Low-Priority Alerts

**Response time p95 > 1 second:**
- Not critical, log for monitoring
- Check if customer count has spiked
- Consider scaling if sustained

**Backup size smaller than expected:**
- Check S3 bucket for upload
- Verify encryption succeeded
- Not critical unless backup missing entirely

**Low trial conversion rate:**
- Monitor through week, not daily action
- Use for product/marketing feedback

---

## Responding to Customer Issues

### Customer can't access dashboard after trial ends

**Check:**
```
SELECT * FROM Charity WHERE id = 'charity_xxx';
subscription_status = 'past_due'?
trial_ends_date = today or earlier?
```

**Fix:**
1. Verify payment method on file in Stripe
2. If payment failed 3x: send "upgrade now" email
3. If customer wants to upgrade: 
   - Update subscription_tier in Charity
   - Set subscription_status = 'active'
   - Send access restored email

### Email not received

**Check:**
```
SELECT * FROM EmailLog WHERE charity_id = 'xxx' AND created_date > NOW() - INTERVAL 1 HOUR;
status = 'sent'?
error_message = ?
```

**If status='failed':**
- Check error_message for reason
- Common: invalid email address, SendGrid bounce
- Re-send manually once customer confirms email

**If status='sent' but not received:**
- Check spam folder
- Check if email is on SendGrid bounce list
- Update customer email and resend

### Rate limit error (429)

**Check:**
```
SELECT * FROM UsageMetric WHERE charity_id = 'xxx' AND metric_type = 'api_call' AND created_date > NOW() - INTERVAL 1 HOUR;
COUNT(*) = ?
```

**If at/over limit:**
- Customer has used all API calls for this month
- Options:
  1. Wait for monthly reset (next 1st of month)
  2. Upgrade to higher tier
  3. Contact sales for custom limit

**If below limit but still getting 429:**
- Check rate limiting window (default 1 hour)
- They may have made all calls within 1 hour
- Explain: "Rate limit resets every hour"

---

## Monitoring Metrics (via SaaSMetricsDashboard)

**Track daily:**
- **MRR:** Should be stable (not negative)
- **New customers:** Should increase over time
- **Churn rate:** Should be < 5% (industry standard)
- **Failed payments:** Should be < 2% of attempts

**Red flags:**
- MRR decreasing (customers churning faster than new signups)
- Failed payments increasing (payment system issue?)
- Error rate > 1% (bugs in code?)

**Actions:**
- Churn > 5%: Email churning customers with recovery offer
- Error rate > 1%: Debug immediately
- Failed payments > 5: Check Stripe account health

---

## End-of-Day Checklist (5 PM)

```
[ ] All critical alerts resolved? (if any)
[ ] New error logs investigated?
[ ] Any customer issues reported in support?
[ ] Tomorrow's automation schedule clear? (check calendar)
[ ] Backup verified completed?
```

**Handoff to next on-call:**
- Update incident log if any issues occurred
- Share status of any ongoing investigations

---

## Weekly Review (Monday 10 AM)

**Before reading weekly report:**
1. Check business metrics dashboard
2. Review customer health scores
3. Look at top support tickets

**From weekly report email:**
- Note MRR target vs actual
- Identify churn patterns
- Check for any missed goals

**Actions:**
- If churn high: plan win-back campaign
- If growth slow: review marketing/sales funnel
- If error rate elevated: schedule code review

---

## Escalation Matrix

| Issue | First Responder | Escalate if | Escalate to |
|-------|-----------------|-------------|------------|
| Email down | On-call eng | Not fixed in 30 min | DevOps lead |
| Payment down | On-call eng | Not fixed in 15 min | CEO |
| Data breach | On-call eng | Any breach confirmed | Legal + CEO |
| API down | On-call eng | Not fixed in 10 min | Platform team |
| High errors | On-call eng | Persists > 1 hour | Engineering lead |
| Customer angry | Support | Complex issue | Account manager |

---

## Contact List

```
On-call Engineer: [slack: #oncall]
DevOps Lead: [phone: +44-xxx-xxx]
CEO: [phone: +44-xxx-xxx]
Legal: [email: legal@charityhub.com]
Support Lead: [email: support@charityhub.com]
Stripe Support: https://support.stripe.com
SendGrid Support: https://support.sendgrid.com
```

---

## First 30 Days Focus

**Week 1:** Stability + quick wins
- Zero critical errors
- All automations running
- All emails delivering
- First 10 customers happy

**Week 2-3:** Optimization
- Fine-tune rate limits if needed
- Review feature gate settings
- Optimize API response times
- Collect customer feedback

**Week 4:** Scale + plan
- Prepare for 100+ customers
- Review cost metrics
- Plan feature roadmap
- Schedule retrospective