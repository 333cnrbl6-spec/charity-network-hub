import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { branch_ids, counts } = await req.json();

    const results = [];
    for (const branch_id of branch_ids) {
      try {
        const branch = await base44.asServiceRole.entities.BranchConfig.filter({ branch_id }).then(b => b[0]);
        if (!branch) continue;

        const result = await base44.asServiceRole.functions.invoke('populateBranchData', {
          branch_id,
          branch_name: branch.branch_name,
          counts
        });
        results.push(result.data);
      } catch (error) {
        results.push({ branch_id, error: error.message });
      }
    }

    return Response.json({
      success: true,
      message: `Bulk population completed for ${branch_ids.length} branches`,
      results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});