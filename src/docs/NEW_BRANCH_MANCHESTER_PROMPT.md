# Age UK Manchester — Branch App Starter Prompt

Copy EVERYTHING below the line and paste it as your FIRST message when creating the Age UK Manchester app in Base44.
Before pasting, replace the one placeholder marked ← with the API key generated for Manchester in the Hub's Branch Registry.

---

## PASTE THIS INTO YOUR NEW BASE44 APP:

---

Build me a complete operational management app for **Age UK Manchester** — an independent charity working with and for older people across the city of Manchester (Charity No. 1083242, Company No. 04075099). Registered office: 20 St Ann's Square, Manchester, M2 7HG.

This app tracks the charity's day-to-day clients, volunteers, jobs, group sessions and grants — and automatically syncs monthly statistics to the Age UK Network Hub dashboard.

---

### BRANCH CONFIGURATION (hardcoded — do not change)

- **Branch name:** Age UK Manchester
- **Branch ID:** manchester
- **Branch API Key:** [PASTE API KEY FROM HUB BRANCH REGISTRY HERE]  ←
- **Hub Sync URL:** https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync

---

### REAL ORGANISATIONAL CONTEXT

Use this to inform realistic sample data:

**Senior Management Team**
- Chief Executive: Sally Dervan
- Care Services Manager: Michelle McKinney
- Finance Manager: Heather McGinnis
- Business Development Manager: Richy Campbell
- Service Development Manager: Sue Agar
- Retail & Income Generation Manager: Rick Hartley

**Board of Trustees (Volunteers)**
- Chairman: Brian Green BA LLB
- Deputy Chair: Dr Sean Lennon BM MSc FRCPsych
- Honorary Treasurer: Richard Zoltie BSc CA
- Colin Fall FRICS
- Richard Clarke BA (Hons) Business Law
- Katie Cruickshank
- Tim Osborn LLB Hons

**Real Services (use as session types in sample data)**
- Ageing Well – Stretch & Flex (seated yoga/meditation, Brunswick Village)
- Ageing Well – Out in the City (LGBT+ social group, Cross Street Chapel)
- Ageing Well – Brunswick (peer-led skill-sharing groups)
- Men in Sheds – Wythenshawe (woodworking, Crossacres Care Centre)
- Tea & Tinker (cycling maintenance group, Crossacres Care Centre)
- Digital Inclusion (online skills, city-wide)
- Scams Awareness & Advice (50+, city-wide)
- Information & Advice: Staying Safe & Warm (benefits/warm homes)
- Hospital Aftercare & Reablement (post-discharge support, 55+)

**Key facts for sample data realism**
- ~100 active volunteers; volunteer contribution worth ~£500,000/year
- Serves thousands of older people across all Manchester neighbourhoods
- 5 charity shops: Didsbury Village (680 Wilmslow Rd M20 2DN), Gorton (Garratt Way), Harpurhey, plus 2 others
- Postcodes to use: M1, M2, M4, M8, M9, M11, M13, M14, M18, M20, M22, M23, M40

---

### ENTITIES (create all of these)

**Client**
- full_name (string, required)
- date_of_birth (string, date)
- address (string)
- postcode (string)
- phone (string)
- email (string)
- referral_source (string, enum: self-referral, nhs, social-care, family, gp, community-partner, other)
- status (string, enum: active, inactive, deceased, default: active)
- date_registered (string, date)
- key_worker (string) — name of assigned volunteer or staff member
- notes (string)

**Volunteer**
- full_name (string, required)
- email (string)
- phone (string)
- role (string, enum: befriender, driver, admin, reception, digital-champion, men-in-sheds, ageing-well-facilitator, shop, trustee, other)
- status (string, enum: active, inactive, default: active)
- dbs_checked (boolean, default: false)
- dbs_expiry (string, date)
- date_joined (string, date)
- hours_contributed (number, default: 0)
- area (string) — neighbourhood/area of Manchester they serve

**Job** (a "job" = a scheduled support visit or task for a client)
- client_id (string, required)
- client_name (string)
- volunteer_id (string)
- volunteer_name (string)
- job_type (string, enum: home-visit, telephone-check, transport, shopping-assist, benefits-advice, digital-help, befriending, scams-advice, hospital-discharge, other)
- scheduled_date (string, date-time)
- status (string, enum: scheduled, completed, cancelled, no-answer, default: scheduled)
- notes (string)
- duration_minutes (number)

**Session** (group activities and classes)
- session_name (string, required)
- session_type (string, enum: stretch-and-flex, men-in-sheds, tea-and-tinker, out-in-the-city, digital-inclusion, scams-awareness, information-advice, ageing-well, hospital-aftercare, other)
- location (string)
- scheduled_date (string, date-time)
- attendees_count (number, default: 0)
- max_capacity (number)
- status (string, enum: scheduled, completed, cancelled, default: scheduled)
- facilitator (string)
- notes (string)

