import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, entity_type, entity_id, changes, charity_id } = await req.json();

    // Get IP and user agent from request
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Create audit log entry
    const auditEntry = await base44.entities.AuditLog.create({
      charity_id,
      user_email: user.email,
      action,
      entity_type,
      entity_id,
      changes,
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      status: 'success'
    });

    return Response.json(auditEntry);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});