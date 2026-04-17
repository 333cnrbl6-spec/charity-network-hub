import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role === 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { branch_id, action } = body;

    if (!branch_id || !action) {
      return Response.json({ error: 'Missing branch_id or action' }, { status: 400 });
    }

    if (action === 'purge_demo') {
      // Get all demo data entities for this branch
      const clients = await base44.asServiceRole.entities.Client.filter({ created_by: `demo_${branch_id}` });
      const volunteers = await base44.asServiceRole.entities.Volunteer.filter({ created_by: `demo_${branch_id}` });
      const jobs = await base44.asServiceRole.entities.Job.filter({ created_by: `demo_${branch_id}` });
      const sessions = await base44.asServiceRole.entities.Session.filter({ created_by: `demo_${branch_id}` });
      const grants = await base44.asServiceRole.entities.Grant.filter({ created_by: `demo_${branch_id}` });

      // Delete all demo records
      let deletedCount = 0;
      for (const entity of [...clients, ...volunteers, ...jobs, ...sessions, ...grants]) {
        try {
          if (entity.id.includes('client') || entity.full_name) {
            await base44.asServiceRole.entities.Client.delete(entity.id);
          } else if (entity.job_type) {
            await base44.asServiceRole.entities.Job.delete(entity.id);
          } else if (entity.session_name) {
            await base44.asServiceRole.entities.Session.delete(entity.id);
          } else if (entity.grant_name) {
            await base44.asServiceRole.entities.Grant.delete(entity.id);
          }
          deletedCount++;
        } catch (e) {
          console.error(`Failed to delete entity: ${e.message}`);
        }
      }

      // Update LocationConfig to mark as onboarded
      const locations = await base44.asServiceRole.entities.LocationConfig.filter({ branch_id });
      if (locations.length > 0) {
        await base44.asServiceRole.entities.LocationConfig.update(locations[0].id, {
          onboarded: true,
          is_demo: false
        });
      }

      return Response.json({
        success: true,
        message: `Purged ${deletedCount} demo records for branch ${branch_id}`,
        deletedCount
      });
    }

    if (action === 'mark_ready') {
      const branches = await base44.asServiceRole.entities.BranchConfig.filter({ branch_id });
      if (branches.length > 0) {
        await base44.asServiceRole.entities.BranchConfig.update(branches[0].id, {
          status: 'active',
          last_sync_date: new Date().toISOString()
        });
      }

      const locations = await base44.asServiceRole.entities.LocationConfig.filter({ branch_id });
      if (locations.length > 0) {
        await base44.asServiceRole.entities.LocationConfig.update(locations[0].id, {
          onboarded: true
        });
      }

      return Response.json({
        success: true,
        message: `Branch ${branch_id} marked as ready for production`
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Onboarding error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});