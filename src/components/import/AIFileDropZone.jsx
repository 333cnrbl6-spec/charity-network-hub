import React, { useState, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload, Sparkles, CheckCircle2, AlertCircle, FileText,
  FileSpreadsheet, Image, FileJson, Loader2, X, ChevronDown, ChevronUp
} from 'lucide-react';

const ENTITY_OPTIONS = ['Client', 'Volunteer', 'Job', 'Session', 'Grant', 'ComplianceRecord'];

const FILE_ICON_MAP = {
  'xlsx': FileSpreadsheet, 'xls': FileSpreadsheet, 'csv': FileSpreadsheet,
  'pdf': FileText, 'doc': FileText, 'docx': FileText, 'txt': FileText,
  'json': FileJson, 'png': Image, 'jpg': Image, 'jpeg': Image,
};

function FileIcon({ filename }) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  const Icon = FILE_ICON_MAP[ext] || FileText;
  return <Icon className="w-5 h-5 text-primary" />;
}

export default function AIFileDropZone({ compact = false, onImportComplete }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle'); // idle | analysing | preview | importing | done | error
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRawPreview, setShowRawPreview] = useState(false);
  const [targetEntity, setTargetEntity] = useState('');
  const inputRef = useRef();

  const reset = () => {
    setFile(null);
    setStage('idle');
    setAiAnalysis(null);
    setImportResult(null);
    setErrorMsg('');
    setShowRawPreview(false);
    setTargetEntity('');
  };

  const processFile = useCallback(async (f) => {
    setFile(f);
    setStage('analysing');
    setErrorMsg('');
    setAiAnalysis(null);

    try {
      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });

      // Determine if it's a structured data file or a document
      const ext = f.name.split('.').pop().toLowerCase();
      const isStructured = ['xlsx', 'xls', 'csv', 'json'].includes(ext);

      let analysisPrompt;
      if (isStructured) {
        analysisPrompt = `You are helping an Age UK branch coordinator import data into their system.
The user has uploaded a file called "${f.name}".

Available entity types: Client, Volunteer, Job, Session, Grant, ComplianceRecord.

Client fields: full_name, date_of_birth, address, postcode, phone, email, referral_source (self-referral/nhs/social-care/family/gp/community-partner/other), status (active/inactive/deceased), date_registered (YYYY-MM-DD), key_worker, notes
Volunteer fields: full_name, email, phone, role (befriender/driver/admin/reception/digital-champion/men-in-sheds/shop/trustee/other), status (active/inactive), dbs_checked (true/false), dbs_expiry (YYYY-MM-DD), date_joined (YYYY-MM-DD), hours_contributed, area
Job fields: client_name, volunteer_name, job_type (home-visit/telephone-check/transport/shopping-assist/benefits-advice/digital-help/befriending/scams-advice/hospital-discharge/other), scheduled_date (ISO 8601), status (scheduled/completed/cancelled/no-answer), notes, duration_minutes
Session fields: session_name, session_type (stretch-and-flex/men-in-sheds/tea-and-tinker/out-in-the-city/digital-inclusion/scams-awareness/information-advice/ageing-well/hospital-aftercare/other), location, scheduled_date (ISO 8601), attendees_count, status (scheduled/completed/cancelled), facilitator, notes
Grant fields: grant_name, funder, amount_awarded (number), date_awarded (YYYY-MM-DD), grant_type (attendance-allowance/pension-credit/warm-homes/energy-support/housing/carers-support/dementia-support/general/other), client_name, status (applied/awarded/rejected), notes
ComplianceRecord fields: branch_id (use "bury"), branch_name (use "Age UK Bury"), compliance_area (dbs_checks/safeguarding_training/health_safety/manual_handling/dementia_awareness/boundary_training/financial_audit/data_protection/insurance/accessibility_standards/quality_standards/incident_reporting), status (compliant/at_risk/non_compliant/pending_review), deadline (YYYY-MM-DD), last_completed (YYYY-MM-DD), assigned_to, notes, risk_level (low/medium/high/critical)

Analyse this file and extract importable records. Map the data carefully to the most appropriate entity type.
For dates always output in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).
For any field you cannot determine from the data, omit it.
Return a structured analysis.`;
      } else {
        analysisPrompt = `You are helping an Age UK branch coordinator import data from a document into their system.
The user has uploaded "${f.name}".

Available entity types: Client, Volunteer, Job, Session, Grant, ComplianceRecord.

Read through this document and extract any structured data that could be stored as records in the system.
If the document is a policy/guidance document, suggest ComplianceRecord.
If it contains client information, suggest Client records.
Return a structured analysis.`;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            suggested_entity: { type: 'string' },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
            record_count: { type: 'number' },
            summary: { type: 'string' },
            guidance: { type: 'string' },
            records: {
              type: 'array',
              items: { type: 'object' }
            },
            warnings: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setAiAnalysis(result);
      setTargetEntity(result.suggested_entity || '');
      setStage('preview');
    } catch (err) {
      setErrorMsg(err.message || 'Could not analyse file');
      setStage('error');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) processFile(f);
  };

  const handleImport = async () => {
    if (!aiAnalysis?.records?.length || !targetEntity) return;
    setStage('importing');
    try {
      let created = 0;
      const entityObj = base44.entities[targetEntity];
      if (!entityObj) throw new Error(`Unknown entity: ${targetEntity}`);

      for (const record of aiAnalysis.records) {
        await entityObj.create(record);
        created++;
      }

      setImportResult({ created, entity: targetEntity });
      setStage('done');
      if (onImportComplete) onImportComplete({ created, entity: targetEntity });
    } catch (err) {
      setErrorMsg(err.message);
      setStage('error');
    }
  };

  // Compact drop trigger for portal embed
  if (compact && stage === 'idle') {
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/40'
        }`}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} accept="*/*" />
        <Upload className="w-7 h-7 text-primary mx-auto mb-2" />
        <p className="text-sm font-medium">Drop any file to import with AI</p>
        <p className="text-xs text-muted-foreground mt-1">Excel, CSV, PDF, Word, images — AI will guide you</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {stage === 'idle' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            dragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
        >
          <input ref={inputRef} type="file" className="hidden" onChange={handleFileSelect} accept="*/*" />
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Drop any file here</h3>
          <p className="text-muted-foreground text-sm mb-3">
            Excel, CSV, PDF, Word documents, images — any format
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['xlsx', 'csv', 'pdf', 'docx', 'jpg', 'json'].map(ext => (
              <Badge key={ext} variant="outline" className="font-mono text-xs">.{ext}</Badge>
            ))}
            <Badge variant="outline" className="text-xs">+ more</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            <Sparkles className="w-3 h-3 inline mr-1 text-primary" />
            AI will automatically read your file and guide you through importing the data
          </p>
        </div>
      )}

      {/* Analysing */}
      {stage === 'analysing' && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex items-center gap-3 justify-center">
              <FileIcon filename={file?.name} />
              <span className="font-medium text-sm">{file?.name}</span>
            </div>
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <div>
              <p className="font-semibold">AI is reading your file…</p>
              <p className="text-sm text-muted-foreground mt-1">
                Identifying data, mapping fields, checking for any issues
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Preview */}
      {stage === 'preview' && aiAnalysis && (
        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-4 px-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">AI Analysis Complete</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{aiAnalysis.summary}</p>
                  </div>
                </div>
                <button onClick={reset} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {aiAnalysis.guidance && (
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <p className="text-xs text-muted-foreground leading-relaxed">{aiAnalysis.guidance}</p>
                </div>
              )}

              {aiAnalysis.warnings?.length > 0 && (
                <div className="mt-3 space-y-1">
                  {aiAnalysis.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Entity selector + record count */}
          {aiAnalysis.records?.length > 0 && (
            <Card>
              <CardContent className="py-4 px-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-sm">Ready to import</p>
                    <p className="text-xs text-muted-foreground">{aiAnalysis.records.length} record{aiAnalysis.records.length !== 1 ? 's' : ''} extracted</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Import as:</span>
                    <select
                      value={targetEntity}
                      onChange={(e) => setTargetEntity(e.target.value)}
                      className="border rounded-md px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select type…</option>
                      {ENTITY_OPTIONS.map(e => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                    <Badge variant={aiAnalysis.confidence === 'high' ? 'default' : 'secondary'} className="text-xs">
                      {aiAnalysis.confidence} confidence
                    </Badge>
                  </div>
                </div>

                {/* Raw preview toggle */}
                <button
                  onClick={() => setShowRawPreview(v => !v)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showRawPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showRawPreview ? 'Hide' : 'Preview'} extracted records
                </button>

                {showRawPreview && (
                  <div className="bg-muted/50 rounded-lg p-3 max-h-64 overflow-y-auto">
                    <pre className="text-xs text-foreground whitespace-pre-wrap">
                      {JSON.stringify(aiAnalysis.records.slice(0, 5), null, 2)}
                      {aiAnalysis.records.length > 5 && `\n\n… and ${aiAnalysis.records.length - 5} more records`}
                    </pre>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleImport} disabled={!targetEntity} className="flex-1 gap-2">
                    <Upload className="w-4 h-4" />
                    Import {aiAnalysis.records.length} record{aiAnalysis.records.length !== 1 ? 's' : ''}
                  </Button>
                  <Button onClick={reset} variant="outline">Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No importable records — guidance only */}
          {(!aiAnalysis.records || aiAnalysis.records.length === 0) && (
            <Card>
              <CardContent className="py-4 px-5">
                <p className="text-sm text-muted-foreground text-center">
                  No structured records could be extracted from this file — but the AI guidance above may still be useful.
                </p>
                <Button onClick={reset} variant="outline" className="w-full mt-3">Upload a different file</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Importing */}
      {stage === 'importing' && (
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="font-semibold">Saving records…</p>
            <p className="text-sm text-muted-foreground">Adding {aiAnalysis?.records?.length} {targetEntity} records</p>
          </CardContent>
        </Card>
      )}

      {/* Done */}
      {stage === 'done' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
            <div>
              <p className="font-semibold text-green-900">Import complete!</p>
              <p className="text-sm text-green-700 mt-1">
                {importResult?.created} {importResult?.entity} record{importResult?.created !== 1 ? 's' : ''} added to the system
              </p>
            </div>
            <Button onClick={reset} variant="outline" size="sm" className="mt-2">Import another file</Button>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {stage === 'error' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <div>
              <p className="font-semibold text-red-900">Something went wrong</p>
              <p className="text-sm text-red-700 mt-1">{errorMsg}</p>
            </div>
            <Button onClick={reset} variant="outline" size="sm">Try again</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}