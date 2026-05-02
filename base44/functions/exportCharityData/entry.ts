import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { charity_id, format = 'csv' } = await req.json();

    // Get all data for charity
    const donors = await base44.entities.Donor.filter({ charity_id });
    const donations = await base44.entities.Donation.filter({ charity_id });
    const campaigns = await base44.entities.Campaign.filter({ charity_id });
    const volunteers = await base44.entities.Volunteer.filter({ charity_id });

    if (format === 'csv') {
      // Generate CSV exports
      const donorsCsv = [
        ['ID', 'Name', 'Email', 'Phone', 'Status', 'Total Donated', 'Last Donation', 'Source'].join(','),
        ...donors.map(d => [d.id, d.name, d.email, d.phone, d.status, d.total_donated, d.last_donation_date, d.source].join(','))
      ].join('\n');

      const donationsCsv = [
        ['ID', 'Donor', 'Amount', 'Date', 'Method', 'Campaign'].join(','),
        ...donations.map(d => [d.id, d.donor_name, d.amount, d.donation_date, d.payment_method, d.campaign_id || 'N/A'].join(','))
      ].join('\n');

      const combined = `DONORS\n${donorsCsv}\n\nDONATIONS\n${donationsCsv}`;

      return new Response(combined, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="charity-data-${Date.now()}.csv"`
        }
      });
    }

    if (format === 'json') {
      const data = {
        exported_at: new Date().toISOString(),
        charity_id,
        donors,
        donations,
        campaigns,
        volunteers,
        summary: {
          donor_count: donors.length,
          donation_count: donations.length,
          total_raised: donations.reduce((sum, d) => sum + d.amount, 0),
          campaign_count: campaigns.length,
          volunteer_count: volunteers.length
        }
      };

      return new Response(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="charity-data-${Date.now()}.json"`
        }
      });
    }

    return Response.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});