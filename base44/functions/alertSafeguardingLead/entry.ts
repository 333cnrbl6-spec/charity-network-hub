import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { format } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { branch_id, risk_level, risk_score, recommendations } = await req.json();

    if (!branch_id || !risk_level) {
      return Response.json({ error: 'branch_id and risk_level required' }, { status: 400 });
    }

    // Get branch details
    const branch = await base44.asServiceRole.entities.BranchConfig.filter({
      id: branch_id
    });

    if (!branch || branch.length === 0) {
      return Response.json({ error: 'Branch not found' }, { status: 404 });
    }

    const branchData = branch[0];
    const charityId = branchData.charity_id;

    // Find safeguarding leads for this charity
    const users = await base44.asServiceRole.entities.User.filter({
      charity_id: charityId,
      role: 'safeguarding_lead'
    });

    if (!users || users.length === 0) {
      console.warn(`No safeguarding leads found for charity ${charityId}`);
      return Response.json({ 
        success: true, 
        message: 'No safeguarding leads to alert',
        alerted: 0 
      });
    }

    const alertEmails = users.map(u => u.email);
    const riskColor = risk_level === 'critical' ? '🔴' : risk_level === 'high' ? '🟠' : '🟡';

    let emailBody = `Dear Safeguarding Lead,

${riskColor} COMPLIANCE ALERT - ${risk_level.toUpperCase()} RISK

Branch: ${branchData.branch_name || branchData.name || branch_id}
Risk Score: ${risk_score}/100
Alert Sent: ${format(new Date(), 'MMM d, yyyy HH:mm')}

RECOMMENDED ACTIONS:
`;

    if (recommendations && recommendations.length > 0) {
      recommendations.forEach(rec => {
        emailBody += `\n• ${rec}`;
      });
    }

    emailBody += `

Please review the Safeguarding Compliance Dashboard for detailed information:
https://charityhub.app/safeguarding-dashboard

This is an automated alert. If you have questions, contact your platform administrator.

Best regards,
CharityHub Safeguarding System`;

    // Send alert emails
    let sentCount = 0;
    for (const email of alertEmails) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: `ALERT: Safeguarding Compliance Issue - ${branchData.branch_name || 'Branch'} [${risk_level.toUpperCase()}]`,
          body: emailBody
        });
        sentCount++;
      } catch (emailErr) {
        console.warn(`Failed to send alert to ${email}:`, emailErr);
      }
    }

    // Update risk score record with alert status
    const riskScores = await base44.asServiceRole.entities.SafeguardingRiskScore.filter({
      branch_id
    });

    if (riskScores && riskScores.length > 0) {
      await base44.asServiceRole.entities.SafeguardingRiskScore.update(riskScores[0].id, {
        alert_sent: true,
        alert_sent_to: alertEmails
      });
    }

    // Log audit event
    await base44.asServiceRole.functions.invoke('logAuditEvent', {
      charity_id: charityId,
      action: 'safeguarding_compliance_alert_sent',
      entity_type: 'SafeguardingAlert',
      changes: {
        branch_id,
        risk_level,
        risk_score,
        recipients: sentCount
      }
    });

    return Response.json({
      success: true,
      alerted: sentCount,
      emails: alertEmails
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});