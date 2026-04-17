import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    if (!data || !data.assignee || event.type !== 'update') {
      return Response.json({ success: true, skipped: true });
    }

    // Check if status changed
    const statusChanged = old_data?.status !== data.status;
    
    // Check if a blocking task was completed
    const oldBlockers = old_data?.blocking_task_ids || [];
    const newBlockers = data.blocking_task_ids || [];
    const blockersRemoved = oldBlockers.some(id => !newBlockers.includes(id));
    
    // Check if a new blocker was completed (old_data has blocker, new_data doesn't have it)
    let completedBlockerTitle = null;
    if (blockersRemoved && old_data.blocking_task_ids?.length > 0) {
      const removedBlockerId = old_data.blocking_task_ids.find(id => !newBlockers.includes(id));
      if (removedBlockerId) {
        try {
          const blocker = await base44.asServiceRole.entities.ProjectTask.get(removedBlockerId);
          if (blocker?.status === 'completed') {
            completedBlockerTitle = blocker.title;
          }
        } catch (e) {
          console.warn('Could not fetch blocker task:', e.message);
        }
      }
    }

    // Only send if status changed or a blocker was completed
    if (!statusChanged && !completedBlockerTitle) {
      return Response.json({ success: true, skipped: true });
    }

    const assigneeEmail = data.assignee;
    const subject = statusChanged 
      ? `Task Status Update: ${data.title}`
      : `Blocker Resolved: ${completedBlockerTitle} for ${data.title}`;

    let emailBody = `Hi ${data.assignee_name || 'there'},\n\n`;

    if (statusChanged) {
      emailBody += `The task "${data.title}" status has been updated to: ${data.status}\n\n`;
    }

    if (completedBlockerTitle) {
      emailBody += `Good news! The blocking task "${completedBlockerTitle}" has been completed.\n`;
      emailBody += `"${data.title}" is no longer blocked and can now proceed.\n\n`;
    }

    if (data.due_date) {
      emailBody += `Due Date: ${new Date(data.due_date).toLocaleDateString('en-GB')}\n`;
    }
    if (data.estimated_hours) {
      emailBody += `Estimated Hours: ${data.estimated_hours}h\n`;
    }

    emailBody += `\nPlease review and take any necessary action.\n\nBest regards,\nProject Task Management System`;

    await base44.integrations.Core.SendEmail({
      to: assigneeEmail,
      subject,
      body: emailBody
    });

    return Response.json({
      success: true,
      email_sent: true,
      to: assigneeEmail,
      reason: statusChanged ? 'status_changed' : 'blocker_resolved'
    });
  } catch (error) {
    console.error('Task notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});