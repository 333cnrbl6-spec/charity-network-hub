import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const rateLimitStore = new Map(); // In production: use Redis

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, method } = await req.json();

    // Get user's charity
    const charities = await base44.entities.Charity.filter({
      created_by: user.email
    });

    if (!charities.length) {
      return Response.json({ error: 'No charity found' }, { status: 404 });
    }

    const tier = charities[0].subscription_tier || 'starter';

    // Get rate limits from feature gates
    const apiGates = await base44.entities.FeatureGate.filter({
      feature_name: 'api_calls'
    });

    if (!apiGates.length) {
      return Response.json({ allowed: true }); // No gate defined
    }

    const limit = apiGates[0].tier_limits[tier] || 0;
    const key = `${user.id}:${endpoint}:${method}`;
    const now = Date.now();

    // Get or create rate limit record
    let record = rateLimitStore.get(key);
    if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
      record = { count: 0, windowStart: now };
    }

    // Increment counter
    record.count++;
    rateLimitStore.set(key, record);

    // Check if over limit
    if (record.count > limit) {
      return Response.json({
        allowed: false,
        message: `Rate limit exceeded: ${record.count}/${limit} requests`,
        retry_after: Math.ceil((record.windowStart + RATE_LIMIT_WINDOW - now) / 1000)
      }, { status: 429 });
    }

    // Log usage
    await base44.entities.UsageMetric.create({
      charity_id: charities[0].id,
      user_id: user.email,
      metric_type: 'api_call',
      feature_name: 'api_calls',
      value: 1,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      allowed: true,
      remaining: limit - record.count,
      limit,
      tier
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});