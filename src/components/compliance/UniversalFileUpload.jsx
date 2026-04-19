import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const RISK_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const ACTION_COLORS = {
  none: 'bg-green-100 text-green-800',
  review: 'bg-yellow-100 text-yellow-800',
  immediate: 'bg-orange-100 text-orange-800',
  block: 'bg-red-100 text-red-800',
};

export default function UniversalFileUpload({ onFileProcessed, destinationEntity }) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Step 1: Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFile({ name: file.name, type: file.type, size: file.size, url: file_url });

      // Step 2: AI Analysis & Classification
      setProcessing(true);
      const { data } = await base44.integrations.Core.InvokeLLM({
        model: 'claude_opus_4_6',
        prompt: `Analyse this uploaded file for CharityHub (Age UK charity management system).
File: ${file.name}
URL: ${file_url}

Classify and extract:
1. File Type: Detect format (pdf, docx, xlsx, csv, jpg, png, etc.)
2. Content Category: Classify as one of: contract, certificate, report, financial, technical, legal, compliance, client-record, volunteer-record, grant-application, safeguarding, policy, other
3. Extract Key Fields: Based on category, extract relevant structured data
4. Compliance Check: Validate against UK charity regulations (Charity Commission, HMRC, GDPR, Safeguarding)
5. Risk Level: low, medium, high, or critical
6. Action Required: none, review, immediate, or block
7. Auto-Sort Destination: Which entity this belongs to (clients, volunteers, grants, compliance, sessions, jobs, or general)

Be thorough — this is for compliance-driven document processing.`,
        response_json_schema: {
          type: 'object',
          properties: {
            file_type: { type: 'string' },
            content_category: { type: 'string' },
            extracted_fields: { type: 'object' },
            compliance_check: {
              type: 'object',
              properties: {
                charity_commission: { type: 'boolean' },
                hmrc_compliant: { type: 'boolean' },
                gdpr_compliant: { type: 'boolean' },
                safeguarding_alert: { type: 'boolean' },
              },
            },
            risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            action_required: { type: 'string', enum: ['none', 'review', 'immediate', 'block'] },
            auto_sort_destination: { type: 'string' },
            recommended_actions: { type: 'array', items: { type: 'string' } },
          },
          required: ['file_type', 'content_category', 'risk_level', 'action_required', 'auto_sort_destination'],
        },
      });

      setAnalysisResult(data);
      toast.success('File analysed successfully', {
        description: `Category: ${data.content_category} | Risk: ${data.risk_level}`,
      });

      if (onFileProcessed) {
        onFileProcessed({ file: uploadedFile, analysis: data });
      }
    } catch (error) {
      console.error('File processing failed:', error);
      toast.error('Failed to process file', {
        description: error.message,
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Universal File Upload & AI Sorting
        </CardTitle>
        <CardDescription>Upload any file type — AI will classify, extract data, and route to correct destination</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedFile ? (
          <div className="border-2 border-dashed border-primary/50 rounded-lg p-8 text-center bg-primary/5">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              disabled={uploading || processing}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.txt,.json"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {uploading ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
              ) : processing ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
              ) : (
                <Upload className="w-10 h-10 text-primary mx-auto mb-3" />
              )}
              <p className="text-sm font-medium mb-1">
                {uploading ? 'Uploading...' : processing ? 'AI Processing...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: PDF, Word, Excel, CSV, Images, Text, JSON
              </p>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="border rounded-lg p-4 flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type || 'Unknown type'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetUpload}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* AI Analysis Result */}
            {analysisResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <Badge variant="outline">{analysisResult.content_category}</Badge>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Auto-Sort To</p>
                    <Badge className="bg-primary/10 text-primary">{analysisResult.auto_sort_destination}</Badge>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                    <Badge className={RISK_COLORS[analysisResult.risk_level]}>{analysisResult.risk_level}</Badge>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Action</p>
                    <Badge className={ACTION_COLORS[analysisResult.action_required]}>{analysisResult.action_required}</Badge>
                  </div>
                </div>

                {/* Compliance Checks */}
                <div className="border rounded-lg p-3">
                  <p className="text-xs font-semibold mb-2">Compliance Validation</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {analysisResult.compliance_check?.charity_commission ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span>Charity Commission</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysisResult.compliance_check?.hmrc_compliant ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span>HMRC Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysisResult.compliance_check?.gdpr_compliant ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span>GDPR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysisResult.compliance_check?.safeguarding_alert ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      <span>Safeguarding</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Actions */}
                {analysisResult.recommended_actions?.length > 0 && (
                  <div className="border rounded-lg p-3">
                    <p className="text-xs font-semibold mb-2">Recommended Actions</p>
                    <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                      {analysisResult.recommended_actions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Extracted Fields Preview */}
                {analysisResult.extracted_fields && Object.keys(analysisResult.extracted_fields).length > 0 && (
                  <div className="border rounded-lg p-3">
                    <p className="text-xs font-semibold mb-2">Extracted Data</p>
                    <pre className="text-xs bg-muted/50 rounded p-2 overflow-auto max-h-40">
                      {JSON.stringify(analysisResult.extracted_fields, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}