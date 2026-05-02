import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const emailSequence = [
  {
    day: 0,
    subject: 'Welcome to CharityHub! 🎉',
    template: 'welcome'
  },
  {
    day: 1,
    subject: 'Getting Started: Your First 10 Minutes',
    template: 'quick_start'
  },
  {
    day: 3,
    subject: 'Feature Spotlight: Volunteer Scheduling',
    template: 'feature_volunteer'
  },
  {
    day: 5,
    subject: 'How to Generate Your First Report',
    template: 'feature_reports'
  },
  {
    day: 7,
    subject: 'Success Story: How Sarah\'s Team Saved 20 Hours/Week',
    template: 'case_study'
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { charity_id, email } = await req.json();

    // Send each email in sequence
    for (const email_config of emailSequence) {
      const delay = email_config.day * 24 * 60 * 60 * 1000; // Convert days to ms
      const sendAt = new Date(Date.now() + delay);

      // Log scheduled email
      await base44.asServiceRole.entities.EmailLog.create({
        charity_id,
        recipient_email: email,
        subject: email_config.subject,
        email_type: 'onboarding',
        status: 'scheduled',
        sent_at: sendAt.toISOString()
      });
    }

    return Response.json({ 
      success: true, 
      message: `Onboarding sequence scheduled for ${email}`,
      emails_scheduled: emailSequence.length 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});