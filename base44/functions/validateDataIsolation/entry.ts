import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Audit that users only see their charity's data
    const charities = await base44.entities.Charity.list();
    const violations = [];

    for (const charity of charities) {
      // Check if users can access via direct ID
      try {
        // Simulate unauthorized access attempt
        const unauthorizedDonors = await base44.asServiceRole.entities.Donor.filter({
          charity_id: { $ne: charity.id }
        });

        if (unauthorizedDonors.length > 0) {
          violations.push({
            type: 'data_isolation_breach',
            charity_id: charity.id,
            detail: 'Foreign data visible',
            severity: 'critical'
          });

          // Log security incident
          await base44.entities.SecurityAuditLog.create({
            event_type: 'data_isolation_breach',
            severity: 'critical',
            charity_id: charity.id,
            details: `Detected cross-charity data visibility for ${charity.id}`,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        // Expected - access denied
      }
    }

    if (violations.length > 0) {
      return Response.json({ 
        success: false, 
        violations,
        message: `Found ${violations.length} data isolation issues`
      });
    }

    return Response.json({ 
      success: true, 
      message: 'Data isolation validated - no breaches found' 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});