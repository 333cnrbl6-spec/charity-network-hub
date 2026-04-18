import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, AlertCircle, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

// Field definitions per entity type — what columns we expect
const ENTITY_FIELDS = {
  Client: [
    { key: 'full_name', label: 'Full Name', required: true, desc: 'The service user\'s full name' },
    { key: 'date_of_birth', label: 'Date of Birth', required: false, desc: 'DOB in any date format' },
    { key: 'address', label: 'Address', required: false, desc: 'Home address' },
    { key: 'postcode', label: 'Postcode', required: false, desc: 'UK postcode' },
    { key: 'phone', label: 'Phone', required: false, desc: 'Contact phone number' },
    { key: 'email', label: 'Email', required: false, desc: 'Contact email address' },
    { key: 'referral_source', label: 'Referral Source', required: false, desc: 'How they were referred (GP, NHS, self, etc.)' },
    { key: 'key_worker', label: 'Key Worker', required: false, desc: 'Assigned volunteer or staff member' },
    { key: 'notes', label: 'Notes', required: false, desc: 'Any additional notes' },
    { key: 'status', label: 'Status', required: false, desc: 'Active, inactive, or deceased' },
  ],
  Volunteer: [
    { key: 'full_name', label: 'Full Name', required: true, desc: 'Volunteer\'s full name' },
    { key: 'email', label: 'Email', required: false, desc: 'Contact email' },
    { key: 'phone', label: 'Phone', required: false, desc: 'Contact phone' },
    { key: 'role', label: 'Role', required: false, desc: 'Their role (befriender, driver, handyperson, etc.)' },
    { key: 'dbs_checked', label: 'DBS Checked', required: false, desc: 'Yes/No or True/False' },
    { key: 'dbs_expiry', label: 'DBS Expiry Date', required: false, desc: 'DBS certificate expiry' },
    { key: 'date_joined', label: 'Date Joined', required: false, desc: 'When they started volunteering' },
    { key: 'area', label: 'Area', required: false, desc: 'Local area they cover' },
    { key: 'status', label: 'Status', required: false, desc: 'Active or inactive' },
  ],
  Job: [
    { key: 'client_name', label: 'Client Name', required: true, desc: 'Who the job is for' },
    { key: 'volunteer_name', label: 'Handyperson / Volunteer', required: false, desc: 'Who is doing the job' },
    { key: 'job_type', label: 'Job Type', required: false, desc: 'Type of support (home visit, transport, etc.)' },
    { key: 'scheduled_date', label: 'Date / Time', required: false, desc: 'When the job is scheduled' },
    { key: 'status', label: 'Status', required: false, desc: 'Scheduled, completed, cancelled' },
    { key: 'notes', label: 'Notes', required: false, desc: 'Job notes or instructions' },
    { key: 'duration_minutes', label: 'Duration (mins)', required: false, desc: 'How long the job took' },
  ],
  Session: [
    { key: 'session_name', label: 'Session Name', required: true, desc: 'Name of the activity or class' },
    { key: 'session_type', label: 'Session Type', required: false, desc: 'Type (digital, exercise, social, etc.)' },
    { key: 'location', label: 'Location', required: false, desc: 'Where the session takes place' },
    { key: 'scheduled_date', label: 'Date / Time', required: false, desc: 'When it runs' },
    { key: 'attendees_count', label: 'Attendees', required: false, desc: 'Number of people attending' },
    { key: 'facilitator', label: 'Facilitator', required: false, desc: 'Who runs the session' },
    { key: 'status', label: 'Status', required: false, desc: 'Scheduled, completed, cancelled' },
  ],
  Grant: [
    { key: 'grant_name', label: 'Grant / Benefit Name', required: true, desc: 'Name of the grant or benefit' },
    { key: 'client_name', label: 'Client Name', required: false, desc: 'Who received it' },
    { key: 'funder', label: 'Funder / Organisation', required: false, desc: 'Who awarded the grant' },
    { key: 'amount_awarded', label: 'Amount (£)', required: false, desc: 'Value awarded in GBP' },
    { key: 'date_awarded', label: 'Date Awarded', required: false, desc: 'When it was awarded' },
    { key: 'grant_type', label: 'Grant Type', required: false, desc: 'Type of support (attendance allowance, pension credit, etc.)' },
    { key: 'status', label: 'Status', required: false, desc: 'Applied, awarded, rejected' },
  ],
};

