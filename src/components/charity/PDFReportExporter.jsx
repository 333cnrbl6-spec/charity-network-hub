import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const REPORT_TYPES = [
  { value: 'annual_impact', label: 'Annual Impact Report', tier: 'professional' },
  { value: 'campaign_summary', label: 'Campaign Summary', tier: 'professional' },
  { value: 'volunteer_log', label: 'Volunteer Activity Log', tier: 'professional' },
  { value: 'grant_application', label: 'Grant Application (formatted)', tier: 'professional' },
];

export default function PDFReportExporter({ charity, donations = [], campaigns = [], volunteers = [], grants = [], subscriptionTier = 'starter' }) {
  const [reportType, setReportType] = useState('annual_impact');
  const [loading, setLoading] = useState(false);

  const isPro = ['professional', 'enterprise'].includes(subscriptionTier);

  const buildPDF = (type) => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const charityName = charity?.name || 'Your Charity';
    const charityNum = charity?.charity_number || '';

    // Header
    doc.setFillColor(88, 28, 135); // purple-900
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(charityName, 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (charityNum) doc.text(`Registered Charity No. ${charityNum}`, 14, 27);
    doc.text(`Report generated: ${today}`, 14, 34);

    doc.setTextColor(0, 0, 0);

    if (type === 'annual_impact') {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Annual Impact Report', 14, 54);

      const totalRaised = donations.reduce((s, d) => s + d.amount, 0);
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
      const totalVolHours = volunteers.reduce((s, v) => s + (v.hours_contributed || 0), 0);
      const awardeGrants = grants.filter(g => g.status === 'awarded').reduce((s, g) => s + g.amount, 0);

      let y = 68;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      const stats = [
        ['Total Funds Raised', `£${totalRaised.toLocaleString()}`],
        ['Active Campaigns', activeCampaigns.toString()],
        ['Total Volunteers', volunteers.length.toString()],
        ['Total Volunteer Hours', totalVolHours.toLocaleString()],
        ['Grants Awarded', `£${awardeGrants.toLocaleString()}`],
        ['Total Donations', donations.length.toString()],
      ];

      stats.forEach(([label, val]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label + ':', 14, y);
        doc.setFont('helvetica', 'normal');
        doc.text(val, 90, y);
        y += 10;
      });

      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Campaign Performance', 14, y);
      y += 8;
      campaigns.slice(0, 10).forEach(c => {
        doc.setFont('helvetica', 'normal');
        const pct = c.goal_amount ? Math.round(((c.raised_amount || 0) / c.goal_amount) * 100) : 0;
        doc.text(`• ${c.title}: £${(c.raised_amount || 0).toLocaleString()} / £${c.goal_amount?.toLocaleString()} (${pct}%)`, 14, y);
        y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }

    if (type === 'campaign_summary') {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Campaign Summary Report', 14, 54);
      let y = 68;
      campaigns.forEach(c => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(c.title, 14, y);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        y += 7;
        doc.text(`Status: ${c.status}  |  Goal: £${c.goal_amount?.toLocaleString()}  |  Raised: £${(c.raised_amount || 0).toLocaleString()}`, 14, y);
        y += 7;
        if (c.description) {
          const lines = doc.splitTextToSize(c.description, 180);
          doc.text(lines, 14, y);
          y += lines.length * 5 + 4;
        }
        y += 4;
        doc.setDrawColor(220, 220, 220);
        doc.line(14, y, 196, y);
        y += 8;
      });
    }

    if (type === 'volunteer_log') {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Volunteer Activity Log', 14, 54);
      let y = 68;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Name', 14, y); doc.text('Role', 70, y); doc.text('Hours', 130, y); doc.text('Status', 160, y);
      y += 6;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, y, 196, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      volunteers.forEach(v => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text((v.name || '').slice(0, 30), 14, y);
        doc.text((v.role || '').slice(0, 25), 70, y);
        doc.text((v.hours_contributed || 0).toString(), 130, y);
        doc.text(v.availability || '', 160, y);
        y += 8;
      });
    }

    if (type === 'grant_application') {
      const g = grants.find(g => g.ai_draft_application) || grants[0];
      if (!g) {
        doc.setFontSize(12);
        doc.text('No grant selected. Please generate an AI draft application first.', 14, 54);
      } else {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`Grant Application: ${g.grant_name}`, 14, 54);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Funder: ${g.funder_name}  |  Amount: £${g.amount?.toLocaleString()}  |  Deadline: ${new Date(g.deadline).toLocaleDateString('en-GB')}`, 14, 63);

        let y = 75;
        if (g.ai_draft_application) {
          Object.entries(g.ai_draft_application).forEach(([key, val]) => {
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), 14, y);
            y += 7;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const lines = doc.splitTextToSize(val || '', 180);
            doc.text(lines, 14, y);
            y += lines.length * 5 + 8;
          });
        }
      }
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`${charityName} | Registered Charity ${charityNum} | Page ${i} of ${pageCount}`, 14, 290);
    }

    return doc;
  };

  const handleExport = async () => {
    setLoading(true);
    const doc = buildPDF(reportType);
    const label = REPORT_TYPES.find(r => r.value === reportType)?.label || 'Report';
    doc.save(`${charityName?.replace(/\s+/g, '-').toLowerCase() || 'charity'}-${reportType}-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success(`${label} exported successfully`);
    setLoading(false);
  };

  const charityName = charity?.name;

  if (!isPro) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">Professional plan required for PDF exports</p>
            <p>Upgrade to export impact reports, donor statements, and grant applications. <a href="/charity-pricing" className="underline">View plans</a></p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileDown className="w-4 h-4" />
          Export PDF Report
        </CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3 items-end">
        <div className="flex-1">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleExport} disabled={loading} className="gap-2 bg-purple-600 hover:bg-purple-700 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          Export PDF
        </Button>
      </CardContent>
    </Card>
  );
}