import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2, HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DataParsingGuide({ files, onComplete, onError }) {
  const [parsingState, setParsingState] = useState('preview'); // preview | parsing | results | error
  const [parseResults, setParseResults] = useState(null);
  const [selectedEntities, setSelectedEntities] = useState({});
  const [isImporting, setIsImporting] = useState(false);

  const startParsing = async () => {
    setParsingState('parsing');
    try {
      // Read file contents
      const fileData = await Promise.all(
        Array.from(files).map(async (file) => ({
          name: file.name,
          content: await file.text()
        }))
      );

      const response = await base44.functions.invoke('parseAndValidateData', {
        fileData
      });

      if (response.data.success) {
        setParseResults(response.data.analysis);
        // Select all detected entities by default
        const selectedByDefault = {};
        Object.entries(response.data.analysis).forEach(([fileName, analysis]) => {
          Object.keys(analysis.detectedEntities || {}).forEach(entity => {
            selectedByDefault[`${fileName}::${entity}`] = true;
          });
        });
        setSelectedEntities(selectedByDefault);
        setParsingState('results');
      } else {
        setParsingState('error');
        onError(response.data.error || 'Failed to parse data');
      }
    } catch (error) {
      setParsingState('error');
      onError(error.message);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const response = await base44.functions.invoke('importParsedData', {
        analysis: parseResults,
        selectedEntities
      });

      if (response.data.success) {
        onComplete(response.data);
      } else {
        onError(response.data.error || 'Import failed');
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  if (parsingState === 'preview') {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            AI Data Assistant
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            I'll analyze your files to understand the data structure and help you map it correctly. This ensures data accuracy and completeness.
          </p>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="bg-white rounded p-2 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="font-mono text-xs">{f.name}</span>
                <span className="text-muted-foreground text-xs ml-auto">({(f.size / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
          </div>
        </div>
        
        <Button onClick={startParsing} className="w-full">
          Analyze Files & Map Data
        </Button>
      </div>
    );
  }

  if (parsingState === 'parsing') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <div className="text-center">
          <p className="font-semibold">Analyzing your data...</p>
          <p className="text-sm text-muted-foreground">This may take a moment for large files</p>
        </div>
      </div>
    );
  }

  if (parsingState === 'error') {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Unable to Parse Files</h3>
            <p className="text-sm text-red-800 mt-1">Please check that your files are in the correct format (CSV, Excel, or JSON) and try again.</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setParsingState('preview')} className="w-full">
          Back to Upload
        </Button>
      </div>
    );
  }

  if (parsingState === 'results' && parseResults) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-green-900 mb-2">✓ Data Successfully Analyzed</p>
          <p className="text-xs text-green-800">Detected entities and fields from your files</p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(parseResults).map(([fileName, analysis]) => (
            <div key={fileName} className="border border-border rounded-lg p-3 space-y-3">
              <p className="text-xs font-mono text-muted-foreground">{fileName}</p>
              <p className="text-xs text-muted-foreground">Headers: {analysis.headers.join(', ')}</p>

              {Object.entries(analysis.detectedEntities || {}).map(([entity, info]) => {
                const key = `${fileName}::${entity}`;
                return (
                  <Card key={key} className={`cursor-pointer border-2 transition-all ${selectedEntities[key] ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                    <CardHeader className="pb-2" onClick={() => setSelectedEntities(prev => ({ ...prev, [key]: !prev[key] }))}>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <input type="checkbox" checked={!!selectedEntities[key]} onChange={() => {}} className="cursor-pointer" />
                        {entity}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {info.totalFields} fields detected • {info.confidence}% confidence
                      </CardDescription>
                      <CardDescription className="text-xs mt-1 text-muted-foreground">
                        Fields: {info.matchedFields.join(', ')}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setParsingState('preview')} disabled={isImporting}>
            Back
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !Object.values(selectedEntities).some(v => v)} className="flex-1">
            {isImporting ? (
              <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Importing...</span>
            ) : (
              'Confirm & Import Data'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}