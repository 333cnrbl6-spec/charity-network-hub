import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { metrics } = await req.json();

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header with gradient color
    doc.setFontSize(28);
    doc.setTextColor(139, 92, 246); // primary purple
    doc.text('Our Community Impact', pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // muted foreground
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });

    yPos += 20;

    // Key Metrics Section
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Key Impact Metrics', 20, yPos);
    yPos += 12;

    const metricsData = [
      { label: 'Total Volunteer Hours', value: `${metrics.totalHours} hours`, color: [59, 130, 246] },
      { label: 'Beneficiaries Supported', value: `${metrics.totalBeneficiaries} people`, color: [16, 185, 129] },
      { label: 'Active Volunteers', value: `${metrics.activeVolunteers} volunteers`, color: [139, 92, 246] },
      { label: 'Grant Funding Awarded', value: `£${(metrics.totalGrantFunding / 1000).toFixed(0)}k`, color: [245, 158, 11] }
    ];

    metricsData.forEach((metric, idx) => {
      // Color block
      doc.setDrawColor(metric.color[0], metric.color[1], metric.color[2]);
      doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
      doc.rect(20, yPos, 5, 8, 'F');

      // Label
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(metric.label, 28, yPos + 3);

      // Value
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.setFont(undefined, 'bold');
      doc.text(metric.value, pageWidth - 20, yPos + 3, { align: 'right' });
      doc.setFont(undefined, 'normal');

      yPos += 12;
    });

    yPos += 10;

    // Mission Statement
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('Our Mission', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(80, 80, 80);
    const missionText = 'We are committed to supporting our community through volunteer-led programs that provide social connection, practical help, and empowerment. Every hour of volunteer time makes a real difference in people\'s lives.';
    const missionLines = doc.splitTextToSize(missionText, pageWidth - 40);
    doc.text(missionLines, 20, yPos);

    yPos += missionLines.length * 5 + 15;

    // Impact Areas
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont(undefined, 'bold');
    doc.text('How We Help', 20, yPos);
    yPos += 10;

    const impactAreas = [
      { title: 'Social Connection', desc: 'Reducing isolation through befriending and community activities' },
      { title: 'Practical Support', desc: 'Home maintenance, gardening, IT help, and daily living assistance' },
      { title: 'Digital Skills', desc: 'Training and support to help people stay connected in the digital world' }
    ];

    impactAreas.forEach((area) => {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(`• ${area.title}`, 20, yPos);

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(area.desc, 25, yPos + 5);

      yPos += 13;
    });

    yPos += 10;

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('This report demonstrates our commitment to transparency and impact measurement.', pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Generate PDF
    const pdfBytes = doc.output('arraybuffer');

    // Upload to storage
    const uploadRes = await base44.integrations.Core.UploadFile({
      file: new Blob([pdfBytes], { type: 'application/pdf' })
    });

    return Response.json({
      success: true,
      pdf_url: uploadRes.file_url
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});