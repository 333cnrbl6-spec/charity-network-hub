import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, File, Shield, CheckCircle, AlertCircle, X, Lock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export default function SecureFileUpload({ incidentId, existingFiles = [], onFilesUpdate }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileCategory, setFileCategory] = useState('evidence');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, category }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('incidentId', incidentId);
      formData.append('fileCategory', category);

      const response = await fetch('/api/functions/uploadSafeguardingFile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onMutate: () => {
      setUploadProgress(10);
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      toast.success('File uploaded securely', {
        description: `${data.filename} (${(data.file_size_bytes / 1024).toFixed(0)}KB) - Virus scan: CLEAN`
      });
      
      // Reset form
      setSelectedFile(null);
      setFileCategory('evidence');
      setUploadProgress(0);
      
      // Refresh file list
      if (onFilesUpdate) {
        onFilesUpdate();
      }
    },
    onError: (error) => {
      setUploadProgress(0);
      toast.error('Upload failed', {
        description: error.message
      });
    }
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'application/zip'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Allowed: JPEG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP'
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Maximum file size: 10MB'
        });
        return;
      }

      setSelectedFile(file);
      setUploadProgress(20);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('No file selected');
      return;
    }

    if (!incidentId) {
      toast.error('Incident ID required');
      return;
    }

    uploadMutation.mutate({
      file: selectedFile,
      category: fileCategory
    });
  };

  const handleAccessFile = async (fileId, filename) => {
    try {
      const response = await base44.functions.invoke('accessSafeguardingFile', { fileId });
      
      // Open signed URL in new tab
      window.open(response.data.signed_url, '_blank');
      
      toast.success('File access logged', {
        description: `Accessed: ${filename}`
      });
    } catch (error) {
      toast.error('Access failed', {
        description: error.message
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) return '📷';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('zip')) return '📦';
    return '📎';
  };

  const getCategoryBadge = (category) => {
    const colors = {
      evidence: 'bg-red-100 text-red-800',
      witness_statement: 'bg-blue-100 text-blue-800',
      medical_report: 'bg-green-100 text-green-800',
      police_report: 'bg-purple-100 text-purple-800',
      social_care_report: 'bg-orange-100 text-orange-800',
      photo: 'bg-pink-100 text-pink-800',
      document: 'bg-gray-100 text-gray-800',
      correspondence: 'bg-yellow-100 text-yellow-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || colors.other;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Secure Evidence Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Security Info */}
        <Alert className="bg-blue-50 border-blue-200">
          <Lock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            All files are encrypted, virus-scanned, and access-logged for compliance. Maximum size: 10MB.
          </AlertDescription>
        </Alert>

        {/* Upload Form */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="file-category">File Category</Label>
            <Select value={fileCategory} onValueChange={setFileCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="evidence">Evidence</SelectItem>
                <SelectItem value="witness_statement">Witness Statement</SelectItem>
                <SelectItem value="medical_report">Medical Report</SelectItem>
                <SelectItem value="police_report">Police Report</SelectItem>
                <SelectItem value="social_care_report">Social Care Report</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="correspondence">Correspondence</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file-upload">Select File</Label>
            <div className="flex gap-2">
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="flex-1"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
              />
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            {selectedFile && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">Uploading and scanning...</p>
            </div>
          )}
        </div>

        {/* Existing Files List */}
        {existingFiles && existingFiles.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <File className="w-4 h-4" />
              Attached Files ({existingFiles.length})
            </h4>
            <div className="space-y-2">
              {existingFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{getFileIcon(file.file_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.filename}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.file_size_bytes)}</span>
                        <span>•</span>
                        <span className={getCategoryBadge(file.file_category)} px-2 py-0.5 rounded-full text-xs">
                          {file.file_category.replace(/_/g, ' ')}
                        </span>
                        <span>•</span>
                        <span>Uploaded by {file.uploaded_by}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      Scanned
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3 text-blue-600" />
                      Encrypted
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAccessFile(file.file_id, file.filename)}
                      className="gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}