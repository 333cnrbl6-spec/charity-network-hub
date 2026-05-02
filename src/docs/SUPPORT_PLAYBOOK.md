# CharityHub Support Playbook

**Use this to handle common customer issues quickly and professionally.**

---

## 🎯 Top 10 Support Issues (& Quick Fixes)

---

### 1. "I can't log in"

**Quick Diagnosis:**
1. Ask: Did you receive the sign-up confirmation email?
2. Ask: Are you using the correct email address?
3. Have them check spam folder

**Solutions:**
- **No confirmation email:** Resend email verification → dashboard admin panel → User → Resend Email
- **Forgot password:** Direct to password reset link
- **Still can't log in:** Clear browser cache (Ctrl+Shift+Del) and try again
- **Still broken:** Reset manually via admin dashboard:
  - Go to Admin → Users → Find their account → Reset Password
  - Send them new temporary password via email

**Escalation:** If >10 users report this simultaneously → possible authentication service outage

---

### 2. "AI grant writing isn't working"

**Quick Diagnosis:**
1. Check: Are they on Professional tier? (AI is Professional+ only)
2. Check: Have they filled in grant details properly?
3. Check: Are there any console errors? (Ask them to open DevTools → Console)

**Solutions:**
- **Not Professional tier:** Upsell to Professional, explain feature
- **Grant details missing:** Ask them to fill in:
  - Grant name
  - Funder name
  - Amount
  - Deadline
  - Project description
- **LLM timeout (>30 seconds):** Retry in 5 minutes (LLM service may be overloaded)
- **Error response:** Check logs:
  ```bash
  # Check recent LLM errors
  grep "generateGrantApplication" logs/production.log | tail -20
  ```

**Workaround:** Provide AI-generated template manually while investigating

---

### 3. "My compliance dashboard shows red for everything"

**Quick Diagnosis:**
1. Check: Is it their first time using the app? (New charities show all red until data added)
2. Ask: Did they recently update their charity profile?

**Solutions:**
- **New charity:** Explain: "Red means 'needs action'. Click each item to add due dates and track."
- **Just updated:** Dashboard may need 5-minute refresh. Have them:
  1. Close and reopen browser
  2. Or refresh page (Ctrl+R)
- **Still showing red after data added:** Check database:
  ```bash
  psql $DATABASE_URL -c "SELECT * FROM ComplianceRecord WHERE charity_id = '<their-id>';"
  ```
  If records missing → manually recreate via admin panel

---

### 4. "PDF export isn't working"

**Quick Diagnosis:**
1. Check: Are they on Professional tier? (PDF export requires Professional+)
2. Ask: Did they see any error message?
3. Check: How many donors/campaigns do they have? (>10k may timeout)

**Solutions:**
- **Not Professional tier:** Upsell or suggest screenshot alternative
- **PDF takes >10 seconds:** May timeout. Ask them to:
  - Try again at quieter time (less server load)
  - Filter to fewer records first
- **Blank PDF:** Check logs:
  ```bash
  grep "PDFReportExporter" logs/production.log | grep charity_id=<their-id>
  ```
- **Stuck on "Generating...":** May be browser cache. Have them:
  - Clear cache (Ctrl+Shift+Del)
  - Try a different browser
  - Try incognito window

---

### 5. "I can't see my donors/campaigns"

**Quick Diagnosis:**
1. Ask: Did you recently switch accounts? (May be viewing different charity)
2. Ask: Did you create them? Or is someone else's data?
3. Check: Pagination — are they on page 1?

**Solutions:**
- **Multiple charities:** Ask which charity — data is charity-specific
- **Just created:** May need 10-second refresh (React Query cache)
- **> 50 donors:** Pagination enabled. Ask them to check:
  - Page number at bottom
  - Search/filter to find specific donor
- **Still missing:** Check database:
  ```bash
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM Donor WHERE charity_id = '<id>';"
  ```

---

### 6. "Donation shows in one place but not another"

**Quick Diagnosis:**
1. They're likely looking at different views (campaign view vs. donor view vs. analytics)
2. Ask: Which page shows it missing?

**Solutions:**
- **Missing from donor detail:** Donation may not be linked to donor. In admin:
  - Find donation record
  - Verify donor_id matches
  - Update if needed
- **Missing from analytics:** Analytics may need 5-min cache refresh
- **Wrong amount/date:** Edit donation in UI, verify database updated:
  ```bash
  psql $DATABASE_URL -c "SELECT * FROM Donation WHERE id = '<donation-id>';"
  ```

**Root Cause:** Usually data entry error or cache issue. Rarely a real sync problem.

---

### 7. "The app is really slow"

**Quick Diagnosis:**
1. Ask: Which page is slow? (Dashboard, analytics, grants, etc.)
2. Ask: How many donors/campaigns do they have?
3. Check: Server metrics. Is server under load?

**Solutions:**
- **Dashboard with 10k+ records:** Expected to be slow. Ask them to:
  - Filter by campaign
  - Export and archive old data
  - Upgrade plan if bottleneck continues
- **Server overloaded:** Check monitoring:
  ```bash
  # Check server CPU/memory
  # Use your hosting provider's dashboard (AWS, Vercel, etc.)
  ```
  If >80% utilization: Scale up or contact hosting provider
