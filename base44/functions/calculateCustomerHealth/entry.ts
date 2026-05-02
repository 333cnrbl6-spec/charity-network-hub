import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all charities
    const charities = await base44.asServiceRole.entities.Charity.list();
    
    const healthScores = [];

    for (const charity of charities) {
      // Get usage metrics for last 30 days
      const metrics = await base44.asServiceRole.entities.UsageMetric.filter({
        charity_id: charity.id
      });
      
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentMetrics = metrics.filter(m => new Date(m.timestamp) > thirtyDaysAgo);

      // Get donations and campaigns
      const donations = await base44.asServiceRole.entities.Donation.filter({
        charity_id: charity.id
      });
      
      const campaigns = await base44.asServiceRole.entities.Campaign.filter({
        charity_id: charity.id
      });

      // Calculate health score (0-100)
      let score = 50; // Base score

      // Last login recency (0-30 points)
      const lastLogin = new Date(charity.updated_date);
      const daysSinceLogin = Math.floor((Date.now() - lastLogin) / (24 * 60 * 60 * 1000));
      score += Math.max(0, 30 - daysSinceLogin);

      // Feature usage (0-25 points)
      const aiGens = recentMetrics.filter(m => m.metric_type === 'ai_generation').length;
      const reportDls = recentMetrics.filter(m => m.metric_type === 'report_download').length;
      score += Math.min(25, (aiGens + reportDls) * 2);

      // Data density (0-20 points)
      const donationCount = donations.length;
      score += Math.min(20, donationCount / 10);

      // Determine status and churn risk
      let status = 'healthy';
      let churnRisk = 'low';
      let churnReason = null;

      if (daysSinceLogin > 30) {
        status = 'at_risk';
        churnRisk = 'medium';
        churnReason = 'No activity for 30+ days';
      }

      if (daysSinceLogin > 60) {
        status = 'churning';
        churnRisk = 'high';
        churnReason = 'Inactive for 60+ days';
      }

      if (score < 30) {
        status = 'churning';
        churnRisk = 'high';
        churnReason = 'Low engagement score';
      }

      const healthData = {
        charity_id: charity.id,
        org_name: charity.name,
        health_score: Math.min(100, Math.max(0, score)),
        status,
        churn_risk: churnRisk,
        churn_reason: churnReason,
        last_login: charity.updated_date,
        days_since_login: daysSinceLogin,
        active_users: recentMetrics.filter(m => m.metric_type === 'login').length,
        data_volume: donationCount + campaigns.length,
        feature_usage: {
          ai_generations: aiGens,
          reports_generated: reportDls,
          data_exports: recentMetrics.filter(m => m.metric_type === 'data_export').length,
          api_calls: recentMetrics.filter(m => m.metric_type === 'api_call').length
        },
        tier: charity.subscription_tier,
        monthly_revenue: charity.subscription_tier === 'enterprise' ? 500 : charity.subscription_tier === 'professional' ? 99 : 29,
        last_updated: new Date().toISOString()
      };

      // Save or update health score
      const existing = await base44.asServiceRole.entities.CustomerHealth.filter({
        charity_id: charity.id
      });

      if (existing.length > 0) {
        await base44.asServiceRole.entities.CustomerHealth.update(existing[0].id, healthData);
      } else {
        await base44.asServiceRole.entities.CustomerHealth.create(healthData);
      }

      healthScores.push(healthData);
    }

    return Response.json({ success: true, scores_updated: healthScores.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});