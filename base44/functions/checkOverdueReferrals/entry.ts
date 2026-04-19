import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all open safeguarding incidents with external referrals
    const incidents = await base44.asServiceRole.entities.SafeguardingIncident.list();

    const RESPONSE_SLA = {
      police: 24,
      social_services: 48,
      cqc: 72,
      lado: 72,
      other: 96,
    };

    const overdueAlerts = [];
    const now = new Date();

    for (const incident of incidents) {
      // Skip closed incidents
      if (incident.status === 'closed') continue;

      if (!incident.external_referrals || incident.external_referrals.length === 0) continue;

      for (const referral of incident.external_referrals) {
        // Skip if already received response or marked as completed
        if (referral.outcome === 'completed' || referral.outcome === 'received') continue;

        // Determine agency type and SLA
        const agencyType = getAgencyType(referral.agency);
        const slaDays = RESPONSE_SLA[agencyType];
        const slaDurationMs = slaDays * 60 * 60 * 1000;

        // Check if overdue
        const referralDate = new Date(referral.referral_date);
        const timeDiff = now - referralDate;

        if (timeDiff > slaDurationMs) {
          overdueAlerts.push({
            incident_id: incident.id,
            incident_reference: incident.incident_reference,
            agency: referral.agency,
            referral_date: referral.referral_date,
            days_overdue: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
            sla_hours: slaDays * 24,
            safeguarding_lead: incident.safeguarding_lead_assigned,
            severity: incident.ai_severity_classification,
          });
        }
      }
    }

    // Send alerts for overdue referrals
    if (overdueAlerts.length > 0) {
      for (const alert of overdueAlerts) {
        const leadEmail = alert.safeguarding_lead || (await getDefaultLeadEmail(base44));

        if (leadEmail) {
          await base44.integrations.Core.SendEmail({
            to: leadEmail,
            subject: `⏰ OVERDUE: External Agency Response Required - ${alert.incident_reference}`,
            body: `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #ea580c;">
      <h2 style="margin-top: 0; color: #92400e;">⏰ OVERDUE REFERRAL RESPONSE</h2>

      <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p><strong>Incident:</strong> ${alert.incident_reference}</p>
        <p><strong>Agency:</strong> ${alert.agency}</p>
        <p><strong>Referral Date:</strong> ${new Date(alert.referral_date).toLocaleString('en-GB')}</p>
        <p><strong>Days Overdue:</strong> ${alert.days_overdue} days</p>
        <p><strong>Expected Response Within:</strong> ${alert.sla_hours} hours</p>
      </div>

      <div style="background-color: #fff7ed; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ea580c;">
        <p style="margin: 0; color: #92400e;"><strong>Action Required:</strong></p>
        <ul style="margin: 10px 0 0 0;">
          <li>Follow up with ${alert.agency} to obtain status update</li>
          <li>Document all contact attempts and responses</li>
          <li>Update the referral status in the system once contacted</li>
          <li>Escalate if no response received within 5 working days</li>
        </ul>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
        <p>This is an automated compliance check from the Age UK Safeguarding System.</p>
      </div>
    </div>
  </body>
</html>
            `,
            from_name: 'Age UK Safeguarding System',
          });
        }
      }
    }

    return Response.json({
      success: true,
      overdueCount: overdueAlerts.length,
      alerts: overdueAlerts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Check overdue referrals error:', error);
    return Response.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});

function getAgencyType(agencyName) {
  const name = agencyName.toLowerCase();
  if (name.includes('police')) return 'police';
  if (name.includes('social') || name.includes('services')) return 'social_services';
  if (name.includes('cqc')) return 'cqc';
  if (name.includes('lado')) return 'lado';
  return 'other';
}

async function getDefaultLeadEmail(base44) {
  try {
    const users = await base44.asServiceRole.entities.User.list();
    const admin = users.find(u => u.role === 'admin');
    return admin?.email;
  } catch {
    return null;
  }
}