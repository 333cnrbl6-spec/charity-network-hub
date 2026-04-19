import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { addDays, differenceInDays } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all training records
    const trainings = await base44.asServiceRole.entities.VolunteerTraining.list();
    const users = await base44.asServiceRole.entities.User.list();

    const remindersToSend = [];
    const nonCompliantUsers = new Map(); // Track non-compliant by manager

    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);

    for (const training of trainings) {
      // Skip already expired trainings that have been addressed
      if (!training.expiry_date || training.status === 'expired') continue;

      const expiryDate = new Date(training.expiry_date);
      const daysUntilExpiry = differenceInDays(expiryDate, now);

      // Find the volunteer/staff member
      const volunteer = await base44.asServiceRole.entities.Volunteer.read(training.volunteer_id);
      if (!volunteer) continue;

      // Check if expiring within 30 days
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        remindersToSend.push({
          type: 'expiring_soon',
          volunteer_id: training.volunteer_id,
          volunteer_name: training.volunteer_name,
          volunteer_email: training.volunteer_email,
          training_type: training.training_type,
          expiry_date: training.expiry_date,
          days_until_expiry: daysUntilExpiry,
          certificate_number: training.certificate_number,
        });
      }

      // Check if already expired
      if (daysUntilExpiry <= 0 && training.status !== 'expired') {
        // Track for manager notification
        if (!nonCompliantUsers.has(volunteer.email)) {
          nonCompliantUsers.set(volunteer.email, {
            volunteer_id: training.volunteer_id,
            volunteer_name: training.volunteer_name,
            volunteer_email: volunteer.email,
            trainings: [],
          });
        }

        nonCompliantUsers.get(volunteer.email).trainings.push({
          training_type: training.training_type,
          expiry_date: training.expiry_date,
          days_overdue: Math.abs(daysUntilExpiry),
        });
      }
    }

    // Send expiring soon reminders to volunteers
    for (const reminder of remindersToSend) {
      if (reminder.volunteer_email && reminder.expiring_soon !== false) {
        const emailBody = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <h2 style="margin-top: 0; color: #92400e;">📋 Safeguarding Training Expiring Soon</h2>

      <p>Hi ${reminder.volunteer_name},</p>

      <p>Your <strong>${reminder.training_type.replace(/_/g, ' ')}</strong> training will expire in <strong>${reminder.days_until_expiry} days</strong>.</p>

      <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>Expiry Date:</strong> ${new Date(reminder.expiry_date).toLocaleDateString('en-GB')}</p>
        <p style="margin: 10px 0 0 0;"><strong>Certificate:</strong> ${reminder.certificate_number || 'N/A'}</p>
      </div>

      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Contact your training provider to arrange renewal</li>
        <li>Ensure you complete the renewal before the expiry date</li>
        <li>Upload your updated certificate once completed</li>
      </ul>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
        <p>This is an automated reminder from the Age UK Training Management System.</p>
      </div>
    </div>
  </body>
</html>
        `;

        await base44.integrations.Core.SendEmail({
          to: reminder.volunteer_email,
          subject: `⏰ Training Expires Soon: ${reminder.training_type.replace(/_/g, ' ')} (${reminder.days_until_expiry} days)`,
          body: emailBody,
          from_name: 'Age UK Training Management',
        });
      }
    }

    // Notify managers of non-compliant staff
    const admins = users.filter(u => u.role === 'admin');

    for (const [email, userData] of nonCompliantUsers.entries()) {
      for (const admin of admins) {
        const emailBody = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
      <h2 style="margin-top: 0; color: #991b1b;">🚨 Training Non-Compliance Alert</h2>

      <p>The following volunteer/staff member has expired mandatory training:</p>

      <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Name:</strong> ${userData.volunteer_name}</p>
        <p style="margin: 10px 0 0 0;"><strong>Email:</strong> ${userData.volunteer_email}</p>
      </div>

      <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0;"><strong>Expired Trainings:</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          ${userData.trainings
            .map(
              t => `
            <li>
              <strong>${t.training_type.replace(/_/g, ' ')}</strong><br>
              <span style="color: #991b1b;">Overdue by ${t.days_overdue} day${t.days_overdue > 1 ? 's' : ''}</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>

      <p><strong>Required Actions:</strong></p>
      <ol>
        <li>Contact ${userData.volunteer_name} immediately to arrange training renewal</li>
        <li>Document the non-compliance in their personnel file</li>
        <li>Ensure renewal is completed within 5 working days</li>
        <li>Update training records once renewed</li>
      </ol>

      <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-radius: 6px;">
        <p style="margin: 0; font-size: 12px; color: #991b1b;">
          <strong>⚖️ Compliance Note:</strong> Staff with expired safeguarding training should not work with vulnerable adults until training is renewed. This may impact your ability to deliver services.
        </p>
      </div>

      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
        <p>This is an automated compliance alert from the Age UK Training Management System.</p>
      </div>
    </div>
  </body>
</html>
        `;

        await base44.integrations.Core.SendEmail({
          to: admin.email,
          subject: `🚨 URGENT: Training Non-Compliance - ${userData.volunteer_name}`,
          body: emailBody,
          from_name: 'Age UK Training Management',
        });
      }
    }

    return Response.json({
      success: true,
      reminders_sent: remindersToSend.length,
      non_compliant_count: nonCompliantUsers.size,
      manager_alerts_sent: nonCompliantUsers.size > 0 ? admins.length : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Training expiry check error:', error);
    return Response.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
});