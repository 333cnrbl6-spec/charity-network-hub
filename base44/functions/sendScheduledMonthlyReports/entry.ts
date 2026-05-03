import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { format, addMonths } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all active report schedules
    const schedules = await base44.asServiceRole.entities.ReportScheduleConfig.filter({
      schedule_enabled: true,
      status: 'active'
    });

    if (!schedules || schedules.length === 0) {
      return Response.json({ message: 'No active report schedules found', sent: 0 });
    }

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const schedule of schedules) {
      try {
        // Check if today is the scheduled day
        const today = new Date();
        const scheduledDay = schedule.send_day_of_month || 1;

        if (today.getDate() !== scheduledDay) {
          // Not today, skip
          continue;
        }

        const charity = await base44.asServiceRole.entities.Charity.filter({
          id: schedule.charity_id
        });

        if (!charity || charity.length === 0) {
          failureCount++;
          results.push({
            charity_id: schedule.charity_id,
            status: 'failed',
            error: 'Charity not found'
          });
          continue;
        }

        // Generate the report
        const reportResult = await base44.asServiceRole.functions.invoke('generateMonthlyImpactReport', {
          charity_id: schedule.charity_id,
          period_start: format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd'),
          period_end: format(new Date(today.getFullYear(), today.getMonth() + 1, 0), 'yyyy-MM-dd')
        });

        if (!reportResult.file_url) {
          failureCount++;
          results.push({
            charity_id: schedule.charity_id,
            status: 'failed',
            error: 'Report generation failed'
          });
          continue;
        }

        // Send email to all stakeholders
        const charityName = charity[0].name || 'CharityHub';
        for (const email of schedule.stakeholder_emails || []) {
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: email,
              subject: `${charityName} - Monthly Impact Report`,
              body: `Dear Stakeholder,

Please find attached or access your monthly impact report for ${charityName}.

Report Period: ${format(new Date(today.getFullYear(), today.getMonth(), 1), 'MMMM yyyy')}

Key Highlights:
- Volunteer Hours: ${reportResult.metrics.volunteer_hours}
- Active Volunteers: ${reportResult.metrics.volunteer_count}
- Clients Served: ${reportResult.metrics.client_count}
- Active Grants: ${reportResult.metrics.grant_count}
- Total Impact Value: £${reportResult.metrics.total_impact.toLocaleString()}

Download your report: ${reportResult.file_url}

Best regards,
CharityHub Team`
            });
          } catch (emailErr) {
            console.warn(`Failed to send email to ${email}:`, emailErr);
          }
        }

        // Update schedule with send date
        await base44.asServiceRole.entities.ReportScheduleConfig.update(schedule.id, {
          last_sent: new Date().toISOString(),
          next_scheduled: format(addMonths(new Date(), 1), 'yyyy-MM-dd')
        });

        successCount++;
        results.push({
          charity_id: schedule.charity_id,
          status: 'sent',
          recipients: schedule.stakeholder_emails?.length || 0
        });
      } catch (err) {
        failureCount++;
        results.push({
          charity_id: schedule.charity_id,
          status: 'failed',
          error: err.message
        });
      }
    }

    return Response.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});