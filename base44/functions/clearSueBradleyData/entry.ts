import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Sue Bradley can clear her own data
    if (user.email !== 'sue.bradley1@ntlworld.com') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Clear ALL data associated with Sue across all entities
    const entitiesToClear = [
      'Client', 'Volunteer', 'Job', 'Session', 'Grant',
      'LocationConfig', 'BranchConfig', 'ComplianceRecord'
    ];

    for (const entity of entitiesToClear) {
      try {
        await base44.asServiceRole.entities[entity].delete({ created_by: user.email });
      } catch (err) {
        // Entity may not have records, continue
        console.log(`No records to clear for ${entity}`);
      }
    }

    // Reset user profile completely - clear all onboarding & workspace data
    await base44.auth.updateMe({ 
      onboarding_status: null,
      onboarding_step: null,
      selected_modules: null,
      workspace_view: null,
      demoDataAction: null,
      selectedWorkspace: null
    });

    return Response.json({ 
      success: true, 
      message: 'All data cleared. User ready for fresh registration.',
      redirect: '/role-onboarding'
    });
  } catch (error) {
    console.error('Error clearing Sue data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});