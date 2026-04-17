import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

    // Get branch config to find API endpoint
    const branches = await base44.asServiceRole.entities.BranchConfig.filter({ branch_id });
    if (!branches?.length) {
      return Response.json({ error: `Branch ${branch_id} not found` }, { status: 404 });
    }

    const branch = branches[0];
    if (!branch.hub_api_url || !branch.api_key) {
      return Response.json({ error: `Branch ${branch_id} missing hub_api_url or api_key` }, { status: 400 });
    }

    // Push config to branch
    const response = await fetch(`${branch.hub_api_url}/receiveConfig`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-API-Key': branch.api_key,
      },
      body: JSON.stringify({ config, timestamp: new Date().toISOString() }),
    });

    const responseData = await response.json();

    console.log(`[pushConfigToBranch] Pushed config to ${branch_id}: ${response.status}`);

    return Response.json({
      success: response.ok,
      branch_id,
      status: response.status,
      response: responseData,
    });
  } catch (error) {
    console.error('pushConfigToBranch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});