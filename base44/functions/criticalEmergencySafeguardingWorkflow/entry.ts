import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get event data from automation trigger
    const { event, data } = await req.json();

    // Only process create events
    if (event.type !== 'create') {
      return Response.json({ skipped: 'Not a create event' });
    }

    const incidentRef = data.incident_reference;
    const incidentType = data.incident_type.replace(/_/g, ' ');
    const severity = data.ai_severity_classification || 'unknown';
    const reportedBy = data.reported_by_name;
    const vulnerableAdult = data.vulnerable_adult_details?.name || 'Not specified';
    const immediateDanger = data.vulnerable_adult_details?.immediate_danger;

    // Only trigger for critical incidents with immediate danger
    if (severity !== 'critical' || !immediateDanger) {
      return Response.json({ skipped: 'Not critical with immediate danger' });
    }

    const safeguardingLead = data.safeguarding_lead_assigned;

    // Send urgent email
    if (safeguardingLead) {
      const emailSubject = `🚨 CRITICAL EMERGENCY: Safeguarding Incident ${incidentRef} - IMMEDIATE ACTION REQUIRED`;
      
      const emailBody = `
CRITICAL SAFEGUARDING EMERGENCY
================================

IMMEDIATE ACTION REQUIRED

Incident Reference: ${incidentRef}
Severity: CRITICAL
IMMEDIATE DANGER: YES ⚠️

INCIDENT:
Type: ${incidentType}
Reported: ${new Date(data.created_date).toLocaleString('en-GB')}
Reported By: ${reportedBy}
Vulnerable Adult: ${vulnerableAdult}

CURRENT STATUS:
${data.incident_description}

IMMEDIATE ACTIONS TAKEN:
${data.actions_taken || 'Not specified'}

AI RISK ASSESSMENT:
Risk Score: ${data.ai_risk_assessment?.risk_score || 'N/A'}/100
Urgency: ${data.ai_risk_assessment?.urgency?.replace(/_/g, ' ') || 'unknown'}

RECOMMENDED ACTIONS:
${data.ai_risk_assessment?.recommended_actions?.length > 0 
  ? data.ai_risk_assessment.recommended_actions.map(a => `• ${a}`).join('\n')
  : 'Review immediately'}

STATUTORY REFERRAL: ${data.ai_risk_assessment?.statutory_referral_required ? 'REQUIRED - URGENT' : 'Assess immediately'}
${data.ai_risk_assessment?.referral_agencies?.length > 0
  ? `Agencies: ${data.ai_risk_assessment.referral_agencies.join(', ')}`
  : ''}

IMMEDIATE STEPS:
----------------
1. Contact vulnerable adult IMMEDIATELY if safe to do so
2. Call 999 if emergency/crime in progress
3. Contact Adult Social Care Emergency Duty Team
4. Police referral if crime suspected
5. Update incident status to 'escalated_to_authorities' if external agencies involved
6. Document all actions in incident progress notes

CONTACT:
View incident: /safeguarding

---
CRITICAL ALERT - Automated from Age UK Safeguarding System
Generated: ${new Date().toLocaleString('en-GB')}
      `.trim();

      try {
        await base44.integrations.Core.SendEmail({
          to: safeguardingLead,
          subject: emailSubject,
          body: emailBody,
          from_name: 'Age UK Safeguarding EMERGENCY'
        });

        console.log(`CRITICAL alert email sent to: ${safeguardingLead}`);
      } catch (emailError) {
        console.error('Failed to send critical alert email:', emailError);
      }
    }

    // Create critical priority task (due immediately)
    const taskDueDate = new Date(); // Due today
    const taskTitle = `🚨 CRITICAL: Immediate Response Required - ${incidentRef}`;
    const taskDescription = `
CRITICAL SAFEGUARDING EMERGENCY - IMMEDIATE RESPONSE REQUIRED

INCIDENT: ${incidentRef}
SEVERITY: CRITICAL with IMMEDIATE DANGER ⚠️

THIS REQUIRES IMMEDIATE ACTION - DO NOT DELAY

REQUIRED WITHIN 2 HOURS:
1. Make immediate contact with vulnerable adult (if safe)
2. Assess if 999 emergency services required
3. Contact Adult Social Care Emergency Duty Team
4. Police referral if crime in progress
5. Consider LADO referral if allegation against staff/volunteer
6. Update incident status immediately
7. Document all actions in progress notes

RISK SCORE: ${data.ai_risk_assessment?.risk_score || 'N/A'}/100

Access incident: /safeguarding
    `.trim();

    try {
      const task = await base44.asServiceRole.entities.ProjectTask.create({
        title: taskTitle,
        description: taskDescription,
        status: 'todo',
        priority: 'critical',
        due_date: taskDueDate.toISOString().split('T')[0],
        tags: ['safeguarding', 'critical-emergency', 'immediate-response', incidentRef],
        assignee: safeguardingLead || '',
        assignee_name: safeguardingLead ? safeguardingLead.split('@')[0] : 'Safeguarding Lead',
        estimated_hours: 4,
        source: 'ai_identified',
        source_id: data.id,
        source_channel: 'safeguarding-critical-automation'
      });

      console.log(`CRITICAL task created: ${task.id}`);
    } catch (taskError) {
      console.error('Failed to create critical task:', taskError);
    }

    // Log in audit trail
    try {
      await base44.entities.SafeguardingIncident.update(data.id, {
        audit_trail: [
          ...(data.audit_trail || []),
          {
            timestamp: new Date().toISOString(),
            user: 'system_automation',
            action: 'critical_emergency_workflow_triggered',
            details: `CRITICAL ALERT: Email sent to ${safeguardingLead || 'N/A'}, immediate response task created`
          }
        ]
      });
    } catch (auditError) {
      console.error('Failed to update audit trail:', auditError);
    }

    return Response.json({
      success: true,
      incident_ref: incidentRef,
      critical_alert: true,
      email_sent: !!safeguardingLead,
      task_created: true
    });

  } catch (error) {
    console.error('Critical safeguarding workflow failed:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});