# Post-Launch Automation Setup

These automations run automatically after deployment. Configure them via the Base44 dashboard.

## Automation 1: Trial Expiration Check (Daily)

**Frequency:** Every day at 00:30 UTC (00:30 GMT)  
**Function:** `checkTrialExpiration`  
**Purpose:** Email customers 7 days before trial ends; block access on trial end date

```
Schedule: Daily at 00:30 UTC
Function: checkTrialExpiration
Function Args: { days_before_warning: 7 }
```

**What it does:**
1. Find all charities with trial_ends_date within 7 days
2. Send "trial expiring" email if not already sent
3. Find charities with trial_ends_date = today
4. Set subscription_status = 'past_due' to block access
5. Send "trial expired" email

---

## Automation 2: Failed Payment Retry (Every 3 days)

**Frequency:** Every 3 days at 02:00 UTC  
**Function:** `retryFailedPayments`  
**Purpose:** Auto-retry failed payments up to 3 times before cancelling

```
Schedule: Every 3 days at 02:00 UTC
Function: retryFailedPayments
Function Args: { max_retries: 3, retry_interval_days: 3 }
```

**What it does:**
1. Find invoices with status='overdue', retry_count < 3
2. Attempt charge via Stripe
3. If success: update invoice status='paid', send payment confirmation email
4. If fail: increment retry_count, send retry notification
5. If 3rd retry fails: mark subscription_status='past_due'

---

## Automation 3: SaaS Metrics Calculation (Daily)

**Frequency:** Every day at 01:00 UTC  
**Function:** `calculateSaaSMetrics`  
**Purpose:** Calculate MRR, ARR, churn, CAC, LTV for reporting

```
Schedule: Daily at 01:00 UTC
Function: calculateSaaSMetrics
Function Args: { metric_date: "today" }
```

**What it does:**
1. Count active subscriptions (subscription_status='active')
2. Count trial customers (subscription_status='trial')
3. Sum monthly revenue from all paid subscriptions
4. Calculate ARR (MRR × 12)
5. Calculate churn rate (cancellations / active customers)
6. Calculate CAC (marketing spend / new customers)
7. Calculate LTV (ARPU / monthly churn rate)
8. Store all in SaaSMetric entity
9. Alert if churn > 5%

---

## Automation 4: Daily Backup Snapshot (Every day)

**Frequency:** Every day at 03:00 UTC  
**Function:** `createBackupSnapshot`  
**Purpose:** Daily encrypted backup to S3 with 30-day retention

```
Schedule: Daily at 03:00 UTC
Function: createBackupSnapshot
Function Args: { 
  retention_days: 30,
  compress: true,
  encrypt: true 
}
```

**What it does:**
1. Export all entities (Charity, Donor, Campaign, etc.)
2. Compress as .tar.gz
3. Encrypt with AES-256
4. Upload to S3 with unique timestamp
5. Set retention_until = 30 days from now
6. Delete backups older than 30 days
7. Log backup status to SystemStatus

---

## Automation 5: Data Retention Cleanup (Weekly)

**Frequency:** Every Sunday at 04:00 UTC  
**Function:** `dataRetentionCleanup`  
**Purpose:** Delete old logs per retention policy

```
Schedule: Weekly (Sunday) at 04:00 UTC
Function: dataRetentionCleanup
Function Args: { dry_run: false }
```

**What it does:**
1. Check DataRetentionPolicy table
2. For AuditLog: delete records older than 365 days
3. For EmailLog: delete records older than 90 days
4. For SecurityAuditLog: delete records older than 730 days
5. Update DataRetentionPolicy.last_cleanup timestamp
6. Log cleanup results to SystemStatus

---

## Automation 6: Data Isolation Security Audit (Weekly)

**Frequency:** Every Sunday at 01:00 UTC  
**Function:** `validateDataIsolation`  
**Purpose:** Verify no cross-tenant data leaks occurred

```
Schedule: Weekly (Sunday) at 01:00 UTC
Function: validateDataIsolation
Function Args: { alert_on_breach: true }
```

**What it does:**
1. For each user, verify they can only see their own charity's data
2. Check all API logs for any cross-tenant queries
3. Look for suspicious patterns (e.g., user querying 10+ different charity_ids)
4. If breach detected: create SecurityAuditLog, send alert email to admins
5. Generate report: "No breaches detected" or list violations

---

## Automation 7: System Health Check (Every 6 hours)

