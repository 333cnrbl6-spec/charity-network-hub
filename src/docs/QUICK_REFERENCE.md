# CharityHub — Quick Reference Card

**Print this. Put it on your desk.**

---

## 🚀 Before Launch (Checklist)

```
□ npm run build        (No errors)
□ node scripts/pre-launch-validation.js  (PASSED)
□ Run all smoke tests  (10/10 PASS)
□ Database backup      (Verified)
□ Monitoring active    (Sentry, uptime alerts)
□ Team on-call         (Schedule assigned)
□ Stripe test card     (4111 1111 1111 1111 — works)
```

**All green? → You're ready to launch.**

---

## 🔧 Emergency Commands

### Check if app is running
```bash
curl https://charityhub.co.uk/api/health
# Expected: {"status":"ok"}
```

### Check error rate
```bash
# Open Sentry dashboard
# Or check logs:
tail -f logs/production.log | grep ERROR
```

### Restart app
```bash
# Via hosting provider (Vercel, AWS, etc.)
# Trigger new deployment from main branch
git push origin main
```

### Rollback to previous version
```bash
git log --oneline | head -5
git revert <commit-hash>
git push origin main
# Monitor error rate after rollback
```

### Check database
```bash
psql $DATABASE_URL
> SELECT NOW();  -- If this works, DB is connected
> SELECT COUNT(*) FROM Charity;  -- View charity count
```

---

## 📞 Who To Call

| Issue | Contact | Time |
|-------|---------|------|
| App down | On-call engineer | 15 min |
| Payment broken | Stripe support | 1 hour |
| Database down | DBA / Hosting provider | 30 min |
| Data corruption | Engineering lead | ASAP |
| Customer complaint | Support lead | 1 hour |
| Press inquiry | [CEO] | ASAP |

---

## 🆘 Top 5 Support Issues (Quick Fixes)

### 1. "I can't log in"
→ Clear browser cache (Ctrl+Shift+Del) and try again
→ If still broken: reset password
→ If STILL broken: call engineering lead

### 2. "AI grant writing doesn't work"
→ Check: Are they on Professional tier?
→ If not Professional: upsell or show alternative
→ If yes: retry in 5 min (LLM may be busy)
→ If STILL broken: check Sentry for errors

### 3. "PDF export isn't working"
→ Check: Professional tier?
→ If Professional: clear cache and retry
→ If takes >10 sec: they have too much data
→ Ask them to filter/archive old records

### 4. "Where are my donors?"
→ Check: Are they looking at right charity?
→ Check: Are they on right page/tab?
→ If missing: verify in database
→ Email: we'll investigate

### 5. "Can't process donation"
→ Check: Stripe status (status.stripe.com)
→ If Stripe down: wait 5 min, try again
→ If card error: ask them to try different card
→ If timeout: network issue, try again later

**For any issue not above → escalate to engineering**

---

## 📊 Daily Health Check (2 min)

Every morning, check:

```bash
# 1. Uptime
curl https://charityhub.co.uk/  # Should return 200

# 2. Error rate (Open Sentry)
# Should be <0.1% (red = action needed)

# 3. New signups (Open database)
psql $DATABASE_URL -c "SELECT COUNT(*) FROM Charity WHERE created_date > now() - interval '24 hours';"

# 4. Support queue
# Check email/Slack for new issues (should be <5 open)

# 5. Performance
# Check dashboard load time (~2 seconds = good)
```

**If any red: investigate immediately.**

---

## 💰 Revenue Check (Weekly)

```bash
# SQL query to check revenue
psql $DATABASE_URL -c "
SELECT 
  DATE(created_date) as date,
  subscription_tier,
  COUNT(*) as new_charities,
  SUM(CASE WHEN subscription_status='active' THEN 1 ELSE 0 END) as active
FROM Charity
GROUP BY DATE(created_date), subscription_tier
ORDER BY date DESC
LIMIT 7;
"
```

**Targets (first month):**
- 50+ signups
- 20+ Professional tier
- <5% churn

---

## 🐛 Debug a Slow Request

**User says: "Dashboard is slow"**

