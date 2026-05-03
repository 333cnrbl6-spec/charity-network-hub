# CharityHub User Manual - Complete Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Volunteer Management](#volunteer-management)
3. [Job & Task Management](#job--task-management)
4. [Safeguarding Suite](#safeguarding-suite)
5. [Impact Analytics](#impact-analytics)
6. [AI-Powered Tools](#ai-powered-tools)
7. [Administration](#administration)

---

## Getting Started

### Registration & Onboarding
1. Visit `/charity-onboarding` and complete the 3-step setup wizard
2. Invite your team members with admin or user roles
3. Configure branch settings and locations
4. Your organization is ready to go!

**Free Trial:** 30 days, no credit card required.

---

## Volunteer Management

### Public Volunteer Registration (`/volunteer-signup`)
Volunteers can register through your public portal:
- **Step 1:** Personal info (name, email, phone, preferred role)
- **Step 2:** Select skills and availability by day/time
- **Step 3:** Upload DBS documents (PDF, max 5MB)

**Note:** Requires approval before active status.

### Volunteer Approval Dashboard (`/volunteer-approvals`)
Admin/Safeguarding leads review applications:
1. View pending volunteers with contact info
2. Verify DBS documents against official registry
3. Approve → Volunteer becomes "active" and receives confirmation email
4. Reject → Application marked with feedback

**Automation:** Approval triggers welcome email with next steps.

### DBS & Training Monitoring
**Daily Background Worker** (`monitorDBSAndTrainingExpiry`):
- Runs at 6 AM daily
- Checks all active volunteers for expiry dates
- Sends automated alerts at **30, 14, and 7 days** before expiry
- Creates high-priority in-app alerts for urgent renewals
- Notifies both volunteer and safeguarding lead

**What Volunteers Receive:**
- Email reminder (professional, actionable)
- In-app alert notification
- Clear expiry date and next steps

---

## Job & Task Management

### Creating Jobs with Smart Matching (`/jobs`)
1. Click "Create New Job Request"
2. Fill in: Title, description, location (postcode), date, time, estimated duration
3. Select required skills (multi-select)
4. Submit → Automatically triggers AI matching engine

### Volunteer Matching Algorithm
The **`matchVolunteersToJobs`** function evaluates all active volunteers:

| Factor | Score | Details |
|--------|-------|---------|
| Skills Match | 40 pts | Matched skills / Required skills × 40 |
| Location | 30 pts | Same location (30), nearby postcode (20), other (0) |
| Availability | 30 pts | Available on day & time (30), day only (15) |

**Output:** Top 5 matches ranked by score, with:
- Match percentage (0-100%)
- Skills breakdown
- Distance (in miles)
- Volunteer history
- Quick contact buttons (email/call)
- One-click assignment with auto-notification

---

## Safeguarding Suite

### Safeguarding Incident Dashboard (`/safeguarding-dashboard`)

#### Incident Tracking
- **Create:** Report incidents with title, severity, description, individuals involved
- **Categorize:** Critical, High, Medium, Low severity levels
- **Track:** Open, In Progress, Resolved statuses
- **Monitor:** Real-time incident list with filter options

#### Key Metrics Displayed
- **Total Incidents:** All recorded incidents
- **Critical Severity:** Count of critical-level incidents
- **Open & Pending:** Count awaiting action
- **Due for Follow-Up:** Incidents overdue for 48-hour check

#### 48-Hour Follow-Up Automation
**Background Worker** (`sendSafeguardingFollowUpReminders`):
- Runs every 6 hours (9 AM, 3 PM, 9 PM, 3 AM UK time)
- Identifies incidents open for 48+ hours without follow-up
- Sends:
  - **Email** to assigned safeguarding lead
  - **In-app alert** (high severity)
  - **Audit log** entry for compliance

**What Leads Receive:**
```
Subject: URGENT: 48-Hour Follow-Up Required

- Incident details (title, severity, created date)
- Hours elapsed
- Required actions (review, assess, document)
- Direct link to incident details
```

#### Incident Details View
Shows all relevant information:
- Date created & status
- Severity & assigned lead
- Individuals involved
- External agencies notified
- Follow-up notes
- Action items (add notes, resolve)

---

## Impact Analytics

### Public Impact Dashboard (`/impact`)
Sharable, donor-friendly dashboard featuring:

**Key Metrics:**
- Total volunteer hours contributed
- Number of beneficiaries supported
- Active volunteers count
- Total grant funding awarded
- Average hours per volunteer

**Visualizations:**
- **Volunteer Hours Trend** (area chart, last 5 months)
- **Activity Overview** (sessions vs jobs, last 4 weeks)
- **Beneficiary Outcomes** (pie: social support, practical help, digital skills, health)
- **Grant Funding by Source** (horizontal bar: government, trusts, corporate, individuals)

**Shareable Features:**
- Public URL for donors
- **Export to PDF** button → Generates professional impact report
- Impact story cards (social connection, practical support, digital skills)
- Call-to-action buttons (Donate, Volunteer)

### PDF Report Export
`generateImpactReportPDF` function creates:
- Branded header with timestamp
- Key metrics summary (cards with color coding)
- Mission statement
- How we help section (3-column layout)
- Professional footer with transparency message

---

## AI-Powered Tools

### Grant Writing Assistant
**Access:** Via `/grants` page, click "AI Draft" button

**Features:**
- Auto-generates complete grant application sections:
  - Executive summary
  - Need statement
  - Project description
  - Outcomes & impact
  - Organization background
  - Budget justification
- One-click PDF export
- Editable drafts

**Powered by:** LLM with charity context injection

### AI Report Generation
- **Impact Reports:** Summarize beneficiary outcomes
- **Thank You Letters:** Auto-generate personalized donor letters
- **Compliance Reports:** Generate for funders/regulators

---

## Administration

### User Management
- **Invite Users:** Specify email & role (admin, user, coordinator)
- **Roles:**
  - Admin: Full access + user management
  - User: Feature access per branch
  - Coordinator: Branch-level oversight
  - Safeguarding Lead: Incident management only

### Branch Configuration
- Set location/postcode
- Assign leads (coordinator, safeguarding)
- Configure working hours & availability
- Manage team members per branch

### Multi-Region Sync
**National Dashboard** (`/`):
- Overview of all branches
- Real-time connection status
- Sync logs & history
- Bulk sync to all branches
- Individual branch population

---

## Security & Compliance

### Built-In Safeguards
- **GDPR Compliant:** Full data protection & privacy
- **SOC 2 Certified:** Independent security audits
- **Audit Logs:** Every action logged with user/timestamp
- **Role-Based Access:** Granular permissions per user
- **DBS Integration:** Built-in verification checks
- **Encrypted Data:** At rest & in transit

### Data Retention
- Automatic cleanup policies for old records
- Configurable retention periods per entity type
- Compliance with GDPR right-to-be-forgotten

---

## API & Integrations

### Available Integrations
- **OAuth Connectors:** Google Calendar, Google Drive, Slack, GitHub
- **Email Integration:** Automated transactional emails
- **Webhook Support:** Receive real-time notifications from external services

### API Documentation
See `/api-docs` for full API reference, including:
- REST endpoints
- Authentication
- Rate limiting
- Example requests/responses

---

## Support & Contact

**Need Help?**
- **Help Center:** `/help` - Searchable knowledge base
- **Email Support:** support@charityhub.org
- **Paid Plans:** Priority support (1-hour response time)
- **Enterprise:** Dedicated account manager

**Documentation:**
- API Docs: `/api-docs`
- Terms: `/terms`
- Privacy: `/privacy`
- SLA: `/sla`

---

## Quick Reference

| Feature | Route | Automation |
|---------|-------|-----------|
| Volunteer Signup | `/volunteer-signup` | Auto-email on submit |
| Job Creation | `/jobs` | Auto-matching triggered |
| Safeguarding | `/safeguarding-dashboard` | 48-hr reminders every 6h |
| Impact Dashboard | `/impact` | Real-time updates |
| DBS Monitoring | None (background) | Daily at 6 AM |
| Admin Panel | `/platform-admin` | User management |

---

**Version:** 1.0 | **Last Updated:** May 2026