import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { charity_id } = await req.json();

    // Get charity and summary data
    const charity = await base44.entities.Charity.filter({ charity_number: charity_id });
    if (!charity.length) {
      return Response.json({ error: 'Charity not found' }, { status: 404 });
    }

    const charityData = charity[0];

    // Get last 7 days of donations
    const donations = await base44.entities.Donation.filter({ charity_id: charityData.id });
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDonations = donations.filter(d => new Date(d.donation_date) > sevenDaysAgo);

    const totalRaised = recentDonations.reduce((sum, d) => d.amount, 0);
    const donorCount = new Set(recentDonations.map(d => d.donor_id)).size;

    // Generate report content
    const reportContent = `
Weekly Impact Report - ${charityData.name}
Generated: ${new Date().toLocaleDateString()}

SUMMARY
-------
Total Raised (Last 7 Days): £${totalRaised.toFixed(2)}
New Donors: ${donorCount}
Donations: ${recentDonations.length}

TOP SUPPORTERS
${recentDonations
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 5)
  .map(d => `- ${d.donor_name}: £${d.amount.toFixed(2)}`)
  .join('\n')}

Next Steps:
- Thank your donors (use AI template)
- Review campaign performance
- Plan next week's outreach

---
CharityHub | Your Impact Platform
    `;

    // In production, this would send an email via SendEmail integration
    // For now, just return the report content

    return Response.json({
      success: true,
      report: reportContent,
      scheduled_for: 'Every Monday at 9am'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});