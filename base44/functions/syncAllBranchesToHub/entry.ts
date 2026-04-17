import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all active branches
    const branches = await base44.asServiceRole.entities.BranchConfig.filter({ status: 'active' });

    if (!branches?.length) {
      return Response.json({ error: 'No active branches found' }, { status: 404 });
    }

    const syncResults = [];
    const syncPromises = branches.map(async (branch) => {
      try {
        const response = await base44.asServiceRole.functions.invoke('syncToHub', {
          branch_id: branch.branch_id,
        });
        return {
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          success: response.data?.success ?? false,
          message: response.data?.hub_response?.message,
        };
      } catch (error) {
        return {
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          success: false,
          message: error.message,
        };
      }
    });

    const results = await Promise.all(syncPromises);
    const successful = results.filter(r => r.success).length;

    console.log(`[syncAllBranchesToHub] Synced ${successful}/${results.length} branches`);

    return Response.json({
      success: true,
      total_branches: results.length,
      successful_syncs: successful,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('syncAllBranchesToHub error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});