import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all upcoming jobs in the next 24 hours
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Fetch jobs scheduled within next 24 hours
    const allJobs = await base44.entities.Job.list();
    const upcomingJobs = allJobs.filter(job => {
      if (job.status !== 'scheduled') return false;
      const scheduledDate = new Date(job.scheduled_date);
      return scheduledDate >= now && scheduledDate <= tomorrow;
    });

    if (upcomingJobs.length === 0) {
      return Response.json({ 
        message: 'No jobs scheduled in next 24 hours',
        notificationsSent: 0 
      });
    }

    // Get volunteer and client data
    const volunteers = await base44.entities.Volunteer.list();
    const clients = await base44.entities.Client.list();
    
    const volunteerMap = Object.fromEntries(volunteers.map(v => [v.id, v]));
    const clientMap = Object.fromEntries(clients.map(c => [c.id, c]));

    // Send reminders for each upcoming job
    let notificationsSent = 0;
    const failedNotifications = [];

    for (const job of upcomingJobs) {
      try {
        const volunteer = volunteerMap[job.volunteer_id];
        const client = clientMap[job.client_id];

        // Skip if volunteer has no email or job wasn't previously reminded
        if (!volunteer?.email) {
          failedNotifications.push({ jobId: job.id, reason: 'No volunteer email' });
          continue;
        }

        // Check if already notified (using a simple flag approach)
        if (job.reminder_sent_24h) {
          continue;
        }

        const scheduledTime = new Date(job.scheduled_date).toLocaleString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const emailBody = `
Dear ${volunteer.full_name},

This is a friendly reminder that you have a scheduled job coming up tomorrow!

📋 Job Details:
• Type: ${job.job_type?.replace('-', ' ') || 'General'}
• Scheduled: ${scheduledTime}
• Client: ${client?.full_name || job.client_name}
• Duration: ${job.duration_minutes || 'Not specified'} minutes

👤 Client Contact Information:
• Name: ${client?.full_name || 'N/A'}
• Phone: ${client?.phone || 'Not provided'}
• Email: ${client?.email || 'Not provided'}
• Address: ${client?.address || 'Not provided'}
• Postcode: ${client?.postcode || 'Not provided'}

📝 Job Notes:
${job.notes || 'No additional notes provided.'}

Please make sure to arrive on time and bring any necessary materials. If you need to reschedule or have any questions, please contact your coordinator as soon as possible.

Thank you for your continued dedication to our community!

Best regards,
Age UK Volunteer Team
        `;

        // Send email via Core integration
        await base44.integrations.Core.SendEmail({
          to: volunteer.email,
          subject: `Reminder: Job with ${client?.full_name || 'Client'} tomorrow at ${scheduledTime.split(',')[1].trim()}`,
          body: emailBody,
          from_name: 'Age UK Volunteer Coordinator'
        });

        // Mark job as notified
        await base44.entities.Job.update(job.id, {
          reminder_sent_24h: true
        });

        notificationsSent++;
      } catch (jobError) {
        failedNotifications.push({ 
          jobId: job.id, 
          reason: jobError.message 
        });
      }
    }

    return Response.json({
      message: 'Job reminder cycle completed',
      notificationsSent,
      totalUpcoming: upcomingJobs.length,
      failedCount: failedNotifications.length,
      failed: failedNotifications.length > 0 ? failedNotifications : undefined
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      notificationsSent: 0
    }, { status: 500 });
  }
});