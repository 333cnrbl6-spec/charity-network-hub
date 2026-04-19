import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get event data from automation trigger
    const { event, data, old_data } = await req.json();

    // Only process create and update events
    if (!['create', 'update'].includes(event.type)) {
      return Response.json({ skipped: 'Not a create/update event' });
    }

    // Check if severity is high or critical
    const severity = data.ai_severity_classification;
    if (!['high', 'critical'].includes(severity)) {
      return Response.json({ skipped: 'Severity not high/critical' });
    }

    // For updates, only trigger if status changed to reported or severity changed to high/critical
    if (event.type === 'update' && old_data) {
      const severityChanged = old_data.ai_severity_classification !== severity;
      const statusChangedToReported = old_data.status !== 'reported' && data.status === 'reported';
      
      if (!severityChanged && !statusChangedToReported) {
        return Response.json({ skipped: 'No relevant change' });
      }
    }

    const safeguardingLead = data.safeguarding_lead_assigned;
    const incidentRef = data.incident_reference;
    const incidentType = data.incident_type.replace(/_/g, ' ');
    const incidentDate = new Date(data.incident_date).toLocaleDateString('en-GB');
    const vulnerability = data.vulnerable_adult_details?.name || 'Not specified';
    const location = data.incident_location || 'Not specified';
    const urgency = data.ai_risk_assessment?.urgency || 'unknown';
    const riskScore = data.ai_risk_assessment?.risk_score || 'N/A';

    // Send email notification to safeguarding lead
    if (safeguardingLead) {
      const emailSubject = `🚨 ${severity.toUpperCase()} Priority Safeguarding Incident: ${incidentRef}`;
      
      const emailBody = `
URGENT SAFEGUARDING NOTIFICATION

Incident Reference: ${incidentRef}
Severity Level: ${severity.toUpperCase()}
Risk Score: ${riskScore}/100
Urgency: ${urgency.replace(/_/g, ' ')}

INCIDENT DETAILS:
-----------------
Type: ${incidentType}
Date/Time: ${incidentDate}
Location: ${location}
Vulnerable Adult: ${vulnerability}

REPORTED BY:
${data.reported_by_name} (${data.reported_by_role})
${data.reported_by}

IMMEDIATE ACTIONS TAKEN:
${data.actions_taken || 'Not specified'}

AI RISK ASSESSMENT:
${data.ai_risk_assessment?.recommended_actions?.length > 0 
  ? data.ai_risk_assessment.recommended_actions.map(a => `• ${a}`).join('\n')
  : 'No specific recommendations'}

STATUTORY REFERRAL: ${data.ai_risk_assessment?.statutory_referral_required ? 'REQUIRED' : 'Not required'}
${data.ai_risk_assessment?.referral_agencies?.length > 0
  ? `Agencies: ${data.ai_risk_assessment.referral_agencies.join(', ')}`
  : ''}

NEXT STEPS:
-----------
1. Review incident details immediately
2. Complete initial risk assessment within 24 hours (task created automatically)
3. Determine if external referral required
4. Update incident status and progress notes

ACCESS INCIDENT:
View full details in the Safeguarding Hub: /safeguarding

---
This is an automated notification from the Age UK Safeguarding System.
Incident logged: ${new Date().toLocaleString('en-GB')}
      `.trim();

      try {
        await base44.integrations.Core.SendEmail({
          to: safeguardingLead,
          subject: emailSubject,
          body: emailBody,
          from_name: 'Age UK Safeguarding System'
        });

        console.log(`Email sent to safeguarding lead: ${safeguardingLead}`);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
    }

    // Create task for initial risk assessment
    const taskDueDate = new Date();
    taskDueDate.setDate(taskDueDate.getDate() + 1); // 24 hours from now

    const taskTitle = `Initial Risk Assessment: ${incidentRef} (${severity.toUpperCase()})`;
    const taskDescription = `
URGENT: Complete initial risk assessment for safeguarding incident.

INCIDENT: ${incidentRef}
SEVERITY: ${severity.toUpperCase()}
REPORTED: ${new Date(data.created_date).toLocaleString('en-GB')}

REQUIRED ACTIONS:
1. Review incident details and AI risk assessment
2. Contact vulnerable adult if appropriate and safe
3. Determine if statutory referral required (Adult Social Care, Police, LADO, etc.)
4. Assess immediate safety measures needed
5. Assign investigation priority and timeline
6. Update incident status and next steps

AI RISK SCORE: ${riskScore}/100
URGENCY: ${urgency.replace(/_/g, ' ')}

Access incident: /safeguarding
    `.trim();

    try {
      const task = await base44.asServiceRole.entities.ProjectTask.create({
        title: taskTitle,
        description: taskDescription,
        status: 'todo',
        priority: severity === 'critical' ? 'critical' : 'high',
        due_date: taskDueDate.toISOString().split('T')[0],
        tags: ['safeguarding', 'risk-assessment', incidentRef],
        assignee: safeguardingLead || '',
        assignee_name: safeguardingLead ? safeguardingLead.split('@')[0] : 'Safeguarding Lead',
        estimated_hours: 2,
        source: 'ai_identified',
        source_id: data.id,
        source_channel: 'safeguarding-automation'
      });

      console.log(`Task created: ${task.id} for incident ${incidentRef}`);
    } catch (taskError) {
      console.error('Failed to create task:', taskError);
    }

    // Log automation action in incident audit trail
    try {
      await base44.entities.SafeguardingIncident.update(data.id, {
        audit_trail: [
          ...(data.audit_trail || []),
          {
            timestamp: new Date().toISOString(),
            user: 'system_automation',
            action: 'high_priority_workflow_triggered',
            details: `Automated workflow: Email sent to ${safeguardingLead || 'N/A'}, task created for 24h risk assessment`
          }
        ]
      });
    } catch (auditError) {
      console.error('Failed to update audit trail:', auditError);
    }

    return Response.json({
      success: true,
      incident_ref: incidentRef,
      severity: severity,
      email_sent: !!safeguardingLead,
      task_created: true,
      safeguarding_lead: safeguardingLead
    });

  } catch (error) {
    console.error('Safeguarding workflow failed:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});