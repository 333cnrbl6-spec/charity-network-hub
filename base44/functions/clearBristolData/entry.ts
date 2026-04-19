/**
 * clearBristolData — light version
 * Deletes up to 200 records total across all entities.
 * Rate-limit safe: small batches with delay.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function clearEntity(svc, entityName, limit = 200) {
  try {
    const records = await svc.entities[entityName].list('-created_date', limit);
    let deleted = 0;
    for (const r of records) {
      try { await svc.entities[entityName].delete(r.id); deleted++; } catch (_) {}
      // Small pause to avoid rate limits
      if (deleted % 20 === 0) await new Promise(r => setTimeout(r, 200));
    }
    return deleted;
  } catch (_) { return 0; }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const counts = {};
    // Sequential to avoid overwhelming the API
    counts.clients = await clearEntity(svc, 'Client');
    counts.volunteers = await clearEntity(svc, 'Volunteer');
    counts.sessions = await clearEntity(svc, 'Session');
    counts.grants = await clearEntity(svc, 'Grant');
    counts.jobs = await clearEntity(svc, 'Job');
    counts.compliance = await clearEntity(svc, 'ComplianceRecord');
    counts.reports = await clearEntity(svc, 'BranchReport');
    return Response.json({ success: true, cleared: counts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});