import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import jsPDF from 'npm:jspdf@4.0.0';
import { format, subMonths } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { charity_id, period_start, period_end } = await req.json();

    if (!charity_id) {
      return Response.json({ error: 'charity_id required' }, { status: 400 });
    }

    // Use last month if not specified
    const endDate = period_end ? new Date(period_end) : new Date();
    const startDate = period_start ? new Date(period_start) : subMonths(endDate, 1);

    // Fetch charity data
    const charity = await base44.entities.Charity.filter({ id: charity_id });
    if (!charity || charity.length === 0) {
      return Response.json({ error: 'Charity not found' }, { status: 404 });
    }
    const charityData = charity[0];

    // Fetch volunteer hours
    const volunteers = await base44.entities.Volunteer.filter({ charity_id });
    const sessions = await base44.entities.Session.filter({ charity_id });
    
    let totalVolunteerHours = 0;
    let volunteerCount = volunteers?.length || 0;
    if (sessions) {
      sessions.forEach(session => {
        if (session.scheduled_date && new Date(session.scheduled_date) >= startDate && new Date(session.scheduled_date) <= endDate) {
          totalVolunteerHours += session.hours_scheduled || 0;
        }
      });
    }

    // Fetch grants and milestones
    const grants = await base44.entities.Grant.filter({ charity_id });
    const activeGrants = grants?.filter(g => g.status === 'awarded' || g.status === 'submitted') || [];
    const grantAmount = grants?.reduce((sum, g) => sum + (g.amount || 0), 0) || 0;

    // Fetch activity (donations, clients served)
    const donations = await base44.entities.Donation.filter({ charity_id });
    const totalDonations = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const clients = await base44.entities.Client.filter({ charity_id, status: 'active' });
    const clientCount = clients?.length || 0;

    // Calculate impact value (volunteer hours at £20/hr + donations)
    const volunteerValue = totalVolunteerHours * 20;
    const totalImpact = volunteerValue + totalDonations;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setTextColor(40, 44, 52);
    doc.text('Monthly Impact Report', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 120);
    doc.text(`${charityData.name || 'Charity'}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 5;
    doc.setFontSize(10);
    doc.text(`${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`, pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 20;

    // Key Metrics Section
    doc.setFontSize(14);
    doc.setTextColor(40, 44, 52);
    doc.text('Key Metrics', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    const metrics = [
      { label: 'Total Volunteer Hours', value: totalVolunteerHours.toFixed(1) },
      { label: 'Active Volunteers', value: volunteerCount },
      { label: 'Clients Served', value: clientCount },
      { label: 'Active Grants', value: activeGrants.length },
      { label: 'Grant Funding Awarded', value: `£${grantAmount.toLocaleString()}` },
      { label: 'Total Donations', value: `£${totalDonations.toLocaleString()}` },
      { label: 'Total Impact Value', value: `£${totalImpact.toLocaleString()}` }
    ];

    metrics.forEach((metric, idx) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${metric.label}:`, 20, yPosition);
      doc.setFont(undefined, 'bold');
      doc.text(metric.value, pageWidth - 20, yPosition, { align: 'right' });
      doc.setFont(undefined, 'normal');
      yPosition += 8;
    });

    // Volunteer Section
    yPosition += 10;
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(40, 44, 52);
    doc.text('Volunteer Activity', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Total volunteer hours: ${totalVolunteerHours.toFixed(1)}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Number of active volunteers: ${volunteerCount}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Estimated value of volunteering: £${volunteerValue.toLocaleString()}`, 20, yPosition);

    // Grant Section
    yPosition += 15;
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(40, 44, 52);
    doc.text('Grant Milestones', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Active grants: ${activeGrants.length}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total funding awarded: £${grantAmount.toLocaleString()}`, 20, yPosition);
    yPosition += 6;

    if (activeGrants.length > 0) {
      doc.text('Recent grants:', 20, yPosition);
      yPosition += 6;
      activeGrants.slice(0, 3).forEach(grant => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`• ${grant.grant_name || 'Unnamed'} (${grant.funder_name || 'Unknown'})`, 25, yPosition);
        yPosition += 5;
      });
    }

    // Client Outcomes Section
    yPosition += 10;
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(40, 44, 52);
    doc.text('Client Outcomes', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Clients currently served: ${clientCount}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total support interactions: ${sessions?.length || 0}`, 20, yPosition);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 20, pageHeight - 10);
    doc.text('CharityHub Impact Report System', pageWidth - 20, pageHeight - 10, { align: 'right' });

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Upload PDF to storage
    const fileName = `impact-report-${charity_id}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    const uploadResult = await base44.integrations.Core.UploadFile({
      file: pdfBuffer
    });

    // Log report generation
    await base44.functions.invoke('logAuditEvent', {
      charity_id,
      action: 'monthly_impact_report_generated',
      entity_type: 'Report',
      changes: {
        period_start: format(startDate, 'yyyy-MM-dd'),
        period_end: format(endDate, 'yyyy-MM-dd'),
        volunteer_hours: totalVolunteerHours,
        file_url: uploadResult.file_url
      }
    });

    return Response.json({
      success: true,
      file_url: uploadResult.file_url,
      file_name: fileName,
      metrics: {
        volunteer_hours: totalVolunteerHours,
        volunteer_count: volunteerCount,
        client_count: clientCount,
        grant_count: activeGrants.length,
        total_impact: totalImpact
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});