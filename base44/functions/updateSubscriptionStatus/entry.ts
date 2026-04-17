import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { subscription_id, status, cancellation_reason } = await req.json();

    if (!subscription_id || !status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validStatuses = ['active', 'past_due', 'suspended', 'cancelled', 'pending'];
    if (!validStatuses.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData = { status };
    if (status === 'cancelled') {
      updateData.cancellation_date = new Date().toISOString().split('T')[0];
      updateData.cancellation_reason = cancellation_reason || 'Admin cancelled';
    }

    const updated = await base44.asServiceRole.entities.BranchSubscription.update(
      subscription_id,
      updateData
    );

    return Response.json({
      success: true,
      subscription: updated
    });
  } catch (error) {
    console.error('Update error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});