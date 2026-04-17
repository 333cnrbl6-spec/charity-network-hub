import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REQUEST_TIMEOUT = 10000; // 10 seconds

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Branch-API-Key',
        },
      });
    }

    const apiKey = req.headers.get('X-Branch-API-Key');
    if (!apiKey) {
      return Response.json({ error: 'Missing X-Branch-API-Key header' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    // Validate API key against BranchConfig
    let branch;
    try {
      const branches = await base44.asServiceRole.entities.BranchConfig.filter({ api_key: apiKey });
      if (!branches || branches.length === 0) {
        console.warn(`[receiveBranchSync] Invalid API key attempted`);
        return Response.json({ error: 'Invalid API key' }, { status: 403 });
      }
      branch = branches[0];
    } catch (error) {
      console.error(`[receiveBranchSync] API key lookup error:`, error.message);
      return Response.json({ error: 'Authentication service error' }, { status: 500 });
    }

    if (branch.status !== 'active') {
      console.warn(`[receiveBranchSync] Branch ${branch.branch_id} is not active`);
      return Response.json({ error: 'Branch is not active' }, { status: 403 });
    }

    // Parse and validate body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (!body.report_period || !body.stats) {
      return Response.json({ error: 'Missing required fields: report_period, stats' }, { status: 400 });
    }

    // Store report
    let report;
    try {
      report = await base44.asServiceRole.entities.BranchReport.create({
        branch_id: branch.branch_id,
        branch_name: branch.branch_name,
        report_period: body.report_period,
        received_at: new Date().toISOString(),
        stats: body.stats,
        status: 'received'
      });
    } catch (error) {
      console.error(`[receiveBranchSync] Failed to create report:`, error.message);
      return Response.json({ error: 'Failed to store report' }, { status: 500 });
    }

    // Update branch sync metadata
    try {
      await base44.asServiceRole.entities.BranchConfig.update(branch.id, {
        last_sync_date: new Date().toISOString(),
        last_sync_result: 'success'
      });
    } catch (error) {
      console.error(`[receiveBranchSync] Failed to update branch config:`, error.message);
      // Don't fail the whole request if metadata update fails
    }

    console.log(`[receiveBranchSync] Successfully received report from ${branch.branch_name} for period ${body.report_period}`);

    return Response.json(
      {
        success: true,
        report_id: report.id,
        message: `Report for ${body.report_period} received from ${branch.branch_name}`
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[receiveBranchSync] Unhandled error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});