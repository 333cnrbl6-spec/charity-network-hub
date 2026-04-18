import React, { useState, useRef, useCallback } from 'react';
import { Upload, Cloud, HardDrive, FolderOpen, X, CheckCircle2, Loader2, Sparkles, AlertCircle, ChevronRight, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

const ENTITY_TYPES = [
  { id: 'Client', label: 'Service User / Client', desc: 'Older people receiving care or support', color: 'bg-blue-50 border-blue-300 text-blue-800', icon: '👴' },
  { id: 'Volunteer', label: 'Volunteer / Handyperson', desc: 'Staff, contractors, or volunteers doing work', color: 'bg-green-50 border-green-300 text-green-800', icon: '🔨' },
  { id: 'Job', label: 'Job / Appointment', desc: 'Past or future service appointments', color: 'bg-yellow-50 border-yellow-300 text-yellow-800', icon: '📅' },
  { id: 'Session', label: 'Group Session / Activity', desc: 'Classes, clubs, group events', color: 'bg-purple-50 border-purple-300 text-purple-800', icon: '🎯' },
  { id: 'Grant', label: 'Grant / Benefit', desc: 'Financial support awarded to clients', color: 'bg-pink-50 border-pink-300 text-pink-800', icon: '💰' },
  { id: 'unknown', label: 'Not Sure / Skip', desc: 'Skip this file for now', color: 'bg-gray-50 border-gray-300 text-gray-600', icon: '❓' },
];

const CLOUD_SOURCES = [
  { id: 'gdrive', label: 'Google Drive', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100', icon: '🟦' },
  { id: 'onedrive', label: 'OneDrive', color: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100', icon: '☁️' },
  { id: 'dropbox', label: 'Dropbox', color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100', icon: '📦' },
  { id: 'sharepoint', label: 'SharePoint', color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100', icon: '🟩' },
];

// Analyse file contents with AI
async function classifyFileWithAI(file) {
  // Read first chunk of text-like files
  let preview = '';
  try {
    if (file.size < 500000 && (file.name.match(/\.(csv|txt|json|xml)$/i))) {
      preview = await file.text().then(t => t.slice(0, 2000));
    }
  } catch {}

  const prompt = `You are helping an Age UK Handyperson Coordinator onboard data into their system.
A file has been uploaded named: "${file.name}" (${(file.size / 1024).toFixed(1)} KB, type: ${file.type || 'unknown'}).
${preview ? `First 2000 characters of file contents:\n${preview}` : 'File is binary or too large to preview.'}

Based on the filename and any content, classify what this file most likely contains. 
Return ONLY a JSON object like:
{
  "entity_type": one of ["Client","Volunteer","Job","Session","Grant","unknown"],
  "confidence": number 0-100,
  "reasoning": "one sentence explanation",
  "detected_columns": ["list","of","detected","field","names","if","any"],
  "warnings": ["any data quality issues spotted"]
}`;

  try {
    const result = await base44.integrations.Core.InvokeLLM({
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
    return result;
  } catch {
    return { entity_type: 'unknown', confidence: 0, reasoning: 'Could not analyse file', detected_columns: [], warnings: [] };
  }
}

export default function AIDataClassifier({ onComplete }) {
  const [phase, setPhase] = useState('drop'); // drop | classifying | review | done
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]); // { file, name, size, status, classification }
  const [classifyingIdx, setClassifyingIdx] = useState(null);
  const fileInputRef = useRef(null);

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

    // Classify each file sequentially
    for (let i = 0; i < entries.length; i++) {
      const globalIdx = files.length + i;
      setClassifyingIdx(globalIdx);
      setFiles(prev => prev.map((f, idx) => idx === globalIdx ? { ...f, status: 'analysing' } : f));
      const result = await classifyFileWithAI(entries[i].file);
      setFiles(prev => prev.map((f, idx) => idx === globalIdx ? { ...f, status: 'classified', classification: result } : f));
    }

    setClassifyingIdx(null);
    setPhase('review');
  }, [files.length]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e) => {
    addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const setOverride = (idx, type) => {
    setFiles(prev => prev.map((f, i) => i === idx ? { ...f, overrideType: type } : f));
  };

  const handleConfirm = () => {
    const classified = files
      .filter(f => f.status === 'classified')
      .map(f => ({
        name: f.name,
        size: f.size,
        entityType: f.overrideType || f.classification?.entity_type,
        confidence: f.classification?.confidence,
        reasoning: f.classification?.reasoning,
        detectedColumns: f.classification?.detected_columns || [],
        warnings: f.classification?.warnings || [],
      }))
      .filter(f => f.entityType !== 'unknown');

    onComplete(classified);
    setPhase('done');
  };

  const classifiedCount = files.filter(f => f.status === 'classified').length;
  const readyToImport = files.filter(f => {
    const type = f.overrideType || f.classification?.entity_type;
    return f.status === 'classified' && type && type !== 'unknown';
  });

  if (phase === 'done') {
    return (
      <div className="text-center py-6 space-y-3">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
        <p className="font-semibold text-green-800">Data queued for import!</p>
        <p className="text-sm text-muted-foreground">{readyToImport.length} file(s) classified and ready to process.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Drop Zone */}
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
          <p className="text-sm font-semibold text-blue-900">{isDragging ? 'Release to upload' : phase === 'review' ? 'Drop more files to add' : 'Drag & drop your existing data files here'}</p>
          <p className="text-xs text-blue-600 mt-1">Excel, CSV, Word, PDF, Access databases — any format</p>
          <p className="text-xs text-blue-500 mt-1 flex items-center justify-center gap-1"><Sparkles className="w-3 h-3" /> AI will automatically identify what each file contains</p>
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

      {/* Classifying spinner */}
      {phase === 'classifying' && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg p-4">
          <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">AI is reading your files…</p>
            <p className="text-xs text-muted-foreground">Identifying clients, handypeople, jobs, sessions, grants…</p>
          </div>
        </div>
      )}

      {/* File review cards */}
      {files.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {classifiedCount}/{files.length} files analysed
          </p>
          {files.map((f, idx) => {
            const cls = f.classification;
            const effectiveType = f.overrideType || cls?.entity_type;
            const entityDef = ENTITY_TYPES.find(e => e.id === effectiveType);

            return (
              <Card key={idx} className={`transition-all ${f.status === 'analysing' ? 'opacity-60' : ''}`}>
                <CardContent className="p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.size}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {f.status === 'analysing' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                      {f.status === 'classified' && cls?.confidence >= 70 && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          {cls.confidence}% confident
                        </Badge>
                      )}
                      {f.status === 'classified' && cls?.confidence < 70 && cls?.confidence > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                          Needs review
                        </Badge>
                      )}
                      <button onClick={() => removeFile(idx)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* AI result */}
                  {f.status === 'classified' && cls && (
                    <>
                      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${entityDef?.color || 'bg-gray-50 border-gray-200'}`}>
                        <span className="text-lg">{entityDef?.icon || '❓'}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{entityDef?.label || 'Unknown'}</p>
                          <p className="text-xs opacity-80">{cls.reasoning}</p>
                        </div>
                        <Edit2 className="w-3.5 h-3.5 opacity-50" />
                      </div>

                      {/* Detected columns */}
                      {cls.detected_columns?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cls.detected_columns.slice(0, 8).map(col => (
                            <span key={col} className="text-xs bg-muted border border-border rounded px-1.5 py-0.5 font-mono">{col}</span>
                          ))}
                          {cls.detected_columns.length > 8 && (
                            <span className="text-xs text-muted-foreground">+{cls.detected_columns.length - 8} more</span>
                          )}
                        </div>
                      )}

                      {/* Warnings */}
                      {cls.warnings?.length > 0 && (
                        <div className="space-y-1">
                          {cls.warnings.map((w, wi) => (
                            <div key={wi} className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span>{w}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Override selector */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Edit2 className="w-3 h-3" /> Override classification if wrong:</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ENTITY_TYPES.map(et => (
                            <button
                              key={et.id}
                              onClick={() => setOverride(idx, f.overrideType === et.id ? null : et.id)}
                              className={`flex items-center gap-1.5 text-xs border rounded-lg px-2 py-1.5 text-left transition-all ${
                                effectiveType === et.id && !f.overrideType ? 'ring-2 ring-primary ' + et.color :
                                f.overrideType === et.id ? 'ring-2 ring-primary ' + et.color :
                                'border-border bg-card hover:bg-muted'
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

      {/* Confirm button */}
      {phase === 'review' && readyToImport.length > 0 && (
        <Button onClick={handleConfirm} className="w-full py-5 text-base shadow-md">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Confirm & Import {readyToImport.length} file{readyToImport.length !== 1 ? 's' : ''}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}

      {phase === 'drop' && (
        <p className="text-xs text-muted-foreground text-center">
          Don't have digital files yet? You can skip this step and add data manually later.
        </p>
      )}
    </div>
  );
}