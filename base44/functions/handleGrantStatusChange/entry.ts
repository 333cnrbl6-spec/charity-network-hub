import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { format } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { grant_id, new_status, charity_id } = await req.json();

    if (!grant_id || !new_status) {
      return Response.json({ error: 'grant_id and new_status required' }, { status: 400 });
    }

    // Get grant details
    const grant = await base44.asServiceRole.entities.Grant.filter({
      id: grant_id
    });

    if (!grant || grant.length === 0) {
      return Response.json({ error: 'Grant not found' }, { status: 404 });
    }

    const grantData = grant[0];
    const charityIdValue = charity_id || grantData.charity_id;

    // Find team members for this charity
    const users = await base44.asServiceRole.entities.User.filter({
      charity_id: charityIdValue
    });

    if (!users || users.length === 0) {
      return Response.json({ success: true, notified: 0 });
    }

    // Compose notification message based on status
    let subject = '';
    let message = '';

    switch (new_status) {
      case 'submitted':
        subject = `Grant Submitted: ${grantData.grant_name}`;
        message = `The grant application for "${grantData.grant_name}" from ${grantData.funder_name} has been submitted.\n\nDeadline: ${format(new Date(grantData.deadline), 'MMM d, yyyy')}`;
        break;
      case 'awarded':
        subject = `🎉 Grant Awarded: ${grantData.grant_name}`;
        message = `Congratulations! Your grant application for "${grantData.grant_name}" has been awarded.\n\nAmount: £${grantData.amount?.toLocaleString() || 'N/A'}\nFunder: ${grantData.funder_name}`;
        break;
      case 'rejected':
        subject = `Grant Application Rejected: ${grantData.grant_name}`;
        message = `Unfortunately, the grant application for "${grantData.grant_name}" from ${grantData.funder_name} has been rejected.\n\nPlease review feedback and consider applying to similar funds.`;
        break;
      default:
        subject = `Grant Status Updated: ${grantData.grant_name}`;
        message = `The grant "${grantData.grant_name}" has been moved to: ${new_status}`;
    }

    // Send emails to team
    let sentCount = 0;
    for (const user of users) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject,
          body: `Dear ${user.full_name || 'Team Member'},\n\n${message}\n\nLog in to view full details in the Grant Management dashboard.\n\nBest regards,\nCharityHub Team`
        });
        sentCount++;
      } catch (emailErr) {
        console.warn(`Failed to send email to ${user.email}:`, emailErr);
      }
    }

    // Log the change
    await base44.asServiceRole.functions.invoke('logAuditEvent', {
      charity_id: charityIdValue,
      action: 'grant_status_changed',
      entity_type: 'Grant',
      entity_id: grant_id,
      changes: {
        from: grantData.status,
        to: new_status,
        grant_name: grantData.grant_name,
        notified: sentCount
      }
    });

    return Response.json({
      success: true,
      notified: sentCount,
      message: `Status updated and ${sentCount} team member(s) notified`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});