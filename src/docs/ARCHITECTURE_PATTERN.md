# CharityHub Architecture Pattern Guide

## Core Principle
**Fetch entities directly from the Base44 SDK. Apply filtering client-side. Use backend functions only for complex business logic.**

---

## ✅ The Correct Pattern

### 1. Direct Entity Queries (Frontend)
```jsx
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

// ✅ CORRECT: Query the entity directly
const { data: campaigns } = useQuery({
  queryKey: ['campaigns'],
  queryFn: () => base44.entities.Campaign.list()
});

// Apply filtering client-side
const filtered = campaigns?.filter(c => c.charity_id === charityId);
```

### 2. Backend Functions for Complex Logic
```jsx
// ✅ CORRECT: Use backend functions for:
// - Business logic (approval workflows, calculations)
// - External integrations (Stripe, LLM calls)
// - Bulk operations (batch updates, exports)
// - Sensitive operations (requiring admin checks)

const response = await base44.functions.invoke('generateGrantApplication', {
  grantId,
  charityId,
  includeOutcomes: true
});
```

---

## ❌ Anti-Pattern (What We Moved Away From)

```jsx
// ❌ WRONG: Calling backend function for simple data access
const response = await base44.functions.invoke('getCampaignDetails', {
  campaignId
});

// Issues:
// - Adds unnecessary network hop
// - Parameter validation in backend (fragile)
// - No automatic RLS enforcement
// - Harder to test and maintain
```

---

## Why This Pattern Works

| Aspect | Direct Entity | Backend Function |
|--------|---------------|------------------|
| **Performance** | Direct DB query, cached by React Query | Extra network hop, manual caching |
| **Security (RLS)** | Automatic tenant isolation | Must be explicitly implemented |
| **Maintainability** | Single source of truth (entity schema) | Multiple parameter versions to maintain |
| **Testability** | Entity mocks are simple | Function mocks require payload structure |
| **Filtering** | Client-side (flexible, transparent) | Backend (less flexible, hidden logic) |

---

## Implementation Checklist

For each new feature:

- [ ] **Data access?** → Use `base44.entities.EntityName.list()` or `.filter()`
- [ ] **Campaign scoping?** → Apply `campaign_id` filter client-side after fetch
- [ ] **Complex transformation?** → Use a utility function, not a backend function
- [ ] **Calculations (e.g., impact metrics)?** → Client-side after fetch, or dedicated `compute*` backend function
- [ ] **External API call (Stripe, LLM, email)?** → Backend function only
- [ ] **Bulk write operations?** → Backend function for efficiency
- [ ] **Sensitive operation (user role check)?** → Backend function with auth verification

---

## Common Scenarios

### Scenario 1: List Campaigns for Current Charity
```jsx
// ✅ CORRECT
const { data: campaigns } = useQuery({
  queryKey: ['campaigns', charityId],
  queryFn: () => base44.entities.Campaign.filter({ charity_id: charityId })
});
```

### Scenario 2: Get Donors + Their Recent Donations
```jsx
// ✅ CORRECT
const { data: donors } = useQuery({
  queryKey: ['donors', charityId],
  queryFn: () => base44.entities.Donor.filter({ charity_id: charityId })
});

const { data: donations } = useQuery({
  queryKey: ['donations', charityId],
  queryFn: () => base44.entities.Donation.filter({ charity_id: charityId })
});

// Combine on frontend
const donorMap = useMemo(() => {
  return donations?.reduce((map, d) => {
    if (!map[d.donor_id]) map[d.donor_id] = [];
    map[d.donor_id].push(d);
    return map;
  }, {});
}, [donations]);
```

### Scenario 3: Draft a Grant Application (AI)
```jsx
// ✅ CORRECT: Backend function for external API call
const { data: draft } = useQuery({
  queryKey: ['grantDraft', grantId],
  queryFn: () => base44.functions.invoke('generateGrantApplication', { grantId })
});
```

### Scenario 4: Update Campaign Status
```jsx
// ✅ CORRECT: Direct entity update (not via backend function)
const updateMutation = useMutation({
  mutationFn: (updates) => 
    base44.entities.Campaign.update(campaignId, updates)
});
```

---

## Error Handling

```jsx
// Always handle network errors and missing data
const { data: campaigns, error, isLoading } = useQuery({
  queryKey: ['campaigns', charityId],
  queryFn: async () => {
    try {
      return await base44.entities.Campaign.filter({ charity_id: charityId });
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      throw err;
    }
  }
});

if (isLoading) return <LoadingIndicator />;
if (error) return <ErrorCard message="Failed to load campaigns" />;
if (!campaigns?.length) return <EmptyState />;

// Render campaigns...
```

---

## Code Review Checklist

When reviewing PRs, check for:

- [ ] No `base44.functions.invoke('get*')` calls (use entities instead)
- [ ] All entity filters applied client-side, not backend
- [ ] Backend functions used only for business logic, external APIs, or bulk ops
- [ ] Query keys include all filter params for proper cache invalidation
- [ ] Error handling for all async operations
- [ ] Loading states rendered appropriately

---

## Questions?

If a feature seems like it needs a backend function, pair with the team first to confirm the pattern is right for the use case. This guide covers 95% of scenarios — edge cases exist, but they're exceptions, not the rule.