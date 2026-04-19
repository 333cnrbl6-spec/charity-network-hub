import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Service role for admin operations
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));

    // Get all active incidents that need follow-up
    const incidents = await base44.asServiceRole.entities.SafeguardingIncident.filter({});
    
    const activeIncidents = incidents.filter(i => 
      !['closed'].includes(i.status) &&
      ['critical', 'high', 'medium'].includes(i.ai_severity_classification)
    );

    const followUpRequired = [];
    const overdueReviews = [];

    activeIncidents.forEach(incident => {
      // Find last progress note or creation date
      const lastUpdate = incident.audit_trail?.length > 0 
        ? new Date(incident.audit_trail[incident.audit_trail.length - 1].timestamp)
        : new Date(incident.created_date);

      const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      const daysSinceUpdate = hoursSinceUpdate / 24;

      // Check if follow-up is due (48 hours = 2 days)
      if (hoursSinceUpdate >= 48) {
        const daysOverdue = Math.floor((hoursSinceUpdate - 48) / 24);
        
        followUpRequired.push({
          id: incident.id,
          reference: incident.incident_reference,
          severity: incident.ai_severity_classification,
          status: incident.status,
          safeguarding_lead: incident.safeguarding_lead_assigned,
          last_update: lastUpdate.toISOString(),
          hours_since_update: Math.round(hoursSinceUpdate),
          days_overdue: daysOverdue,
          is_overdue: daysOverdue > 0,
        });

        if (daysOverdue > 0) {
          overdueReviews.push({
            incident_id: incident.id,
            reference: incident.incident_reference,
            severity: incident.ai_severity_classification,
            days_overdue: daysOverdue,
            safeguarding_lead: incident.safeguarding_lead_assigned,
          });
        }
      }
    });

    // Log overdue reviews as alerts
    for (const overdue of overdueReviews) {
      // Check if alert already exists for this incident
      const existingAlerts = await base44.asServiceRole.entities.NetworkAlert.filter({
        branch_id: overdue.incident_id,
        alert_type: 'safeguarding_review_overdue'
      });

      if (existingAlerts.length === 0) {
        await base44.asServiceRole.entities.NetworkAlert.create({
          branch_id: overdue.incident_id,
          alert_type: 'safeguarding_review_overdue',
          message: `Safeguarding incident ${overdue.reference} review is ${overdue.days_overdue} day(s) overdue. Severity: ${overdue.severity.toUpperCase()}. Assigned to: ${overdue.safeguarding_lead || 'Unassigned'}`,
          severity: overdue.severity === 'critical' ? 'critical' : overdue.severity === 'high' ? 'high' : 'medium',
          resolved: false
        });
      }
    }

    // Send notifications to safeguarding leads (would integrate with email/SMS service)
    const notificationsSent = [];
    for (const incident of followUpRequired) {
      if (incident.safeguarding_lead) {
        // In production, trigger email/SMS notification
        notificationsSent.push({
          lead: incident.safeguarding_lead,
          incident_reference: incident.reference,
          overdue: incident.is_overdue,
          days_overdue: incident.days_overdue
        });
      }
    }

    return Response.json({
      total_active_incidents: activeIncidents.length,
      follow_up_required: followUpRequired.length,
      overdue_reviews: overdueReviews.length,
      notifications_sent: notificationsSent.length,
      incidents: followUpRequired,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Follow-up check failed:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});