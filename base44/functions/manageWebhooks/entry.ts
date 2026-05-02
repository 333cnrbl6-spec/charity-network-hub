import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, charity_id, endpoint_url, events, webhook_id, status } = await req.json();

    if (action === 'create') {
      const secret = `whk_${crypto.getRandomValues(new Uint8Array(32)).toString()}`;
      
      const webhook = await base44.entities.WebhookConfig.create({
        charity_id,
        endpoint_url,
        events,
        secret,
        status: 'active'
      });

      return Response.json({ 
        success: true, 
        webhook_id: webhook.id,
        secret,
        message: 'Webhook created. Save the secret for verification.'
      });
    }

    if (action === 'update') {
      await base44.entities.WebhookConfig.update(webhook_id, { events, endpoint_url });
      return Response.json({ success: true });
    }

    if (action === 'toggle') {
      const newStatus = status === 'active' ? 'inactive' : 'active';
      await base44.entities.WebhookConfig.update(webhook_id, { status: newStatus });
      return Response.json({ success: true, status: newStatus });
    }

    if (action === 'delete') {
      await base44.entities.WebhookConfig.delete(webhook_id);
      return Response.json({ success: true });
    }

    if (action === 'list') {
      const webhooks = await base44.entities.WebhookConfig.filter({ charity_id });
      return Response.json({ webhooks });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});