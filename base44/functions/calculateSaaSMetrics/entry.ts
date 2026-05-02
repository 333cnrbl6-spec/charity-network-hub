import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const charities = await base44.entities.Charity.list();

    // Calculate metrics
    let mrr = 0;
    let activeCustomers = 0;
    let trialCustomers = 0;
    let failedPayments = 0;

    const tierPricing = {
      starter: 49,
      professional: 149,
      enterprise: 499
    };

    for (const charity of charities) {
      if (charity.subscription_status === 'active') {
        mrr += tierPricing[charity.subscription_tier] || 0;
        activeCustomers++;
      } else if (charity.subscription_status === 'trial') {
        trialCustomers++;
      }
    }

    const failedInvoices = await base44.entities.Invoice.filter({
      status: 'overdue'
    });
    failedPayments = failedInvoices.length;

    // Get previous metrics for churn calculation
    const lastMetrics = await base44.entities.SaaSMetric.filter({
      metric_date: { $gte: lastMonth.toISOString().split('T')[0] }
    });

    const previousActive = lastMetrics[0]?.active_customers || activeCustomers;
    const churnRate = previousActive > 0 ? 
      ((previousActive - activeCustomers) / previousActive * 100).toFixed(2) : 0;

    // Create metric record
    const metric = await base44.entities.SaaSMetric.create({
      metric_date: today.toISOString().split('T')[0],
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      active_customers: activeCustomers,
      trial_customers: trialCustomers,
      churn_rate: parseFloat(churnRate),
      failed_payments: failedPayments,
      customer_retention_rate: 100 - parseFloat(churnRate),
      cac: activeCustomers > 0 ? Math.round(5000 / activeCustomers) : 0,
      ltv: Math.round((tierPricing.professional || 0) * 36) // 3-year average
    });

    return Response.json({ success: true, metric });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});