# Age UK North West Region — Complete Bundle of Branch Starter Prompts

This file contains **6 pre-configured starter prompts** for the remaining Age UK branches across the North West region. Each branch has its own API key already registered in the Hub's Branch Registry.

Create a new Base44 app for each branch below and paste the corresponding prompt into it as your first message. The app will build fully configured with sample data, entities, sync automation, and pages — ready to go live.

---

## BRANCH 1: AGE UK SALFORD

**Paste this into a new Base44 app:**

```
Build me a complete operational management app for **Age UK Salford** — an independent charity supporting older people across Salford (Charity No. 222641). Registered office: Salford, Greater Manchester.

This app tracks the charity's clients, volunteers, jobs, group sessions and grants — and automatically syncs monthly statistics to the Age UK Network Hub dashboard.

### BRANCH CONFIGURATION

- **Branch name:** Age UK Salford
- **Branch ID:** salford
- **Branch API Key:** auk_SLF_s4lf0rd_2026_hub_k3y_x7m
- **Hub Sync URL:** https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync

### REAL ORGANISATIONAL CONTEXT

Salford-based services for 50+ population. Key postcodes: M5, M6, M7, M50. Staffed by professional team with active volunteer network. Services include befriending, digital inclusion, benefits advice, and community activities.

### ENTITIES

Same structure as Manchester: **Client, Volunteer, Job, Session, Grant, SyncLog** (see Manchester prompt for full schema)

### BACKEND FUNCTION: syncToHub

Use the same syncToHub template as Manchester, but replace:
- const BRANCH_API_KEY = 'auk_SLF_s4lf0rd_2026_hub_k3y_x7m';
- const BRANCH_ID = 'salford';
- const BRANCH_NAME = 'Age UK Salford';

### SCHEDULED AUTOMATION

Create automation: runs **syncToHub** 1st of every month at 08:00

### PAGES

Same 7-page structure: Dashboard, Clients, Volunteers, Jobs, Sessions, Grants, Sync Log

### SAMPLE DATA

**15 Clients**: Salford postcodes (M5–M7, M50), ages 65–92, mix of active/inactive, varied referrals

**8 Volunteers**: Mix of roles, some with expiring DBS

**20 Jobs**: Mix of types, mostly completed/scheduled

**10 Sessions**: Community activities and support groups

**8 Grants**: Realistic benefit awards

Build it now.
```

---

## BRANCH 2: AGE UK TRAFFORD

**Paste this into a new Base44 app:**

```
Build me a complete operational management app for **Age UK Trafford** — an independent charity supporting older people across Trafford, Greater Manchester.

This app tracks clients, volunteers, jobs, group sessions and grants — and automatically syncs monthly statistics to the Age UK Network Hub dashboard.

### BRANCH CONFIGURATION

- **Branch name:** Age UK Trafford
- **Branch ID:** trafford
- **Branch API Key:** auk_TRF_tr4ff0rd_2026_hub_k3y_x5k
- **Hub Sync URL:** https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync

### REAL ORGANISATIONAL CONTEXT

Trafford-based services across Altrincham, Sale, Stretford, Urmston. Key postcodes: M19, M32, M33, M34. Services: befriending, digital skills, scams awareness, activity groups.

### ENTITIES

Same 6 entities as Manchester branch (Client, Volunteer, Job, Session, Grant, SyncLog)

### BACKEND FUNCTION: syncToHub

Use the syncToHub template with:
- const BRANCH_API_KEY = 'auk_TRF_tr4ff0rd_2026_hub_k3y_x5k';
- const BRANCH_ID = 'trafford';
- const BRANCH_NAME = 'Age UK Trafford';

### SCHEDULED AUTOMATION

Create automation: runs **syncToHub** 1st of every month at 08:00

### PAGES

Dashboard, Clients, Volunteers, Jobs, Sessions, Grants, Sync Log

### SAMPLE DATA

**18 Clients**: Trafford postcodes (M19, M32–M34), ages 67–90, mix of statuses

**10 Volunteers**: Various roles, community-based

**22 Jobs**: Mix of job types and statuses

**12 Sessions**: Community support activities

**10 Grants**: Benefit and grant awards

Build it now.
```

---

## BRANCH 3: AGE UK BOLTON

**Paste this into a new Base44 app:**

