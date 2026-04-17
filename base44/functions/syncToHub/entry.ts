import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// This is a hub function - called via syncAllBranchesToHub
// It queries local branch data and sends to hub
const HUB_URL = 'https://app.base44.com/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const branchId = body.branch_id;

    if (!branchId) {
      return Response.json({ error: 'Missing branch_id in request' }, { status: 400 });
    }

    // Get branch config for API key
    const branches = await base44.asServiceRole.entities.BranchConfig.filter({ branch_id: branchId });
    if (!branches?.length) {
      return Response.json({ error: `Branch ${branchId} not found` }, { status: 404 });
    }

    const branch = branches[0];
    const BRANCH_API_KEY = branch.api_key;

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

    console.log(`[syncToHub] Branch ${branchId} synced: ${hubResponse.ok ? 'success' : 'failed'}`);

    return Response.json({ success: hubResponse.ok, stats, hub_response: hubData });
  } catch (error) {
    console.error('syncToHub error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});