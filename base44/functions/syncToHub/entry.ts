import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const HUB_URL = 'https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync';
const BRANCH_API_KEY = 'auk_MCR_mAnCh3st3r_2026_hub_k3y_x9z';
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