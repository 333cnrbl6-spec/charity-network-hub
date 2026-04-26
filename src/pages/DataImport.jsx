import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle2, AlertCircle, Download, FileUp, Sparkles } from 'lucide-react';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { playSuccess, playClick } from '@/lib/audio';
import AIFileDropZone from '@/components/import/AIFileDropZone';
import BuryAssistCSVImporter from '@/components/import/BuryAssistCSVImporter';

const IMPORT_TEMPLATES = {
  Client: {
    fields: ['full_name', 'date_of_birth', 'address', 'postcode', 'phone', 'email', 'referral_source', 'status', 'date_registered', 'key_worker', 'notes'],
    example: [
      { full_name: 'John Smith', date_of_birth: '1945-03-15', address: '123 Main St', postcode: 'M1 1AA', phone: '0161 123 4567', email: 'john@example.com', referral_source: 'self-referral', status: 'active', date_registered: '2024-01-15', key_worker: 'Jane Doe', notes: 'Mobility issues' }
    ]
  },
  Volunteer: {
    fields: ['full_name', 'email', 'phone', 'role', 'status', 'dbs_checked', 'dbs_expiry', 'date_joined', 'hours_contributed', 'area'],
    example: [
      { full_name: 'Mary Johnson', email: 'mary@example.com', phone: '0161 987 6543', role: 'befriender', status: 'active', dbs_checked: true, dbs_expiry: '2026-06-01', date_joined: '2023-06-01', hours_contributed: 120, area: 'City Centre' }
    ]
  },
  Job: {
    fields: ['client_id', 'client_name', 'volunteer_id', 'volunteer_name', 'job_type', 'scheduled_date', 'status', 'notes', 'duration_minutes'],
    example: [
      { client_id: 'C001', client_name: 'John Smith', volunteer_id: 'V001', volunteer_name: 'Mary Johnson', job_type: 'befriending', scheduled_date: '2026-04-20T10:00:00', status: 'scheduled', notes: 'Weekly visit', duration_minutes: 60 }
    ]
  },
  Session: {
    fields: ['session_name', 'session_type', 'location', 'scheduled_date', 'attendees_count', 'max_capacity', 'status', 'facilitator', 'notes'],
    example: [
      { session_name: 'Digital Café', session_type: 'digital-inclusion', location: 'Community Centre', scheduled_date: '2026-04-22T14:00:00', attendees_count: 8, max_capacity: 20, status: 'scheduled', facilitator: 'Sarah Wilson', notes: 'Introductory computers' }
    ]
  },
  Grant: {
    fields: ['grant_name', 'funder', 'amount_awarded', 'date_awarded', 'grant_type', 'client_id', 'client_name', 'status', 'notes'],
    example: [
      { grant_name: 'Winter Fuel Payment', funder: 'Department of Work and Pensions', amount_awarded: 300, date_awarded: '2024-11-01', grant_type: 'energy-support', client_id: 'C001', client_name: 'John Smith', status: 'awarded', notes: 'Approved for winter 2024' }
    ]
  }
};

export default function DataImport() {
  const [selectedEntity, setSelectedEntity] = useState('Client');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [jsonInput, setJsonInput] = useState('');

  const handleDownloadTemplate = () => {
    playClick();
    const template = IMPORT_TEMPLATES[selectedEntity];
    const json = JSON.stringify(template.example, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEntity.toLowerCase()}_template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    playClick();
    if (!jsonInput.trim()) {
      setResult({ success: false, error: 'Please paste JSON data' });
      return;
    }

    setUploading(true);
    try {
      let records;
      try {
        records = JSON.parse(jsonInput);
        if (!Array.isArray(records)) {
          records = [records];
        }
      } catch (e) {
        setResult({ success: false, error: 'Invalid JSON format' });
        setUploading(false);
        return;
      }

      const response = await base44.functions.invoke('importBranchData', {
        entity_type: selectedEntity,
        records,
        branch_id: 'hub'
      });

      if (response.data?.success) {
        setResult({
          success: true,
          created: response.data.results.created,
          failed: response.data.results.failed,
          entityType: selectedEntity
        });
        setJsonInput('');
        playSuccess();
      } else {
        setResult({ success: false, error: response.data?.error || 'Import failed' });
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <LoadingIndicator isLoading={uploading} message="Importing data..." />

      <div>
        <h1 className="text-3xl font-bold text-foreground">Data Import</h1>
        <p className="text-muted-foreground mt-1">Import real client, volunteer, and operational data</p>
      </div>

      {/* BuryAssist CSV Import — dedicated flow */}
      <BuryAssistCSVImporter />

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or use AI-guided import</span>
        </div>
      </div>

      {/* AI Drop Zone — for other file types */}
       <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Sparkles className="w-5 h-5 text-primary" />
             AI-Guided File Import
           </CardTitle>
           <p className="text-sm text-muted-foreground">Drop any file — Excel, CSV, PDF, Word, image — and AI will read it, identify the data, and guide you through importing it.</p>
         </CardHeader>
         <CardContent>
           <AIFileDropZone />
         </CardContent>
       </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or import manually with JSON</span>
        </div>
      </div>

      {/* Entity Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Entity Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.keys(IMPORT_TEMPLATES).map(entity => (
              <Button
                key={entity}
                onClick={() => {
                  setSelectedEntity(entity);
                  setJsonInput('');
                  setResult(null);
                }}
                variant={selectedEntity === entity ? 'default' : 'outline'}
                className="justify-center"
              >
                {entity}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="font-bold text-primary">1.</span>
            <span>Click "Download Template" to get a sample JSON file for {selectedEntity}</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">2.</span>
            <span>Fill in your real data using the same structure as the template</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">3.</span>
            <span>Paste the JSON data in the text area below</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">4.</span>
            <span>Click Import to add records to the system</span>
          </div>
        </CardContent>
      </Card>

      {/* Template Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{selectedEntity} Template</CardTitle>
            <Button onClick={handleDownloadTemplate} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Required and optional fields:</p>
            <div className="flex flex-wrap gap-2">
              {IMPORT_TEMPLATES[selectedEntity].fields.map(field => (
                <Badge key={field} variant="outline" className="font-mono text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JSON Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileUp className="w-5 h-5" />
            Paste JSON Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`Paste your ${selectedEntity} data as JSON here...\n\nExample:\n[\n  { "full_name": "John Smith", "email": "john@example.com", ... },\n  { "full_name": "Jane Doe", "email": "jane@example.com", ... }\n]`}
            className="w-full h-64 p-3 border rounded-lg font-mono text-sm bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={handleImport}
            disabled={uploading || !jsonInput.trim()}
            className="w-full gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Importing...' : 'Import Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Import Result */}
      {result && (
        <Card className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-4">
            {result.success ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Import Successful</span>
                </div>
                <p className="text-sm text-green-800">
                  {result.created} {result.entityType} records imported
                  {result.failed > 0 && ` (${result.failed} failed)`}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">Import Failed</span>
                </div>
                <p className="text-sm text-red-800">{result.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}