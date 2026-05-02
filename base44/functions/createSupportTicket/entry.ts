import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, description, priority, charity_id } = await req.json();

    // Generate ticket ID
    const ticketId = `SUP-${Date.now()}`;

    // Send confirmation email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `Support Ticket Created: ${ticketId}`,
      body: `
Your support ticket has been created:

Ticket ID: ${ticketId}
Subject: ${subject}
Priority: ${priority}

We'll respond within 24 hours.

Reply to this email to add updates to your ticket.
      `,
      from_name: 'CharityHub Support'
    });

    return Response.json({
      ticket_id: ticketId,
      status: 'open',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});