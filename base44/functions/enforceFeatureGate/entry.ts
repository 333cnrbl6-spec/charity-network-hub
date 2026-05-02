import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feature_name } = await req.json();

    // Get charity subscription
    const charities = await base44.entities.Charity.filter({ 
      created_by: user.email 
    });

    if (!charities.length) {
      return Response.json({ error: 'No charity found' }, { status: 404 });
    }

    const charity = charities[0];
    const tier = charity.subscription_tier || 'starter';

    // Get feature gate
    const gates = await base44.entities.FeatureGate.filter({ 
      feature_name 
    });

    if (!gates.length) {
      return Response.json({ allowed: true, tier }); // Feature not gated
    }

    const gate = gates[0];

    // Check if tier has access
    if (!gate.enabled_tiers.includes(tier)) {
      return Response.json({ 
        allowed: false, 
        message: `${feature_name} requires ${gate.enabled_tiers[0]} tier or higher`,
        upgrade_required: true
      });
    }

    // Check usage limits
    const metric = await base44.entities.UsageMetric.filter({
      charity_id: charity.id,
      metric_type: feature_name,
      timestamp: { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    const usage = metric.reduce((sum, m) => sum + (m.value || 1), 0);
    const limit = gate.tier_limits[tier] || 0;

    if (usage >= limit) {
      return Response.json({ 
        allowed: false, 
        message: `You've reached your ${feature_name} limit (${usage}/${limit})`,
        current_usage: usage,
        limit
      });
    }

    return Response.json({ 
      allowed: true, 
      tier,
      current_usage: usage,
      limit
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});