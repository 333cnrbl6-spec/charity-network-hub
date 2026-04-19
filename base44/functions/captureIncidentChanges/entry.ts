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
      old_data,
      new_data,
      action_description
    } = await req.json();

    if (!incident_id || !old_data || !new_data) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Detect changed fields
    const changedFields = [];
    const fieldChanges = {};

    // Compare all fields between old and new data
    const allKeys = new Set([...Object.keys(old_data), ...Object.keys(new_data)]);
    
    for (const key of allKeys) {
      const oldVal = old_data[key];
      const newVal = new_data[key];

      // Skip audit_trail, created_date, id for comparison
      if (['audit_trail', 'created_date', 'updated_date', 'created_by', 'id'].includes(key)) {
        continue;
      }

      // Deep comparison for objects and arrays
      const oldStr = JSON.stringify(oldVal);
      const newStr = JSON.stringify(newVal);

      if (oldStr !== newStr) {
        changedFields.push(key);
        fieldChanges[key] = {
          previous: oldVal,
          new: newVal
        };
      }
    }

    // If no changes detected, return early
    if (changedFields.length === 0) {
      return Response.json({
        success: true,
        message: 'No changes detected',
        audit_entry: null
      });
    }

    // Get the incident to append audit entry
    const incident = await base44.entities.SafeguardingIncident.read(incident_id);

    if (!incident) {
      return Response.json({ error: 'Incident not found' }, { status: 404 });
    }

    // Create comprehensive audit entry
    const auditEntry = {
      timestamp: new Date().toISOString(),
      user: user.email,
      user_name: user.full_name || user.email,
      action: action_description || 'incident_updated',
      details: `Updated ${changedFields.length} field(s): ${changedFields.join(', ')}`,
      changed_fields: changedFields,
      field_changes: fieldChanges,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    };

    // Add to audit trail
    const updatedAuditTrail = incident.audit_trail ? [...incident.audit_trail, auditEntry] : [auditEntry];

    // Update the incident
    await base44.entities.SafeguardingIncident.update(incident_id, {
      audit_trail: updatedAuditTrail,
    });

    return Response.json({
      success: true,
      audit_entry: auditEntry,
      summary: {
        changed_fields: changedFields,
        field_count: changedFields.length
      }
    });
  } catch (error) {
    console.error('Error capturing incident changes:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});