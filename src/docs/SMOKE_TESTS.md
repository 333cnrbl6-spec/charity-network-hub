# CharityHub Smoke Tests — Pre-Deployment Checklist

Run these tests **before every production deployment**. Each test should take <5 minutes.

---

## 🔴 CRITICAL TESTS (Must Pass)

### Test 1: Charity Signup Flow
**Objective:** Verify a new charity can sign up and reach the dashboard

1. Open app in incognito window
2. Click "Get Started" → navigate to `/charity-setup`
3. Fill form:
   - Charity Name: "Test Charity QA"
   - Charity Number: "1234567"
   - Cause Area: "Community"
4. Click "Create Charity"
5. **Expected:** Redirects to `/charity-dashboard` with empty dashboard displayed
6. **Verify:** Dashboard loads within 2 seconds, no console errors

**Failure Criteria:**
- Form submission fails
- 400/500 error
- Redirects to login
- Dashboard shows "Page Not Found"

---

### Test 2: Login & Session Persistence
**Objective:** Verify authentication works and session persists

1. Log in with valid credentials
2. Verify: Dashboard loads, user name appears in header
3. Refresh page (F5)
4. **Expected:** Logged in state persists, no redirect to login
5. Log out
6. **Expected:** Redirects to login page, cached data cleared

**Failure Criteria:**
- Login fails with valid credentials
- Session lost on refresh
- Logout doesn't clear state (cached data still visible)

---

### Test 3: AI Grant Writing (Professional Only)
**Objective:** Verify AI integration works end-to-end

1. Log in as Professional tier user
2. Navigate to `/charity-grants`
3. Create a new grant:
   - Grant Name: "Test Grant"
   - Funder: "Test Foundation"
   - Amount: "£50,000"
   - Deadline: 30 days from today
4. Click "Generate AI Draft"
5. **Expected:** Draft appears within 30 seconds with all sections
6. **Verify:** Draft is readable, no incomplete JSON, no error messages

**Failure Criteria:**
- Button disabled for Professional user
- Timeout >30 seconds
- Empty/malformed response
- Console errors (LLM API timeout, etc.)

---

### Test 4: Data Validation & Error Handling
**Objective:** Verify form validation prevents bad data

1. Go to create campaign
2. Try submit with:
   - Empty title → error message "Title required"
   - Negative amount → error message "Amount must be positive"
   - Invalid date (past) → error message "Date must be in future"
3. Fix and submit successfully
4. **Expected:** Form accepts valid data, creates record

**Failure Criteria:**
- Bad data submitted to database
- No error messages shown
- Form hangs on submission

---

### Test 5: Compliance Dashboard Load
**Objective:** Verify compliance status displays correctly

1. Log in as charity user
2. Navigate to `/charity-compliance`
3. **Expected:** Page loads within 3 seconds
4. **Verify:** All 12 compliance items visible (RAG status displayed)
5. Click one item
6. **Expected:** Detail view opens with no errors

**Failure Criteria:**
- Page hangs >3 seconds
- Compliance items missing or show error
- No data displayed

---

### Test 6: Mobile Responsiveness
**Objective:** Verify UI works on mobile (iPhone SE resolution)

1. Open DevTools → Mobile mode (iPhone SE)
2. Navigate to `/charity-dashboard`
3. **Verify:**
   - No horizontal scroll
   - All buttons clickable (44px+ target)
   - Menu collapses on mobile
   - Forms are readable
4. Test campaign creation on mobile
5. **Verify:** Date picker works, submit button visible

**Failure Criteria:**
- Horizontal scroll present
- Text too small to read
- Buttons unclickable
- Date picker broken

---

## 🟡 HIGH-PRIORITY TESTS (Should Pass)

### Test 7: PDF Export
**Objective:** Verify PDF generation works

1. Log in, navigate to dashboard
2. Click "Export PDF"
3. **Expected:** PDF downloads within 10 seconds
4. Open PDF and verify:
   - Charity name visible
   - Charts render
   - No "undefined" text

**Failure Criteria:**
- PDF download fails
- Timeout >10 seconds
- PDF corrupted or empty

---

### Test 8: Real-Time Data Sync
**Objective:** Verify data updates without page refresh

1. Open dashboard in two browser tabs (same account)
2. In Tab A: Create a new campaign
3. In Tab B: **Verify** new campaign appears within 10 seconds (no refresh)
4. **Expected:** Real-time update via React Query subscription

**Failure Criteria:**
- No update in Tab B
- Update takes >10 seconds
- Requires page refresh to see new data

---

### Test 9: Analytics Dashboard
**Objective:** Verify charts render with real data

1. Log in with account that has donations/campaigns
2. Navigate to `/charity-analytics`
3. **Verify:**
   - KPI cards show correct numbers
   - 5 charts render (area, pie, bar, funnel, horizontal bar)
   - No console errors
   - Responsive on mobile

**Failure Criteria:**
- Charts missing or blank
- Incorrect numbers
- Console errors (chart rendering fails)

---

### Test 10: Error Recovery
**Objective:** Verify app recovers from errors gracefully

1. Open Network tab in DevTools
2. Navigate to dashboard
3. Throttle network (Slow 3G)
4. Trigger API call (e.g., refresh page)
5. **Expected:** Loading indicator appears, data loads, no crash
6. Set network to "Offline"
7. Try creating a record
8. **Expected:** Error message "Network error. Please check your connection."
9. Go back to "Online"
10. **Expected:** User can retry and succeed

**Failure Criteria:**
- White screen on slow network
- No error message on network failure
- Can't recover after network restore

---

## 🟢 OPTIONAL TESTS (Nice to Have)

- Test across browsers (Chrome, Firefox, Safari, Edge)
- Test on 5 different devices (desktop, tablet, mobile)
- Test with 1000+ donors loaded
- Load test: 100 concurrent users
- Test all accessibility features (keyboard nav, screen reader)

---

## ✅ Post-Test Checklist

- [ ] All critical tests (1-6) passed
- [ ] No console errors (except warnings)
- [ ] Network tab shows no failed requests (non-CORS errors)
- [ ] No visual regressions (compare screenshots)
- [ ] Performance acceptable (<2s dashboard load on 4G)
- [ ] Mobile fully functional
- [ ] Error messages are clear and helpful

---

## 🚨 Deployment Rollback Criteria

**STOP DEPLOYMENT if:**
- Any critical test (1-6) fails
- Console shows uncaught errors
- Database migration failed
- Stripe webhook not responding
- Authentication broken

**Can proceed with high-priority tests failing if:**
- It's a known issue in rollback plan
- Low-traffic time (off-peak)
- Team is on-call to fix

---

## 📝 Test Report Template

```
DATE: [date]
TESTER: [name]
VERSION: [version/commit]

CRITICAL TESTS:
[ ] Test 1: Signup
[ ] Test 2: Login/Session
[ ] Test 3: AI Grant Writing
[ ] Test 4: Validation
[ ] Test 5: Compliance Dashboard
[ ] Test 6: Mobile

HIGH PRIORITY:
[ ] Test 7: PDF Export
[ ] Test 8: Real-Time Sync
[ ] Test 9: Analytics
[ ] Test 10: Error Recovery

ISSUES FOUND:
1. [Issue] - [Severity] - [Assigned to]

APPROVED FOR DEPLOYMENT: [YES/NO]
SIGNED: [Name]
``