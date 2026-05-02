import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitStore = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, limit = 100, window = 3600 } = await req.json();
    const key = `${user.email}:${endpoint}`;
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key) || { count: 0, resetTime: now + window * 1000 };

    // Reset if window expired
    if (now > entry.resetTime) {
      entry = { count: 0, resetTime: now + window * 1000 };
    }

    // Check limit
    if (entry.count >= limit) {
      return Response.json(
        { error: 'Rate limit exceeded', retryAfter: Math.ceil((entry.resetTime - now) / 1000) },
        { status: 429, headers: { 'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString() } }
      );
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);

    return Response.json({
      allowed: true,
      remaining: limit - entry.count,
      resetTime: new Date(entry.resetTime).toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});