async function getAIColumnSuggestions(entityType, sourceColumns, fileName) {
  const fields = ENTITY_FIELDS[entityType] || [];
  const prompt = `You are helping map columns from an imported spreadsheet into a database for an Age UK charity.

The spreadsheet is named: "${fileName}"
It has been identified as containing: ${entityType} records.

The spreadsheet has these column headers: ${JSON.stringify(sourceColumns)}

The database has these fields: ${JSON.stringify(fields.map(f => ({ key: f.key, label: f.label, desc: f.desc })))}

For each source column, suggest the best matching database field key (or null if no match).
Return JSON like:
{
  "mappings": [
    { "source_column": "Name", "suggested_field": "full_name", "confidence": 95, "reasoning": "Direct name match" },
    { "source_column": "DOB", "suggested_field": "date_of_birth", "confidence": 90, "reasoning": "DOB is date of birth" },
    { "source_column": "Ref No", "suggested_field": null, "confidence": 0, "reasoning": "No matching field" }
  ]
}`;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          mappings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source_column: { type: 'string' },
                suggested_field: { type: 'string' },
                confidence: { type: 'number' },
                reasoning: { type: 'string' },
              },
            },
          },
        },
      },
    });
    return result.mappings || [];
  } catch {
    return sourceColumns.map(col => ({ source_column: col, suggested_field: null, confidence: 0, reasoning: 'Could not analyse' }));
  }
}

