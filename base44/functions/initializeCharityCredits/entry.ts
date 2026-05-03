import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Initialize credit account for new charity during onboarding.
 * Called when a new Charity is created.
 * 
 * Params:
 * - charity_id: string
 * - subscription_tier: string (default: 'trial')
 * - trial_days: number (default: 30)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { charity_id, subscription_tier = 'trial', trial_days = 30 } = await req.json();

    if (!charity_id) {
      return Response.json({ error: 'Missing charity_id' }, { status: 400 });
    }

    // Get credit pricing for this tier to determine allowance
    const tieredPricing = await base44.asServiceRole.entities.CreditPricing.list();

    // Calculate total monthly allowance for tier
    let monthlyAllowance = 0;
    for (const pricing of tieredPricing) {
      const tierKey = `${subscription_tier}_monthly_allowance`;
      if (pricing[tierKey]) {
        monthlyAllowance += pricing[tierKey];
      }
    }

    // Calculate trial end date
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + trial_days);

    // Create charity credits record
    const creditsRecord = await base44.asServiceRole.entities.CharityCredits.create({
      charity_id,
      subscription_tier,
      trial_ends: trialEnd.toISOString().split('T')[0],
      credits_available: subscription_tier === 'trial' ? 500 : monthlyAllowance, // 500 free credits for trials
      monthly_credit_allowance: monthlyAllowance,
      credits_used_month: 0,
      last_credit_reset: new Date().toISOString(),
      credit_alerts_enabled: true,
      alert_threshold_percent: 75
    });

    return Response.json({
      success: true,
      charity_id,
      tier: subscription_tier,
      initial_credits: subscription_tier === 'trial' ? 500 : monthlyAllowance,
      monthly_allowance: monthlyAllowance,
      trial_ends: trialEnd.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('initializeCharityCredits error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});