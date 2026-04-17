import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { branch_id } = await req.json();

    if (!branch_id) {
      return Response.json({ error: 'Missing branch_id' }, { status: 400 });
    }

    // Fetch subscription for this branch
    const subs = await base44.asServiceRole.entities.BranchSubscription.filter({
      branch_id
    });

    if (subs.length === 0) {
      return Response.json({
        has_access: false,
        reason: 'No subscription found',
        status: null
      });
    }

    const sub = subs[0];

    // Check access based on subscription status
    const hasAccess = sub.status === 'active' || sub.status === 'trialing';
    const reason = !hasAccess ? sub.status : null;

    return Response.json({
      has_access: hasAccess,
      status: sub.status,
      reason,
      days_overdue: sub.days_overdue || 0,
      next_billing_date: sub.next_billing_date,
      plan: sub.plan
    });
  } catch (error) {
    console.error('Access check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});