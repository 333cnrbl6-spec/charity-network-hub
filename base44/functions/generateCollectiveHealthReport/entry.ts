import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Mock product performance data - replace with real SynergyFlow API calls
const PRODUCT_METRICS = [
  {
    product_name: 'Age UK Bury',
    parity_score: 92,
    impact_score: 88,
    growth_rate: 12,
    client_count: 1240
  },
  {
    product_name: 'Premiso',
    parity_score: 78,
    impact_score: 71,
    growth_rate: 8,
    client_count: 650
  },
  {
    product_name: 'Species Explorer',
    parity_score: 65,
    impact_score: 62,
    growth_rate: 15,
    client_count: 2100
  },
  {
    product_name: 'CaseNarrative',
    parity_score: 71,
    impact_score: 68,
    growth_rate: 5,
    client_count: 890
  }
];

const PARITY_THRESHOLD = 70;

function calculateCollectiveHealthScore(products) {
  const avgParity = products.reduce((sum, p) => sum + p.parity_score, 0) / products.length;
  const avgImpact = products.reduce((sum, p) => sum + p.impact_score, 0) / products.length;
  const avgGrowth = products.reduce((sum, p) => sum + p.growth_rate, 0) / products.length;
  
  // Weighted calculation: 50% parity, 30% impact, 20% growth
  return Math.round((avgParity * 0.5) + (avgImpact * 0.3) + (avgGrowth * 2 * 0.2));
}

function generateRecommendations(products, flaggedProducts) {
  const recommendations = [];
  
  if (flaggedProducts.length > 0) {
    recommendations.push(`⚠️ ${flaggedProducts.join(', ')} below parity threshold—prioritize alignment initiatives`);
  }
  
  const lowestGrowth = products.reduce((min, p) => p.growth_rate < min.growth_rate ? p : min);
  if (lowestGrowth.growth_rate < 8) {
    recommendations.push(`Growth Alert: ${lowestGrowth.product_name} at ${lowestGrowth.growth_rate}%—consider acceleration strategy`);
  }
  
  const highestGrowth = products.reduce((max, p) => p.growth_rate > max.growth_rate ? p : max);
  recommendations.push(`Success: ${highestGrowth.product_name} leading growth at +${highestGrowth.growth_rate}%`);
  
  return recommendations;
}

function getWeekIdentifier() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneDay = 86400000;
  const week = Math.ceil(diff / oneDay / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process each product
    const products = PRODUCT_METRICS.map(metric => {
      const isFlagged = metric.parity_score < PARITY_THRESHOLD;
      return {
        product_name: metric.product_name,
        parity_score: metric.parity_score,
        impact_score: metric.impact_score,
        growth_rate: metric.growth_rate,
        client_count: metric.client_count,
        flagged: isFlagged,
        flag_reason: isFlagged ? `Parity score ${metric.parity_score}% below threshold of ${PARITY_THRESHOLD}%` : null
      };
    });

    const flaggedProducts = products
      .filter(p => p.flagged)
      .map(p => p.product_name);

    const collectiveHealth = calculateCollectiveHealthScore(PRODUCT_METRICS);
    const recommendations = generateRecommendations(products, flaggedProducts);

    // Determine status
    let status = 'healthy';
    if (flaggedProducts.length > 0) status = 'warning';
    if (flaggedProducts.length > 2) status = 'critical';

    const reportWeek = getWeekIdentifier();

    // Create report record
    const report = await base44.entities.CollectiveHealthReport.create({
      report_week: reportWeek,
      generated_at: new Date().toISOString(),
      collective_health_score: collectiveHealth,
      products,
      flagged_products: flaggedProducts,
      threshold: PARITY_THRESHOLD,
      status,
      recommendations
    });

    // Send alert if products are flagged
    if (flaggedProducts.length > 0) {
      const alertMessage = `Health Report Alert: ${flaggedProducts.join(', ')} flagged for parity below ${PARITY_THRESHOLD}%`;
      console.log(`[ALERT] ${alertMessage}`);
      
      // Could integrate with email/slack here
      // await base44.integrations.Core.SendEmail({
      //   to: 'chairman@synergyflow.io',
      //   subject: `SynergyFlow Weekly Health Alert - ${reportWeek}`,
      //   body: alertMessage
      // });
    }

    return Response.json({
      success: true,
      report: {
        id: report.id,
        week: reportWeek,
        health_score: collectiveHealth,
        status,
        flagged_products: flaggedProducts,
        recommendations
      }
    });
  } catch (error) {
    console.error('Health report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});