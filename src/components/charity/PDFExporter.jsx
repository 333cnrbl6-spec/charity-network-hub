import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PDFExporter({ charityData, subscriptionTier, reportType = 'impact' }) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const canExport = ['professional', 'enterprise'].includes(subscriptionTier);

  const exportPDF = async () => {
    if (!canExport) return;
    
    setGenerating(true);
    setError(null);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // Title
      pdf.setFontSize(20);
      pdf.text(charityData.name, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Report type heading
      pdf.setFontSize(14);
      pdf.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Content based on report type
      pdf.setFontSize(11);
      pdf.setTextColor(0);

      if (reportType === 'impact') {
        pdf.text('Annual Impact Report', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.text([
          'Charity Number: ' + charityData.charity_number,
          'Cause Area: ' + charityData.cause_area,
          'Mission: ' + charityData.description,
          'Annual Income: £' + (charityData.annual_income || 0).toLocaleString()
        ], 20, yPosition, { maxWidth: 160 });
      } else if (reportType === 'donor') {
        pdf.text('Donor Statement', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.text('Thank you for your support of ' + charityData.name, 20, yPosition, { maxWidth: 160 });
      } else if (reportType === 'campaign') {
        pdf.text('Campaign Summary', 20, yPosition);
        yPosition += 10;
        pdf.setFontSize(10);
        pdf.text('Campaign performance and outcomes report', 20, yPosition, { maxWidth: 160 });
      }

      // Footer
      yPosition = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.text('Generated on ' + new Date().toLocaleDateString(), 20, yPosition);
      pdf.text('Page 1', pageWidth / 2, yPosition, { align: 'center' });

      pdf.save(`${charityData.name}-${reportType}-${new Date().getFullYear()}.pdf`);
    } catch (err) {
      setError('Failed to generate PDF: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!canExport) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold">Upgrade to Professional</p>
            <p>PDF reports available on Professional and Enterprise plans.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Export Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {['impact', 'donor', 'campaign', 'volunteer'].map(type => (
            <Button
              key={type}
              variant="outline"
              className="w-full justify-start"
              onClick={exportPDF}
              disabled={generating}
            >
              {generating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Export {type.charAt(0).toUpperCase() + type.slice(1)} Report
            </Button>
          ))}
        </div>
        {error && <div className="mt-3 bg-red-50 text-red-700 p-3 rounded text-sm">{error}</div>}
      </CardContent>
    </Card>
  );
}