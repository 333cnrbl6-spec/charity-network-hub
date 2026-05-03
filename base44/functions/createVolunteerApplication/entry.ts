import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { volunteer_data, dbs_file } = await req.json();

    // Create volunteer record with pending status
    const volunteer = await base44.asServiceRole.entities.Volunteer.create({
      name: volunteer_data.name,
      email: volunteer_data.email,
      phone: volunteer_data.phone,
      role: volunteer_data.role,
      skills: volunteer_data.skills,
      availability: volunteer_data.availability,
      about: volunteer_data.about,
      status: 'pending_approval',
      dbs_checked: false,
      dbs_expiry: null,
      date_joined: new Date().toISOString().split('T')[0],
      hours_contributed: 0
    });

    // Store DBS file reference (in real scenario, upload the actual file)
    // For now, we'll log it and create an audit trail
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: volunteer_data.email,
      action: 'volunteer_registration_submitted',
      entity_type: 'Volunteer',
      entity_id: volunteer.id,
      changes: {
        status: 'pending_approval',
        dbs_document: 'submitted_for_verification'
      },
      timestamp: new Date().toISOString(),
      status: 'success'
    });

    // Send confirmation email to volunteer
    await base44.integrations.Core.SendEmail({
      to: volunteer_data.email,
      subject: 'Volunteer Application Received',
      body: `
Hello ${volunteer_data.name},

Thank you for applying to volunteer with us! We're excited to have you join our community.

Your application details:
- Role: ${volunteer_data.role}
- Skills: ${volunteer_data.skills.join(', ')}
- Status: Pending DBS Verification

What happens next:
1. Our team will verify your DBS documents (5-7 working days)
2. You'll receive an approval email once verified
3. We'll contact you to arrange induction and get started

If you have any questions, contact us at volunteers@charityhub.org

Best regards,
The Volunteer Team
      `
    });

    // Notify admins of new application
    await base44.integrations.Core.SendEmail({
      to: 'admin@charityhub.org',
      subject: `New Volunteer Application: ${volunteer_data.name}`,
      body: `
New volunteer application received:

Name: ${volunteer_data.name}
Email: ${volunteer_data.email}
Phone: ${volunteer_data.phone}
Role: ${volunteer_data.role}
Skills: ${volunteer_data.skills.join(', ')}

Review and approve in the Volunteer Approval Dashboard.
      `
    });

    return Response.json({
      success: true,
      volunteer_id: volunteer.id,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});