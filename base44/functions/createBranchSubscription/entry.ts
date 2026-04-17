import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { branch_id, branch_name, plan, email } = await req.json();

    if (!branch_id || !branch_name || !plan) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Plan pricing in GBP (pence)
    const planPricing = {
      starter: 4999,      // £49.99/month
      professional: 9999, // £99.99/month
      enterprise: 24999   // £249.99/month
    };

    const amount = planPricing[plan];
    if (!amount) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: email || `${branch_id}@ageuk.org.uk`,
      metadata: {
        branch_id,
        branch_name
      }
    });

    // Create subscription with trial period (14 days)
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: amount,
            recurring: {
              interval: 'month'
            },
            product_data: {
              name: `Age UK ${branch_name} - ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `SaaS subscription for Age UK branch management`
            }
          }
        }
      ],
      trial_period_days: 14,
      metadata: {
        branch_id,
        branch_name
      }
    });

    // Store subscription in database
    const branchSub = await base44.asServiceRole.entities.BranchSubscription.create({
      branch_id,
      branch_name,
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      plan,
      status: subscription.status === 'trialing' ? 'active' : subscription.status,
      amount_monthly: amount / 100, // Convert from pence to GBP
      billing_cycle_start: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
      next_billing_date: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0],
      payment_method: subscription.default_payment_method?.id || '',
      invoice_email: email || `${branch_id}@ageuk.org.uk`,
      auto_renew: !subscription.cancel_at
    });

    return Response.json({
      success: true,
      subscription: branchSub,
      message: `Subscription created with 14-day trial for ${branch_name}`,
      trial_ends: new Date(subscription.trial_end * 1000).toISOString()
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});