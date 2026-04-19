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
      action, 
      details, 
      previous_value, 
      new_value, 
      changed_fields 
    } = await req.json();

    if (!incident_id || !action) {
      return Response.json(
        { error: 'Missing required fields: incident_id, action' },
        { status: 400 }
      );
    }

    // Get the current incident
    const incident = await base44.entities.SafeguardingIncident.read(incident_id);

    if (!incident) {
      return Response.json({ error: 'Incident not found' }, { status: 404 });
    }

    // Create audit entry with comprehensive tracking
    const auditEntry = {
      timestamp: new Date().toISOString(),
      user: user.email,
      user_name: user.full_name || user.email,
      action: action,
      details: details || null,
      previous_value: previous_value !== undefined ? previous_value : null,
      new_value: new_value !== undefined ? new_value : null,
      changed_fields: changed_fields || null,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    };

    // Add to audit trail (or create if doesn't exist)
    const updatedAuditTrail = incident.audit_trail ? [...incident.audit_trail, auditEntry] : [auditEntry];

    // Update the incident with the new audit entry
    await base44.entities.SafeguardingIncident.update(incident_id, {
      audit_trail: updatedAuditTrail,
    });

    return Response.json({
      success: true,
      audit_entry: auditEntry,
    });
  } catch (error) {
    console.error('Error logging audit entry:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});