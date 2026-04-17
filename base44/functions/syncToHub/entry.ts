import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Hub endpoint - configured via environment or branch config
const getHubUrl = (branchId) => {
  // Use branch's hub_api_url if set, otherwise fall back to default
  return `https://preview-sandbox--69e20cef658590cb2c64169c.base44.app/api/apps/69e20cef658590cb2c64169c/functions/receiveBranchSync`;
};

const SYNC_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 2;

async function syncWithRetry(url, payload, apiKey, attempt = 0) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SYNC_TIMEOUT);

    // Send with CORS headers
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Branch-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (attempt < MAX_RETRIES && (error.name === 'AbortError' || error.message.includes('network'))) {
      console.warn(`[syncToHub] Retry attempt ${attempt + 1}/${MAX_RETRIES}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
      return syncWithRetry(url, payload, apiKey, attempt + 1);
    }
    throw error;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const branchId = body.branch_id || user.email.split('@')[0]; // Fallback to user identifier

    if (!branchId) {
      return Response.json({ error: 'Missing branch_id' }, { status: 400 });
    }

    // Get branch config
    let branch;
    try {
      const branches = await base44.asServiceRole.entities.BranchConfig.filter({ branch_id: branchId });
      if (!branches?.length) {
        return Response.json({ error: `Branch ${branchId} not found` }, { status: 404 });
      }
      branch = branches[0];
    } catch (error) {
      console.error(`[syncToHub] Branch lookup error:`, error.message);
      return Response.json({ error: 'Failed to fetch branch config' }, { status: 500 });
    }

    if (!branch.api_key) {
      return Response.json({ error: `Branch ${branchId} missing api_key` }, { status: 400 });
    }

    // Prepare report
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const reportPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let stats;
    try {
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

      stats = {
        total_clients: activeClients.length,
        new_clients: newClients.length,
        active_volunteers: activeVolunteers.length,
        total_jobs: monthJobs.length,
        completed_jobs: completedJobs.length,
        total_sessions: completedSessions.length,
        grants_awarded: awardedGrants.length,
        grants_total_value: grantsValue,
      };
    } catch (error) {
      console.error(`[syncToHub] Data collection error:`, error.message);
      return Response.json({ error: 'Failed to collect stats' }, { status: 500 });
    }

    // Send to hub with retry
    const hubUrl = getHubUrl(branchId);
    const payload = { report_period: reportPeriod, stats };

    let hubResponse;
    try {
      hubResponse = await syncWithRetry(hubUrl, payload, branch.api_key);
    } catch (error) {
      console.error(`[syncToHub] Hub sync failed:`, error.message);
      
      // Log failure but don't block
      try {
        await base44.asServiceRole.entities.SyncLog.create({
          report_period: reportPeriod,
          synced_at: now.toISOString(),
          status: 'error',
          response_message: `Network error: ${error.message}`,
          stats_snapshot: stats,
        });
      } catch (logError) {
        console.error(`[syncToHub] Failed to log sync error:`, logError.message);
      }

      return Response.json({ 
        error: 'Failed to sync with hub', 
        details: error.message 
      }, { status: 502 });
    }

    const hubData = await hubResponse.json().catch(() => ({ message: 'Invalid response' }));

    // Log result
    try {
      await base44.asServiceRole.entities.SyncLog.create({
        report_period: reportPeriod,
        synced_at: now.toISOString(),
        status: hubResponse.ok ? 'success' : 'error',
        response_message: hubData.message || JSON.stringify(hubData),
        stats_snapshot: stats,
      });
    } catch (error) {
      console.error(`[syncToHub] Failed to log sync result:`, error.message);
    }

    console.log(`[syncToHub] Sync for ${branchId}: ${hubResponse.ok ? 'success' : 'failed'}`);

    return Response.json({
      success: hubResponse.ok,
      stats,
      hub_response: hubData,
      status_code: hubResponse.status,
    });
  } catch (error) {
    console.error('[syncToHub] Unhandled error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});