import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    // Get the incident data
    const incident = data || (await base44.entities.SafeguardingIncident.read(event.entity_id));

    if (!incident) {
      return Response.json({ error: 'Incident not found' }, { status: 404 });
    }

    // Only process critical and high risk incidents
    const severity = incident.ai_severity_classification;
    if (!['critical', 'high'].includes(severity)) {
      return Response.json({ success: true, skipped: true, reason: 'Not critical/high risk' });
    }

    // Determine safeguarding lead email
    let leadEmail = incident.safeguarding_lead_assigned;
    let leadName = 'Safeguarding Lead';

    // If no assigned lead, try to find default safeguarding contact
    if (!leadEmail) {
      const users = await base44.asServiceRole.entities.User.list();
      const safeguardingUser = users.find(u => u.role === 'admin' || u.org_role === 'safeguarding_lead');
      if (safeguardingUser) {
        leadEmail = safeguardingUser.email;
        leadName = safeguardingUser.full_name;
      }
    } else {
      // Get the lead's full name
      const users = await base44.asServiceRole.entities.User.list();
      const lead = users.find(u => u.email === leadEmail);
      if (lead) {
        leadName = lead.full_name;
      }
    }

    if (!leadEmail) {
      return Response.json({
        error: 'No safeguarding lead contact found',
        status: 400,
      });
    }

    // Build alert subject and body
    const riskLevel = severity.toUpperCase();
    const incidentType = incident.incident_type.replace(/_/g, ' ');
    const reporterName = incident.reported_by_name || 'Unknown';

    const emailSubject = `🚨 URGENT: ${riskLevel} RISK Safeguarding Incident - ${incident.incident_reference}`;

    const emailBody = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="background-color: ${severity === 'critical' ? '#fee2e2' : '#fef3c7'}; padding: 20px; border-radius: 8px; border-left: 4px solid ${severity === 'critical' ? '#dc2626' : '#f59e0b'};">
      <h2 style="margin-top: 0; color: ${severity === 'critical' ? '#991b1b' : '#92400e'};">
        ⚠️ ${riskLevel} RISK SAFEGUARDING INCIDENT
      </h2>

      <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <p><strong>Reference:</strong> ${incident.incident_reference}</p>
        <p><strong>Severity:</strong> <span style="color: ${severity === 'critical' ? '#dc2626' : '#f59e0b'}; font-weight: bold;">${riskLevel}</span></p>
        <p><strong>Risk Score:</strong> ${incident.ai_risk_assessment?.risk_score || 'N/A'}/100</p>
        <p><strong>Type:</strong> ${incidentType}</p>
        <p><strong>Reported By:</strong> ${reporterName} (${incident.reported_by_role})</p>
        <p><strong>Incident Date:</strong> ${new Date(incident.incident_date).toLocaleString('en-GB')}</p>
        <p><strong>Location:</strong> ${incident.incident_location}</p>
      </div>

      <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Incident Summary</h3>
        <p>${incident.incident_description}</p>
      </div>

      ${incident.vulnerable_adult_details?.immediate_danger ? `
      <div style="background-color: #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="margin: 0; color: #991b1b;"><strong>🚨 IMMEDIATE DANGER IDENTIFIED</strong></p>
        <p style="margin: 5px 0 0 0; color: #991b1b;">Vulnerable adult may be in immediate danger. Immediate intervention required.</p>
      </div>
      ` : ''}

      ${incident.ai_risk_assessment?.statutory_referral_required ? `
      <div style="background-color: #fee2e2; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="margin: 0; color: #991b1b;"><strong>📋 STATUTORY REFERRAL REQUIRED</strong></p>
        <p style="margin: 5px 0 0 0; color: #991b1b;">External referral to statutory agencies is required. Refer to incident details for recommended referral bodies.</p>
      </div>
      ` : ''}

      ${incident.ai_risk_assessment?.recommended_actions && incident.ai_risk_assessment.recommended_actions.length > 0 ? `
      <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Recommended Actions</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${incident.ai_risk_assessment.recommended_actions.map(action => `<li>${action}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 6px;">
        <p style="margin: 0;"><strong>Next Steps:</strong></p>
        <ol style="margin: 10px 0 0 0;">
          <li>Review the full incident report immediately</li>
          <li>Complete risk assessment and determine immediate actions</li>
          <li>Contact vulnerable adult if safe to do so</li>
          <li>Make statutory referrals if required</li>
          <li>Document all actions in the incident record</li>
        </ol>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
        <p>This is an automated alert from the Age UK Safeguarding System.</p>
        <p>Review the full incident details: <a href="https://your-app-domain.com/safeguarding/incident/${incident.id}" style="color: #2563eb; text-decoration: none;">View Incident Details</a></p>
      </div>
    </div>
  </body>
</html>
    `;

    // Send email notification
    await base44.integrations.Core.SendEmail({
      to: leadEmail,
      subject: emailSubject,
      body: emailBody,
      from_name: 'Age UK Safeguarding System',
    });

    return Response.json({
      success: true,
      message: `Alert sent to ${leadEmail}`,
      incident_id: event.entity_id,
      severity: severity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Notification error:', error);
    return Response.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});