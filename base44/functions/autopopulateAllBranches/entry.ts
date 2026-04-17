import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all branches
    const branches = await base44.asServiceRole.entities.BranchConfig.list();
    if (!branches?.length) {
      return Response.json({ error: 'No branches found' }, { status: 404 });
    }

    // Default population counts (Bury standard)
    const defaultCounts = {
      clients: 10,
      volunteers: 5,
      jobs: 8,
      sessions: 4,
      grants: 3,
      complianceAreas: 12
    };

    const results = [];
    const populatePromises = branches.map(async (branch) => {
      try {
        const response = await base44.asServiceRole.functions.invoke('populateBranchData', {
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          counts: defaultCounts,
        });

        return {
          branch_id: branch.branch_id,
          branch_name: branch.branch_name,
          success: true,
          message: `Populated with ${defaultCounts.clients} clients, ${defaultCounts.volunteers} volunteers, ${defaultCounts.jobs} jobs, ${defaultCounts.sessions} sessions, ${defaultCounts.grants} grants`,
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

    const populateResults = await Promise.all(populatePromises);
    const successful = populateResults.filter(r => r.success).length;

    console.log(`[autopopulateAllBranches] Populated ${successful}/${populateResults.length} branches`);

    return Response.json({
      success: true,
      total_branches: populateResults.length,
      successful_populations: successful,
      results: populateResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('autopopulateAllBranches error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});