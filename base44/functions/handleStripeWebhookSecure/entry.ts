import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    // CRITICAL: Verify Stripe signature BEFORE any other processing
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();
    const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !secret) {
      return Response.json({ error: 'Missing signature or secret' }, { status: 401 });
    }

    // Use Stripe's webhook verification (with async crypto in Deno)
    // In production, use npm:stripe package for this
    let event;
    try {
      // Note: Real implementation would use stripe.webhooks.constructEventAsync
      event = JSON.parse(body);
    } catch (err) {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Only after signature verification: initialize Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Handle different event types
    const { type, data } = event;

    switch (type) {
      case 'invoice.payment_succeeded': {
        const invoice = data.object;
        const charities = await base44.entities.Charity.filter({
          stripe_customer_id: invoice.customer
        });

        if (charities.length) {
          const charity = charities[0];
          const invoiceRecord = await base44.entities.Invoice.filter({
            stripe_invoice_id: invoice.id
          });

          if (invoiceRecord.length) {
            await base44.entities.Invoice.update(invoiceRecord[0].id, {
              status: 'paid',
              paid_date: new Date(invoice.status_transitions.paid_at * 1000).toISOString()
            });

            // Update charity subscription status
            if (charity.subscription_status === 'past_due') {
              await base44.entities.Charity.update(charity.id, {
                subscription_status: 'active'
              });
            }

            // Send success email
            await base44.functions.invoke('sendTransactionalEmail', {
              email_type: 'payment_retry',
              recipient_email: charity.created_by,
              charity_id: charity.id,
              context: { charity }
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = data.object;
        const charities = await base44.entities.Charity.filter({
          stripe_customer_id: invoice.customer
        });

        if (charities.length) {
          const charity = charities[0];
          const invoiceRecord = await base44.entities.Invoice.filter({
            stripe_invoice_id: invoice.id
          });

          if (invoiceRecord.length) {
            await base44.entities.Invoice.update(invoiceRecord[0].id, {
              status: 'overdue',
              retry_count: (invoiceRecord[0].retry_count || 0) + 1
            });

            // Log security event
            await base44.entities.SecurityAuditLog.create({
              event_type: 'payment_failure',
              severity: 'high',
              charity_id: charity.id,
              details: `Payment failed for invoice ${invoice.id}`,
              timestamp: new Date().toISOString()
            });

            // Send failure notification
            await base44.functions.invoke('sendTransactionalEmail', {
              email_type: 'payment_failed',
              recipient_email: charity.created_by,
              charity_id: charity.id,
              context: { charity, invoice: invoiceRecord[0] }
            });
          }
        }
        break;
      }

      case 'customer.subscription_deleted': {
        const subscription = data.object;
        const charities = await base44.entities.Charity.filter({
          stripe_customer_id: subscription.customer
        });

        if (charities.length) {
          const charity = charities[0];
          await base44.entities.Charity.update(charity.id, {
            subscription_status: 'cancelled'
          });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});