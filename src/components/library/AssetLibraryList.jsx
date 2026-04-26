import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Download, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AssetLibraryList({ assets = [], showUploadInfo = false, jobTypeFilter = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedJobType, setSelectedJobType] = useState(jobTypeFilter || 'all');

  const filtered = useMemo(() => {
    return assets
      .filter(a => a.is_active)
      .filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesType = selectedType === 'all' || a.asset_type === selectedType;
        
        const matchesJobType = selectedJobType === 'all' || 
          a.applicable_job_types?.includes(selectedJobType) ||
          a.applicable_job_types?.includes('all');
        
        return matchesSearch && matchesType && matchesJobType;
      });
  }, [assets, searchQuery, selectedType, selectedJobType]);

  const handleDownload = async (asset) => {
    try {
      const link = document.createElement('a');
      link.href = asset.file_url;
      link.download = asset.file_name;
      link.click();
      toast.success(`Downloaded: ${asset.title}`);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const assetTypes = ['all', ...new Set(assets.map(a => a.asset_type))];
  const jobTypes = ['all', ...new Set(assets.flatMap(a => a.applicable_job_types || []))];

  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No assets yet. {showUploadInfo && 'Coordinators can upload guides and templates.'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search assets, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Asset Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-sm px-2 py-1 border rounded"
              >
                {assetTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Job Type</label>
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="w-full text-sm px-2 py-1 border rounded"
              >
                {jobTypes.map(jt => (
                  <option key={jt} value={jt}>
                    {jt === 'all' ? 'All Jobs' : jt.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground text-sm">
              No assets match your filters
            </CardContent>
          </Card>
        ) : (
          filtered.map(asset => (
            <Card key={asset.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm leading-tight">{asset.title}</h3>
                        {asset.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{asset.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">{asset.asset_type}</Badge>
                          {asset.version && (
                            <span className="text-xs text-muted-foreground">v{asset.version}</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {(asset.file_size_kb / 1024).toFixed(1)} MB
                          </span>
                        </div>
                        {asset.tags && asset.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {asset.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {asset.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{asset.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleDownload(asset)}
                    className="gap-2 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Showing {filtered.length} of {assets.filter(a => a.is_active).length} assets
        </p>
      )}
    </div>
  );
}