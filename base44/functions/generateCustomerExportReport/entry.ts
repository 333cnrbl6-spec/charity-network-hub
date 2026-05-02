import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report_type = 'usage', start_date, end_date } = await req.json();

    // Get user's charity
    const charities = await base44.entities.Charity.filter({
      created_by: user.email
    });

    if (!charities.length) {
      return Response.json({ error: 'No charity found' }, { status: 404 });
    }

    const charityId = charities[0].id;

    let reportData = {
      charity_id: charityId,
      report_type,
      generated_at: new Date().toISOString(),
      start_date,
      end_date
    };

    if (report_type === 'usage') {
      const metrics = await base44.entities.UsageMetric.filter({
        charity_id: charityId
      });
      reportData.total_api_calls = metrics.filter(m => m.metric_type === 'api_call').length;
      reportData.total_exports = metrics.filter(m => m.metric_type === 'data_export').length;
      reportData.total_ai_generations = metrics.filter(m => m.metric_type === 'ai_generation').length;
      reportData.metrics = metrics;
    } else if (report_type === 'donors') {
      const donors = await base44.entities.Donor.filter({
        charity_id: charityId
      });
      reportData.total_donors = donors.length;
      reportData.donors = donors;
    } else if (report_type === 'campaigns') {
      const campaigns = await base44.entities.Campaign.filter({
        charity_id: charityId
      });
      reportData.total_campaigns = campaigns.length;
      reportData.campaigns = campaigns;
    }

    // Log this export as audit event
    await base44.entities.AuditLog.create({
      charity_id: charityId,
      user_email: user.email,
      action: 'export',
      entity_type: 'report',
      timestamp: new Date().toISOString(),
      status: 'success'
    });

    return Response.json({
      status: 'success',
      data: reportData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});