import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle2, Loader2, Sparkles, AlertCircle, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import DemoDataWipeConfirm from './DemoDataWipeConfirm';
import ColumnMappingWizard from './ColumnMappingWizard';

const ENTITY_TYPES = [
  { id: 'Client', label: 'Service User / Client', color: 'bg-blue-50 border-blue-300 text-blue-800', icon: '👴' },
  { id: 'Volunteer', label: 'Volunteer / Handyperson', color: 'bg-green-50 border-green-300 text-green-800', icon: '🔨' },
  { id: 'Job', label: 'Job / Appointment', color: 'bg-yellow-50 border-yellow-300 text-yellow-800', icon: '📅' },
  { id: 'Session', label: 'Group Session / Activity', color: 'bg-purple-50 border-purple-300 text-purple-800', icon: '🎯' },
  { id: 'Grant', label: 'Grant / Benefit', color: 'bg-pink-50 border-pink-300 text-pink-800', icon: '💰' },
  { id: 'unknown', label: 'Not Sure / Skip', color: 'bg-gray-50 border-gray-300 text-gray-600', icon: '❓' },
];

const CLOUD_SOURCES = [
  { id: 'gdrive', label: 'Google Drive', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100', icon: '🟦' },
  { id: 'onedrive', label: 'OneDrive', color: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100', icon: '☁️' },
  { id: 'dropbox', label: 'Dropbox', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100', icon: '📦' },
  { id: 'sharepoint', label: 'SharePoint', color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100', icon: '🟩' },
];

async function classifyFileWithAI(file) {
  let preview = '';
  try {
    if (file.size < 500000 && file.name.match(/\.(csv|txt|json|xml)$/i)) {
      preview = await file.text().then(t => t.slice(0, 2000));
    }
  } catch {}

  const prompt = `You are helping an Age UK Handyperson Coordinator import data.
File: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)
${preview ? `Content preview:\n${preview}` : 'Binary or large file — use filename only.'}

Classify what this file contains and extract column headers if visible.
Return JSON:
{
  "entity_type": one of ["Client","Volunteer","Job","Session","Grant","unknown"],
  "confidence": 0-100,
  "reasoning": "one sentence",
  "detected_columns": ["array","of","column","header","names"],
  "warnings": ["any issues"]
}`;

  try {
    return await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          entity_type: { type: 'string' },
          confidence: { type: 'number' },
          reasoning: { type: 'string' },
          detected_columns: { type: 'array', items: { type: 'string' } },
          warnings: { type: 'array', items: { type: 'string' } },
        },
      },
    });
  } catch {
    return { entity_type: 'unknown', confidence: 0, reasoning: 'Could not analyse', detected_columns: [], warnings: [] };
  }
}

