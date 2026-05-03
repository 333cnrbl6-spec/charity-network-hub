# CharityHub Comprehensive Testing Protocol

## Overview
This protocol guides exhaustive human-like testing across all user journeys. Use this checklist to validate functionality, UX, performance, and code quality before release.

---

## SECTION 1: USER JOURNEY TESTING

### 1.1 Public Landing Page Journey
**Route:** `/landing` → `/` → `/pricing` → `/features`

**Test Cases:**
- [ ] Load times under 3 seconds on 4G
- [ ] All CTAs (Sign Up, Learn More, Start Free Trial) navigate correctly
- [ ] Mobile responsiveness: test on iPhone 12, Android, tablet
- [ ] Navigation links don't have broken hrefs
- [ ] Images load without 404 errors
- [ ] Copy is concise and benefit-focused
- [ ] No console errors on page load
- [ ] Forms have proper validation feedback
- [ ] Social proof elements (testimonials) display correctly
- [ ] Footer links all functional

**Expected Outcome:** User can understand value proposition and click to sign up without friction

---

### 1.2 Charity Signup & Profile Creation
**Route:** `/charity-onboarding`

**Test Cases:**
- [ ] Form validation works (required fields show errors)
- [ ] Charity number validation (accepts 6-digit format)
- [ ] Cause area dropdown populates all 12 options
- [ ] Website URL field accepts optional input
- [ ] Step navigation (back/next) doesn't skip/repeat steps
- [ ] Progress indicators accurately show completion
- [ ] Form data persists if user navigates back
- [ ] Error messages are clear and actionable
- [ ] Submit button disables during request
- [ ] Success toast appears and redirects to wizard
- [ ] All 3 steps complete without errors

**Expected Outcome:** New charity creates profile and enters wizard

---

### 1.3 Onboarding Wizard Journey (CRITICAL)
**Route:** `/charity-wizard` → Steps 1-4

**Step 1: Branch Setup**
- [ ] Branch name field is required (error on blank)
- [ ] Postcode field is required
- [ ] Location autocomplete works (if implemented)
- [ ] Submit creates BranchConfig entity in DB
- [ ] Submit creates LocationConfig entity in DB
- [ ] Step completes without duplicate branches
- [ ] Error handling if charity_id missing
- [ ] Form fields clear after success
- [ ] Navigation to step 2 is immediate

**Step 2: Team Invites**
- [ ] Email validation works (rejects invalid emails)
- [ ] Add button enables only with valid email
- [ ] Can add multiple emails to list
- [ ] Remove button deletes from list correctly
- [ ] Skip button works (allows proceeding without invites)
- [ ] Duplicate emails rejected with error message
- [ ] "Send invites" calls base44.users.inviteUser
- [ ] Toast shows correct count of invites sent
- [ ] Navigation to step 3 works

**Step 3: Volunteer Registration (AHA MOMENT)**
- [ ] Full name required (error on blank)
- [ ] Email required and validated
- [ ] Skills field accepts comma-separated values
- [ ] Create Volunteer entity in DB
- [ ] Send welcome email via integrations.Core.SendEmail
- [ ] Log audit event with correct metadata
- [ ] Debit 0 credits (first volunteer is free)
- [ ] Step completes without data loss
- [ ] Navigation to completion screen

**Step 4: Completion Screen**
- [ ] Shows all 3 checkmarks
- [ ] Displays correct charity name
- [ ] "Go to Dashboard" button navigates to `/dashboard`
- [ ] "Help" button navigates to `/help`
- [ ] Completion message is celebratory and clear
- [ ] No lingering form data

**Expected Outcome:** Charity has branch, invited team, registered first volunteer, feels sense of accomplishment

---

### 1.4 Credit System Journey
**Route:** `/charity-wizard` → `/credits` → AI Features

**Test Cases:**
- [ ] New charity initialized with 500 trial credits
- [ ] `/credits` page loads and displays correct balance
- [ ] Monthly allowance shows as "500 (trial)"
- [ ] Usage chart shows 0 usage (first user)
- [ ] Grant writing operation (75 credits) deducted correctly
- [ ] Insufficient credit error blocks operation (402 status)
- [ ] Credit consumption logged in CreditConsumption entity
- [ ] Monthly reset automation (1st of month) works
- [ ] Alert email sent at 75% usage threshold
- [ ] Trial expiry email sent 7 days before end date

**Expected Outcome:** Cost control prevents runaway infrastructure costs

---

### 1.5 Dashboard & Main App Journey
**Route:** `/dashboard` → Various admin pages