**Frequency:** Every 6 hours  
**Function:** `dailySystemHealthCheck`  
**Purpose:** Monitor system status, error rates, response times

```
Schedule: Every 6 hours
Function: dailySystemHealthCheck
Function Args: { }
```

**What it does:**
1. Check API response times (p95, p99)
2. Calculate error rate (errors / total requests)
3. Verify Stripe webhook connectivity
4. Verify SendGrid email delivery
5. Check database connection pool
6. If error_rate > 1%: alert ops team
7. If API p95 > 1 second: log warning
8. Update SystemStatus entity with current health

---

## Automation 8: Customer Health Score Calculation (Daily)

**Frequency:** Every day at 02:30 UTC  
**Function:** `calculateCustomerHealth`  
**Purpose:** Predict churn risk, identify at-risk customers

```
Schedule: Daily at 02:30 UTC
Function: calculateCustomerHealth
Function Args: { alert_on_churn_risk: true }
```

**What it does:**
1. For each active customer, calculate health_score (0-100):
   - Last login > 30 days ago: -20 points
   - Feature usage < 10% of limit: -15 points
   - Open support tickets > 2: -10 points
   - Recent upgrade: +20 points
   - High API usage: +15 points
2. Categorize: healthy (>70), at_risk (40-70), churning (<40)
3. If at_risk: trigger outreach email
4. If churning: alert account manager
5. Store results in CustomerHealth entity

---

## Automation 9: Scheduled Weekly Report (Weekly)

**Frequency:** Every Monday at 09:00 UTC  
**Function:** `scheduleWeeklyReport`  
**Purpose:** Email business metrics to team

```
Schedule: Weekly (Monday) at 09:00 UTC
Function: scheduleWeeklyReport
Function Args: { 
  recipients: ['ops@charityhub.com', 'ceo@charityhub.com'],
  report_type: 'business_metrics'
}
```

**What it does:**
1. Compile metrics from SaaSMetric (MRR, ARR, churn, new customers)
2. Count signups, payments, failed payments
3. Summarize customer health scores
4. List any active incidents
5. Generate PDF report
6. Email to team with key highlights

---

## Setup Instructions

### Via Base44 Dashboard

1. **Go to:** Settings → Automations
2. **Create automation for each #1-9 above**
3. **Test each one:**
   - Click "Run now" to test before scheduled time
   - Check function logs for success/failure
   - Verify data written to relevant entities

### Verify Automations Running

Check logs:
```
Dashboard → Logs → Function Invocations → Filter by function name
```

Example output:
```
checkTrialExpiration: ✅ Completed (127 emails sent)
retryFailedPayments: ✅ Completed (3 retried, 2 succeeded)
calculateSaaSMetrics: ✅ Completed (MRR: £4,200)
```

---

## Monitoring Automations

**Daily checklist (9 AM):**
- [ ] Check all 9 automations ran successfully
- [ ] Review error logs (should be zero)
- [ ] Spot-check CustomerHealth calculations
- [ ] Verify backup completed

**Weekly checklist (Monday 10 AM):**
- [ ] Review business metrics report
- [ ] Check data retention cleanup (records deleted?)
- [ ] Review security audit results
- [ ] Any churn risk alerts? Follow up with customers

**If automation fails:**
1. Click "View Logs" in automation detail
2. Check error message
3. Common issues:
   - **Network error:** Retry in 5 minutes
   - **Invalid secret:** Update environment variable
   - **Rate limit exceeded:** Function hit Stripe/SendGrid limit; will retry automatically
4. If recurring: contact support

---

## Automation Schedule Overview (UTC Times)

```
00:30 → Trial expiration check
01:00 → SaaS metrics calculation
01:00 → Data isolation audit (Sunday only)
02:00 → Failed payment retry (every 3 days)
02:30 → Customer health calculation
03:00 → Daily backup snapshot
04:00 → Data retention cleanup (Sunday only)
06:00 → System health check
09:00 → Weekly report (Monday only)
```

---

## Alert Thresholds

These automations trigger alerts if:

| Alert | Threshold | Action |
|-------|-----------|--------|
| High error rate | > 1% | Email ops team |
| Churn > target | > 5% monthly | Email CEO + ops |
| Payment failure | 3 consecutive failures | Email customer + ops |
| Data isolation breach | Any breach detected | CRITICAL: Email + lock account |
| Backup failed | Backup size < 1MB | Email ops team |
| Response time p95 | > 1 second | Log warning (non-critical) |