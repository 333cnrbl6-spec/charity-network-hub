import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const EMAIL_TEMPLATES = {
  invoice: (charity, invoice) => ({
    subject: `Invoice ${invoice.invoice_number} from CharityHub`,
    html: `
      <h2>Your CharityHub Invoice</h2>
      <p>Hi ${charity.name},</p>
      <p>Your invoice for <strong>£${invoice.amount}</strong> is ready.</p>
      <p><strong>Due Date:</strong> ${invoice.due_date}</p>
      <p><a href="${invoice.pdf_url}">View Full Invoice</a></p>
      <hr />
      <p>Thank you for using CharityHub.</p>
    `
  }),
  trial_expiring: (charity, days) => ({
    subject: `⏰ Your CharityHub trial expires in ${days} days`,
    html: `
      <h2>Your Trial is Expiring Soon</h2>
      <p>Hi ${charity.name},</p>
      <p>Your free trial expires in <strong>${days} days</strong>. Upgrade now to unlock all features.</p>
      <p><a href="https://charityhub.com/upgrade">Upgrade to Professional</a></p>
      <p>Questions? <a href="https://charityhub.com/support">Contact our team</a></p>
    `
  }),
  payment_failed: (charity, invoice) => ({
    subject: `❌ Payment failed: Action required`,
    html: `
      <h2>Payment Issue Detected</h2>
      <p>Hi ${charity.name},</p>
      <p>We couldn't process your payment for invoice <strong>${invoice.invoice_number}</strong>.</p>
      <p>Update your billing details to avoid service interruption:</p>
      <p><a href="https://charityhub.com/billing">Update Payment Method</a></p>
      <p>We'll retry automatically in 3 days.</p>
    `
  }),
  payment_retry: (charity) => ({
    subject: '💳 Payment retry successful',
    html: `
      <h2>Payment Confirmed</h2>
      <p>Hi ${charity.name},</p>
      <p>Your payment was successfully processed. Your account is fully active.</p>
      <p>Thank you!</p>
    `
  })
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email_type, recipient_email, charity_id, context } = await req.json();

    // Validate inputs
    if (!email_type || !recipient_email || !charity_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log email attempt
    const emailLog = await base44.entities.EmailLog.create({
      charity_id,
      recipient_email,
      email_type,
      subject: 'Sending...',
      status: 'sent'
    });

    // Get template
    const template = EMAIL_TEMPLATES[email_type];
    if (!template) {
      throw new Error(`Unknown email type: ${email_type}`);
    }

    // Render email
    const { subject, html } = template(context.charity, context);

    // Send via SendGrid API
    const sgKey = Deno.env.get('SENDGRID_API_KEY');
    if (!sgKey) {
      throw new Error('SendGrid API key not configured');
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sgKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ 
          to: [{ email: recipient_email }],
          subject
        }],
        from: { email: 'noreply@charityhub.com', name: 'CharityHub' },
        content: [{ 
          type: 'text/html', 
          value: `
            <html>
              <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                ${html}
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #999;">© 2026 CharityHub Ltd. All rights reserved.</p>
              </body>
            </html>
          ` 
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      await base44.entities.EmailLog.update(emailLog.id, {
        status: 'failed',
        error_message: errorText
      });
      throw new Error(`SendGrid error: ${response.status}`);
    }

    await base44.entities.EmailLog.update(emailLog.id, { 
      status: 'sent',
      subject
    });
    return Response.json({ success: true, message: 'Email sent', log_id: emailLog.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});