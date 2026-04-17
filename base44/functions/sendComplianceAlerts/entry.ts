import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [volunteers, compliance, branches] = await Promise.all([
      base44.entities.Volunteer.list(),
      base44.entities.ComplianceRecord.list(),
      base44.entities.BranchConfig.list(),
    ]);

    const alerts = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Check DBS expiries
    volunteers.forEach(v => {
      if (v.dbs_expiry) {
        const expiryDate = new Date(v.dbs_expiry);
        if (expiryDate <= thirtyDaysFromNow && expiryDate >= today) {
          alerts.push({
            type: 'dbs_expiry',
            volunteer: v.full_name,
            email: v.email,
            expiry: v.dbs_expiry,
            subject: `DBS Check Expiring Soon - ${v.full_name}`,
            message: `DBS check for ${v.full_name} expires on ${new Date(v.dbs_expiry).toLocaleDateString()}. Please arrange renewal.`,
          });
        }
      }
    });

    // Check compliance deadlines
    compliance.forEach(c => {
      if (c.deadline && c.status === 'pending_review') {
        const deadline = new Date(c.deadline);
        if (deadline <= thirtyDaysFromNow && deadline >= today) {
          alerts.push({
            type: 'compliance_deadline',
            area: c.compliance_area,
            branch: c.branch_name,
            deadline: c.deadline,
            subject: `Compliance Deadline - ${c.compliance_area}`,
            message: `${c.compliance_area} deadline for ${c.branch_name} is ${new Date(c.deadline).toLocaleDateString()}`,
          });
        }
      }
    });

    // Send alerts via email
    const emailPromises = alerts.map(alert => {
      if (alert.email) {
        return base44.integrations.Core.SendEmail({
          to: alert.email,
          subject: alert.subject,
          body: `Hello,\n\n${alert.message}\n\nPlease log in to the Age UK Hub to take action.\n\nBest regards,\nAge UK Network Hub`,
        });
      }
      return Promise.resolve();
    });

    await Promise.all(emailPromises);

    return Response.json({
      success: true,
      alertsSent: alerts.length,
      details: alerts,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});