- **Network issue:** Ask them to:
  - Throttle to slow 3G in DevTools to see if they have network issue
  - Try from different location (WiFi vs. mobile)
  - Clear browser cache

---

### 8. "We can't process donations"

**Quick Diagnosis:**
1. **CRITICAL:** Check Stripe status → https://status.stripe.com
2. Ask: What error do they see? (Card declined, connection error, timeout?)
3. Check: Is Stripe webhook responding?

**Solutions:**
- **Stripe down:** Wait 5-10 min, test again. Post to status page.
- **Card declined:**
  - Ask if card is valid (not expired)
  - Ask if card has sufficient funds
  - Try different card
  - Contact their bank
- **Connection timeout:** Likely network issue:
  - Try again in 5 minutes
  - Try from different network
  - Clear cookies and retry
- **Webhook not responding:** CRITICAL ISSUE:
  ```bash
  # Check webhook logs
  tail -f logs/stripe_webhooks.log
  # If stuck: restart webhook handler
  # (Instructions depend on your architecture)
  ```

**Escalation:** If affecting >5% of transactions → page on-call engineer

---

### 9. "My team member can't access our charity"

**Quick Diagnosis:**
1. Ask: Have you invited them? (Check in Charity → Team Settings)
2. Ask: Did they receive invitation email?
3. Check: What's their role? (May have limited permissions)

**Solutions:**
- **Not invited:** Invite them via Charity → Team Settings → Add Member
- **Didn't receive email:** Check:
  - Spam folder
  - Resend invitation
  - Verify email address correct
- **Wrong permissions:** Check role in Team Settings:
  - Admin: Can do everything
  - Manager: Can view/edit data, manage team, no billing
  - Viewer: Read-only
  - Adjust as needed
- **Still can't access:** Reset via admin:
  - Admin panel → Users → Find their account → Resend invitation
  - Or manually update user role in database

---

### 10. "Are you GDPR compliant?"

**Quick Diagnosis:**
This is a sales/compliance question, not a technical issue.

**Solution:**
Direct to compliance page: `/charity-compliance`

Assure them:
- ✅ UK GDPR certified
- ✅ Data stored in UK only
- ✅ Donor records encrypted
- ✅ No data sold or shared
- ✅ Full data export/delete on request
- ✅ ISO 27001 certification in progress

If they want full DPA or security audit → escalate to [Compliance Lead]

---

## 📞 Escalation Path

**Level 1 (You):** Handle with scripts above
- Response time: <1 hour
- Can reset passwords, resend emails, check basic logs

**Level 2 (Engineering):** Technical deep-dive
- Response time: <4 hours
- Can access databases, check error logs, diagnose system issues
- Examples: Data corruption, webhook failures, database performance

**Level 3 (Leadership):** Business/legal issues
- Response time: <24 hours
- Billing disputes, contract issues, compliance audits, press inquiries
- Examples: "Stripe charged us twice", "We need SOC 2 cert", "Media coverage"

---

## 🎤 Communication Templates

### Quick Fix (Expected to resolve in 5 min)
```
Hi [Name],

Thanks for letting us know! Quick fix:

[Solution from playbook above]

Let me know if that works. Happy to help further.

Best,
[Your name]
```

### Deep Dive Needed (Need to investigate)
```
Hi [Name],

Thanks for reporting this. I'm looking into it now.

In the meantime, here's what you can try: [Quick workaround]

I'll come back to you within 4 hours with a solution.

Best,
[Your name]
```

### Bad News (We broke something)
```
Hi [Name],

Apologies — we've identified an issue affecting PDF exports for users with 10k+ donors. We're working on a fix now (ETA 2 hours).

In the meantime, here's a workaround: [Workaround]

We'll notify you as soon as it's fixed. Thank you for your patience.

Best,
[Your name]
```

---

## 📊 Support Metrics to Track

- **Response time:** Target <1 hour for all issues
- **Resolution time:** Target <4 hours for 80% of issues
- **Escalation rate:** Track % of issues going to Level 2/3
- **Customer satisfaction:** Send feedback survey after each issue
- **Common issues:** Track top 10, identify patterns

**Weekly review:** Look for new patterns, update playbook accordingly.

---

## 🆘 Incident Response

If multiple customers report same issue:

1. **Declare incident** (Slack #incidents channel)
2. **Assess severity:**
   - **Critical (P1):** Core flow broken (signup, donations, compliance)
   - **High (P2):** Major feature broken (analytics, AI, PDF)
   - **Medium (P3):** Minor feature issue, workaround available
3. **Form incident response team:**
   - Engineering lead
   - Product lead
   - Support lead
4. **Communicate:**
   - Internal: Post to #incidents every 15 min
   - External: Post to status page if affecting >10% of users
5. **Post-incident (within 24h):**
   - Root cause analysis
   - Action items to prevent recurrence
   - Customer apology + compensation if needed

---

## 🎓 Getting Help

- **Product docs:** https://charityhub.co.uk/help
- **API docs:** https://docs.charityhub.co.uk
- **Logs:** [Your log aggregation platform]
- **Database:** Ask [DBA] for access
- **Stripe issues:** https://support.stripe.com
- **Questions:** Ask [Engineering lead] or [Product lead]