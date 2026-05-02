import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const invoices = await base44.entities.Invoice.filter({
      status: 'overdue'
    });

    const results = [];

    for (const invoice of invoices) {
      if ((invoice.retry_count || 0) >= 3) {
        continue; // Max retries reached
      }

      // Attempt Stripe charge retry (requires Stripe integration)
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      if (!stripeKey) {
        continue; // Stripe not configured
      }

      try {
        const response = await fetch(
          `https://api.stripe.com/v1/invoices/${invoice.stripe_invoice_id}/pay`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${stripeKey}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        if (response.ok) {
          await base44.entities.Invoice.update(invoice.id, {
            status: 'paid',
            paid_date: new Date().toISOString()
          });

          // Send success notification
          await base44.functions.invoke('sendTransactionalEmail', {
            email_type: 'payment_retry',
            recipient_email: invoice.created_by,
            charity_id: invoice.charity_id,
            context: { charity: { id: invoice.charity_id } }
          });

          results.push({ invoice_id: invoice.id, status: 'paid' });
        } else {
          await base44.entities.Invoice.update(invoice.id, {
            retry_count: (invoice.retry_count || 0) + 1
          });
          results.push({ invoice_id: invoice.id, status: 'retry_failed' });
        }
      } catch (err) {
        results.push({ invoice_id: invoice.id, status: 'error', error: err.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});