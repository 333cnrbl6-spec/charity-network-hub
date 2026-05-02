import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { target_risk_level = 'high', discount_percent = 10, message = '' } = await req.json();

    // Get at-risk customers via churn prediction
    const response = await base44.functions.invoke('predictChurnRisk', {});
    const predictions = response.data?.predictions || [];

    const targetCustomers = predictions.filter(p => p.risk_level === target_risk_level);
    const emailsSent = [];
    const emailsFailed = [];

    for (const customer of targetCustomers) {
      try {
        const charity = await base44.entities.Charity.get(customer.charity_id);

        // Create win-back email
        const emailBody = `
          Hi ${charity.name},

          We noticed you haven't been using CharityHub recently. We miss you!

          As a special offer, we're giving you ${discount_percent}% off for the next month.
          
          ${message ? `\n${message}\n` : ''}

          Get back to managing your charity with CharityHub:
          https://charityhub.com/login

          Questions? Reply to this email.

          Best,
          The CharityHub Team
        `;

        await base44.integrations.Core.SendEmail({
          to: charity.email || charity.contact_email,
          subject: `We miss you! ${discount_percent}% off your next month`,
          body: emailBody,
          from_name: 'CharityHub'
        });

        // Log email
        await base44.entities.EmailLog.create({
          charity_id: customer.charity_id,
          recipient_email: charity.email || charity.contact_email,
          subject: `We miss you! ${discount_percent}% off your next month`,
          email_type: 'alert',
          status: 'sent'
        });

        emailsSent.push(customer.charity_id);
      } catch (err) {
        emailsFailed.push({
          charity_id: customer.charity_id,
          error: err.message
        });
      }
    }

    return Response.json({
      campaign_type: 'win_back',
      target_risk_level,
      discount_percent,
      total_targets: targetCustomers.length,
      emails_sent: emailsSent.length,
      emails_failed: emailsFailed.length,
      failed_details: emailsFailed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});