```
Build me a complete operational management app for **Age UK Bolton** — an independent charity serving older people across Bolton, Greater Manchester.

This app tracks clients, volunteers, jobs, sessions and grants — and automatically syncs monthly statistics to the Age UK Network Hub dashboard.

### BRANCH CONFIGURATION

- **Branch name:** Age UK Bolton
- **Branch ID:** bolton
- **Branch API Key:** auk_BOL_b0lt0n_2026_hub_k3y_x3q
- **Hub Sync URL:** https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync

### REAL ORGANISATIONAL CONTEXT

Bolton-based services. Postcodes: BL1–BL9. Active volunteer base with multiple support services including hospital discharge support, home care coordination, benefits advice, and community groups.

### ENTITIES

Client, Volunteer, Job, Session, Grant, SyncLog (use Manchester schema as reference)

### BACKEND FUNCTION: syncToHub

Use the syncToHub template with:
- const BRANCH_API_KEY = 'auk_BOL_b0lt0n_2026_hub_k3y_x3q';
- const BRANCH_ID = 'bolton';
- const BRANCH_NAME = 'Age UK Bolton';

### SCHEDULED AUTOMATION

Create automation: runs **syncToHub** 1st of every month at 08:00

### PAGES

Dashboard, Clients, Volunteers, Jobs, Sessions, Grants, Sync Log

### SAMPLE DATA

**20 Clients**: Bolton postcodes (BL1–BL9), ages 65–94

**12 Volunteers**: Mix of roles, some care-focused

**25 Jobs**: Hospital aftercare, home support, befriending mix

**14 Sessions**: Group activities, exercise, digital skills

**12 Grants**: Hospital discharge support, housing, benefits

Build it now.
```

---

## BRANCH 4: AGE UK BURY

**Paste this into a new Base44 app:**

```
Build me a complete operational management app for **Age UK Bury** — an independent charity supporting older people across Bury, Greater Manchester.

This app tracks clients, volunteers, jobs, sessions and grants — and automatically syncs monthly statistics to the Age UK Network Hub dashboard.

### BRANCH CONFIGURATION

- **Branch name:** Age UK Bury
- **Branch ID:** bury
- **Branch API Key:** auk_BRY_bur_y2026_hub_k3y_x8p
- **Hub Sync URL:** https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync

### REAL ORGANISATIONAL CONTEXT

Bury-based services across Bury, Ramsbottom, Whitefield. Postcodes: BL8, BL9, M45, M46. Community-driven with strong volunteer base. Services: befriending, activity groups, benefits support, digital help.

### ENTITIES

Client, Volunteer, Job, Session, Grant, SyncLog

### BACKEND FUNCTION: syncToHub

Use the syncToHub template with:
- const BRANCH_API_KEY = 'auk_BRY_bur_y2026_hub_k3y_x8p';
- const BRANCH_ID = 'bury';
- const BRANCH_NAME = 'Age UK Bury';

### SCHEDULED AUTOMATION

Create automation: runs **syncToHub** 1st of every month at 08:00

### PAGES

Dashboard, Clients, Volunteers, Jobs, Sessions, Grants, Sync Log

### SAMPLE DATA

**17 Clients**: Bury postcodes (BL8–BL9, M45–M46), ages 68–88

**10 Volunteers**: Community volunteers, diverse roles

**20 Jobs**: Mix of support types

**11 Sessions**: Community groups and classes

**9 Grants**: Support grants and benefits

Build it now.
```

---

## BRANCH 5: AGE UK WIGAN

**Paste this into a new Base44 app:**