**Grant**
- grant_name (string, required)
- funder (string)
- amount_awarded (number)
- date_awarded (string, date)
- grant_type (string, enum: attendance-allowance, pension-credit, warm-homes, energy-support, housing, carers-support, dementia-support, general, other)
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

### BACKEND FUNCTION: syncToHub

Create a backend function called **syncToHub** using this exact code:

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HUB_URL = 'https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync';
const BRANCH_API_KEY = '[PASTE BRANCH API KEY HERE]';
const BRANCH_ID = 'manchester';
const BRANCH_NAME = 'Age UK Manchester';

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

### SCHEDULED AUTOMATION

Create a scheduled automation that runs **syncToHub** on the **1st of every month at 08:00**.

---

### PAGES TO BUILD

Build a clean, professional dashboard with these pages:

**Dashboard** (home `/`)
- App header: "Age UK Manchester" with the charity's purple branding
- KPI cards: Total Active Clients, Active Volunteers, Jobs This Month, Sessions This Month, Grants Value This Month
- Last sync status banner showing last SyncLog result and timestamp
- "Sync Now" button that calls syncToHub manually
- Recent jobs list (last 5)
- Upcoming sessions (next 3)

**Clients** (`/clients`)
- Searchable, filterable table (filter by status, referral source, postcode)
- Add / edit / view client
- Show status badge, registration date, key worker

**Volunteers** (`/volunteers`)
- Table with role, status, area, DBS status and expiry
- Flag DBS expiring within 30 days in amber, expired in red
- Add / edit volunteer
- Show total hours contributed

**Jobs** (`/jobs`)
- List view with filters: status, type, date range
- Add / edit / complete jobs — link to client and volunteer
- Show overdue jobs (scheduled date passed, not completed) highlighted

**Sessions** (`/sessions`)
- List of all group sessions with type, location, date, attendance
- Add / edit / cancel sessions
- Show utilisation (attendees vs capacity)

**Grants & Benefits** (`/grants`)
- List of all grant/benefit records
- Summary cards: Total awarded this month, Year-to-date total
- Add / edit grant records

**Sync Log** (`/sync-log`)
- Table of SyncLog records: period, date, status, stats snapshot
- "Sync Now" button at the top

---

### DESIGN

- **Primary colour:** Purple (#5B2D8E) — matching Age UK branding
- **Secondary/accent:** Amber gold (#F6B219)
- **Fonts:** Plus Jakarta Sans (headings), Inter (body)
- **Sidebar navigation** with "Age UK Manchester" branding and charity logo placeholder
- Responsive — works on mobile and desktop

---

### SAMPLE DATA — USE REAL MANCHESTER CONTEXT

**Clients (create 20)** — use realistic Manchester names and postcodes from: M1, M4, M8, M9, M11, M13, M14, M18, M20, M22, M23, M40. Mix of active (16), inactive (3), deceased (1). Ages 65–94. Referral sources: mix of NHS, GP, social-care, self-referral.

Example clients (generate 20 in this style):
- Margaret Thornton, 78, 14 Brunswick St, M13 9PL, active, referred by NHS
- Arthur Patel, 84, 7 Claremont Rd, M14 4RS, active, self-referral
- Edna Walsh, 91, 22 Moston Lane, M40 9NB, active, referred by social-care
- William Goulding, 72, 55 Didsbury Park, M20 5LJ, active, referred by GP
- Joan Bateson, 88, 3 Hulme Walk, M15 5FP, inactive, self-referral

**Volunteers (create 12)** — mix of roles. Include trustees (Brian Green, Richard Zoltie as trustees). Others: befrienders, digital champions, shop volunteers, Men in Sheds facilitators. Some DBS expiring soon (within 30 days), one expired.

**Jobs (create 25)** — mix across all types. 15 completed, 7 scheduled (future dates April/May 2026), 2 cancelled, 1 no-answer. Link to the clients above.

**Sessions (create 12)** — use the real service names:
- Stretch & Flex — Brunswick Village, Wednesdays, seated yoga
- Men in Sheds — Crossacres Care Centre, Thursdays
- Out in the City — Cross Street Chapel, Fridays
- Digital Inclusion — city-wide, various dates
- Scams Awareness — city-wide drop-in
- Information & Advice: Staying Safe & Warm — Didsbury, monthly
Mix of completed (8), scheduled (3), cancelled (1).

**Grants (create 10)** — realistic benefit/grant types:
- Attendance Allowance claims: £72.65/week (lower) or £108.55/week (higher rate)
- Pension Credit top-ups
- Warm Homes Discount: £150
- Council housing support grants: £500–£2,500
Mix: 6 awarded, 3 applied/pending, 1 rejected.

---

That's everything. Build it all now so it's immediately ready to use. The syncToHub function will push statistics to the Age UK Network Hub monthly, and can be triggered manually from the Dashboard or Sync Log page.