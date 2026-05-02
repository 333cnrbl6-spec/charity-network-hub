import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_type, source, charity_email } = await req.json();

    // Log conversion event
    await base44.asServiceRole.entities.UsageMetric.create({
      charity_id: 'marketing',
      metric_type: 'conversion',
      feature_name: event_type,
      value: 1,
      timestamp: new Date().toISOString()
    });

    // Track signup source
    if (event_type === 'signup') {
      await base44.asServiceRole.functions.invoke('trackLeadSource', {
        source: source || 'organic',
        email: charity_email
      });
    }

    // Send welcome email
    if (event_type === 'trial_started') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: charity_email,
        subject: 'Welcome to CharityHub! Your 30-day trial starts now',
        body: `
Welcome to CharityHub!

You're now part of a community of 50+ branches managing thousands of volunteers.

Your trial includes:
✓ Full platform access
✓ All features unlocked
✓ Dedicated onboarding support
✓ 24/7 help center access

Get started: Log in at ${Deno.env.get('BASE44_APP_URL') || 'https://app.charityhub.org'}

Questions? Reply to this email or contact support@charityhub.org

Best regards,
The CharityHub Team
        `
      });
    }

    return Response.json({ success: true, event: event_type });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});