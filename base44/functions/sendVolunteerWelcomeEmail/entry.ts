import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BRANCH_INFO = {
  manchester: {
    name: 'Manchester',
    email: 'volunteers@manchester.ageuk.org.uk',
    phone: '0161-441-2600',
    address: '42 Didsbury Lane, Manchester M20 2LN',
  },
  bristol: {
    name: 'Bristol',
    email: 'volunteers@bristol.ageuk.org.uk',
    phone: '0117-314-5600',
    address: '45 Clifton Avenue, Bristol BS8 2EX',
  },
  london: {
    name: 'London',
    email: 'volunteers@london.ageuk.org.uk',
    phone: '020-7646-1234',
    address: '89 Highgate Hill, London N19 5NE',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { volunteer_name, volunteer_email, branch_id, role, start_date } = await req.json();

    if (!volunteer_email || !branch_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const branchInfo = BRANCH_INFO[branch_id] || BRANCH_INFO.manchester;

    const emailBody = `
Dear ${volunteer_name},

Welcome to Age UK ${branchInfo.name}! We are delighted that you have chosen to volunteer with us.

**Your Role:** ${role || 'Volunteer'}
**Start Date:** ${start_date || 'To be confirmed'}

**Local Branch Information:**
${branchInfo.name} Branch
Address: ${branchInfo.address}
Phone: ${branchInfo.phone}
Email: ${branchInfo.email}

**Next Steps:**
1. Your DBS application will be processed within 5-10 business days
2. You will receive a welcome call from our coordinator
3. Complete any additional training requirements
4. Your first shift will be scheduled according to your availability

**Important Documents:**
- Please keep your DBS reference number safe
- You will receive a volunteer handbook via email
- All policies and procedures are available on our secure portal

If you have any questions or need to reschedule, please contact us immediately:
Email: ${branchInfo.email}
Phone: ${branchInfo.phone}

We look forward to working with you and making a real difference in our community.

Best regards,
Age UK ${branchInfo.name} Team
    `;

    const response = await base44.integrations.Core.SendEmail({
      to: volunteer_email,
      subject: `Welcome to Age UK ${branchInfo.name}!`,
      body: emailBody,
      from_name: `Age UK ${branchInfo.name}`,
    });

    return Response.json({
      success: true,
      message: 'Welcome email sent successfully',
      recipient: volunteer_email,
    });
  } catch (error) {
    console.error('Email send error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});