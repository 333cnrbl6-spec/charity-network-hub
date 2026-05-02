/**
 * Client-side rate limiting for features
 * Rate limits per tier (per month)
 */

const RATE_LIMITS = {
  starter: {
    ai_generations: 10,
    reports: 5,
    exports: 3,
    api_calls: 100
  },
  professional: {
    ai_generations: 100,
    reports: 50,
    exports: 50,
    api_calls: 1000
  },
  enterprise: {
    ai_generations: Infinity,
    reports: Infinity,
    exports: Infinity,
    api_calls: Infinity
  }
};

/**
 * Check if user has hit rate limit for feature
 * @param {string} feature - Feature name (ai_generations, reports, etc)
 * @param {string} tier - User's subscription tier
 * @param {number} usageThisMonth - How many times user has used feature this month
 * @returns {object} { allowed: boolean, remaining: number, limit: number }
 */
export function checkRateLimit(feature, tier, usageThisMonth = 0) {
  const tierLimits = RATE_LIMITS[tier] || RATE_LIMITS.starter;
  const limit = tierLimits[feature] || 0;

  return {
    allowed: usageThisMonth < limit,
    remaining: Math.max(0, limit - usageThisMonth),
    limit: limit === Infinity ? null : limit,
    tier
  };
}

/**
 * Get all limits for a tier
 */
export function getTierLimits(tier) {
  return RATE_LIMITS[tier] || RATE_LIMITS.starter;
}

/**
 * Format rate limit message for UI
 */
export function formatRateLimitMessage(feature, tier, usageThisMonth) {
  const { allowed, remaining, limit } = checkRateLimit(feature, tier, usageThisMonth);

  if (limit === null) return 'Unlimited access';
  if (!allowed) return `Monthly limit reached (${limit} per month)`;
  if (remaining <= 5) return `${remaining} remaining this month`;

  return null;
}