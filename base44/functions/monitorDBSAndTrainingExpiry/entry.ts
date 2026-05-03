import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all active volunteers
    const volunteers = await base44.asServiceRole.entities.Volunteer.list();
    const activeVolunteers = volunteers.filter(v => v.status === 'active');

    const today = new Date();
    const alertThresholds = [30, 14, 7]; // days before expiry
    const alerts = [];

    for (const volunteer of activeVolunteers) {
      // Check DBS expiry
      if (volunteer.dbs_expiry) {
        const expiryDate = new Date(volunteer.dbs_expiry);
        const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry > 0 && alertThresholds.includes(daysUntilExpiry)) {
          alerts.push({
            type: 'dbs_expiry',
            volunteer_id: volunteer.id,
            volunteer_email: volunteer.email,
            volunteer_name: volunteer.name,
            days_until_expiry: daysUntilExpiry,
            expiry_date: volunteer.dbs_expiry
          });
        }
      }

      // Check training expiry (if training_expiry field exists)
      if (volunteer.training_expiry) {
        const expiryDate = new Date(volunteer.training_expiry);
        const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry > 0 && alertThresholds.includes(daysUntilExpiry)) {
          alerts.push({
            type: 'training_expiry',
            volunteer_id: volunteer.id,
            volunteer_email: volunteer.email,
            volunteer_name: volunteer.name,
            days_until_expiry: daysUntilExpiry,
            expiry_date: volunteer.training_expiry
          });
        }
      }
    }

    // Process each alert
    for (const alert of alerts) {
      // Send email to volunteer
      const emailSubject = alert.type === 'dbs_expiry'
        ? `DBS Check Expiring in ${alert.days_until_expiry} Days`
        : `Training Certificate Expiring in ${alert.days_until_expiry} Days`;

      const emailBody = alert.type === 'dbs_expiry'
        ? `
Hello ${alert.volunteer_name},

Your DBS check expires on ${alert.expiry_date}. You have ${alert.days_until_expiry} days remaining.

To continue volunteering, you'll need to renew your DBS check. Please contact our safeguarding team at safeguarding@charityhub.org to arrange this.

Best regards,
The Safeguarding Team
        `
        : `
Hello ${alert.volunteer_name},

Your volunteer training certificate expires on ${alert.expiry_date}. You have ${alert.days_until_expiry} days remaining.

Please complete your training renewal to maintain your volunteer status. Reply to this email or visit your portal to enroll in the refresher course.

Best regards,
The Safeguarding Team
        `;

      await base44.integrations.Core.SendEmail({
        to: alert.volunteer_email,
        subject: emailSubject,
        body: emailBody
      });

      // Create in-app alert for volunteer
      await base44.asServiceRole.entities.Alert.create({
        volunteer_id: alert.volunteer_id,
        alert_type: alert.type,
        severity: alert.days_until_expiry <= 7 ? 'high' : 'medium',
        title: emailSubject,
        message: `Your ${alert.type === 'dbs_expiry' ? 'DBS check' : 'training'} expires on ${alert.expiry_date}. Please renew immediately.`,
        expiry_date: alert.expiry_date,
        days_until_expiry: alert.days_until_expiry,
        created_at: new Date().toISOString(),
        read: false
      });

      // Send email to safeguarding lead(s)
      // In a real scenario, you'd query for users with safeguarding_lead role
      const safeguardingEmail = 'safeguarding@charityhub.org';
      const safeguardingEmailBody = alert.type === 'dbs_expiry'
        ? `
Safeguarding Alert:

Volunteer: ${alert.volunteer_name}
Email: ${alert.volunteer_email}

DBS Check Expiry: ${alert.expiry_date} (${alert.days_until_expiry} days remaining)

Action Required: Monitor renewal and ensure compliance.
        `
        : `
Safeguarding Alert:

Volunteer: ${alert.volunteer_name}
Email: ${alert.volunteer_email}

Training Expiry: ${alert.expiry_date} (${alert.days_until_expiry} days remaining)

Action Required: Ensure volunteer completes refresher training.
        `;

      await base44.integrations.Core.SendEmail({
        to: safeguardingEmail,
        subject: `Safeguarding Alert: ${alert.type === 'dbs_expiry' ? 'DBS' : 'Training'} Expiry - ${alert.volunteer_name}`,
        body: safeguardingEmailBody
      });

      // Log the alert action
      await base44.asServiceRole.entities.AuditLog.create({
        user_email: 'system@charityhub.org',
        action: 'expiry_alert_triggered',
        entity_type: 'Volunteer',
        entity_id: alert.volunteer_id,
        changes: {
          alert_type: alert.type,
          days_until_expiry: alert.days_until_expiry,
          notifications_sent: ['volunteer', 'safeguarding_lead']
        },
        timestamp: new Date().toISOString(),
        status: 'success'
      });
    }

    return Response.json({
      success: true,
      alerts_processed: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('DBS/Training monitoring error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});