import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileJson, FileText } from 'lucide-react';

export default function DataExportPanel({ charityId, charityTier }) {
  const [format, setFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);

  // Only Professional/Enterprise can export
  if (charityTier === 'starter') {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Data export is available on Professional and Enterprise plans.
          </p>
          <Button className="mt-4">Upgrade to Professional</Button>
        </CardContent>
      </Card>
    );
  }

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke('exportCharityData', {
        charity_id: charityId,
        format
      });

      // Create download link
      const element = document.createElement('a');
      const file = new Blob([response.data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `charity-data-${Date.now()}.${format === 'csv' ? 'csv' : 'json'}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Your Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <Select value={format} onValueChange={setFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV (Spreadsheet)
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  JSON (Complete)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-sm text-slate-700">
            <strong>Includes:</strong> Donors, donations, campaigns, and volunteers
          </p>
        </div>

        <Button
          onClick={handleExport}
          disabled={exporting}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Download Data'}
        </Button>

        <p className="text-xs text-muted-foreground">
          Your data is encrypted in transit and never shared with third parties. GDPR compliant.
        </p>
      </CardContent>
    </Card>
  );
}