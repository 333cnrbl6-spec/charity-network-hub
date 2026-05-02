import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const charities = await base44.entities.Charity.filter({
      subscription_status: 'trial'
    });

    const results = [];

    for (const charity of charities) {
      const trialEnds = new Date(charity.trial_ends_date);
      const daysLeft = Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24));

      // Send reminder at 7 days, 1 day, and on expiry
      if (daysLeft === 7 || daysLeft === 1 || daysLeft <= 0) {
        await base44.functions.invoke('sendTransactionalEmail', {
          email_type: daysLeft <= 0 ? 'trial_expired' : 'trial_expiring',
          recipient_email: charity.created_by,
          charity_id: charity.id,
          context: { charity, days: daysLeft }
        });

        // Block access if expired
        if (daysLeft < 0) {
          await base44.entities.Charity.update(charity.id, {
            subscription_status: 'past_due'
          });
          results.push({ charity_id: charity.id, action: 'blocked_access' });
        } else {
          results.push({ charity_id: charity.id, action: 'reminder_sent', days_left: daysLeft });
        }
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});