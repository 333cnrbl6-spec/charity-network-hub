import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Reset monthly credit counters on the 1st of each month.
 * This is intended to be called by a scheduled automation at 00:00 UTC on the 1st of month.
 * 
 * Returns:
 * - charities_reset: number
 * - credits_allocated: number (total credits reset across all charities)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Allow service role calls (from automation)
    if (!user && req.headers.get('authorization') === `Bearer ${Deno.env.get('BASE44_SERVICE_ROLE_KEY')}`) {
      // Service role access allowed
    } else if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all charity credit records
    const allCharities = await base44.asServiceRole.entities.CharityCredits.list();

    let resetCount = 0;
    let totalCreditsAllocated = 0;

    for (const charity of allCharities) {
      // Skip trial accounts
      if (charity.subscription_tier === 'trial') {
        continue;
      }

      // Update monthly counter
      await base44.asServiceRole.entities.CharityCredits.update(charity.id, {
        credits_used_month: 0,
        last_credit_reset: new Date().toISOString()
      });

      totalCreditsAllocated += charity.monthly_credit_allowance || 0;
      resetCount++;
    }

    // Log this maintenance action
    console.log(`Monthly credit reset: ${resetCount} charities, ${totalCreditsAllocated} total credits allocated`);

    return Response.json({
      success: true,
      charities_reset: resetCount,
      credits_allocated: totalCreditsAllocated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('resetMonthlyCredits error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});