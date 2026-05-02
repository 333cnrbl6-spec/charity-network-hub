# Critical Path Test Suite

Run these tests in order before launch to verify the complete user journey.

## Test 1: Complete Trial → Payment → Invoice Flow

```
Start: User signs up
End: Invoice created and email sent

Steps:
1. Create test charity via SignUp (charity@test.co.uk)
2. Verify Charity record created with:
   - subscription_tier: 'starter'
   - subscription_status: 'trial'
   - trial_ends_date: 30 days from today
   - stripe_customer_id: populated
3. Wait 5 seconds
4. Call sendTransactionalEmail function with email_type='trial_expiring', days=25
5. Verify EmailLog created with status='sent'
6. Manually trigger payment via Stripe test card: 4242 4242 4242 4242
7. Check Stripe webhook is processed (handleStripeWebhookSecure)
8. Verify Invoice status='paid'
9. Verify email sent: payment_retry template
```

**Expected Outcome:** All steps complete, no errors, emails delivered

---

## Test 2: Payment Failure & Auto-Retry

```
Start: Failed payment attempt
End: Auto-retry succeeds or notifies user

Steps:
1. Create test charity with declined Stripe card: 4000 0000 0000 0002
2. Attempt payment (will fail)
3. Verify Invoice created with status='overdue', retry_count=0
4. Verify email sent: payment_failed template
5. Wait 1 minute
6. Manually call retryFailedPayments function
7. Verify retry_count incremented
8. If 3rd retry, verify Charity marked subscription_status='past_due'
9. Check SecurityAuditLog created with event_type='payment_failure'
```

**Expected Outcome:** Retries work, customer gets notified after 3 attempts fail

---

## Test 3: Trial Expiration & Access Block

```
Start: Trial ends today
End: Customer blocked from using app

Steps:
1. Create charity with trial_ends_date=today
2. Call checkTrialExpiration function
3. Verify email sent: trial_expiring with days=0
4. Verify Charity updated: subscription_status='past_due'
5. Try to access dashboard as that user
6. Verify 403 error or paywall shown
7. User upgrades to Professional tier
8. Verify subscription_status='active', access restored
```

**Expected Outcome:** Trial lock works, upgrade restores access

---

## Test 4: Feature Gating by Tier

```
Start: User on 'starter' tier tries premium feature
End: Request denied with upgrade prompt

Steps:
1. Create charity with subscription_tier='starter'
2. Call enforceFeatureGate with feature_name='data_export'
3. Check response: allowed=false, message mentions 'professional tier'
4. Verify UsageMetric NOT created (request rejected)
5. Upgrade charity to 'professional'
6. Call enforceFeatureGate again
7. Verify allowed=true, UsageMetric created
8. Attempt 101st export (limit is 100 for professional)
9. Verify 101st denied with current_usage=101, limit=100
```

**Expected Outcome:** Feature gates enforce tier limits correctly

---

## Test 5: Data Isolation (Security)

```
Start: User A tries to access User B's data
End: Request denied, SecurityAuditLog created

Steps:
1. Create 2 test charities: charity_a@test.co.uk, charity_b@test.co.uk
2. Add donors to both charities
3. Log in as User A
4. Try to query Donors belonging to charity_b (different charity_id)
5. Verify response is empty or 403 error
6. Check SecurityAuditLog for event_type='data_isolation_breach'
7. Verify no data leak occurred
```

**Expected Outcome:** Cross-tenant access is impossible

---

## Test 6: Email System

```
Start: Various email types triggered
End: All delivered successfully

Steps:
1. Trigger invoice email: sendTransactionalEmail(email_type='invoice', ...)
2. Trigger trial_expiring: sendTransactionalEmail(email_type='trial_expiring', days=7)
3. Trigger payment_failed: sendTransactionalEmail(email_type='payment_failed', ...)
4. Trigger payment_retry: sendTransactionalEmail(email_type='payment_retry', ...)
5. Check EmailLog for all 4 entries
6. Verify status='sent' (not 'failed')
7. Go to test email inbox: verify emails arrived in < 30 seconds
8. Verify HTML formatting is correct
9. Verify from_name='CharityHub', from_email='noreply@charityhub.com'
10. Verify footer with copyright notice
```

**Expected Outcome:** All email types sent with correct formatting

---

## Test 7: Rate Limiting

```
Start: User makes > limit API calls
End: 429 Too Many Requests returned

Steps:
1. Create charity with subscription_tier='starter' (api_calls limit=1000/hour)
2. Make 1001 API calls to /api/something in < 1 minute
3. Verify 1000th call succeeds
4. Verify 1001st returns 429 status
5. Check response headers include 'Retry-After' and 'X-RateLimit-Remaining'
6. Verify UsageMetric entries created for each call
7. Wait 1 hour
8. Verify rate limit resets, can make calls again
```

**Expected Outcome:** Rate limiting works without blocking legitimate users

---

## Test 8: Backup Snapshot

```
Start: Daily backup scheduled
End: Backup verified and restorable

Steps:
1. Call createBackupSnapshot function manually
2. Verify backup created with status='completed'
3. Check S3 bucket for backup file
4. Verify file is encrypted (check object metadata)
5. Download backup file
6. Verify file integrity (SHA256 checksum)
7. Decompress and spot-check contents
8. Verify retention_until is 30 days from now
```

**Expected Outcome:** Backups create, encrypt, and retain correctly

---

## Automated Test Function

Call this function to run all tests and generate a report:

```javascript
await base44.functions.invoke('runCriticalPathTests', {
  test_mode: 'comprehensive', // or 'quick' for 5-min run
  email_test_inbox: 'qa@charityhub.com'
});
```

Response:
```json
{
  "status": "all_passed",
  "tests": {
    "trial_to_payment": "✅ PASS",
    "payment_failure_retry": "✅ PASS",
    "trial_expiration": "✅ PASS",
    "feature_gating": "✅ PASS",
    "data_isolation": "✅ PASS",
    "email_system": "✅ PASS",
    "rate_limiting": "✅ PASS",
    "backup_snapshot": "✅ PASS"
  },
  "timestamp": "2026-05-02T10:30:00Z",
  "duration_seconds": 245
}
``