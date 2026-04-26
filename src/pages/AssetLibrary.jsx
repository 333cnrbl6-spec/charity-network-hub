import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import AssetUploadForm from '@/components/library/AssetUploadForm';
import AssetLibraryList from '@/components/library/AssetLibraryList';

export default function AssetLibrary() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { user } = base44.auth;

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => base44.entities.Asset.list('-created_date'),
  });

  const isCoordinator = user?.org_role === 'branch_department_coordinator' || 
    user?.org_role === 'branch_operations_manager' ||
    user?.role === 'admin';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-500" />
            Asset Library
          </h1>
          <p className="text-muted-foreground mt-1">
            {isCoordinator 
              ? 'Upload guides, templates, and resources for your volunteers'
              : 'Find and download guides, templates, and resources'}
          </p>
        </div>
        {isCoordinator && (
          <Button 
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Upload Asset
          </Button>
        )}
      </div>

      {/* Upload Form - Coordinators Only */}
      {isCoordinator && showUploadForm && (
        <AssetUploadForm onSuccess={() => setShowUploadForm(false)} />
      )}

      {/* Asset Statistics */}
      {isCoordinator && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-blue-600">{assets.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Assets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-green-600">
                {assets.reduce((sum, a) => sum + (a.download_count || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Downloads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-purple-600">
                {new Set(assets.flatMap(a => a.tags || [])).size}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Unique Tags</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Asset Library List */}
      <AssetLibraryList assets={assets} showUploadInfo={isCoordinator} />
    </div>
  );
}