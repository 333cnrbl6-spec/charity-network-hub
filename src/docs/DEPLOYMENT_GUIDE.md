# Deployment & Launch Guide

## Pre-Deployment Checklist (48 hours before)

- [ ] Run LAUNCH_CHECKLIST.md phases 1-5
- [ ] Complete CRITICAL_PATH_TESTS.md
- [ ] Notify team: deployment happening at [DATE/TIME]
- [ ] Prepare rollback plan (see Rollback section below)
- [ ] Set up on-call rotation for launch day

## Step 1: Verify Secrets (2 hours before)

```bash
# Call verification function
await base44.functions.invoke('verifySecretsConfigured', {
  required_keys: ['SENDGRID_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']
});
```

Expected response:
```json
{
  "all_configured": true,
  "sendgrid": { "valid": true, "status": "ready" },
  "stripe": { "valid": true, "status": "ready" },
  "ready_to_launch": true
}
```

**If any secret is missing:** Do NOT proceed. Set secrets and re-verify.

---

## Step 2: Seed Default Policies (1.5 hours before)

```bash
# Manually trigger policy seeding
await base44.functions.invoke('seedDefaultPolicies', {});
```

Verify in database:
- [ ] 5 FeatureGate records exist
- [ ] 4 DataRetentionPolicy records exist

---

## Step 3: Set Stripe Webhook (1 hour before)

1. Go to Stripe Dashboard → Webhooks
2. Create new endpoint:
   - **URL:** `https://charityhub.com/webhooks/stripe` (use your actual domain)
   - **Events:** `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription_deleted`
3. Copy **Signing Secret** to STRIPE_WEBHOOK_SECRET environment variable
4. Test: Send test event from Stripe dashboard
5. Check function logs for successful processing

---

## Step 4: Configure DNS (1 hour before)

**Point your domain to Base44:**

If using custom domain (charityhub.com):
1. Dashboard → Settings → Custom Domain
2. Add: charityhub.com
3. Update DNS registrar:
   ```
   CNAME charityhub.com → app.base44.com
   ```
4. Wait for DNS to propagate (5-15 minutes)
5. Verify: `curl https://charityhub.com` returns 200 status

---

## Step 5: Enable Production Stripe Keys (30 min before)

**⚠️ CRITICAL:** Do NOT do this in test environment first

1. Stripe Dashboard → API Keys
2. Switch to **Live Keys** tab
3. Copy **Secret Key** and **Webhook Signing Secret** to environment variables
4. Test with small transaction first (£0.01)
5. Verify invoice appears in production account

---

## Step 6: Launch Public Landing Page (15 min before)

Deploy `/landing` route:
- Verify PublicLandingPage component is imported in App.jsx
- Check `/landing` route exists
- Test all CTA links point to correct signup flow

---

## Step 7: Run Final Smoke Tests (10 min before)

```bash
await base44.functions.invoke('smokeTest', {
  endpoints: [
    'GET /landing',
    'POST /api/signup',
    'GET /api/charity/:id',
    'POST /webhooks/stripe'
  ]
});
```

All endpoints must return 200 or 201.

---

## Step 8: GO LIVE

**30 min before → actual launch:**

1. Send Slack notification: "CharityHub going live in 30 minutes"
2. Verify everyone is ready
3. **Toggle app visibility:** Dashboard → Settings → Public Access → Enable
4. Monitor logs for errors (first 5 minutes are critical)
5. Check customer health dashboard (should show 0 active customers initially)
6. Test complete signup flow as real user
7. Announce on social media / website

---

## Launch Day Monitoring (Hour 1-4)

Monitor these metrics every 5 minutes:

- **Error rate:** Should be < 0.1%
- **API response time:** Should be < 500ms p95
- **Payment processing:** Any failed payments?
- **Email delivery:** Are signup confirmations reaching users?
- **Support tickets:** Any immediate complaints?

**If error rate > 1%:** Investigate immediately before continuing

---

## Post-Launch (Day 1-7)

**Daily checklist:**
- [ ] 9 AM: Check overnight error logs
- [ ] Review new customer signups
- [ ] Test email delivery (at least 1 email per day)
- [ ] Check MRR dashboard (should show trial customers)
- [ ] Any support tickets? Respond within 1 hour
- [ ] 5 PM: Run backup verification

**Weekly (after launch week):**
- [ ] Analyze customer usage patterns
- [ ] Feature gate hit rates (are limits appropriate?)
- [ ] Churn rate (trial → paid conversion)
- [ ] Customer feedback survey

---

## Rollback Plan

If critical bug found in first hour:

1. **Immediate:** Disable signup (set public_access=false)
2. **Notify customers:** Email to anyone who signed up in last hour
3. **Investigate:** Check error logs and database state
4. **Fix:** Deploy hotfix
5. **Re-test:** Run critical path tests again
6. **Re-launch:** Re-enable public access

**Rollback commands:**
```bash
# Disable signups immediately
UPDATE Charity SET subscription_status='suspended' WHERE created_date > NOW() - INTERVAL 1 HOUR;

# Revert to previous code version (if base44 supports)
dashboard → Deployments → Rollback to [previous version]
```

---

## Support Escalation

**During first 24 hours, escalation path:**

1. **0-15 min response:** On-call engineer checks Slack
2. **15-30 min:** Acknowledge customer, investigate
3. **30-60 min:** Fix deployed or workaround provided
4. **If critical:** Call on-call manager

**Critical issues:** Payment processing broken, data loss, security breach

---

## Success Criteria

Launch is **successful** when:

✅ Zero payment processing errors  
✅ Email delivery rate > 95%  
✅ API error rate < 0.5%  
✅ No security breaches detected  
✅ First 10 customers signed up successfully  
✅ Data isolation audit passed  

---

## Post-Launch Communication

**Email to early customers:**
```
Subject: CharityHub is now live!

Hi there,

We're excited to announce that CharityHub is now available to the public.

Start your free 30-day trial today: https://charityhub.com/landing

Questions? Email support@charityhub.com or visit our help center.

Best,
The CharityHub Team
``