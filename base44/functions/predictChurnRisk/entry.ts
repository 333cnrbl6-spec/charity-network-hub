import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const charities = await base44.entities.Charity.list();
    const predictions = [];

    for (const charity of charities) {
      // Get last login
      const auditLogs = await base44.entities.AuditLog.filter({
        charity_id: charity.id,
        action: 'login'
      });

      const lastLogin = auditLogs.length > 0
        ? new Date(auditLogs[0].timestamp)
        : new Date(charity.created_date);

      const daysSinceLogin = Math.floor(
        (Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get feature usage
      const metrics = await base44.entities.UsageMetric.filter({
        charity_id: charity.id
      });

      const totalMetrics = metrics.length;
      const lastMonthMetrics = metrics.filter(m => {
        const metricDate = new Date(m.timestamp);
        return metricDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }).length;

      // Calculate churn risk score (0-100, 100 = high risk)
      let riskScore = 0;

      if (daysSinceLogin > 60) riskScore += 40;
      else if (daysSinceLogin > 30) riskScore += 20;
      else if (daysSinceLogin > 14) riskScore += 10;

      if (lastMonthMetrics === 0) riskScore += 30;
      else if (lastMonthMetrics < 5) riskScore += 15;

      if (charity.subscription_status === 'past_due') riskScore += 25;
      if (charity.subscription_status === 'trial') riskScore -= 10; // Trials expected to be low usage

      // Support ticket indicator
      const supportTickets = await base44.entities.Alert.filter({
        charity_id: charity.id
      });

      if (supportTickets.length > 3) riskScore += 10;

      riskScore = Math.max(0, Math.min(100, riskScore)); // Clamp 0-100

      predictions.push({
        charity_id: charity.id,
        org_name: charity.name,
        churn_risk_score: riskScore,
        risk_level: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
        days_since_login: daysSinceLogin,
        last_month_usage: lastMonthMetrics,
        subscription_status: charity.subscription_status,
        risk_factors: [
          daysSinceLogin > 60 && 'No activity in 60+ days',
          lastMonthMetrics === 0 && 'Zero usage in last month',
          charity.subscription_status === 'past_due' && 'Past due on payment'
        ].filter(Boolean)
      });
    }

    // Sort by risk score (highest first)
    predictions.sort((a, b) => b.churn_risk_score - a.churn_risk_score);

    return Response.json({
      total_customers: charities.length,
      high_risk: predictions.filter(p => p.risk_level === 'high').length,
      medium_risk: predictions.filter(p => p.risk_level === 'medium').length,
      low_risk: predictions.filter(p => p.risk_level === 'low').length,
      predictions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});