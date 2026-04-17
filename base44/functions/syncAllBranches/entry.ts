import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can force sync
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all active branches
    const branches = await base44.asServiceRole.entities.BranchConfig.list();
    const activeBranches = branches.filter(b => b.status === 'active');

    const syncResults = [];

    // Call syncToHub for each active branch
    for (const branch of activeBranches) {
      try {
        const result = await base44.asServiceRole.functions.invoke('syncToHub', {
          branch_id: branch.branch_id,
        });
        syncResults.push({
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          success: true,
          result,
        });
      } catch (error) {
        syncResults.push({
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          success: false,
          error: error.message,
        });
      }
    }

    return Response.json({
      message: 'Sync completed',
      total: activeBranches.length,
      results: syncResults,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});