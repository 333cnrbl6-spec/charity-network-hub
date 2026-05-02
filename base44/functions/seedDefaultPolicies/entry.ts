import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const defaultFeatureGates = [
      {
        feature_name: 'api_calls',
        tier_limits: { starter: 1000, professional: 10000, enterprise: 100000 },
        enabled_tiers: ['starter', 'professional', 'enterprise'],
        billing_impact: true
      },
      {
        feature_name: 'data_export',
        tier_limits: { starter: 10, professional: 100, enterprise: 1000 },
        enabled_tiers: ['professional', 'enterprise'],
        billing_impact: true
      },
      {
        feature_name: 'ai_generation',
        tier_limits: { starter: 5, professional: 50, enterprise: 500 },
        enabled_tiers: ['professional', 'enterprise'],
        billing_impact: true
      },
      {
        feature_name: 'team_members',
        tier_limits: { starter: 2, professional: 10, enterprise: 100 },
        enabled_tiers: ['starter', 'professional', 'enterprise'],
        billing_impact: false
      },
      {
        feature_name: 'custom_branding',
        tier_limits: { starter: 0, professional: 1, enterprise: 10 },
        enabled_tiers: ['professional', 'enterprise'],
        billing_impact: true
      }
    ];

    const defaultRetentionPolicies = [
      {
        entity_type: 'AuditLog',
        retention_days: 365,
        enabled: true
      },
      {
        entity_type: 'EmailLog',
        retention_days: 90,
        enabled: true
      },
      {
        entity_type: 'SecurityAuditLog',
        retention_days: 730,
        enabled: true
      },
      {
        entity_type: 'UsageMetric',
        retention_days: 180,
        enabled: true
      }
    ];

    const results = { features: [], retention: [] };

    // Seed feature gates
    for (const gate of defaultFeatureGates) {
      const existing = await base44.entities.FeatureGate.filter({
        feature_name: gate.feature_name
      });
      
      if (!existing.length) {
        const created = await base44.entities.FeatureGate.create(gate);
        results.features.push({ feature: gate.feature_name, status: 'created' });
      } else {
        results.features.push({ feature: gate.feature_name, status: 'already_exists' });
      }
    }

    // Seed retention policies
    for (const policy of defaultRetentionPolicies) {
      const existing = await base44.entities.DataRetentionPolicy.filter({
        entity_type: policy.entity_type
      });

      if (!existing.length) {
        const created = await base44.entities.DataRetentionPolicy.create(policy);
        results.retention.push({ entity: policy.entity_type, status: 'created' });
      } else {
        results.retention.push({ entity: policy.entity_type, status: 'already_exists' });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});