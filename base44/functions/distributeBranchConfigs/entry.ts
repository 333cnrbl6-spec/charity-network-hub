import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all location configs from hub
    const locationConfigs = await base44.asServiceRole.entities.LocationConfig.list();
    const branches = await base44.asServiceRole.entities.BranchConfig.filter({ status: 'active' });

    if (!branches?.length) {
      return Response.json({ error: 'No active branches found' }, { status: 404 });
    }

    const distributionResults = [];
    const distributePromises = branches.map(async (branch) => {
      try {
        // Find matching location config
        const branchConfig = locationConfigs.find(lc => lc.branch_id === branch.branch_id);

        if (!branchConfig) {
          return {
            branch_id: branch.branch_id,
            branch_name: branch.branch_name,
            success: false,
            message: 'No location config found',
          };
        }

        // Send config to branch via pushConfigToBranch
        const response = await base44.asServiceRole.functions.invoke('pushConfigToBranch', {
          branch_id: branch.branch_id,
          config: branchConfig,
        });

        return {
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          success: response.data?.success ?? false,
          message: response.data?.response?.message,
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

    const results = await Promise.all(distributePromises);
    const successful = results.filter(r => r.success).length;

    console.log(`[distributeBranchConfigs] Distributed configs to ${successful}/${results.length} branches`);

    return Response.json({
      success: true,
      total_branches: results.length,
      successful_distributions: successful,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('distributeBranchConfigs error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});