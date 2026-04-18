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

    // Clear all demo data associated with Sue
    await base44.asServiceRole.entities.Client.delete({ created_by: user.email });
    await base44.asServiceRole.entities.Volunteer.delete({ created_by: user.email });
    await base44.asServiceRole.entities.Job.delete({ created_by: user.email });
    await base44.asServiceRole.entities.Session.delete({ created_by: user.email });
    await base44.asServiceRole.entities.Grant.delete({ created_by: user.email });

    // Mark Sue's onboarding as needing to restart
    await base44.auth.updateMe({ 
      onboarding_status: 'pending',
      onboarding_step: 0,
      selected_modules: [],
      workspace_view: null
    });

    return Response.json({ 
      success: true, 
      message: 'Data cleared. Ready for new onboarding.',
      redirect: '/role-onboarding'
    });
  } catch (error) {
    console.error('Error clearing Sue data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});