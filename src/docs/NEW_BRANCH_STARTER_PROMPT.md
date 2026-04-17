# Age UK Network Hub — New Branch App Starter Prompt

Copy everything between the dividers below and paste it as your first message when creating a new branch app in Base44.
Replace the three placeholders marked with ← before pasting.

---

## PASTE THIS INTO YOUR NEW BASE44 APP:

---

Build me a complete Age UK branch management app for **[BRANCH NAME e.g. Age UK Rochdale]** ← replace this.

This app is a local branch reporting tool that automatically syncs its operational statistics to the Age UK Network Hub dashboard every month. Everything must work out of the box with no further setup needed.

---

### BRANCH DETAILS (fill these in before pasting)

- **Branch name:** Age UK [Town Name]  ← replace
- **Branch ID:** [lowercase-town-name e.g. rochdale]  ← replace
- **Branch API Key:** [PASTE THE API KEY FROM THE HUB'S BRANCH REGISTRY PAGE]  ← replace
- **Hub Sync URL:** https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync

---

### WHAT TO BUILD

#### 1. Entities (create all of these)

**Client**
- full_name (string, required)
- date_of_birth (string, date)
- address (string)
- postcode (string)
- phone (string)
- email (string)
- referral_source (string, enum: self-referral, nhs, social-care, family, other)
- status (string, enum: active, inactive, deceased, default: active)
- date_registered (string, date)
- notes (string)

**Volunteer**
- full_name (string, required)
- email (string)
- phone (string)
- role (string, enum: befriender, driver, admin, reception, instructor, other)
- status (string, enum: active, inactive, default: active)
- dbs_checked (boolean, default: false)
- dbs_expiry (string, date)
- date_joined (string, date)
- hours_contributed (number, default: 0)

**Job** (a "job" = a scheduled support visit or task for a client)
- client_id (string, required)
- client_name (string)
- volunteer_id (string)
- volunteer_name (string)
- job_type (string, enum: home-visit, telephone-check, transport, shopping, gardening, befriending, other)
- scheduled_date (string, date-time)
- status (string, enum: scheduled, completed, cancelled, no-answer, default: scheduled)
- notes (string)
- duration_minutes (number)

**Session** (group sessions / classes)
- session_name (string, required)
- session_type (string, enum: strength-balance, ageing-well, social, information-advice, nutrition, other)
- location (string)
- scheduled_date (string, date-time)
- attendees_count (number, default: 0)
- max_capacity (number)
- status (string, enum: scheduled, completed, cancelled, default: scheduled)
- notes (string)

**Grant**
- grant_name (string, required)
- funder (string)
- amount_awarded (number)
- date_awarded (string, date)
- grant_type (string, enum: attendance-allowance, pension-credit, warm-homes, energy-support, other)
- client_id (string)
- client_name (string)
- status (string, enum: applied, awarded, rejected, default: applied)
- notes (string)

**SyncLog** (records every sync attempt to the Hub)
- report_period (string, required, e.g. 2026-04)
- synced_at (string, date-time)
- status (string, enum: success, error, default: success)
- response_message (string)
- stats_snapshot (object)

---

#### 2. Backend Function: syncToHub

Create a backend function called **syncToHub** that:

1. Counts all Clients where status = "active" → total_clients
2. Counts Clients created this calendar month → new_clients
3. Counts Volunteers where status = "active" → active_volunteers
4. Counts all Jobs this month → total_jobs
5. Counts Jobs where status = "completed" this month → completed_jobs
6. Counts Sessions where status = "completed" this month → total_sessions
7. Counts Grants where status = "awarded" this month → grants_awarded
8. Sums amount_awarded for awarded grants this month → grants_total_value
9. POSTs all these stats to the Hub URL below with the branch API key in the header
10. Saves a SyncLog record with the result

Use this exact code structure:

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HUB_URL = 'https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync';
const BRANCH_API_KEY = '[PASTE BRANCH API KEY HERE]';
const BRANCH_ID = '[lowercase-branch-id]';
const BRANCH_NAME = '[Full Branch Name]';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const reportPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [allClients, allVolunteers, allJobs, allSessions, allGrants] = await Promise.all([
      base44.asServiceRole.entities.Client.list(),
      base44.asServiceRole.entities.Volunteer.list(),
      base44.asServiceRole.entities.Job.list(),
      base44.asServiceRole.entities.Session.list(),
      base44.asServiceRole.entities.Grant.list(),
    ]);

    const activeClients = allClients.filter(c => c.status === 'active');
    const newClients = allClients.filter(c => c.created_date >= monthStart);
    const activeVolunteers = allVolunteers.filter(v => v.status === 'active');
    const monthJobs = allJobs.filter(j => j.created_date >= monthStart);
    const completedJobs = monthJobs.filter(j => j.status === 'completed');
    const completedSessions = allSessions.filter(s => s.status === 'completed' && s.created_date >= monthStart);
    const awardedGrants = allGrants.filter(g => g.status === 'awarded' && g.created_date >= monthStart);
    const grantsValue = awardedGrants.reduce((sum, g) => sum + (g.amount_awarded || 0), 0);

    const stats = {
      total_clients: activeClients.length,
      new_clients: newClients.length,
      active_volunteers: activeVolunteers.length,
      total_jobs: monthJobs.length,
      completed_jobs: completedJobs.length,
      total_sessions: completedSessions.length,
      grants_awarded: awardedGrants.length,
      grants_total_value: grantsValue,
    };

    const hubResponse = await fetch(HUB_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Branch-API-Key': BRANCH_API_KEY,
      },
      body: JSON.stringify({ report_period: reportPeriod, stats }),
    });

    const hubData = await hubResponse.json();

    await base44.asServiceRole.entities.SyncLog.create({
      report_period: reportPeriod,
      synced_at: now.toISOString(),
      status: hubResponse.ok ? 'success' : 'error',
      response_message: hubData.message || JSON.stringify(hubData),
      stats_snapshot: stats,
    });

    return Response.json({ success: hubResponse.ok, stats, hub_response: hubData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

---

#### 3. Scheduled Automation

Create a **scheduled automation** that runs **syncToHub** every month on the 1st at 08:00 AM.

---

#### 4. Pages to build

Build a clean, professional dashboard app with these pages:

**Dashboard** (home page /)
- KPI cards: Total Active Clients, Active Volunteers, Jobs This Month, Sessions This Month, Grants Value This Month
- Last sync status banner (shows last SyncLog result and timestamp)
- "Sync Now" button that calls syncToHub manually
- Recent jobs list
- Recent sessions list

**Clients** (/clients)
- Searchable, filterable table of all clients
- Add / edit / view client details
- Show status badge (active/inactive)

**Volunteers** (/volunteers)
- Table of all volunteers with role, status, DBS status
- Add / edit volunteer
- Flag volunteers whose DBS is expired or expiring within 30 days

**Jobs** (/jobs)
- Calendar or list view of all jobs
- Filter by status, type, date
- Add / edit / complete jobs
- Link jobs to clients and volunteers

**Sessions** (/sessions)
- List of all group sessions
- Add / edit / cancel sessions
- Record attendance count

**Grants & Finance** (/grants)
- List of all grant records
- Total value awarded this month and year-to-date
- Add / edit grant records

**Sync Log** (/sync-log)
- Table of all SyncLog records showing period, date, status, stats snapshot
- Manual "Sync Now" button at the top

---

#### 5. Design

Use a clean, professional style with:
- Purple primary colour (#5B2D8E style, similar to Age UK branding)
- Amber/gold secondary colour for accents
- Plus Jakarta Sans for headings, Inter for body text
- Sidebar navigation
- Responsive layout that works on mobile and desktop
- The app name in the sidebar should be "Age UK [Branch Name]"

---

#### 6. Sample Data

Populate realistic sample data:
- 15–20 clients with realistic names, postcodes from the local area, and varied statuses
- 8–10 volunteers with DBS details (some expiring soon)
- 20–30 jobs (mix of completed, scheduled, cancelled)
- 10 sessions (mix of types and statuses)
- 8–10 grant records with realistic amounts

---

That's everything. Build it all now so it's ready to use immediately with no further setup. The syncToHub function will automatically push stats to the Age UK Network Hub every month, and it can also be triggered manually from the Dashboard or Sync Log page.