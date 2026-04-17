import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PUSH_TIMEOUT = 15000; // 15 seconds

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { branch_id, config } = body;

    if (!branch_id || !config) {
      return Response.json({ error: 'Missing branch_id or config' }, { status: 400 });
    }

    // Get branch config
    let branch;
    try {
      const branches = await base44.asServiceRole.entities.BranchConfig.filter({ branch_id });
      if (!branches?.length) {
        return Response.json({ error: `Branch ${branch_id} not found` }, { status: 404 });
      }
      branch = branches[0];
    } catch (error) {
      console.error(`[pushConfigToBranch] Branch lookup error:`, error.message);
      return Response.json({ error: 'Failed to fetch branch config' }, { status: 500 });
    }

    if (!branch.hub_api_url || !branch.api_key) {
      return Response.json({ 
        error: `Branch ${branch_id} missing hub_api_url or api_key`,
        branch_id,
        has_hub_api_url: !!branch.hub_api_url,
        has_api_key: !!branch.api_key,
      }, { status: 400 });
    }

    // Push config with timeout
    let response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), PUSH_TIMEOUT);

      response = await fetch(`${branch.hub_api_url}/receiveConfig`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hub-API-Key': branch.api_key,
        },
        body: JSON.stringify({ config, timestamp: new Date().toISOString() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (error) {
      console.error(`[pushConfigToBranch] Push failed for ${branch_id}:`, error.message);
      return Response.json({ 
        error: 'Failed to push config to branch',
        details: error.message,
        branch_id,
      }, { status: 502 });
    }

    const responseData = await response.json().catch(() => ({ message: 'Invalid response' }));

    console.log(`[pushConfigToBranch] Pushed config to ${branch_id}: ${response.status}`);

    return Response.json({
      success: response.ok,
      branch_id,
      status_code: response.status,
      response: responseData,
    });
  } catch (error) {
    console.error('[pushConfigToBranch] Unhandled error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});