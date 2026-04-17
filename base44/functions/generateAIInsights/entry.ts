import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { insightType, data } = await req.json();

    if (!insightType || !data) {
      return Response.json(
        { error: 'Missing required fields: insightType, data' },
        { status: 400 }
      );
    }

    let prompt = '';

    if (insightType === 'health_report') {
      prompt = `Analyze this collective health report and provide actionable insights:

Report Week: ${data.report_week}
Collective Health Score: ${data.collective_health_score}/100
Status: ${data.status}
Flagged Products (${data.flagged_products?.length || 0}): ${data.flagged_products?.join(', ') || 'None'}

Product Details:
${data.products?.map(p => 
  `- ${p.product_name}: Parity ${p.parity_score}%, Impact ${p.impact_score}%, Growth ${p.growth_rate}%, ${p.client_count} clients${p.flagged ? ' (FLAGGED)' : ''}`
).join('\n')}

Recommendations from system: ${data.recommendations?.join('; ') || 'None'}

Please provide:
1. Trend Analysis: What patterns do you observe?
2. Anomalies: Any unexpected metrics or outliers?
3. Risk Assessment: What could go wrong in the next 4 weeks?
4. Actionable Recommendations: 3-5 specific steps to improve health score.
5. Priority Areas: Which products need immediate attention?`;
    } else if (insightType === 'product_performance') {
      prompt = `Analyze this product performance data and identify opportunities:

Products:
${data.products?.map(p => 
  `- ${p.name}: Parity ${p.parity}%, Revenue ${p.revenue}, Clients ${p.client_count}`
).join('\n')}

Please provide:
1. Performance Ranking: Order by growth potential.
2. Cross-product Insights: Opportunities for synergy or shared resources.
3. Risk Flags: Which products are underperforming?
4. Growth Opportunities: Where can we invest for maximum ROI?
5. Market Risks: External factors to watch.`;
    } else {
      return Response.json(
        { error: 'Invalid insightType' },
        { status: 400 }
      );
    }

    const insights = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_flash'
    });

    return Response.json({
      success: true,
      insightType,
      analysis: insights,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI insights generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});