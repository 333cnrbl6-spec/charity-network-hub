import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      incident_id,
      incident_reference,
      agency_id,
      agency_name,
      agency_email,
      custom_message,
      incident_details
    } = await req.json();

    if (!incident_id || !agency_email) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the incident for context
    const incident = await base44.entities.SafeguardingIncident.read(incident_id);

    if (!incident) {
      return Response.json({ error: 'Incident not found' }, { status: 404 });
    }

    // Generate email body
    const emailBody = generateEmailBody(incident_reference, incident_details, custom_message);

    // Send email via integration
    const emailResponse = await base44.integrations.Core.SendEmail({
      to: agency_email,
      from_name: 'Safeguarding Team',
      subject: `URGENT: Safeguarding Incident Report - ${incident_reference}`,
      body: emailBody
    });

    // Log the notification in the incident's audit trail
    const auditEntry = {
      timestamp: new Date().toISOString(),
      user: user.email,
      action: 'external_notification_sent',
      details: JSON.stringify({
        agency_id,
        agency_name,
        agency_email,
        notification_type: 'email',
        status: 'sent'
      }),
      previous_value: null,
      new_value: null
    };

    const updatedAuditTrail = incident.audit_trail ? [...incident.audit_trail, auditEntry] : [auditEntry];

    // Update incident with audit entry
    await base44.entities.SafeguardingIncident.update(incident_id, {
      audit_trail: updatedAuditTrail
    });

    return Response.json({
      success: true,
      notification: {
        agency: agency_name,
        email: agency_email,
        timestamp: auditEntry.timestamp,
        reference: incident_reference
      }
    });
  } catch (error) {
    console.error('Error sending external agency notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateEmailBody(incidentReference, details, customMessage) {
  return `
SAFEGUARDING INCIDENT NOTIFICATION

Incident Reference: ${incidentReference}
Incident Type: ${details.type?.replace(/_/g, ' ').toUpperCase()}
Severity: ${details.severity?.toUpperCase()}
Reported By: ${details.reported_by}

INCIDENT LOCATION
${details.location}

INCIDENT DATE & TIME
${new Date(details.date).toLocaleString()}

INCIDENT DESCRIPTION
${details.description}

${customMessage ? `

ADDITIONAL INFORMATION
${customMessage}` : ''}

---
This is an automated notification from the Age UK Safeguarding Management System.
For more information, please contact the Safeguarding Team directly.

CONFIDENTIALITY NOTICE:
This email and any attachments are confidential and intended solely for the use of the named recipient(s).
If you are not the intended recipient, please notify the sender immediately and do not disclose the contents to any other person.
`;
}