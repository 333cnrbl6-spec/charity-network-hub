import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { source, campaign, medium, utm_params } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's charity
    const charities = await base44.entities.Charity.filter({
      created_by: user.email
    });

    if (!charities.length) {
      return Response.json({ error: 'No charity found' }, { status: 404 });
    }

    // Log lead source
    await base44.entities.UsageMetric.create({
      charity_id: charities[0].id,
      user_id: user.email,
      metric_type: 'lead_source',
      feature_name: source,
      value: 1,
      timestamp: new Date().toISOString()
    });

    // Also create audit log with full campaign details
    await base44.entities.AuditLog.create({
      charity_id: charities[0].id,
      user_email: user.email,
      action: 'signup_source',
      entity_type: 'lead',
      changes: {
        source,
        campaign,
        medium,
        utm_params,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      status: 'success'
    });

    return Response.json({
      status: 'tracked',
      source,
      campaign,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});