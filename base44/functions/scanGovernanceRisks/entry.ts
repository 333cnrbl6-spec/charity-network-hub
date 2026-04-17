import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Week identifier formatter
function getWeekIdentifier() {
  const now = new Date();
  const year = now.getFullYear();
  const jan = new Date(year, 0, 1);
  const diff = now - jan;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const week = Math.ceil((dayOfYear + jan.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

// Default governance policies
const DEFAULT_POLICIES = [
  {
    policy_name: 'Data Privacy Compliance',
    category: 'data_protection',
    description: 'All products must have documented data privacy policies and GDPR compliance measures',
    severity: 'critical'
  },
  {
    policy_name: 'Security Incident Response',
    category: 'security',
    description: 'Products must maintain documented incident response procedures',
    severity: 'high'
  },
  {
    policy_name: 'Financial Controls',
    category: 'financial',
    description: 'All revenue and transaction data must have audit trails',
    severity: 'high'
  },
  {
    policy_name: 'Operational Documentation',
    category: 'operational',
    description: 'Products must have up-to-date operational runbooks',
    severity: 'medium'
  },
  {
    policy_name: 'Access Control',
    category: 'compliance',
    description: 'Role-based access control (RBAC) must be enforced across all systems',
    severity: 'high'
  }
];

// Mock product data scanning (replace with actual data fetching)
async function assessProductCompliance(base44, product) {
  const violations = [];
  const policies = DEFAULT_POLICIES;

  // Simulate compliance checks based on product characteristics
  const riskFactors = {
    'Species Explorer': 3, // Higher risk (developing)
    'CaseNarrative': 1,
    'Premiso': 1,
    'Age UK Bury': 0
  };

  const riskCount = riskFactors[product.name] || 2;

  // Assign violations based on risk level
  for (let i = 0; i < riskCount && i < policies.length; i++) {
    const policy = policies[i];
    violations.push({
      policy_name: policy.policy_name,
      category: policy.category,
      severity: policy.severity,
      finding: `Product ${product.name} requires review against ${policy.policy_name.toLowerCase()}`
    });
  }

  // Calculate risk score
  const criticalViolations = violations.filter(v => v.severity === 'critical').length;
  const highViolations = violations.filter(v => v.severity === 'high').length;
  const mediumViolations = violations.filter(v => v.severity === 'medium').length;

  const riskScore = Math.min(100, (criticalViolations * 30) + (highViolations * 15) + (mediumViolations * 5));

  return {
    product_name: product.name,
    risk_score: riskScore,
    violations,
    compliant: violations.length === 0
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch or create default policies
    const existingPolicies = await base44.asServiceRole.entities.GovernancePolicy.list();
    if (existingPolicies.length === 0) {
      for (const policy of DEFAULT_POLICIES) {
        await base44.asServiceRole.entities.GovernancePolicy.create({
          ...policy,
          is_active: true,
          created_at: new Date().toISOString()
        });
      }
    }

    // Mock product data
    const products = [
      { name: 'Age UK Bury', status: 'operational' },
      { name: 'Premiso', status: 'operational' },
      { name: 'Species Explorer', status: 'developing' },
      { name: 'CaseNarrative', status: 'operational' }
    ];

    // Assess each product
    const productsAssessed = [];
    const allViolations = [];

    for (const product of products) {
      const assessment = await assessProductCompliance(base44, product);
      productsAssessed.push(assessment);
      allViolations.push(...assessment.violations);
    }

    // Calculate overall metrics
    const criticalViolations = allViolations.filter(v => v.severity === 'critical').map(v => `${v.policy_name} (${v.severity})`);
    const compliantProducts = productsAssessed.filter(p => p.compliant).length;
    const policyCompliance = Math.round((compliantProducts / productsAssessed.length) * 100);
    const overallRiskScore = Math.round(productsAssessed.reduce((sum, p) => sum + p.risk_score, 0) / productsAssessed.length);

    // Determine risk level
    let riskLevel = 'low';
    if (overallRiskScore >= 70) riskLevel = 'critical';
    else if (overallRiskScore >= 50) riskLevel = 'high';
    else if (overallRiskScore >= 30) riskLevel = 'medium';

    // Generate mitigation recommendations
    const recommendations = [];
    if (criticalViolations.length > 0) {
      recommendations.push(`Address ${criticalViolations.length} critical policy violation(s) immediately`);
    }
    const lowestScore = Math.min(...productsAssessed.map(p => p.risk_score));
    const needsReview = productsAssessed.filter(p => p.risk_score > lowestScore + 20);
    if (needsReview.length > 0) {
      recommendations.push(`Schedule governance review for: ${needsReview.map(p => p.product_name).join(', ')}`);
    }
    recommendations.push('Update security documentation and incident response procedures');
    recommendations.push('Conduct quarterly governance audits for all products');

    // Create scorecard
    const scorecard = await base44.asServiceRole.entities.GovernanceRiskScorecard.create({
      scan_week: getWeekIdentifier(),
      overall_risk_score: overallRiskScore,
      risk_level: riskLevel,
      products_assessed: productsAssessed,
      critical_violations: criticalViolations,
      policy_coverage: policyCompliance,
      mitigation_recommendations: recommendations,
      generated_at: new Date().toISOString()
    });

    // Post to governance channel
    try {
      const governanceChannels = await base44.asServiceRole.entities.Channel.list();
      const govChannel = governanceChannels.find(c => c.channel_name === 'governance');

      if (govChannel) {
        const scoreboardMessage = `📋 **Weekly Governance Risk Scorecard - ${getWeekIdentifier()}**

**Overall Risk: ${overallRiskScore}/100 (${riskLevel.toUpperCase()})**
Policy Coverage: ${policyCompliance}%
Products Assessed: ${productsAssessed.length}

**Critical Issues:** ${criticalViolations.length > 0 ? criticalViolations.join(', ') : 'None'}

**Product Summary:**
${productsAssessed.map(p => `• ${p.product_name}: Risk ${p.risk_score}% ${p.compliant ? '✅' : '⚠️'}`).join('\n')}

**Key Recommendations:**
${recommendations.map(r => `• ${r}`).join('\n')}

Report ID: ${scorecard.id}`;

        await base44.asServiceRole.entities.Message.create({
          channel_name: 'governance',
          author: 'Governance Bot',
          content: scoreboardMessage,
          is_ai_generated: true,
          posted_at: new Date().toISOString()
        });
      }
    } catch (channelError) {
      console.warn('Could not post to governance channel:', channelError.message);
    }

    return Response.json({
      success: true,
      scorecard: {
        scan_week: scorecard.scan_week,
        overall_risk_score: scorecard.overall_risk_score,
        risk_level: scorecard.risk_level,
        policy_coverage: scorecard.policy_coverage,
        critical_violations: scorecard.critical_violations,
        products_assessed: scorecard.products_assessed
      },
      message: `Governance scan completed. ${criticalViolations.length} critical issues identified.`
    });
  } catch (error) {
    console.error('Governance scan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});