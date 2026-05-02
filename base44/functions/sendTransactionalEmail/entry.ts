import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const EMAIL_TEMPLATES = {
  invoice: (charity, invoice) => ({
    subject: `Invoice ${invoice.invoice_number} from CharityHub`,
    body: `Your invoice for ${invoice.currency} ${invoice.amount} is ready.\n\nDue: ${invoice.due_date}\n\nView: ${invoice.pdf_url}`
  }),
  trial_expiring: (charity, days) => ({
    subject: `Your CharityHub trial expires in ${days} days`,
    body: `Your free trial ends in ${days} days. Upgrade now to continue using all features.\n\nUpgrade: [UPGRADE_URL]`
  }),
  payment_failed: (charity, invoice) => ({
    subject: `Payment failed for invoice ${invoice.invoice_number}`,
    body: `We couldn't process your payment. Update your billing info to avoid service interruption.\n\nUpdate payment: [PAYMENT_URL]`
  }),
  payment_retry: (charity) => ({
    subject: 'Retrying your payment',
    body: 'We\'re retrying your failed payment. You\'ll receive confirmation shortly.'
  })
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email_type, recipient_email, charity_id, context } = await req.json();

    // Log email attempt
    const emailLog = await base44.entities.EmailLog.create({
      charity_id,
      recipient_email,
      email_type,
      subject: 'Email in progress',
      status: 'sent'
    });

    // Get template
    const template = EMAIL_TEMPLATES[email_type];
    if (!template) {
      throw new Error(`Unknown email type: ${email_type}`);
    }

    // Render email (simplified - use SendGrid/SES in production)
    const { subject, body } = template(context.charity, context);

    // Send via SendGrid API (requires SENDGRID_API_KEY secret)
    const sgKey = Deno.env.get('SENDGRID_API_KEY');
    if (sgKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sgKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient_email }] }],
          from: { email: 'noreply@charityhub.com', name: 'CharityHub' },
          subject,
          content: [{ type: 'text/plain', value: body }]
        })
      });

      if (!response.ok) {
        await base44.entities.EmailLog.update(emailLog.id, {
          status: 'failed',
          error_message: await response.text()
        });
        throw new Error('SendGrid API error');
      }
    }

    await base44.entities.EmailLog.update(emailLog.id, { status: 'sent' });
    return Response.json({ success: true, message: 'Email sent' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});