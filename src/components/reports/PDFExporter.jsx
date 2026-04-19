import React, { useState } from 'react';

const REPORTS = [
  { id: 'impact', label: 'Annual Impact Report', desc: 'Comprehensive overview of all activities and outcomes', color: 'text-purple-600' },
  { id: 'volunteer', label: 'Volunteer Activity Log', desc: 'Volunteer hours, roles and contributions', color: 'text-green-600' },
  { id: 'grants', label: 'Grant Pipeline Report', desc: 'All grant applications, awards and values', color: 'text-amber-600' },
  { id: 'compliance', label: 'Compliance Summary', desc: 'Compliance status across all required areas', color: 'text-blue-600' },
];

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { useClients, useVolunteers, useJobs, useGrants, useCompliance } from '@/hooks/useEntityQueries';

export default function PDFExporter() {
  const [generating, setGenerating] = useState(null);

  const { data: clients = [] } = useClients();
  const { data: volunteers = [] } = useVolunteers();
  const { data: jobs = [] } = useJobs();
  const { data: grants = [] } = useGrants();
  const { data: compliance = [] } = useCompliance();

  const generatePDF = async (reportId) => {
    setGenerating(reportId);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const pageW = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(124, 58, 237);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');

    const titles = {
      impact: 'Annual Impact Report',
      volunteer: 'Volunteer Activity Log',
      grants: 'Grant Pipeline Report',
      compliance: 'Compliance Summary',
    };

    doc.text(titles[reportId], 14, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${today} | CharityHub`, 14, 21);
    doc.setTextColor(30, 30, 30);

    let y = 38;

    const addSection = (title) => {
      doc.setFillColor(245, 243, 255);
      doc.rect(10, y - 5, pageW - 20, 10, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(124, 58, 237);
      doc.text(title, 14, y + 1);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      y += 10;
    };

    const addRow = (label, value) => {
      doc.text(`${label}:`, 14, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value), 80, y);
      doc.setFont('helvetica', 'normal');
      y += 7;
      if (y > 270) { doc.addPage(); y = 20; }
    };

    if (reportId === 'impact') {
      addSection('Key Metrics');
      addRow('Total Clients', clients.length);
      addRow('Active Clients', clients.filter(c => c.status === 'active').length);
      addRow('Active Volunteers', volunteers.filter(v => v.status === 'active').length);
      addRow('Total Volunteer Hours', volunteers.reduce((s, v) => s + (v.hours_contributed || 0), 0));
      addRow('Jobs Completed', jobs.filter(j => j.status === 'completed').length);
      addRow('Grants Awarded', grants.filter(g => g.status === 'awarded').length);
      addRow('Total Grant Value', `£${grants.filter(g => g.status === 'awarded').reduce((s, g) => s + (g.amount_awarded || 0), 0).toLocaleString()}`);
      y += 5;
      addSection('Clients by Status');
      ['active', 'inactive', 'deceased'].forEach(s => addRow(s.charAt(0).toUpperCase() + s.slice(1), clients.filter(c => c.status === s).length));
    }

    if (reportId === 'volunteer') {
      addSection('Volunteer Summary');
      addRow('Total Volunteers', volunteers.length);
      addRow('Active', volunteers.filter(v => v.status === 'active').length);
      addRow('DBS Checked', volunteers.filter(v => v.dbs_checked).length);
      addRow('Total Hours', volunteers.reduce((s, v) => s + (v.hours_contributed || 0), 0));
      y += 5;
      addSection('By Role');
      const roles = {};
      volunteers.forEach(v => { roles[v.role || 'other'] = (roles[v.role || 'other'] || 0) + 1; });
      Object.entries(roles).forEach(([r, c]) => addRow(r, c));
      y += 5;
      addSection('Top Contributors');
      volunteers.sort((a, b) => (b.hours_contributed || 0) - (a.hours_contributed || 0)).slice(0, 10).forEach(v => {
        addRow(v.full_name, `${v.hours_contributed || 0} hrs`);
      });
    }

    if (reportId === 'grants') {
      addSection('Grant Pipeline');
      addRow('Total Applications', grants.length);
      addRow('Awarded', grants.filter(g => g.status === 'awarded').length);
      addRow('Pending', grants.filter(g => g.status === 'applied').length);
      addRow('Rejected', grants.filter(g => g.status === 'rejected').length);
      addRow('Total Value Awarded', `£${grants.filter(g => g.status === 'awarded').reduce((s, g) => s + (g.amount_awarded || 0), 0).toLocaleString()}`);
      y += 5;
      addSection('Recent Awards');
      grants.filter(g => g.status === 'awarded').slice(0, 15).forEach(g => {
        addRow(g.grant_name, `£${(g.amount_awarded || 0).toLocaleString()}`);
      });
    }

    if (reportId === 'compliance') {
      addSection('Compliance Overview');
      addRow('Total Records', compliance.length);
      addRow('Compliant', compliance.filter(c => c.status === 'compliant').length);
      addRow('At Risk', compliance.filter(c => c.status === 'at_risk').length);
      addRow('Non-Compliant', compliance.filter(c => c.status === 'non_compliant').length);
      addRow('Pending Review', compliance.filter(c => c.status === 'pending_review').length);
      y += 5;
      addSection('Non-Compliant Items');
      compliance.filter(c => c.status === 'non_compliant').forEach(c => {
        addRow(c.compliance_area?.replace(/_/g, ' ') || 'Unknown', c.risk_level || 'medium');
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`CharityHub | Page ${i} of ${pageCount}`, pageW / 2, 290, { align: 'center' });
    }

    doc.save(`${reportId}-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    setGenerating(null);
    toast.success(`${titles[reportId]} downloaded!`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Export PDF Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REPORTS.map(r => (
          <div key={r.id} className="border rounded-lg p-4 flex items-start justify-between gap-3 hover:bg-accent/30 transition-colors">
            <div className="min-w-0">
              <p className={`font-semibold text-sm ${r.color}`}>{r.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => generatePDF(r.id)}
              disabled={!!generating}
              className="shrink-0 gap-1.5"
            >
              {generating === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              PDF
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}