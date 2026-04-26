import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AssetDragDropZone from './AssetDragDropZone';

const JOB_TYPES = [
  'home-visit', 'telephone-check', 'transport', 'shopping-assist',
  'benefits-advice', 'digital-help', 'befriending', 'scams-advice',
  'hospital-discharge', 'all'
];

const ASSET_TYPES = ['guide', 'template', 'checklist', 'form', 'policy', 'training', 'resource', 'other'];

export default function AssetUploadForm({ onSuccess }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    asset_type: 'guide',
    tags: [],
    applicable_job_types: [],
    applicable_roles: [],
    version: '1.0',
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        toast.error('Only PDF files are supported');
        return;
      }
      setFile(selected);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleJobTypeToggle = (jobType) => {
    setFormData(prev => ({
      ...prev,
      applicable_job_types: prev.applicable_job_types.includes(jobType)
        ? prev.applicable_job_types.filter(j => j !== jobType)
        : [...prev.applicable_job_types, jobType],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.title.trim()) {
      toast.error('Please select a file and enter a title');
      return;
    }

    setLoading(true);
    try {
      // Upload file
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadRes.url;

      // Get current user
      const user = await base44.auth.me();

      // Create asset record
      await base44.entities.Asset.create({
        title: formData.title,
        description: formData.description,
        asset_type: formData.asset_type,
        file_url: fileUrl,
        file_name: file.name,
        file_size_kb: Math.round(file.size / 1024),
        tags: formData.tags,
        applicable_job_types: formData.applicable_job_types,
        applicable_roles: formData.applicable_roles.filter(r => r),
        version: formData.version,
        created_by: user.email,
        created_by_name: user.full_name,
      });

      toast.success('Asset uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['assets'] });

      // Reset form
      setFile(null);
      setFormData({
        title: '',
        description: '',
        asset_type: 'guide',
        tags: [],
        applicable_job_types: [],
        applicable_roles: [],
        version: '1.0',
      });
      setTagInput('');

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload New Asset
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload - Smart Drag & Drop */}
          <div>
            <label className="block text-sm font-medium mb-2">PDF File</label>
            <AssetDragDropZone onFileSelect={setFile} />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., Home Visit Checklist"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows="3"
              placeholder="Briefly describe what this asset covers..."
            />
          </div>

          {/* Asset Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Asset Type</label>
            <select
              value={formData.asset_type}
              onChange={(e) => setFormData(prev => ({ ...prev, asset_type: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {ASSET_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Job Types */}
          <div>
            <label className="block text-sm font-medium mb-2">Applicable Job Types</label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map(jobType => (
                <button
                  key={jobType}
                  type="button"
                  onClick={() => handleJobTypeToggle(jobType)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.applicable_job_types.includes(jobType)
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {jobType.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                placeholder="Add tags and press Enter..."
              />
              <Button type="button" size="sm" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Version */}
          <div>
            <label className="block text-sm font-medium mb-2">Version</label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full gap-2">
            <Upload className="w-4 h-4" />
            {loading ? 'Uploading...' : 'Upload Asset'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}