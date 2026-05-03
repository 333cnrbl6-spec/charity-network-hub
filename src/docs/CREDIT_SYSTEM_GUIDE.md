# CharityHub Credit System - Cost Control Infrastructure

## Overview

The credit system is a cost-control mechanism built into CharityHub to manage expensive operations (AI generation, bulk exports, etc.) before the app generates significant subscription revenue. This ensures maximum sustainability during early growth.

**Key Goal:** Keep infrastructure costs minimal while allowing users to experience premium features.

---

## Architecture

### Core Entities

#### 1. **CharityCredits**
Tracks credit balance per charity organization.
- `charity_id` - Organization identifier
- `credits_available` - Current balance
- `credits_used_month` - Monthly consumption tracker
- `subscription_tier` - "trial", "starter", "professional", "enterprise"
- `monthly_credit_allowance` - Base allocation per tier
- `trial_ends` - When 30-day trial ends
- `alert_threshold_percent` - When to warn user (default 75%)

#### 2. **CreditConsumption**
Audit log of all credit-consuming operations.
- `charity_id` - Which organization used credits
- `user_email` - Who triggered the operation
- `operation_type` - "ai_grant_writing", "ai_job_matching", etc
- `credits_consumed` - How many consumed
- `charity_tier` - Tier at time of consumption
- `timestamp` - When it happened
- `status` - "success", "blocked_limit_exceeded", "blocked_trial"
- `metadata` - Context (grant name, job title, etc)

#### 3. **CreditPricing**
Global pricing structure for operations.
- `operation_type` - Type of operation
- `base_cost_credits` - Standard cost (1 credit = £0.01)
- `{tier}_monthly_allowance` - Free allocation per tier
- `trial_allowance` - Free credits in trial (500)

---

## Credit Model

### Cost Structure (1 credit = £0.01)

| Operation | Cost | Rationale |
|-----------|------|-----------|
| AI Grant Writing | 75 cr (£0.75) | LLM API cost ~£0.50 + overhead |
| AI Report Generation | 50 cr (£0.50) | Standard LLM generation |
| AI Thank You Letter | 30 cr (£0.30) | Shorter content |
| AI Job Matching | 10 cr (£0.10) | Lower cost, high value |
| AI Insights | 40 cr (£0.40) | Data processing + LLM |
| PDF Export | 5 cr (£0.05) | Rendering service |
| Bulk Data Export | 25 cr (£0.25) | CSV/Excel generation |
| Email Campaign | 1 cr per email | External delivery costs |
| API Calls | 2 cr per 100 | If publicly exposed |

### Tier Allowances (Monthly)

| Feature | Trial (30 days) | Starter | Professional | Enterprise |
|---------|-----------------|---------|--------------|------------|
| Grant Writing | 300 (4 grants) | 100 (1-2) | 500 (6-7) | 2000 (26+) |
| Report Generation | 200 | 50 | 300 | 1500 |
| Thank You Letters | 150 | 100 | 500 | 2000 |
| Job Matching | 500 (50 jobs) | 200 | 1000 | 5000 |
| AI Insights | 100 | 50 | 300 | 1500 |
| PDF Export | 200 | 100 | 500 | 5000 |
| Bulk Data Export | 50 | 20 | 100 | 1000 |
| Email Campaign | 2000 emails | 1000 | 10,000 | 100,000 |
| API Calls | 10,000 | 5,000 | 25,000 | 100,000 |

---

## Key Functions

### 1. **checkCreditAvailability** (Read-Only Check)
Before executing expensive operations, check if user has enough credits.

**Parameters:**
```json
{
  "charity_id": "charity_123",
  "operation_type": "ai_grant_writing"
}
```

**Response:**
```json
{
  "allowed": true,
  "remaining_credits": 425,
  "operation_cost": 75,
  "message": "Operation allowed. 425 credits remaining."
}
```

**Usage Pattern:**
1. User clicks "Generate with AI" on grant
2. Frontend calls `checkCreditAvailability`
3. If blocked (402 status), show upgrade prompt
4. If allowed, proceed with operation

### 2. **debitCredits** (Post-Operation Debit)
After successful operation, debit credits.

**Parameters:**
```json
{
  "charity_id": "charity_123",
  "operation_type": "ai_grant_writing",
  "metadata": { "grant_id": "grant_456", "grant_name": "Big Lottery Fund" }
}
```

**Process:**
1. Verify credits available
2. Deduct from `credits_available`
3. Increment `credits_used_month`
4. Create `CreditConsumption` audit entry
5. Check if threshold exceeded → Send alert email

**Response:**
```json
{
  "success": true,
  "new_balance": 350,
  "credits_used_this_month": 150,
  "alert_sent": false
}
```

### 3. **initializeCharityCredits** (Onboarding)
Called when new charity registers.

**Sets up:**
- Initial credit balance (trial: 500, starter: monthly allowance, etc)
- Trial end date (30 days out)
- Monthly allowance based on tier
- Alert thresholds

### 4. **resetMonthlyCredits** (Scheduled Automation)
Runs on 1st of month at 00:00 UTC.

**Actions:**
- Reset `credits_used_month` to 0 for all charities
- Restore to `monthly_credit_allowance` (does NOT top up overage)
- Update `last_credit_reset` timestamp
- Log action for audit

---

## Implementation in Functions

### In `generateGrantApplication.js`

