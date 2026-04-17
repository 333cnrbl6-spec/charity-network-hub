import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set');
      return Response.json({ received: true }, { status: 200 });
    }

    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    const base44 = createClientFromRequest(req);

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await handleSubscriptionChange(base44, event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(base44, event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(base44, event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(base44, event.data.object);
        break;
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleSubscriptionChange(base44, subscription) {
  const { customer, id, status, current_period_end } = subscription;
  
  const subs = await base44.asServiceRole.entities.BranchSubscription.filter({
    stripe_subscription_id: id
  });

  if (subs.length === 0) return;

  const currentSub = subs[0];
  const daysOverdue = status === 'past_due' ? calculateDaysOverdue(current_period_end) : 0;

  await base44.asServiceRole.entities.BranchSubscription.update(currentSub.id, {
    status: status === 'trialing' ? 'active' : status,
    days_overdue: daysOverdue,
    next_billing_date: new Date(current_period_end * 1000).toISOString().split('T')[0]
  });
}

async function handlePaymentSuccess(base44, invoice) {
  const { subscription, paid } = invoice;

  if (!paid || !subscription) return;

  const subs = await base44.asServiceRole.entities.BranchSubscription.filter({
    stripe_subscription_id: subscription
  });

  if (subs.length === 0) return;

  await base44.asServiceRole.entities.BranchSubscription.update(subs[0].id, {
    status: 'active',
    days_overdue: 0,
    last_payment_date: new Date().toISOString()
  });
}

async function handlePaymentFailed(base44, invoice) {
  const { subscription } = invoice;

  if (!subscription) return;

  const subs = await base44.asServiceRole.entities.BranchSubscription.filter({
    stripe_subscription_id: subscription
  });

  if (subs.length === 0) return;

  await base44.asServiceRole.entities.BranchSubscription.update(subs[0].id, {
    status: 'past_due',
    days_overdue: 1
  });
}

async function handleSubscriptionCancelled(base44, subscription) {
  const { id } = subscription;

  const subs = await base44.asServiceRole.entities.BranchSubscription.filter({
    stripe_subscription_id: id
  });

  if (subs.length === 0) return;

  await base44.asServiceRole.entities.BranchSubscription.update(subs[0].id, {
    status: 'cancelled',
    cancellation_date: new Date().toISOString().split('T')[0]
  });
}

function calculateDaysOverdue(periodEndTimestamp) {
  const periodEnd = new Date(periodEndTimestamp * 1000);
  const now = new Date();
  return Math.floor((now - periodEnd) / (1000 * 60 * 60 * 24));
}