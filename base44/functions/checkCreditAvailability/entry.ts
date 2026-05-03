import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Check if a charity has enough credits for an operation.
 * Returns credit availability, remaining balance, and whether operation is allowed.
 * 
 * Params:
 * - charity_id: string
 * - operation_type: string (ai_grant_writing, ai_report_generation, etc)
 * 
 * Returns:
 * - allowed: boolean
 * - remaining_credits: number
 * - reason_blocked: string (if blocked)
 * - message: string (user-friendly message)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { charity_id, operation_type } = await req.json();

    if (!charity_id || !operation_type) {
      return Response.json(
        { error: 'Missing charity_id or operation_type' },
        { status: 400 }
      );
    }

    // Get charity credits record
    const charityCredits = await base44.asServiceRole.entities.CharityCredits.filter(
      { charity_id }
    );

    if (!charityCredits || charityCredits.length === 0) {
      return Response.json(
        { error: 'No credit record found for charity' },
        { status: 404 }
      );
    }

    const credits = charityCredits[0];
    const { subscription_tier, trial_ends, credits_available, credits_used_month, monthly_credit_allowance } = credits;

    // Get pricing for operation
    const pricing = await base44.asServiceRole.entities.CreditPricing.filter(
      { operation_type, active: true }
    );

    if (!pricing || pricing.length === 0) {
      return Response.json(
        { error: 'Operation pricing not configured' },
        { status: 500 }
      );
    }

    const { base_cost_credits } = pricing[0];

    // Check trial status
    if (subscription_tier === 'trial') {
      const trialEnd = new Date(trial_ends);
      const today = new Date();

      if (today > trialEnd) {
        return Response.json({
          allowed: false,
          remaining_credits: 0,
          reason_blocked: 'trial_expired',
          message: 'Your free trial has ended. Please upgrade to continue using this feature.'
        });
      }
    }

    // Check if credits available
    const allowed = credits_available >= base_cost_credits;

    return Response.json({
      allowed,
      remaining_credits: Math.max(0, credits_available - base_cost_credits),
      operation_cost: base_cost_credits,
      tier: subscription_tier,
      used_this_month: credits_used_month,
      monthly_allowance: monthly_credit_allowance,
      message: allowed
        ? `Operation allowed. ${credits_available - base_cost_credits} credits remaining.`
        : `Insufficient credits. Need ${base_cost_credits}, have ${credits_available}. Upgrade your plan or wait for monthly reset.`
    });
  } catch (error) {
    console.error('checkCreditAvailability error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});