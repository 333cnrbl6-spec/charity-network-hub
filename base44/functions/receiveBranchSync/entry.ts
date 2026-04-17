import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const apiKey = req.headers.get('X-Branch-API-Key');
  if (!apiKey) {
    return Response.json({ error: 'Missing X-Branch-API-Key header' }, { status: 401 });
  }

  const base44 = createClientFromRequest(req);

  // Look up branch config by API key using service role
  const branches = await base44.asServiceRole.entities.BranchConfig.filter({ api_key: apiKey });

  if (!branches || branches.length === 0) {
    return Response.json({ error: 'Invalid API key' }, { status: 403 });
  }

  const branch = branches[0];

  if (branch.status !== 'active') {
    return Response.json({ error: 'Branch is not active' }, { status: 403 });
  }

  const body = await req.json();

  // Validate required fields
  if (!body.report_period || !body.stats) {
    return Response.json({ error: 'Missing required fields: report_period, stats' }, { status: 400 });
  }

  // Store the report
  const report = await base44.asServiceRole.entities.BranchReport.create({
    branch_id: branch.branch_id,
    branch_name: branch.branch_name,
    report_period: body.report_period,
    received_at: new Date().toISOString(),
    stats: body.stats,
    status: 'received'
  });

  // Update branch config with last sync info
  await base44.asServiceRole.entities.BranchConfig.update(branch.id, {
    last_sync_date: new Date().toISOString(),
    last_sync_result: 'success'
  });

  return Response.json({
    success: true,
    report_id: report.id,
    message: `Report for ${body.report_period} received from ${branch.branch_name}`
  });
});