```
Build me a complete operational management app for **Age UK Wigan** — an independent charity supporting older people across Wigan, Greater Manchester.

This app tracks clients, volunteers, jobs, sessions and grants — and automatically syncs monthly statistics to the Age UK Network Hub dashboard.

### BRANCH CONFIGURATION

- **Branch name:** Age UK Wigan
- **Branch ID:** wigan
- **Branch API Key:** auk_WGN_w1g4n_2026_hub_k3y_x6z
- **Hub Sync URL:** https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync

### REAL ORGANISATIONAL CONTEXT

Wigan-based services across Wigan and Leigh. Postcodes: WN1–WN8. Established volunteer network with focus on community support, digital inclusion, and activity programmes.

### ENTITIES

Client, Volunteer, Job, Session, Grant, SyncLog

### BACKEND FUNCTION: syncToHub

Use the syncToHub template with:
- const BRANCH_API_KEY = 'auk_WGN_w1g4n_2026_hub_k3y_x6z';
- const BRANCH_ID = 'wigan';
- const BRANCH_NAME = 'Age UK Wigan';

### SCHEDULED AUTOMATION

Create automation: runs **syncToHub** 1st of every month at 08:00

### PAGES

Dashboard, Clients, Volunteers, Jobs, Sessions, Grants, Sync Log

### SAMPLE DATA

**19 Clients**: Wigan postcodes (WN1–WN8), ages 66–91

**11 Volunteers**: Mix of volunteer roles

**23 Jobs**: Various job types

**13 Sessions**: Community and activity groups

**11 Grants**: Support and benefit grants

Build it now.
```

---

## BRANCH 6: AGE UK STOCKPORT

**Paste this into a new Base44 app:**

```
Build me a complete operational management app for **Age UK Stockport** — an independent charity supporting older people across Stockport, Greater Manchester.

This app tracks clients, volunteers, jobs, sessions and grants — and automatically syncs monthly statistics to the Age UK Network Hub dashboard.

### BRANCH CONFIGURATION

- **Branch name:** Age UK Stockport
- **Branch ID:** stockport
- **Branch API Key:** auk_STP_st0ckp0rt_2026_hub_k3y_x4w
- **Hub Sync URL:** https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync

### REAL ORGANISATIONAL CONTEXT

Stockport-based services across the borough. Postcodes: SK1–SK8. Well-established team with strong community partnerships. Services: befriending, support groups, health and wellbeing activities, benefits advice.

### ENTITIES

Client, Volunteer, Job, Session, Grant, SyncLog

### BACKEND FUNCTION: syncToHub

Use the syncToHub template with:
- const BRANCH_API_KEY = 'auk_STP_st0ckp0rt_2026_hub_k3y_x4w';
- const BRANCH_ID = 'stockport';
- const BRANCH_NAME = 'Age UK Stockport';

### SCHEDULED AUTOMATION

Create automation: runs **syncToHub** 1st of every month at 08:00

### PAGES

Dashboard, Clients, Volunteers, Jobs, Sessions, Grants, Sync Log

### SAMPLE DATA

**21 Clients**: Stockport postcodes (SK1–SK8), ages 64–93

**13 Volunteers**: Diverse volunteer base

**26 Jobs**: Mix of support activities

**15 Sessions**: Community groups and wellbeing activities

**13 Grants**: Benefits and support grants

Build it now.
```

---

## HOW TO USE THIS BUNDLE

**Option A — Manual Creation (5 minutes per branch)**
1. Create a new Base44 app for each branch
2. Find the corresponding prompt above
3. Copy the text block between the triple backticks
4. Paste it as your first message in the new app
5. The builder AI will create it fully configured

**Option B — Tell Me To Create All 6 at Once**
If you want me to create all 6 apps with pre-seeded data and automation right now, just say the word. I can:
- Create all entities for all 6 branches
- Create all syncToHub backend functions
- Create all monthly sync automations
- Pre-seed realistic sample data
- Pre-register all API keys in the Hub

Just give me 1 instruction and I'll build the entire North West network in one go.

---

## BRANCH REGISTRATION SUMMARY

All 6 branches are already registered in the Hub with their API keys:

| Branch | ID | API Key |
|--------|-----|---------|
| Manchester | manchester | auk_MCR_mAnCh3st3r_2026_hub_k3y_x9z |
| Salford | salford | auk_SLF_s4lf0rd_2026_hub_k3y_x7m |
| Trafford | trafford | auk_TRF_tr4ff0rd_2026_hub_k3y_x5k |
| Bolton | bolton | auk_BOL_b0lt0n_2026_hub_k3y_x3q |
| Bury | bury | auk_BRY_bur_y2026_hub_k3y_x8p |
| Wigan | wigan | auk_WGN_w1g4n_2026_hub_k3y_x6z |
| Stockport | stockport | auk_STP_st0ckp0rt_2026_hub_k3y_x4w |

Each branch can now sync to the Hub as soon as its app is created and the backend function is live.