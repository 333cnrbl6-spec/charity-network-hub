import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { entity_type, records, branch_id } = body;

    if (!entity_type || !records || !Array.isArray(records) || !branch_id) {
      return Response.json({ error: 'Missing required fields: entity_type, records (array), branch_id' }, { status: 400 });
    }

    const validEntities = ['Client', 'Volunteer', 'Job', 'Session', 'Grant'];
    if (!validEntities.includes(entity_type)) {
      return Response.json({ error: `Invalid entity type. Must be one of: ${validEntities.join(', ')}` }, { status: 400 });
    }

    // Get the entity from base44
    const entityClass = base44.entities[entity_type];
    if (!entityClass) {
      return Response.json({ error: `Entity ${entity_type} not found` }, { status: 404 });
    }

    // Bulk create records
    const results = {
      created: 0,
      failed: 0,
      errors: []
    };

    for (const record of records) {
      try {
        await entityClass.create(record);
        results.created++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          record: record,
          error: error.message
        });
      }
    }

    console.log(`[importBranchData] User ${user.email} imported ${results.created} ${entity_type} records for branch ${branch_id}`);

    return Response.json({
      success: true,
      entity_type,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});