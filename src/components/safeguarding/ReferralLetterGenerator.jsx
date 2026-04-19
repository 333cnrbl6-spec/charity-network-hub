import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const REFERRAL_OPTIONS = [
  { value: 'adult_social_care', label: 'Adult Social Care Services', icon: '📋' },
  { value: 'police', label: 'Police Service', icon: '🚔' },
  { value: 'cqc', label: 'Care Quality Commission (CQC)', icon: '🏛️' },
  { value: 'lado', label: 'Local Authority Designated Officer (LADO)', icon: '👨‍⚖️' },
  { value: 'internal', label: 'Internal Management', icon: '📊' },
];

export default function ReferralLetterGenerator({ incident, onClose }) {
  const [selectedType, setSelectedType] = useState('');
  const [organizationName, setOrganizationName] = useState('Age UK');
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleGeneratePreview = async () => {
    if (!selectedType) {
      toast.error('Please select a referral type');
      return;
    }

    setGenerating(true);
    try {
      // Generate preview by calling the function
      const response = await base44.functions.invoke('generateReferralPDF', {
        incidentId: incident.id,
        referralType: selectedType,
        organizationName,
      });

      // For preview, we'll show letter details
      setPreview({
        type: selectedType,
        date: new Date().toLocaleDateString('en-GB'),
        incidentRef: incident.incident_reference,
      });

      toast.success('Preview ready');
    } catch (error) {
      toast.error('Failed to generate preview', { description: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedType) {
      toast.error('Please select a referral type');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateReferralPDF', {
        incidentId: incident.id,
        referralType: selectedType,
        organizationName,
      });

      // The function returns PDF as arraybuffer
      // Create blob and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SG-Referral-${incident.incident_reference}-${selectedType}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Referral letter downloaded');
    } catch (error) {
      toast.error('Failed to download PDF', { description: error.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Generate Referral Letter
        </CardTitle>
        <CardDescription>
          Pre-filled referral letter for {incident.incident_reference}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Incident Summary */}
        <div className="border rounded-lg p-3 bg-blue-50">
          <p className="text-sm font-semibold text-blue-900 mb-2">Incident Summary</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
            <div>
              <span className="font-medium">Reference:</span> {incident.incident_reference}
            </div>
            <div>
              <span className="font-medium">Type:</span>{' '}
              {incident.incident_type.replace(/_/g, ' ')}
            </div>
            <div>
              <span className="font-medium">Risk Level:</span>
              <Badge
                variant="outline"
                className={`ml-1 ${
                  incident.ai_severity_classification === 'critical'
                    ? 'bg-red-100 text-red-800'
                    : incident.ai_severity_classification === 'high'
                    ? 'bg-orange-100 text-orange-800'
                    : incident.ai_severity_classification === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {incident.ai_severity_classification?.toUpperCase()}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Risk Score:</span>{' '}
              {incident.ai_risk_assessment?.risk_score || 'N/A'}/100
            </div>
          </div>
        </div>

        {/* Referral Type Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Referral Type *</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Select recipient agency..." />
            </SelectTrigger>
            <SelectContent>
              {REFERRAL_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organization Name */}
        <div>
          <label className="text-sm font-medium mb-2 block">Organization Name</label>
          <input
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Age UK"
          />
        </div>

        {/* Preview Section */}
        {preview && (
          <div className="border rounded-lg p-3 bg-green-50">
            <p className="text-sm font-semibold text-green-900 mb-2">✓ Preview Ready</p>
            <div className="text-xs text-green-800 space-y-1">
              <p>
                <span className="font-medium">Recipient:</span>{' '}
                {REFERRAL_OPTIONS.find(r => r.value === preview.type)?.label}
              </p>
              <p>
                <span className="font-medium">Generated:</span> {preview.date}
              </p>
              <p className="text-green-700 mt-2">
                Ready to download. Letter includes incident details, risk assessment, and
                recommended actions.
              </p>
            </div>
          </div>
        )}

        {/* Warning for Critical/High Risk */}
        {(incident.ai_severity_classification === 'critical' ||
          incident.ai_severity_classification === 'high') && (
          <div className="border border-red-200 rounded-lg p-3 bg-red-50">
            <p className="text-sm font-semibold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              High-Priority Referral
            </p>
            <p className="text-xs text-red-800 mt-1">
              This incident requires urgent external referral. Ensure this letter is sent
              immediately and follow up within 24 hours.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {!preview ? (
            <Button
              onClick={handleGeneratePreview}
              disabled={!selectedType || generating}
              className="flex-1"
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate & Preview'}
            </Button>
          ) : (
            <Button
              onClick={handleDownloadPDF}
              disabled={generating}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {generating ? 'Downloading...' : 'Download PDF'}
            </Button>
          )}

          <Button onClick={onClose} variant="ghost" className="flex-1">
            Cancel
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          💡 PDF includes watermark "DRAFT FOR REVIEW". Review letter content before final
          submission to external agencies.
        </p>
      </CardContent>
    </Card>
  );
}