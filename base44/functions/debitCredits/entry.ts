import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Debit credits from a charity account after successful operation.
 * Logs consumption for analytics and enforces limits.
 * 
 * Params:
 * - charity_id: string
 * - operation_type: string
 * - metadata: object (optional, for context like document title)
 * 
 * Returns:
 * - success: boolean
 * - new_balance: number
 * - alert_sent: boolean (if usage threshold exceeded)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { charity_id, operation_type, metadata = {} } = await req.json();

    if (!charity_id || !operation_type) {
      return Response.json(
        { error: 'Missing charity_id or operation_type' },
        { status: 400 }
      );
    }

    // Get charity credits
    const charityCredits = await base44.asServiceRole.entities.CharityCredits.filter(
      { charity_id }
    );

    if (!charityCredits || charityCredits.length === 0) {
      return Response.json({ error: 'Credit record not found' }, { status: 404 });
    }

    const credits = charityCredits[0];

    // Get operation pricing
    const pricing = await base44.asServiceRole.entities.CreditPricing.filter(
      { operation_type, active: true }
    );

    if (!pricing || pricing.length === 0) {
      return Response.json({ error: 'Operation pricing not found' }, { status: 404 });
    }

    const { base_cost_credits } = pricing[0];

    // Check if credits available
    if (credits.credits_available < base_cost_credits) {
      return Response.json(
        {
          success: false,
          reason: 'insufficient_credits',
          message: `Operation requires ${base_cost_credits} credits. Only ${credits.credits_available} available.`
        },
        { status: 402 }
      );
    }

    // Debit credits
    const newBalance = credits.credits_available - base_cost_credits;
    const newUsedMonth = credits.credits_used_month + base_cost_credits;

    await base44.asServiceRole.entities.CharityCredits.update(credits.id, {
      credits_available: newBalance,
      credits_used_month: newUsedMonth
    });

    // Log consumption
    await base44.asServiceRole.entities.CreditConsumption.create({
      charity_id,
      user_email: user.email,
      operation_type,
      credits_consumed: base_cost_credits,
      charity_tier: credits.subscription_tier,
      timestamp: new Date().toISOString(),
      status: 'success',
      metadata
    });

    // Check if alert threshold exceeded
    let alertSent = false;
    if (credits.credit_alerts_enabled && credits.monthly_credit_allowance > 0) {
      const usagePercent = (newUsedMonth / credits.monthly_credit_allowance) * 100;

      if (usagePercent >= credits.alert_threshold_percent && usagePercent < 100) {
        // Send alert email to charity
        try {
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `CharityHub: You've used ${Math.round(usagePercent)}% of your monthly credits`,
            body: `You've used ${newUsedMonth} of ${credits.monthly_credit_allowance} credits this month.\n\nTo avoid interruptions, consider upgrading your plan or disabling credit alerts in settings.`
          });
          alertSent = true;
        } catch (e) {
          console.log('Alert email failed, continuing:', e.message);
        }
      }
    }

    return Response.json({
      success: true,
      new_balance: newBalance,
      credits_used_this_month: newUsedMonth,
      alert_sent: alertSent
    });
  } catch (error) {
    console.error('debitCredits error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});