export default function ColumnMappingWizard({ datasets, onComplete }) {
  // datasets: [{ name, entityType, detectedColumns, file }]
  const [currentIdx, setCurrentIdx] = useState(0);
  const [allMappings, setAllMappings] = useState({}); // { datasetName: { col: fieldKey } }
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState({}); // { col: bool }

  const dataset = datasets[currentIdx];
  const fields = ENTITY_FIELDS[dataset?.entityType] || [];

  useEffect(() => {
    if (!dataset) return;
    setLoading(true);
    setConfirmed({});
    getAIColumnSuggestions(dataset.entityType, dataset.detectedColumns, dataset.name).then(suggestions => {
      setAiSuggestions(suggestions);
      // Pre-fill mappings from AI suggestions
      const initial = {};
      suggestions.forEach(s => {
        if (s.suggested_field && s.confidence >= 60) initial[s.source_column] = s.suggested_field;
      });
      setAllMappings(prev => ({ ...prev, [dataset.name]: initial }));
      // Pre-confirm high confidence ones
      const preConfirmed = {};
      suggestions.forEach(s => { if (s.confidence >= 85) preConfirmed[s.source_column] = true; });
      setConfirmed(preConfirmed);
      setLoading(false);
    });
  }, [currentIdx]);

  const currentMapping = allMappings[dataset?.name] || {};

  const setMapping = (col, fieldKey) => {
    setAllMappings(prev => ({
      ...prev,
      [dataset.name]: { ...prev[dataset.name], [col]: fieldKey },
    }));
  };

  const toggleConfirm = (col) => {
    setConfirmed(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleNext = () => {
    if (currentIdx < datasets.length - 1) {
      setCurrentIdx(i => i + 1);
      setAiSuggestions(null);
      setLoading(true);
    } else {
      onComplete(allMappings);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      setAiSuggestions(null);
      setLoading(true);
    }
  };

  if (!dataset) return null;

  const getSuggestion = (col) => aiSuggestions?.find(s => s.source_column === col);
  const mappedCount = Object.values(currentMapping).filter(Boolean).length;
  const confirmedCount = Object.keys(confirmed).filter(k => confirmed[k]).length;
  const totalCols = dataset.detectedColumns?.length || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
            Dataset {currentIdx + 1} of {datasets.length}
          </p>
          <p className="text-base font-bold truncate">{dataset.name}</p>
          <Badge className={`mt-1 text-xs ${
            dataset.entityType === 'Client' ? 'bg-blue-100 text-blue-700' :
            dataset.entityType === 'Volunteer' ? 'bg-green-100 text-green-700' :
            dataset.entityType === 'Job' ? 'bg-yellow-100 text-yellow-700' :
            dataset.entityType === 'Session' ? 'bg-purple-100 text-purple-700' :
            'bg-pink-100 text-pink-700'
          }`}>
            → {dataset.entityType} records
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{confirmedCount}/{totalCols} confirmed</p>
          <div className="h-1.5 w-20 bg-border rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${totalCols ? (confirmedCount / totalCols) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg p-5">
          <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">AI is mapping your columns…</p>
            <p className="text-xs text-muted-foreground">Matching "{dataset.name}" columns to {dataset.entityType} fields</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {(dataset.detectedColumns || []).map((col) => {
            const suggestion = getSuggestion(col);
            const mappedField = currentMapping[col];
            const fieldDef = fields.find(f => f.key === mappedField);
            const isConfirmed = confirmed[col];
            const confidence = suggestion?.confidence || 0;

            return (
              <Card key={col} className={`border transition-all ${isConfirmed ? 'border-green-300 bg-green-50/30' : 'border-border'}`}>
                <CardContent className="p-3 space-y-2">
                  {/* Column name + confirm checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!isConfirmed}
                      onChange={() => toggleConfirm(col)}
                      disabled={!mappedField}
                      className="mt-0.5 w-4 h-4 accent-green-600 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-semibold bg-muted border border-border rounded px-1.5 py-0.5">{col}</span>
                        {confidence >= 85 && <Badge className="bg-green-100 text-green-700 text-xs">AI: {confidence}% match</Badge>}
                        {confidence >= 60 && confidence < 85 && <Badge className="bg-amber-100 text-amber-700 text-xs">AI: {confidence}% — check me</Badge>}
                        {confidence < 60 && suggestion?.suggested_field && <Badge className="bg-red-100 text-red-700 text-xs">Low confidence</Badge>}
                        {isConfirmed && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      </div>

                      {/* AI reasoning */}
                      {suggestion?.reasoning && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                          {suggestion.reasoning}
                        </p>
                      )}

                      {/* Field selector */}
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Maps to database field:</p>
                        <select
                          value={mappedField || ''}
                          onChange={e => { setMapping(col, e.target.value || null); if (isConfirmed) toggleConfirm(col); }}
                          className="w-full text-xs border border-input rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">— Skip this column —</option>
                          {fields.map(f => (
                            <option key={f.key} value={f.key}>
                              {f.label}{f.required ? ' *' : ''} — {f.desc}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Confirm instruction */}
                      {mappedField && !isConfirmed && (
                        <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          Tick the checkbox above to confirm: <strong>"{col}"</strong> is the <strong>{fieldDef?.label}</strong> of each {dataset.entityType}
                        </p>
                      )}
                      {isConfirmed && fieldDef && (
                        <p className="text-xs text-green-700 mt-1">
                          ✓ Confirmed: <strong>"{col}"</strong> → <strong>{fieldDef.label}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      {!loading && (
        <div className="flex gap-3 pt-2 border-t border-border">
          {currentIdx > 0 && (
            <Button variant="outline" onClick={handleBack} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1 gap-1">
            {currentIdx < datasets.length - 1 ? (
              <><span>Next dataset</span><ChevronRight className="w-4 h-4" /></>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /><span>Finish mapping & import</span></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}