**Test Cases:**
- [ ] Auth check prevents access without login
- [ ] User sees their charity data, not others'
- [ ] Data isolation enforced (security check)
- [ ] Sidebar navigation loads all routes
- [ ] Loading states show while fetching data
- [ ] Error states handle network failures gracefully
- [ ] Refresh button re-fetches without page reload
- [ ] Tables paginate correctly (if applicable)
- [ ] Filters work and persist state
- [ ] Exports don't fail or timeout

**Expected Outcome:** Admin can manage their charity data safely

---

## SECTION 2: CODE QUALITY REVIEW

### 2.1 React Component Issues

**Check Each Component For:**
- [ ] Unused imports (remove)
- [ ] Missing error boundaries around async operations
- [ ] Unhandled promise rejections
- [ ] Missing dependency arrays in useEffect
- [ ] Functions created on every render (move outside or memo)
- [ ] Missing null checks before accessing nested properties
- [ ] Hardcoded strings (should be constants or props)
- [ ] Inaccessible buttons/inputs (no aria labels)
- [ ] Console.log statements left in production code
- [ ] setState in loops (causes re-renders)
- [ ] Not cleaning up subscriptions on unmount

**Common Pattern Issues:**
```javascript
// ❌ BAD: Missing dependency array
useEffect(() => {
  fetchData();
});

// ✅ GOOD: Proper dependency array
useEffect(() => {
  fetchData();
}, [charityId]);

// ❌ BAD: Creating function on every render
<button onClick={() => handleClick(item.id)}>Click</button>

// ✅ GOOD: Memoized callback
const handleClick = useCallback((id) => {...}, []);
<button onClick={() => handleClick(item.id)}>Click</button>
```

---

### 2.2 Backend Function Issues

