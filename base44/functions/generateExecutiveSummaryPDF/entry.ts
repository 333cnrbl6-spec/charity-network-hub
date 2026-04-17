import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';

// Helper to format week identifier
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

// Get last 4 weeks of data
function getLast4WeekIds() {
  const weeks = [];
  let date = new Date();
  for (let i = 0; i < 4; i++) {
    const year = date.getFullYear();
    const jan = new Date(year, 0, 1);
    const diff = date - jan;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const week = Math.ceil((dayOfYear + jan.getDay() + 1) / 7);
    weeks.unshift(`${year}-W${String(week).padStart(2, '0')}`);
    date.setDate(date.getDate() - 7);
  }
  return weeks;
}

// Create PDF with aggregated metrics
async function createPDF(base44) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Fetch all data in parallel
  const [healthReports, scorecards, branches, clients] = await Promise.all([
    base44.asServiceRole.entities.CollectiveHealthReport.list('-report_week', 4),
    base44.asServiceRole.entities.GovernanceRiskScorecard.list('-scan_week', 4),
    base44.asServiceRole.entities.BranchConfig.list(),
    base44.asServiceRole.entities.Client.list()
  ]);

  const latestHealthReport = healthReports[0];
  const latestScorecard = scorecards[0];

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 60, 120);
  doc.text('Executive Summary Dashboard', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Week of ${latestHealthReport?.report_week || getWeekIdentifier()} | ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;
  const lineY = yPos;
  doc.setDrawColor(40, 60, 120);
  doc.line(20, lineY, pageWidth - 20, lineY);

  // Key Metrics Summary
  yPos += 8;
  doc.setFontSize(14);
  doc.setTextColor(40, 60, 120);
  doc.text('Key Metrics Overview', 20, yPos);

  yPos += 12;
  const metricsData = [
    {
      label: 'Overall Health Score',
      value: latestHealthReport?.collective_health_score || 'N/A',
      unit: '%'
    },
    {
      label: 'Active Branches',
      value: branches.length,
      unit: ''
    },
    {
      label: 'Total Clients',
      value: clients.length,
      unit: ''
    },
    {
      label: 'Governance Risk',
      value: latestScorecard?.overall_risk_score || 'N/A',
      unit: '/100'
    }
  ];

  const metricBoxWidth = (pageWidth - 40) / 2;
  let metricsX = 20;
  let metricsY = yPos;
  let metricsRowCount = 0;

  metricsData.forEach((metric, idx) => {
    if (metricsRowCount === 2) {
      metricsY += 25;
      metricsX = 20;
      metricsRowCount = 0;
    }

    // Box
    doc.setDrawColor(200, 200, 200);
    doc.rect(metricsX, metricsY, metricBoxWidth - 5, 20);

    // Content
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(metric.label, metricsX + 5, metricsY + 7);

    doc.setFontSize(14);
    doc.setTextColor(40, 60, 120);
    doc.text(`${metric.value}${metric.unit}`, metricsX + 5, metricsY + 16);

    metricsX += metricBoxWidth;
    metricsRowCount++;
  });

  yPos = metricsY + 30;

  // Product Health Status
  if (latestHealthReport?.products && latestHealthReport.products.length > 0) {
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(40, 60, 120);
    doc.text('Product Health Status', 20, yPos);

    yPos += 10;
    const tableStartY = yPos;
    const colWidth = (pageWidth - 40) / 4;

    // Table header
    doc.setFillColor(40, 60, 120);
    doc.setTextColor(255);
    doc.setFontSize(9);
    const headers = ['Product', 'Parity', 'Impact', 'Growth'];
    headers.forEach((header, idx) => {
      doc.text(header, 20 + idx * colWidth, yPos + 5);
    });

    yPos += 8;

    // Table rows
    doc.setTextColor(50);
    latestHealthReport.products.slice(0, 5).forEach((product, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPos - 4, pageWidth - 40, 7, 'F');
      }

      doc.text(product.product_name || '', 20, yPos);
      doc.text(`${product.parity_score || 0}%`, 20 + colWidth, yPos);
      doc.text(`${product.impact_score || 0}%`, 20 + colWidth * 2, yPos);
      doc.text(`${product.growth_rate || 0}%`, 20 + colWidth * 3, yPos);

      yPos += 7;
    });
  }

  yPos += 5;

  // Governance Risk Summary
  if (latestScorecard) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(40, 60, 120);
    doc.text('Governance Risk Assessment', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);

    const riskLevel = latestScorecard.risk_level.toUpperCase();
    const riskColor = latestScorecard.risk_level === 'critical' ? [200, 0, 0] :
                      latestScorecard.risk_level === 'high' ? [255, 100, 0] :
                      latestScorecard.risk_level === 'medium' ? [255, 200, 0] : [0, 150, 0];

    doc.setTextColor(...riskColor);
    doc.setFontSize(12);
    doc.text(`Risk Level: ${riskLevel}`, 20, yPos);

    yPos += 8;
    doc.setTextColor(50);
    doc.setFontSize(9);
    doc.text(`Policy Coverage: ${latestScorecard.policy_coverage}%`, 20, yPos);

    yPos += 6;
    doc.text(`Critical Violations: ${latestScorecard.critical_violations?.length || 0}`, 20, yPos);

    if (latestScorecard.mitigation_recommendations?.length > 0) {
      yPos += 10;
      doc.setFontSize(10);
      doc.setTextColor(40, 60, 120);
      doc.text('Key Recommendations:', 20, yPos);

      yPos += 6;
      doc.setFontSize(8);
      doc.setTextColor(80);
      latestScorecard.mitigation_recommendations.slice(0, 3).forEach(rec => {
        doc.text(`• ${rec}`, 25, yPos, { maxWidth: pageWidth - 50 });
        yPos += 5;
      });
    }
  }

  // Footer
  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Page ${doc.internal.pages.length - 1} | Generated: ${new Date().toLocaleString('en-GB')}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  return doc.output('arraybuffer');
}

// Main endpoint
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Generate PDF
    const pdfBytes = await createPDF(base44);

    // Upload to storage
    const fileName = `Executive-Summary-${getWeekIdentifier()}.pdf`;
    const { file_url } = await base44.integrations.Core.UploadFile({
      file: new Blob([pdfBytes], { type: 'application/pdf' })
    });

    // Get leadership team (admins with leadership role)
    const users = await base44.asServiceRole.entities.User.list();
    const adminUsers = users.filter(u => u.role === 'admin');

    // Send emails
    const emailPromises = adminUsers.map(admin =>
      base44.integrations.Core.SendEmail({
        to: admin.email,
        subject: `Executive Summary Dashboard - ${getWeekIdentifier()}`,
        body: `Hi ${admin.full_name},\n\nPlease find attached your weekly Executive Summary Dashboard for ${getWeekIdentifier()}.\n\nKey Highlights:\n- Overall Health Score\n- Product Performance Metrics\n- Governance Risk Assessment\n- Strategic Recommendations\n\nFile: ${file_url}\n\nBest regards,\nAutomated Reporting Service`
      })
    );

    await Promise.all(emailPromises);

    return Response.json({
      success: true,
      message: `Executive Summary PDF generated and emailed to ${adminUsers.length} users`,
      file_url,
      week: getWeekIdentifier()
    });
  } catch (error) {
    console.error('Executive summary generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});