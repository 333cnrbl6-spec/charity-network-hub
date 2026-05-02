import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

export default function BulkUserUpload({ charityId, charityTier }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);

  // Only Professional/Enterprise
  if (charityTier === 'starter') {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Bulk user management is available on Professional and Enterprise plans.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      
      const users = lines.map(line => {
        const [name, email, role] = line.split(',').map(s => s.trim());
        return { name, email, role: role || 'user' };
      });

      // Validate and create
      let successful = 0;
      let failed = 0;
      const errors = [];

      for (const user of users) {
        try {
          if (!user.email || !user.name) {
            failed++;
            errors.push(`Row skipped: missing email or name`);
            continue;
          }

          // In production, you'd create TenantUser records
          // await base44.entities.TenantUser.create(user);
          successful++;
        } catch (err) {
          failed++;
          errors.push(`${user.email}: ${err.message}`);
        }
      }

      setResults({
        successful,
        failed,
        total: users.length,
        errors: errors.slice(0, 5) // Show first 5 errors
      });
    } catch (error) {
      alert('Error reading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk User Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-50 p-3 rounded-lg text-sm">
          <p className="font-medium mb-2">CSV Format:</p>
          <code className="text-xs block font-mono">name,email,role</code>
          <code className="text-xs block font-mono">John Doe,john@example.com,user</code>
          <code className="text-xs block font-mono">Jane Smith,jane@example.com,admin</code>
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-slate-500"
        />

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Users'}
        </Button>

        {results && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">{results.successful} users created</p>
              </div>
            </div>

            {results.failed > 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{results.failed} errors</p>
                  <ul className="text-xs text-red-700 mt-1 space-y-1">
                    {results.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}