```bash
# 1. Ask: How many donors?
# > 10,000 = expected to be slow. Ask them to filter.

# 2. Check server performance
# Open hosting provider dashboard (AWS CloudWatch, etc.)
# CPU/Memory should be <80%

# 3. Check database queries
# Enable slow query log
# SELECT queries taking >1s are the issue

# 4. Check network waterfall
# Ask user: Open DevTools → Network → Reload
# If JS/CSS >1s to load: redeploy (might be CDN issue)
```

---

## 🔒 Security Checklist (Monthly)

- [ ] No hardcoded secrets in code
- [ ] SSL certificate valid (expires in 30+ days)
- [ ] Dependabot alerts reviewed and patched
- [ ] Database backups verified restorable
- [ ] Access logs reviewed for anomalies
- [ ] Failed login attempts normal (<100/day)
- [ ] No unauthorized API calls in logs

---

## 📈 Metrics to Watch

| Metric | Target | Alert If |
|--------|--------|----------|
| Uptime | 99.5% | <99% |
| Error rate | <0.1% | >0.5% |
| Dashboard load | <2s | >3s |
| Support response | <1h | >2h |
| Payment success | >99% | <95% |
| Churn rate | <5% | >10% |

---

## 🎯 Launch Week Schedule

**Monday:** Deploy to production
**Tuesday-Friday:** Monitor closely (team on-call)
- Check metrics every 2 hours
- Respond to support issues <30 min
- Fix any critical bugs immediately

**Following week:** 
- Continue monitoring daily
- Gradual ramp-up of customer acquisitions
- Weekly metrics review
- Celebrate your launch! 🎉

---

## 🧪 Commands to Know

```bash
# Build and test locally
npm install
npm run dev                  # Test locally
npm run build              # Build for production
node scripts/pre-launch-validation.js  # Pre-flight check

# Database
psql $DATABASE_URL         # Connect to DB
\dt                        # List all tables
\d Charity                 # View Charity schema

# View logs
tail -f logs/production.log            # Real-time logs
grep "ERROR" logs/production.log       # Find errors
tail -n 100 logs/production.log | less # Last 100 lines

# Deploy (via git)
git push origin main       # Triggers auto-deploy
git log --oneline | head   # View commit history
```

---

## 📝 Issue Template (For your team)

When reporting a bug:

```
Title: [Feature] [Severity] [Description]

Severity:
- 🔴 Critical: Core flow broken (signups, payments, data loss)
- 🟠 High: Major feature broken (AI, compliance, analytics)
- 🟡 Medium: Minor feature issue (UI bug, slow feature)
- 🟢 Low: Polish (typo, minor design)

Steps to reproduce:
1. ...
2. ...
3. ...

Expected result:
...

Actual result:
...

Error message (if any):
...

Device/Browser:
...

Assigned to:
[Name]
```

---

## ✅ You've Got This

**Remember:**
- **First 24 hours** = critical monitoring (stay close)
- **First week** = steady ramp-up (watch metrics)
- **First month** = establish patterns (review weekly)
- **Beyond** = operate normally (daily health check)

**Key to success:**
1. Fast error detection (monitoring)
2. Fast support response (<1h)
3. Fast bug fixes (high priority first)
4. Transparent communication (customers + team)

**Most issues:** Network, browser cache, or data entry (not your fault)
**Your job:** Respond quickly and help them troubleshoot

**You're ready. Go launch.** 🚀

---

## 🆘 In Case of Panic

1. **Take a breath.** Most issues aren't as bad as they seem.
2. **Gather info:** What happened? Who's affected? When?
3. **Check logs:** Usually the answer is there.
4. **Try restart:** Turn it off and on again (works 60% of the time).
5. **Get help:** Call someone smarter than you. That's what teams are for.
6. **Communicate:** Update your team and customers every 15 min.
7. **Fix it:** Calmly. Then write it down so it doesn't happen again.

**Crisis management rule:** Communication > speed of fix

---

**Last updated:** [Date]
**Next review:** [Date + 30 days]
**Reviewed by:** [Name]