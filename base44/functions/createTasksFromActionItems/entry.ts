import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Parse action items and create tasks
async function parseAndCreateTasks(base44, actionItemsText, channel, sourceId) {
  const lines = actionItemsText.split('\n').filter(line => line.trim());
  const tasks = [];

  for (const line of lines) {
    // Parse format: "- [OWNER]: Description"
    const match = line.match(/^[-•]\s*\[?([^\]:\-]+)\]?:\s*(.+)$/);
    if (!match) continue;

    const [, owner, description] = match;
    const ownerTrimmed = owner.trim().toLowerCase();
    const isUnassigned = ownerTrimmed === 'unassigned';

    // Determine due date (default to 1 week out)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Determine priority based on keywords
    let priority = 'medium';
    if (description.toLowerCase().includes('critical') || description.toLowerCase().includes('urgent')) {
      priority = 'critical';
    } else if (description.toLowerCase().includes('asap') || description.toLowerCase().includes('high priority')) {
      priority = 'high';
    }

    const taskData = {
      title: description.trim(),
      description: `From AI analysis in #${channel}: ${description}`,
      source: 'ai_identified',
      source_id: sourceId,
      source_channel: channel,
      status: 'backlog',
      priority,
      assignee: isUnassigned ? null : ownerTrimmed,
      assignee_name: isUnassigned ? null : owner.trim(),
      due_date: dueDate.toISOString().split('T')[0],
      tags: [channel, 'ai-identified'],
      estimated_hours: priority === 'critical' ? 2 : priority === 'high' ? 4 : 8
    };

    try {
      const task = await base44.asServiceRole.entities.ProjectTask.create(taskData);
      tasks.push(task);
    } catch (error) {
      console.warn(`Failed to create task for "${description}":`, error.message);
    }
  }

  return tasks;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action_items_text, channel_name, source_id, ai_member } = await req.json();

    if (!action_items_text || !channel_name) {
      return Response.json(
        { error: 'Missing required fields: action_items_text, channel_name' },
        { status: 400 }
      );
    }

    const tasks = await parseAndCreateTasks(base44, action_items_text, channel_name, source_id || `ai_${Date.now()}`);

    // Post notification to channel
    if (tasks.length > 0) {
      await base44.asServiceRole.entities.Message.create({
        channel_name,
        author: ai_member || 'Task Manager',
        content: `✅ **${tasks.length} Action Item(s) Converted to Tasks**\n\nAutomatically created trackable tasks:\n${tasks.map(t => `• ${t.title}`).join('\n')}\n\nView and manage in Project Tasks.`,
        is_ai_generated: true,
        ai_member_name: ai_member || 'Task Manager',
        posted_at: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      tasks_created: tasks.length,
      tasks,
      message: `Created ${tasks.length} tasks from action items`
    });
  } catch (error) {
    console.error('Task creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});