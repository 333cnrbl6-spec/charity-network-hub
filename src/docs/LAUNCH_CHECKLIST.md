# CharityHub SaaS Launch Checklist

**Date:** 2026-05-02  
**Status:** Pre-Launch

## Phase 1: Secrets & Configuration (BEFORE Code Deploy)
- [ ] Set SENDGRID_API_KEY in dashboard → Settings → Environment Variables
- [ ] Set STRIPE_SECRET_KEY in dashboard → Settings → Environment Variables
- [ ] Set STRIPE_WEBHOOK_SECRET in dashboard → Settings → Environment Variables
- [ ] Verify all 3 secrets are active (test with `verifySecretsConfigured` function)
- [ ] Configure Stripe webhook endpoint: `https://yourdomain.com/webhooks/stripe`

## Phase 2: Database Seeding
- [ ] Run `seedDefaultPolicies` automation (should auto-run daily at 00:30 UTC)
- [ ] Verify FeatureGate records exist: api_calls, data_export, ai_generation, team_members, custom_branding
- [ ] Verify DataRetentionPolicy records exist for AuditLog (365d), EmailLog (90d), SecurityAuditLog (730d)
- [ ] Check Charity subscription_tier defaults to 'starter'

## Phase 3: Critical Path Testing
- [ ] Test complete flow: Signup → Trial Created → 7-day reminder email → Payment → Invoice
- [ ] Test payment failure: Force declined card → Retry notification → Auto-retry in 3 days
- [ ] Test trial expiration: Set trial_ends_date to today → Check if user is blocked
- [ ] Test feature gating: Attempt API call as 'starter' user → Verify limit enforced
- [ ] Test data isolation: User A tries to query User B's data → Verify access denied
- [ ] Test email sending: Check EmailLog entries are created and status is 'sent'

## Phase 4: Security Hardening
- [ ] Verify CORS headers restrict to https://app.charityhub.com
- [ ] Verify X-Frame-Options: DENY (prevents clickjacking)
- [ ] Verify CSP header is set (Content-Security-Policy)
- [ ] Verify HSTS header forces HTTPS (Strict-Transport-Security)
- [ ] Verify all API endpoints require authentication
- [ ] Run `validateDataIsolation` automation (runs weekly Sundays 01:00 UTC)

## Phase 5: Backup & Disaster Recovery
- [ ] Configure S3 bucket for backups with encryption
- [ ] Set bucket lifecycle policy: Retain backups for 30 days, delete after
- [ ] Run first manual backup via `createBackupSnapshot` function
- [ ] Test restore procedure: Download backup, verify integrity
- [ ] Document backup recovery steps in runbook

## Phase 6: Monitoring & Alerting
- [ ] Set up Sentry/error logging integration (optional but recommended)
- [ ] Configure email alerts for: payment failures > 2, data isolation breach, rate limit abuse
- [ ] Set up dashboard monitoring: MRR, churn rate, failed payments
- [ ] Create on-call rotation for critical alerts

## Phase 7: Public Launch
- [ ] Deploy PublicLandingPage to `/landing` route
- [ ] Point domain DNS to app: charityhub.com → app.base44.com
- [ ] Enable SSL/TLS certificate (auto via platform)
- [ ] Set up Stripe test → production migration
- [ ] Create initial test charity account (for manual QA)
- [ ] Run smoke tests (see SMOKE_TESTS.md)

## Phase 8: Post-Launch (Day 1-7)
- [ ] Monitor error logs for crashes
- [ ] Check MRR/ARR dashboard daily
- [ ] Watch for payment failures and retry success rate
- [ ] Review first customer support tickets
- [ ] Check email delivery rate (should be >95%)
- [ ] Verify automations ran: checkTrialExpiration, retryFailedPayments, calculateSaaSMetrics

## Phase 9: Scaling (Week 2+)
- [ ] Monitor response times as customer count grows
- [ ] Check rate limiting isn't triggering legitimate users
- [ ] Review feature usage: which features are customers using?
- [ ] Plan feature improvements based on usage data
- [ ] Begin customer onboarding calls for feedback

---

## GO/NO-GO Decision Criteria

**LAUNCH is GO if:**
✅ All Phase 1-4 checkboxes complete  
✅ Critical path tests pass  
✅ No security vulnerabilities found  
✅ Email sending works reliably  
✅ Stripe webhook integration tested  

**DELAY LAUNCH if:**
❌ Secrets missing or invalid  
❌ Email sending fails  
❌ Data isolation breach detected  
❌ Critical bugs in payment flow  

---

## Troubleshooting

**Email not sending?**
- Check SENDGRID_API_KEY is valid: `verifySecretsConfigured` function
- Check EmailLog table for error_message
- Verify recipient email isn't on SendGrid bounce list

**Payment failing?**
- Verify Stripe keys are for correct environment (test vs. live)
- Check Stripe webhook endpoint is registered and responding with 200
- Look at Stripe dashboard → Events for webhook errors

**Rate limiting too aggressive?**
- Edit tier_limits in FeatureGate records
- Check enforceRateLimitMiddleware function for window size (default 1 hour)

**Customers can't sign up?**
- Check trial_ends_date is being set correctly (30 days from today)
- Verify Stripe customer_id is saved to Charity record
- Check onboarding flow isn't failing silently