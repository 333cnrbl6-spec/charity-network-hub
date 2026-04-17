import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { template_id, project_name, project_channel } = await req.json();

    if (!template_id || !project_name) {
      return Response.json(
        { error: 'Missing required fields: template_id, project_name' },
        { status: 400 }
      );
    }

    // Fetch template
    const template = await base44.asServiceRole.entities.ProjectTemplate.get(template_id);
    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create tasks from template
    const createdTasks = [];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    for (const templateTask of template.template_tasks) {
      const taskData = {
        title: templateTask.title,
        description: `[${project_name}] ${templateTask.description || ''}`.trim(),
        source: 'manual',
        source_channel: project_channel || 'general',
        status: 'backlog',
        priority: templateTask.priority,
        assignee_name: templateTask.assignee_name || null,
        due_date: dueDate.toISOString().split('T')[0],
        estimated_hours: templateTask.estimated_hours || null,
        tags: [
          ...(templateTask.tags || []),
          'from-template',
          template.name.toLowerCase().replace(/\s+/g, '-')
        ]
      };

      try {
        const task = await base44.asServiceRole.entities.ProjectTask.create(taskData);
        createdTasks.push(task);
      } catch (error) {
        console.warn(`Failed to create task "${templateTask.title}":`, error.message);
      }
    }

    return Response.json({
      success: true,
      tasks_created: createdTasks.length,
      project_name,
      tasks: createdTasks,
      message: `Created ${createdTasks.length} tasks from template "${template.name}"`
    });
  } catch (error) {
    console.error('Template application error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});