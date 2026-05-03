import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all open safeguarding incidents
    const incidents = await base44.asServiceRole.entities.SafeguardingIncident.filter({
      status: 'open'
    });

    const now = Date.now();
    const fortyEightHoursMs = 48 * 60 * 60 * 1000;
    const reminders = [];

    for (const incident of incidents) {
      // Check if incident was created more than 48 hours ago
      const createdTime = new Date(incident.created_at).getTime();
      const timeSinceCreation = now - createdTime;

      // If incident is older than 48 hours and hasn't had a follow-up done yet
      if (timeSinceCreation > fortyEightHoursMs && !incident.follow_up_completed_at) {
        reminders.push(incident);

        // Get safeguarding lead email (from assigned_to or default safeguarding email)
        const safeguardingLeadEmail = incident.assigned_to || 'safeguarding@charityhub.org';
        const hoursElapsed = Math.floor(timeSinceCreation / (1000 * 60 * 60));

        // Send email reminder to safeguarding lead
        await base44.integrations.Core.SendEmail({
          to: safeguardingLeadEmail,
          subject: `URGENT: 48-Hour Follow-Up Required - Safeguarding Incident #${incident.id}`,
          body: `
Hello,

This is an automated reminder that a safeguarding incident requires follow-up action.

INCIDENT DETAILS:
Title: ${incident.title}
Severity: ${incident.severity.toUpperCase()}
Created: ${incident.created_at}
Hours Elapsed: ${hoursElapsed}h

DESCRIPTION:
${incident.description}

REQUIRED ACTION:
Complete the 48-hour follow-up assessment and document findings in the safeguarding system.

CRITICAL: This incident has been open for ${hoursElapsed} hours without follow-up documentation.

Please log in to the Safeguarding Dashboard immediately to:
1. Review the incident details
2. Conduct follow-up assessment
3. Update incident status and add follow-up notes
4. Document any actions taken

If follow-up has already been completed, please mark this incident as resolved.

Best regards,
Safeguarding System
          `
        });

        // Create an alert for the safeguarding lead
        await base44.asServiceRole.entities.Alert.create({
          alert_type: 'safeguarding_followup',
          severity: 'high',
          title: `48-Hour Follow-Up Due: ${incident.title}`,
          message: `Safeguarding incident #${incident.id} requires immediate follow-up action. ${hoursElapsed} hours have elapsed since creation.`,
          related_id: incident.id,
          created_at: new Date().toISOString()
        });

        // Log the reminder action
        await base44.asServiceRole.entities.AuditLog.create({
          user_email: 'system@charityhub.org',
          action: 'safeguarding_followup_reminder_sent',
          entity_type: 'SafeguardingIncident',
          entity_id: incident.id,
          changes: {
            reminder_type: '48_hour_followup',
            hours_elapsed: hoursElapsed,
            recipient_email: safeguardingLeadEmail
          },
          timestamp: new Date().toISOString(),
          status: 'success'
        });
      }
    }

    return Response.json({
      success: true,
      reminders_sent: reminders.length,
      incidents_checked: incidents.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Safeguarding follow-up reminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});