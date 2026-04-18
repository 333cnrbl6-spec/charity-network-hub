import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Clear Sue Bradley's onboarding state
    const sueBradleyEmail = 'sue.bradley1@ntlworld.com';
    
    // Update her user profile to reset onboarding
    await base44.auth.updateMe({
      onboarding_complete: false,
      assigned_location: 'bury',
      assigned_role: 'coordinator'
    });

    // Optionally delete any existing records tied to her previous setup
    // This can be expanded to delete client data, volunteer records, etc.
    
    return Response.json({ 
      success: true, 
      message: 'Sue Bradley has been cleared for re-onboarding',
      assigned_location: 'bury',
      assigned_role: 'coordinator'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});