import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { charity_email, subject, sla_details } = await req.json();

    const emailBody = `
Dear Customer,

${subject}

SLA Details:
- Uptime Guarantee: ${sla_details.uptime_percentage}%
- Support Response: ${sla_details.support_response_time}
- Data Backup: ${sla_details.backup_frequency}

For detailed SLA terms, see: /sla

Best regards,
CharityHub Team
    `;

    // Send email via integration
    await base44.integrations.Core.SendEmail({
      to: charity_email,
      subject: subject,
      body: emailBody,
      from_name: 'CharityHub'
    });

    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});