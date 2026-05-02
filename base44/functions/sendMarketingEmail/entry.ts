import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { 
      target_group = 'trial_users', // trial_users, at_risk, inactive, all
      email_type = 'feature_announcement',
      subject,
      body,
      send_now = false
    } = await req.json();

    let targetCharities = [];

    if (target_group === 'trial_users') {
      targetCharities = await base44.entities.Charity.filter({
        subscription_status: 'trial'
      });
    } else if (target_group === 'at_risk') {
      targetCharities = await base44.entities.Charity.filter({
        subscription_status: 'active'
      });
      // Filter by health score in memory
      const health = await base44.entities.CustomerHealth.list();
      const atRiskIds = health.filter(h => h.churn_risk === 'high').map(h => h.charity_id);
      targetCharities = targetCharities.filter(c => atRiskIds.includes(c.id));
    } else if (target_group === 'inactive') {
      targetCharities = await base44.entities.Charity.filter({
        subscription_status: 'past_due'
      });
    } else {
      targetCharities = await base44.entities.Charity.list();
    }

    const emailsSent = [];
    const emailsFailed = [];

    for (const charity of targetCharities) {
      try {
        // Get recipient email
        const recipientEmail = charity.email || charity.contact_email;
        if (!recipientEmail) continue;

        if (send_now) {
          await base44.integrations.Core.SendEmail({
            to: recipientEmail,
            subject,
            body,
            from_name: 'CharityHub'
          });
        }

        // Log email
        await base44.entities.EmailLog.create({
          charity_id: charity.id,
          recipient_email: recipientEmail,
          subject,
          email_type,
          status: send_now ? 'sent' : 'scheduled'
        });

        emailsSent.push(charity.id);
      } catch (err) {
        emailsFailed.push({
          charity_id: charity.id,
          error: err.message
        });
      }
    }

    return Response.json({
      status: 'success',
      target_group,
      email_type,
      total_targets: targetCharities.length,
      emails_sent: emailsSent.length,
      emails_failed: emailsFailed.length,
      failed_details: emailsFailed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});