**Check Each Function For:**
- [ ] Missing error handling (no try/catch)
- [ ] Unvalidated user input
- [ ] Missing auth check (base44.auth.me())
- [ ] SQL/NoSQL injection risks (unlikely in SDK but check)
- [ ] N+1 query problems (looping over IDs then fetching)
- [ ] Hardcoded values that should be config
- [ ] Incomplete cleanup (don't leave DB in bad state)
- [ ] Missing rate limiting
- [ ] Logging sensitive data (emails, passwords)
- [ ] Returning raw error to frontend (hide implementation details)

**Common Pattern Issues:**
```javascript
// ❌ BAD: No auth check
Deno.serve(async (req) => {
  const { charityId } = await req.json();
  // ... do something with charityId
});

// ✅ GOOD: Auth check first
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // ... do something
});
```

---

### 2.3 Data Isolation & Security

**Check For:**
- [ ] Users can only see their own charity data
- [ ] No queries return data from OTHER charities
- [ ] API endpoints validate charity ownership
- [ ] Sensitive data not logged in audit trails
- [ ] File uploads validated (type, size)
- [ ] No direct SQL/NoSQL queries (use SDK)
- [ ] CORS properly configured
- [ ] Rate limiting prevents abuse
- [ ] Webhook signatures validated
- [ ] Stripe webhook authenticity checked

---

### 2.4 Error Handling

**Check Each Flow:**
- [ ] Network errors don't crash app
- [ ] Missing data shows friendly error, not blank page
- [ ] Invalid input shows validation message
- [ ] Timeout errors have retry button
- [ ] Form submission errors are specific
- [ ] File upload errors explain what went wrong
- [ ] API errors don't expose stack traces to user
- [ ] Failed operations roll back cleanly

---

### 2.5 Performance Issues

**Check For:**
- [ ] Unnecessary re-renders (use React DevTools Profiler)
- [ ] Large lists aren't virtualized (10k+ items)
- [ ] Heavy computations aren't blocking UI
- [ ] Images optimized (compressed, right dimensions)
- [ ] API calls batched where possible
- [ ] Caching implemented for static data
- [ ] Lazy loading for routes/components
- [ ] Bundle size under 500KB (gzipped)
- [ ] No memory leaks on unmount
- [ ] Debounced search/filter inputs

---

## SECTION 3: SPECIFIC COMPONENTS TO CHECK

### 3.1 CharityOnboardingWizard (NEW)

**File:** `pages/CharityOnboardingWizard.jsx`

Issues Found & Fixes:
```javascript
// ISSUE 1: No error handling if user not authenticated
// ISSUE 2: Charity lookup by email could fail if user created multiple charities
// ISSUE 3: No timeout on credit initialization call
// ISSUE 4: Step navigation doesn't validate previous steps completed
// ISSUE 5: Credit consumption not checked before wizard
```

---

### 3.2 WizardStep1BranchSetup

Issues Found:
```javascript
// ISSUE 1: No validation on postcode format (accept any string)
// ISSUE 2: No duplicate branch check (could create 2 branches with same name)
// ISSUE 3: LocationConfig creation could fail but branch already created
// ISSUE 4: No timeout protection (form stays loading forever if request hangs)
// ISSUE 5: Phone validation missing (accepts any string)
```

---

### 3.3 WizardStep2TeamInvites

Issues Found:
```javascript
// ISSUE 1: Email validation regex too simple (doesn't catch all invalid formats)
// ISSUE 2: inviteUser doesn't check if user already registered
// ISSUE 3: No rate limiting (could spam 100 invites)
// ISSUE 4: Invite list not saved to DB (lost if page refreshes)
// ISSUE 5: Error handling doesn't differentiate "user already invited" vs network error
```

---

### 3.3 WizardStep3VolunteerReg

Issues Found:
```javascript
// ISSUE 1: Skills split by comma but not validated
// ISSUE 2: No check if volunteer email already exists
// ISSUE 3: Welcome email could fail but volunteer still created
// ISSUE 4: Audit log creation could fail silently
// ISSUE 5: Location field accepts any string (should validate postcode format)
```

---

## SECTION 4: DATABASE & DATA INTEGRITY

### 4.1 Entity Relationships

**Check:**
- [ ] Foreign key references valid (charity_id exists)
- [ ] No orphaned records (branch without charity)
- [ ] Cascading deletes work correctly
- [ ] Unique constraints enforced (email, charity_number)
- [ ] Required fields actually required in DB schema
- [ ] Date formats consistent (ISO 8601)
- [ ] Enums match between frontend and backend

---

### 4.2 Concurrency Issues

**Test:**
- [ ] Rapid form submissions don't create duplicates
- [ ] Two users creating branches simultaneously don't conflict
- [ ] Credit deduction race conditions prevented
- [ ] Update operations are atomic

---

## SECTION 5: INTEGRATION TESTING

### 5.1 Email Delivery

**Test:**
- [ ] Onboarding welcome emails send
- [ ] Team invite emails send
- [ ] Credit alert emails send
- [ ] Trial expiry reminder emails send
- [ ] Email templates render correctly
- [ ] No personal data exposed in email headers

---

### 5.2 Stripe Integration (If Applicable)

**Test:**
- [ ] Webhook signature validation works
- [ ] Payment success/failure handled
- [ ] Upgrade tier updates credit allowance
- [ ] Invoice generated and accessible
- [ ] Billing portal accessible

---

## SECTION 6: MOBILE & ACCESSIBILITY

### 6.1 Mobile Testing

**Test On:**
- [ ] iPhone 12 (Safari)
- [ ] Samsung Galaxy (Chrome)
- [ ] iPad (landscape and portrait)

**Check:**
- [ ] Touch targets are at least 44x44px
- [ ] Forms don't have tiny input fields
- [ ] Modals can be dismissed on mobile
- [ ] Tables don't overflow (responsive)
- [ ] Images scale correctly
- [ ] Keyboard appears correctly for inputs

---

### 6.2 Accessibility (WCAG 2.1)

**Check:**
- [ ] Color contrast ratio at least 4.5:1
- [ ] All form inputs have labels
- [ ] Keyboard navigation works (Tab through all buttons)
- [ ] Focus states visible
- [ ] Images have alt text
- [ ] Links are descriptive (not "Click here")
- [ ] Error messages are programmatically associated
- [ ] Loading states announced to screen readers
- [ ] No keyboard traps

---

## SECTION 7: TESTING EXECUTION CHECKLIST

### Before Release:
- [ ] All test cases above executed
- [ ] No critical bugs remain
- [ ] No console errors in DevTools
- [ ] Load times acceptable (<3s)
- [ ] Mobile fully functional
- [ ] Accessibility audit passed
- [ ] Code reviewed for issues listed in Section 2
- [ ] Security checklist passed
- [ ] Documentation updated
- [ ] Rollback plan in place

---

## Issues Found & Fixes Applied

### CRITICAL (Block Release)
1. Missing auth checks in onboarding
2. No validation on email format
3. Duplicate entity creation not prevented
4. SQL/NoSQL injection risks (if any)

### HIGH (Fix Before Release)
1. Race condition on rapid form submissions
2. Error handling doesn't differentiate error types
3. Missing timeout protection
4. Form data lost on refresh

### MEDIUM (Fix in Next Sprint)
1. Non-critical validation (phone format)
2. Missing virtualization for large lists
3. Console.log statements in production code
4. Unused imports

### LOW (Nice to Have)
1. Performance micro-optimizations
2. Loading skeleton screens
3. Animation polish
4. Dark mode support

---

**Status:** Ready for Deep-Dive Review
**Date:** May 3, 2026