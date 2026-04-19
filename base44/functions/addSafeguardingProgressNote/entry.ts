import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { incident_id, progress_note, next_review_date, status_update } = await req.json();

    if (!incident_id || !progress_note) {
      return Response.json({ 
        error: 'Incident ID and progress note required' 
      }, { status: 400 });
    }

    // Get current incident
    const incident = await base44.entities.SafeguardingIncident.get(incident_id);
    
    if (!incident) {
      return Response.json({ error: 'Incident not found' }, { status: 404 });
    }

    // Update incident with progress note
    const updatedIncident = {
      investigation_notes: incident.investigation_notes 
        ? `${incident.investigation_notes}\n\n[${new Date().toISOString()}] ${progress_note}`
        : `[${new Date().toISOString()}] ${progress_note}`,
      
      status: status_update || incident.status,
      
      audit_trail: [
        ...(incident.audit_trail || []),
        {
          timestamp: new Date().toISOString(),
          user: user.email,
          action: 'progress_note_added',
          details: progress_note
        }
      ]
    };

    // Add next review date if provided
    if (next_review_date) {
      updatedIncident.next_review_date = next_review_date;
    }

    await base44.entities.SafeguardingIncident.update(incident_id, updatedIncident);

    // Resolve overdue alert if exists
    const existingAlerts = await base44.asServiceRole.entities.NetworkAlert.filter({
      branch_id: incident_id,
      alert_type: 'safeguarding_review_overdue',
      resolved: false
    });

    if (existingAlerts.length > 0) {
      for (const alert of existingAlerts) {
        await base44.asServiceRole.entities.NetworkAlert.update(alert.id, {
          resolved: true
        });
      }
    }

    return Response.json({
      success: true,
      incident_id: incident_id,
      updated_at: new Date().toISOString(),
      message: 'Progress note added successfully'
    });

  } catch (error) {
    console.error('Failed to add progress note:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});