// PHASES: wipe_confirm → drop → classifying → review → mapping → done
export default function AIDataClassifier({ onComplete }) {
  const [phase, setPhase] = useState('wipe_confirm');
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [wipingData, setWipingData] = useState(false);
  const fileInputRef = useRef(null);

  // --- WIPE DEMO DATA ---
  const handleWipeConfirm = async () => {
    setWipingData(true);
    try {
      await Promise.all([
        base44.entities.Client.filter({}).then(items => Promise.all(items.map(i => base44.entities.Client.delete(i.id)))),
        base44.entities.Volunteer.filter({}).then(items => Promise.all(items.map(i => base44.entities.Volunteer.delete(i.id)))),
        base44.entities.Job.filter({}).then(items => Promise.all(items.map(i => base44.entities.Job.delete(i.id)))),
        base44.entities.Session.filter({}).then(items => Promise.all(items.map(i => base44.entities.Session.delete(i.id)))),
        base44.entities.Grant.filter({}).then(items => Promise.all(items.map(i => base44.entities.Grant.delete(i.id)))),
      ]);
    } catch (e) {
      console.error('Wipe error', e);
    }
    setWipingData(false);
    setPhase('drop');
  };

  const handleSkipWipe = () => setPhase('drop');

  // --- FILE DROP ---
  const addFiles = useCallback(async (rawFiles) => {
    const entries = rawFiles.map(f => ({
      file: f,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      status: 'pending',
      classification: null,
      overrideType: null,
    }));

    setFiles(prev => [...prev, ...entries]);
    setPhase('classifying');

    const startIdx = files.length;
    for (let i = 0; i < entries.length; i++) {
      const idx = startIdx + i;
      setFiles(prev => prev.map((f, j) => j === idx ? { ...f, status: 'analysing' } : f));
      const result = await classifyFileWithAI(entries[i].file);
      setFiles(prev => prev.map((f, j) => j === idx ? { ...f, status: 'classified', classification: result } : f));
    }
    setPhase('review');
  }, [files.length]);

  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)); };
  const handleFileInput = (e) => { addFiles(Array.from(e.target.files)); e.target.value = ''; };
  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));
  const setOverride = (idx, type) => setFiles(prev => prev.map((f, i) => i === idx ? { ...f, overrideType: type } : f));

  // --- PROCEED TO COLUMN MAPPING ---
  const readyToMap = files.filter(f => {
    const type = f.overrideType || f.classification?.entity_type;
    return f.status === 'classified' && type && type !== 'unknown' && (f.classification?.detected_columns?.length > 0);
  });

  const handleProceedToMapping = () => setPhase('mapping');

  // --- MAPPING COMPLETE ---
  const handleMappingComplete = (allMappings) => {
    const result = readyToMap.map(f => ({
      name: f.name,
      entityType: f.overrideType || f.classification?.entity_type,
      detectedColumns: f.classification?.detected_columns || [],
      columnMappings: allMappings[f.name] || {},
      warnings: f.classification?.warnings || [],
    }));
    onComplete(result);
    setPhase('done');
  };

  // ---- RENDER ----

  if (phase === 'wipe_confirm') {
    if (wipingData) {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <p className="text-sm font-semibold">Clearing demo data…</p>
          <p className="text-xs text-muted-foreground">Removing sample clients, volunteers, jobs, sessions and grants</p>
        </div>
      );
    }
    return <DemoDataWipeConfirm onConfirm={handleWipeConfirm} onSkip={handleSkipWipe} />;
  }

  if (phase === 'mapping') {
    return (
      <ColumnMappingWizard
        datasets={readyToMap.map(f => ({
          name: f.name,
          entityType: f.overrideType || f.classification?.entity_type,
          detectedColumns: f.classification?.detected_columns || [],
          file: f.file,
        }))}
        onComplete={handleMappingComplete}
      />
    );
  }

  if (phase === 'done') {
    return (
      <div className="text-center py-8 space-y-3">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
        <p className="font-semibold text-green-800 text-lg">Import complete!</p>
        <p className="text-sm text-muted-foreground">All your data has been mapped and is ready in your portal.</p>
      </div>
    );
  }

  const classifiedCount = files.filter(f => f.status === 'classified').length;

  return (
    <div className="space-y-4">

      {/* Drop zone */}
      {(phase === 'drop' || phase === 'review') && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'
          }`}
        >
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileInput}
            accept=".xlsx,.xls,.csv,.ods,.pdf,.docx,.doc,.txt,.json,.xml,.zip,.mdb" />
          <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-primary' : 'text-blue-400'}`} />
          <p className="text-sm font-semibold text-blue-900">
            {isDragging ? 'Release to upload' : phase === 'review' ? 'Drop more files' : 'Drop all your data files here'}
          </p>
          <p className="text-xs text-blue-600 mt-1">Excel, CSV, Word, PDF, Access — any format, bulk upload welcome</p>
          <p className="text-xs text-blue-500 mt-1.5 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" /> AI will read each file and identify what it contains
          </p>
        </div>
      )}

      {/* Cloud connectors */}
      {phase === 'drop' && (
        <div className="grid grid-cols-2 gap-2">
          {CLOUD_SOURCES.map(src => (
            <button key={src.id} onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${src.color}`}>
              <span>{src.icon}</span><span>{src.label}</span>
              <span className="text-xs opacity-60 ml-auto">Connect</span>
            </button>
          ))}
        </div>
      )}

      {/* Classifying progress */}
      {phase === 'classifying' && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg p-4">
          <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">AI is reading your files… ({classifiedCount}/{files.length})</p>
            <p className="text-xs text-muted-foreground">Identifying clients, handypeople, jobs, sessions, grants…</p>
          </div>
        </div>
      )}

      {/* File review cards */}
      {files.length > 0 && (
        <div className="space-y-3">
          {phase === 'review' && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {classifiedCount}/{files.length} files analysed — confirm or correct each one
            </p>
          )}
          {files.map((f, idx) => {
            const cls = f.classification;
            const effectiveType = f.overrideType || cls?.entity_type;
            const entityDef = ENTITY_TYPES.find(e => e.id === effectiveType);

            return (
              <Card key={idx} className={`transition-all ${f.status === 'analysing' ? 'opacity-50' : ''}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.size}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {f.status === 'analysing' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                      {f.status === 'classified' && cls?.confidence >= 70 && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{cls.confidence}% confident</Badge>
                      )}
                      {f.status === 'classified' && cls?.confidence > 0 && cls?.confidence < 70 && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Needs review</Badge>
                      )}
                      <button onClick={() => removeFile(idx)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {f.status === 'classified' && cls && (
                    <>
                      {/* AI classification badge */}
                      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${entityDef?.color || 'bg-gray-50 border-gray-200'}`}>
                        <span className="text-lg">{entityDef?.icon || '❓'}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{entityDef?.label || 'Unknown'}</p>
                          <p className="text-xs opacity-80">{cls.reasoning}</p>
                        </div>
                      </div>

                      {/* Detected columns preview */}
                      {cls.detected_columns?.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Detected columns:</p>
                          <div className="flex flex-wrap gap-1">
                            {cls.detected_columns.slice(0, 8).map(col => (
                              <span key={col} className="text-xs bg-muted border border-border rounded px-1.5 py-0.5 font-mono">{col}</span>
                            ))}
                            {cls.detected_columns.length > 8 && (
                              <span className="text-xs text-muted-foreground">+{cls.detected_columns.length - 8} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Warnings */}
                      {cls.warnings?.length > 0 && (
                        <div className="space-y-1">
                          {cls.warnings.map((w, wi) => (
                            <div key={wi} className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /><span>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Override type */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                          <Edit2 className="w-3 h-3" /> Correct the type if wrong:
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ENTITY_TYPES.map(et => (
                            <button
                              key={et.id}
                              onClick={() => setOverride(idx, f.overrideType === et.id ? null : et.id)}
                              className={`flex items-center gap-1.5 text-xs border rounded-lg px-2 py-1.5 text-left transition-all ${
                                (f.overrideType === et.id) || (!f.overrideType && effectiveType === et.id)
                                  ? 'ring-2 ring-primary ' + et.color
                                  : 'border-border bg-card hover:bg-muted'
                              }`}
                            >
                              <span>{et.icon}</span>
                              <span className="font-medium truncate">{et.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Proceed to column mapping */}
      {phase === 'review' && readyToMap.length > 0 && (
        <Button onClick={handleProceedToMapping} className="w-full py-5 text-base shadow-md">
          <Sparkles className="w-4 h-4 mr-2" />
          Map columns for {readyToMap.length} dataset{readyToMap.length !== 1 ? 's' : ''} →
        </Button>
      )}

      {phase === 'drop' && (
        <p className="text-xs text-muted-foreground text-center">
          No digital files yet? You can skip this step and add data manually later.
        </p>
      )}
    </div>
  );
}