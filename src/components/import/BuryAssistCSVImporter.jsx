import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle2, AlertCircle, MapPin, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { playSuccess, playClick } from '@/lib/audio';

const FIELD_MAPPINGS = {
  Client: {
    buryFields: ['ClientID', 'FirstName', 'LastName', 'DateOfBirth', 'Address', 'Postcode', 'PhoneNumber', 'EmailAddress', 'ReferralSource', 'Status', 'RegisteredDate', 'KeyWorkerName', 'Notes'],
    ageukFields: ['client_id_ref', 'full_name', 'full_name', 'date_of_birth', 'address', 'postcode', 'phone', 'email', 'referral_source', 'status', 'date_registered', 'key_worker', 'notes'],
    transform: (row) => ({
      full_name: `${row.FirstName || ''} ${row.LastName || ''}`.trim(),
      date_of_birth: row.DateOfBirth,
      address: row.Address,
      postcode: row.Postcode,
      phone: row.PhoneNumber,
      email: row.EmailAddress,
      referral_source: row.ReferralSource?.toLowerCase().replace(/\s+/g, '-') || 'self-referral',
      status: (row.Status || 'active').toLowerCase(),
      date_registered: row.RegisteredDate,
      key_worker: row.KeyWorkerName,
      notes: row.Notes
    })
  },
  Volunteer: {
    buryFields: ['VolunteerID', 'FirstName', 'LastName', 'EmailAddress', 'PhoneNumber', 'Role', 'Status', 'DBSChecked', 'DBSExpiryDate', 'JoinDate', 'HoursContributed', 'Area'],
    ageukFields: ['volunteer_id_ref', 'full_name', 'full_name', 'email', 'phone', 'role', 'status', 'dbs_checked', 'dbs_expiry', 'date_joined', 'hours_contributed', 'area'],
    transform: (row) => ({
      full_name: `${row.FirstName || ''} ${row.LastName || ''}`.trim(),
      email: row.EmailAddress,
      phone: row.PhoneNumber,
      role: row.Role?.toLowerCase().replace(/\s+/g, '-') || 'other',
      status: (row.Status || 'active').toLowerCase(),
      dbs_checked: row.DBSChecked?.toLowerCase() === 'yes' || row.DBSChecked === true,
      dbs_expiry: row.DBSExpiryDate,
      date_joined: row.JoinDate,
      hours_contributed: parseInt(row.HoursContributed) || 0,
      area: row.Area
    })
  },
  Job: {
    buryFields: ['JobID', 'ClientID', 'ClientName', 'VolunteerID', 'VolunteerName', 'JobType', 'ScheduledDate', 'Status', 'Notes', 'DurationMinutes'],
    ageukFields: ['job_id_ref', 'client_id', 'client_name', 'volunteer_id', 'volunteer_name', 'job_type', 'scheduled_date', 'status', 'notes', 'duration_minutes'],
    transform: (row) => ({
      client_id: row.ClientID,
      client_name: row.ClientName,
      volunteer_id: row.VolunteerID,
      volunteer_name: row.VolunteerName,
      job_type: row.JobType?.toLowerCase().replace(/\s+/g, '-') || 'other',
      scheduled_date: row.ScheduledDate,
      status: (row.Status || 'scheduled').toLowerCase(),
      notes: row.Notes,
      duration_minutes: parseInt(row.DurationMinutes) || null
    })
  }
};