```javascript
// 1. Check credits BEFORE LLM call
const credits = await base44.asServiceRole.entities.CharityCredits.filter(
  { charity_id: grantData.charity_id }
);

if (credits[0].credits_available < 75) {
  return Response.json({ error: 'Insufficient credits' }, { status: 402 });
}

// 2. Call LLM
const response = await base44.integrations.Core.InvokeLLM({...});

// 3. Debit AFTER success
await base44.asServiceRole.entities.CharityCredits.update(credits[0].id, {
  credits_available: credits[0].credits_available - 75,
  credits_used_month: credits[0].credits_used_month + 75
});

// 4. Log consumption
await base44.asServiceRole.entities.CreditConsumption.create({
  charity_id,
  operation_type: 'ai_grant_writing',
  credits_consumed: 75,
  ...
});
```

### In `matchVolunteersToJobs.js`

Same pattern:
1. Check credit availability (10 credits)
2. Execute matching algorithm
3. Debit credits on success
4. Log to audit

---

## User Experience

### For Trial Users
- 500 free credits to explore all features
- No payment method required
- Clear countdown to trial end (30 days)
- Email reminder at 7 days before expiry

### For Starter Tier (£99/month)
- Monthly allowance resets on billing date
- Can see remaining credits in `/credits` page
- Alert at 75% usage
- Can upgrade to Professional anytime

### For Professional Tier (£299/month)
- 5-10x more credits than Starter
- Overage allowed (per tier limit)
- Detailed usage analytics

### For Enterprise
- Unlimited credits (custom pricing)
- No restrictions

---

## Cost Control Mechanisms

### 1. **Hard Limit**
Operation blocked if insufficient credits.
- Returns 402 Insufficient Credits error
- Frontend shows upgrade prompt

### 2. **Soft Alert** (75% threshold)
Email sent when usage crosses 75% of monthly allowance.
- Allows users to continue but alerts them
- Configurable per organization

### 3. **No Overage** (Free Tiers)
Trial and Starter tiers cannot overage.
- Once limit reached, operations blocked
- Professional allows overage at £0.01 per credit

### 4. **Monthly Reset**
On the 1st of each month, monthly counter resets.
- Used credits don't "carry over"
- Encourages sustainable usage patterns

---

## Cost Analysis

### Infrastructure Cost Example

**Scenario:** 100 charities, Starter tier, average usage

- **Grant Writing:** 100 charities × 100 credits/month = 10,000 credits consumed
  - LLM API cost: 10,000 × £0.005 (actual API) = **£50/month**
  - Collected from users: 10,000 × £0.01 = **£100/month**
  - **Margin: +£50/month per 100 charities**

- **Job Matching:** 100 charities × 200 credits/month = 20,000 credits
  - Algorithm cost (negligible): ~£1/month
  - Collected: 20,000 × £0.01 = **£200/month**
  - **Margin: +£199/month**

- **Total Margin (100 Startups):** ~£250/month
- **Server Costs:** ~£300/month
- **Net:** Break-even at ~100 Starter tier customers

---

## Setup Instructions

### 1. Initialize Credit Pricing
Run once during deployment:
```bash
curl -X POST https://app.charityhub.org/functions/seedCreditPricing \
  -H "Authorization: Bearer [admin_token]" \
  -H "Content-Type: application/json"
```

### 2. Create Automation - Monthly Credit Reset
Create scheduled automation:
- **Type:** Scheduled
- **Function:** `resetMonthlyCredits`
- **Schedule:** 1st of month, 00:00 UTC
- **Cron:** `0 0 1 * *`

### 3. Hook into Onboarding
When `CharityOnboarding` completes, call:
```javascript
await base44.functions.invoke('initializeCharityCredits', {
  charity_id: newCharity.id,
  subscription_tier: tier // "trial" or "starter"
});
```

### 4. Add to UI
- Add `/credits` route to navigation (authenticated users)
- Show credit balance in header/sidebar
- Show warnings when approaching limits

---

## Monitoring & Analytics

### Dashboards to Build

**Admin Dashboard (`/platform-admin/credits`)**
- Total credits issued vs consumed (chart)
- By operation type (what's costing most?)
- By tier (which tiers use most?)
- Margin analysis (cost vs revenue)

**Charity Dashboard (`/credits`)**
- Current balance
- Usage chart (last 3 months)
- Breakdown by operation type
- Monthly allowance vs usage
- Upgrade recommendations

### Queries to Track

1. **Cost per charity:** `CreditConsumption` grouped by `charity_id`
2. **Cost per operation:** `CreditConsumption` grouped by `operation_type`
3. **Trending operations:** What's growing in usage?
4. **Trial-to-paid conversion:** Do trials convert after hitting limits?

---

## Future Enhancements

### Phase 2 (Month 6)
- Top-up credits via Stripe (pay-as-you-go)
- Credit packages (e.g., "500 credits for £5")
- Volume discounts for Enterprise

### Phase 3 (Month 12)
- Pay-per-use (remove base tier allowances)
- Credits marketplace (trade unused credits)
- Credit sharing within organizations

### Phase 4
- Credit forecasting (predict when you'll hit limit)
- Auto-purchase credits at threshold
- Credit insurance (protect against unexpected costs)

---

## Important Notes

### ⚠️ Do NOT
- Allow negative credits (hard block)
- Reset credits mid-month for non-trial users
- Give free credits for support
- Disable credit system for any user (except Enterprise)

### ✅ DO
- Monitor cost margins weekly
- Alert if usage anomalies detected
- Provide clear upgrade paths
- Document pricing in all outgoing comms

---

## Contact & Support

For questions about credit system:
- Internal: Check this doc first
- Users: Point to `/help` center articles
- Enterprise: Direct to account manager

---

**Version:** 1.0 | **Created:** May 2026 | **Status:** Production Ready