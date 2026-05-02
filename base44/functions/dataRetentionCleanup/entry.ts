import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const policies = await base44.entities.DataRetentionPolicy.filter({ enabled: true });
    const results = [];

    for (const policy of policies) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.retention_days);

      try {
        // Get records older than cutoff
        const oldRecords = await base44.entities[policy.entity_type].filter({
          created_date: { $lt: cutoffDate.toISOString() }
        });

        // Delete in batches
        let deleted = 0;
        for (const record of oldRecords) {
          await base44.entities[policy.entity_type].delete(record.id);
          deleted++;
        }

        // Update policy stats
        if (deleted > 0) {
          await base44.entities.DataRetentionPolicy.update(policy.id, {
            last_cleanup: new Date().toISOString(),
            next_cleanup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            records_deleted: (policy.records_deleted || 0) + deleted
          });
        }

        results.push({ entity_type: policy.entity_type, deleted });
      } catch (err) {
        results.push({ entity_type: policy.entity_type, error: err.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});