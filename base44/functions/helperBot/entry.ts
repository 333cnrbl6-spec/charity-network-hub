import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { message, page, context } = body;

    // Gather live data context
    let dataContext = { clientCount: 0, jobCount: 0, volunteerCount: 0, sessionCount: 0, grantCount: 0, hasData: false, todaysJobs: [], recentClients: [] };
    try {
      const [clients, jobs, volunteers, sessions, grants] = await Promise.all([
        base44.entities.Client.list('-created_date', 10),
        base44.entities.Job.list('-scheduled_date', 20),
        base44.entities.Volunteer.list('-created_date', 10),
        base44.entities.Session.list('-scheduled_date', 10),
        base44.entities.Grant.list('-created_date', 10),
      ]);
      const today = new Date().toDateString();
      dataContext = {
        clientCount: clients.length,
        jobCount: jobs.length,
        volunteerCount: volunteers.length,
        sessionCount: sessions.length,
        grantCount: grants.length,
        hasData: clients.length > 0 || jobs.length > 0,
        todaysJobs: jobs.filter(j => j.scheduled_date && new Date(j.scheduled_date).toDateString() === today)
          .map(j => ({ client: j.client_name, type: j.job_type, status: j.status })),
        recentClients: clients.slice(0, 5).map(c => c.full_name),
      };
    } catch (_) {}

    const orgRole = user.org_role || user.role || 'user';
    const roleDescriptions = {
      branch_department_coordinator: 'Handyperson Service Coordinator — manages job scheduling, client records, volunteer team, sessions and grants.',
      branch_staff: 'Branch staff — focused on assigned jobs and client visits for today.',
      volunteer: 'Volunteer — see your schedule and assigned visits.',
      branch_operations_manager: 'Operations Manager — oversees all branch services, staff, compliance and financials.',
      branch_service_manager: 'Service Manager — manages a specific service area.',
      branch_ceo: 'Branch CEO — strategic lead with full visibility across all departments.',
      national_director: 'National Director — full access across all Age UK branches and hub.',
      national_governance: 'Trustee/Governance — strategic and compliance oversight.',
      area_manager: 'Area Manager — cross-branch visibility for a region.',
    };

    const pageContext = {
      '/coordinator-portal': 'the Coordinator Portal (jobs, clients, team, grants)',
      '/clients': 'the Clients page — manage client records',
      '/volunteers': 'the Volunteers & Team page',
      '/jobs': 'the Jobs page — schedule and track service visits',
      '/sessions': 'the Sessions page — group activities',
      '/grants': 'the Grants & Benefits page',
      '/import': 'the Data Import page — upload legacy records via AI',
      '/safeguarding': 'the Safeguarding Hub — incident reporting',
      '/compliance': 'the Compliance dashboard',
      '/training': 'the Training & DBS module',
      '/profile': 'the User Profile settings',
      '/staff-portal': 'the Staff Portal — today\'s assigned jobs',
      '/branch-ops': 'the Branch Operations Manager dashboard',
      '/branch-ceo': 'the CEO/Chief Officer dashboard',
      '/governance-portal': 'the Trustee Governance Portal',
    };

    const currentPageDesc = pageContext[page] || `the ${page || 'platform'} page`;
    const userName = user.full_name?.split(' ')[0] || 'there';
    
    // Determine org context based on role scope
    const isNationalUser = user.role === 'admin' || ['national_director', 'national_governance'].includes(orgRole);
    const orgContext = isNationalUser ? 'Age UK Network (national hub)' : (user.branch_name || 'Age UK Bury');

    const systemPrompt = `You are "Vera" — a wise, warm, encouraging AI helper for an Age UK branch management platform. You are a superhero older woman who loves helping people do great work for older people in the community.

PERSONALITY: Friendly, encouraging, occasionally witty. Short clear sentences. Light superhero metaphors sometimes ("time to save the day!", "every hero needs their data!"). Always practical and action-oriented. Never preachy.

PLATFORM: SaaS for Age UK branches managing: clients (older people supported), volunteers, jobs/visits, group sessions, safeguarding, compliance, grants/benefits, hub reporting.

KEY FEATURES BY ROLE:
- coordinator: job scheduling, client register, volunteer team, sessions, grants, data import
- staff/volunteer: today's jobs, client contact info
- ops_manager: all services, staff, compliance, DBS, financials
- ceo: full branch picture, performance, hub reports
- governance: read-only strategic KPIs, compliance, impact

USER: ${userName} (${orgRole} — ${roleDescriptions[orgRole] || 'platform user'}) at ${orgContext}
CURRENT PAGE: ${currentPageDesc}

LIVE DATA SNAPSHOT:
- Clients: ${dataContext.clientCount}
- Jobs: ${dataContext.jobCount}  
- Volunteers: ${dataContext.volunteerCount}
- Sessions: ${dataContext.sessionCount}
- Grants: ${dataContext.grantCount}
- Has operational data: ${dataContext.hasData ? 'Yes' : 'No — empty/new setup'}
- Today's jobs: ${dataContext.todaysJobs.length > 0 ? JSON.stringify(dataContext.todaysJobs) : 'None scheduled today'}
- Recent clients: ${dataContext.recentClients.join(', ') || 'None yet'}

UI CONTEXT: ${context || 'none'}

RESPONSE RULES:
1. MAX 3-4 short sentences unless user asks for more detail
2. CRITICAL PRIORITY FOR NEW USERS: If minimal/no data exists, make data import the hero message — it's essential to unlock the platform's full power
3. Be data-aware — if no data, make import the call-to-action; if data exists, reference it specifically
4. Be role-specific — only mention features this role has access to
5. For coordinators with no data: "Your data is the heartbeat of this platform! Let's get your clients, volunteers and jobs uploaded first — everything else flows from that."
6. Plain English only — no tech jargon or IDs
7. Thought-bubble chat style. Occasional emoji ✨ is fine
8. For greetings: If no data → "First things first: upload your legacy data. This unlocks everything." If data exists → mention today's priorities and one actionable tip`;

    // Override greeting if new user with no data
    let userPrompt = message;
    if (!message && context === 'initial_greeting' && !dataContext.hasData) {
      userPrompt = `Hi Vera! I just opened the platform and I'm brand new. I have no data uploaded yet. Give me a VERY warm, encouraging greeting that makes me excited about uploading my critical data (clients, volunteers, jobs). Tell me this is the KEY first step to unlock the platform's power, and give me ONE specific tip about what to expect from the upload process. Make it feel achievable and motivating!`;
    } else if (!message) {
      userPrompt = `Hi Vera! I just opened the platform. Give me a warm greeting, tell me what I should focus on today based on my role and data, and one specific tip for the page I'm on.`;
    }

    const reply = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nUSER SAYS: "${userPrompt}"\n\nVera's response:`,
      model: 'claude_sonnet_4_6',
    });

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});