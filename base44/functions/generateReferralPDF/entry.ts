import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

const REFERRAL_TYPES = {
  adult_social_care: 'Adult Social Care Services',
  police: 'Police Service',
  cqc: 'Care Quality Commission',
  lado: 'Local Authority Designated Officer',
  internal: 'Internal Management',
};

function buildLetterText(incident, referralType, organizationName) {
  const date = new Date(incident.incident_date).toLocaleDateString('en-GB');
  const refDate = new Date().toLocaleDateString('en-GB');
  const riskLevel = (incident.ai_severity_classification || 'unknown').toUpperCase();
  const riskScore = incident.ai_risk_assessment?.risk_score || 'N/A';

  return `SAFEGUARDING REFERRAL LETTER

Date: ${refDate}
Reference: ${incident.incident_reference}
Referred to: ${REFERRAL_TYPES[referralType]}

CONFIDENTIAL

Dear Recipient,

RE: SAFEGUARDING REFERRAL - ${riskLevel} RISK

INCIDENT DETAILS
- Reference: ${incident.incident_reference}
- Date: ${date}
- Location: ${incident.incident_location}
- Type: ${incident.incident_type.replace(/_/g, ' ')}
- Risk Level: ${riskLevel}
- Risk Score: ${riskScore}/100

VULNERABLE ADULT
- Name: ${incident.vulnerable_adult_details?.name || 'Undisclosed'}
- Age: ${incident.vulnerable_adult_details?.age || 'Undisclosed'}
- Immediate Danger: ${incident.vulnerable_adult_details?.immediate_danger ? 'YES - URGENT' : 'No'}

DESCRIPTION
${incident.incident_description}

ACTIONS TAKEN
${incident.actions_taken || 'No actions documented'}

RISK FACTORS
${incident.ai_risk_assessment?.risk_factors?.map(r => '- ' + r).join('\n') || '- None documented'}

RECOMMENDED ACTIONS
${incident.ai_risk_assessment?.recommended_actions?.map(a => '- ' + a).join('\n') || '- Assessment required'}

STATUTORY REFERRAL
Required: ${incident.ai_risk_assessment?.statutory_referral_required ? 'YES' : 'NO'}
${incident.ai_risk_assessment?.referral_type ? 'Type(s): ' + incident.ai_risk_assessment.referral_type.join(', ') : ''}

REPORTER
${incident.reported_by_name} (${incident.reported_by_role})
${incident.reported_by}

Please confirm receipt and provide assessment timeline.

Age UK Safeguarding Team
${organizationName}`;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { incidentId, referralType, organizationName } = await req.json();

    if (!incidentId || !referralType || !REFERRAL_TYPES[referralType]) {
      return Response.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }

    const incident = await base44.asServiceRole.entities.SafeguardingIncident.read(incidentId);
    if (!incident) {
      return Response.json({ error: 'Incident not found' }, { status: 404 });
    }

    const letterText = buildLetterText(incident, referralType, organizationName || 'Age UK');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    
    const lines = doc.splitTextToSize(letterText, maxWidth);
    let yPos = margin;

    lines.forEach(line => {
      if (yPos + 5 > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
      doc.setPage(page);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${page} of ${totalPages} | ${incident.incident_reference}`,
        margin,
        pageHeight - 10
      );
    }

    const filename = `SG-Referral-${incident.incident_reference}-${referralType}.pdf`;
    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: 'PDF generation failed' }, { status: 500 });
  }
});