export default function BuryAssistCSVImporter() {
  const [selectedEntity, setSelectedEntity] = useState('Client');
  const [csvData, setCsvData] = useState(null);
  const [mappedData, setMappedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCount, setPreviewCount] = useState(5);
  const [validationErrors, setValidationErrors] = useState([]);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const record = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] || '';
      });
      records.push(record);
    }

    return records;
  };

  const validateRow = (row, entityType) => {
    const errors = [];
    if (entityType === 'Client') {
      if (!row.FirstName?.trim() || !row.LastName?.trim()) errors.push('Name required');
      if (!row.Postcode?.trim()) errors.push('Postcode required');
    } else if (entityType === 'Volunteer') {
      if (!row.FirstName?.trim() || !row.LastName?.trim()) errors.push('Name required');
      if (!row.EmailAddress?.trim()) errors.push('Email required');
    } else if (entityType === 'Job') {
      if (!row.ClientName?.trim()) errors.push('Client required');
      if (!row.ScheduledDate?.trim()) errors.push('Date required');
    }
    return errors;
  };

  const handleFileUpload = (e) => {
    playClick();
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const parsed = parseCSV(text);
        setCsvData(parsed);

        // Map and validate
        const mapping = FIELD_MAPPINGS[selectedEntity];
        const errors = [];
        const mapped = parsed.map((row, idx) => {
          const rowErrors = validateRow(row, selectedEntity);
          if (rowErrors.length > 0) {
            errors.push({ row: idx + 2, errors: rowErrors });
          }
          return mapping.transform(row);
        });

        setMappedData(mapped);
        setValidationErrors(errors);
        setResult(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    playClick();
    if (mappedData.length === 0) {
      setResult({ success: false, error: 'No valid data to import' });
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('importBranchData', {
        entity_type: selectedEntity,
        records: mappedData,
        branch_id: 'bury',
        source: 'bury_assist'
      });

      if (response.data?.success) {
        setResult({
          success: true,
          created: response.data.results.created,
          failed: response.data.results.failed,
          entityType: selectedEntity
        });
        setCsvData(null);
        setMappedData([]);
        playSuccess();
      } else {
        setResult({ success: false, error: response.data?.error || 'Import failed' });
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          BuryAssist CSV Import
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Import Clients, Volunteers, and Jobs from BuryAssist. Fields are automatically mapped and validated.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <LoadingIndicator isLoading={loading} message="Importing data..." />

        {/* Entity Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">What are you importing?</label>
          <div className="flex gap-2">
            {Object.keys(FIELD_MAPPINGS).map(entity => (
              <Button
                key={entity}
                onClick={() => {
                  setSelectedEntity(entity);
                  setCsvData(null);
                  setMappedData([]);
                  setValidationErrors([]);
                  setResult(null);
                }}
                variant={selectedEntity === entity ? 'default' : 'outline'}
                size="sm"
              >
                {entity}s
              </Button>
            ))}
          </div>
        </div>

        {/* Expected Fields */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Expected BuryAssist Columns</label>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {FIELD_MAPPINGS[selectedEntity].buryFields.map(field => (
                <Badge key={field} variant="outline" className="font-mono text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload CSV File</label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => {
                 e.preventDefault();
                 const file = e.dataTransfer.files?.[0];
                 if (file) {
                   const input = document.getElementById('csv-upload');
                   if (input) {
                     const dt = new DataTransfer();
                     dt.items.add(file);
                     input.files = dt.files;
                     const event = new Event('change', { bubbles: true });
                     input.dispatchEvent(event);
                   }
                 }
               }}>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Drop CSV file or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">CSV files only. Max 10,000 rows.</p>
            </label>
          </div>
        </div>

        {/* Validation Messages */}
        {validationErrors.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
            <p className="text-sm font-medium text-amber-900">⚠️ {validationErrors.length} rows with errors:</p>
            {validationErrors.slice(0, 3).map((err, idx) => (
              <p key={idx} className="text-xs text-amber-800">
                Row {err.row}: {err.errors.join(', ')}
              </p>
            ))}
            {validationErrors.length > 3 && (
              <p className="text-xs text-amber-700">...and {validationErrors.length - 3} more</p>
            )}
          </div>
        )}

        {/* Data Summary */}
        {mappedData.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              ✓ {mappedData.length} {selectedEntity} records ready to import
              {validationErrors.length > 0 && ` (${validationErrors.length} with warnings)`}
            </p>
          </div>
        )}

        {/* Preview */}
        {mappedData.length > 0 && (
          <div className="space-y-2">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              size="sm"
              className="w-full gap-2"
            >
              {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <Eye className="w-4 h-4" />
              Preview Mapped Data
            </Button>

            {showPreview && (
              <div className="overflow-x-auto bg-muted/50 rounded-lg p-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(mappedData[0] || {}).map(key => (
                        <th key={key} className="text-left p-2 font-mono text-xs font-semibold">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mappedData.slice(0, previewCount).map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        {Object.values(row).map((val, cidx) => (
                          <td key={cidx} className="p-2 font-mono text-xs truncate max-w-xs">
                            {typeof val === 'boolean' ? (val ? '✓' : '✗') : val || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mappedData.length > previewCount && (
                  <Button
                    onClick={() => setPreviewCount(previewCount + 5)}
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                  >
                    Show {Math.min(5, mappedData.length - previewCount)} more...
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Import Button */}
        {mappedData.length > 0 && (
          <Button
            onClick={handleImport}
            disabled={loading || mappedData.length === 0}
            className="w-full gap-2"
            size="lg"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Importing...' : `Import ${mappedData.length} ${selectedEntity}s`}
          </Button>
        )}

        {/* Result */}
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
      </CardContent>
    </Card>
  );
}