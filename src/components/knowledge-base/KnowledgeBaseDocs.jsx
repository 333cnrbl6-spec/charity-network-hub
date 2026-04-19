import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, BookOpen, ExternalLink, Search } from 'lucide-react';
import { useState } from 'react';

const categoryIcons = {
  policy: '📋',
  template: '📄',
  guidance: '📚',
  legislation: '⚖️',
  procedure: '🔄',
  form: '📑',
  training_material: '🎓',
  other: '📖',
};

export default function KnowledgeBaseDocs({ relevantTo = 'all', compact = false }) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['knowledge-base'],
    queryFn: () => base44.entities.KnowledgeBase.list(),
  });

  const filteredDocs = useMemo(() => {
    let filtered = docs.filter(
      doc => doc.status === 'active' && (relevantTo === 'all' || doc.relevant_to?.includes(relevantTo) || doc.relevant_to?.includes('all'))
    );

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc =>
          doc.title.toLowerCase().includes(term) ||
          doc.description?.toLowerCase().includes(term) ||
          doc.tags?.some(t => t.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [docs, searchTerm, relevantTo]);

  const groupedByCategory = useMemo(() => {
    const grouped = {};
    filteredDocs.forEach(doc => {
      if (!grouped[doc.category]) {
        grouped[doc.category] = [];
      }
      grouped[doc.category].push(doc);
    });
    return grouped;
  }, [filteredDocs]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading resources...</div>;
  }

  if (filteredDocs.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">No resources available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      {/* Documents by Category */}
      <div className="space-y-4">
        {Object.entries(groupedByCategory).map(([category, categoryDocs]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {categoryIcons[category]} {category.replace(/_/g, ' ')}
            </h3>

            <div className="space-y-2">
              {categoryDocs.map(doc => (
                <div
                  key={doc.id}
                  className="p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">{doc.title}</p>
                      {doc.description && !compact && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                      onClick={() => {
                        const url = doc.external_link || doc.file_url;
                        if (url) window.open(url, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Tags and Metadata */}
                  <div className="flex items-center justify-between gap-2">
                    {doc.tags && doc.tags.length > 0 && !compact && (
                      <div className="flex gap-1 flex-wrap">
                        {doc.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {doc.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{doc.tags.length - 2}</span>
                        )}
                      </div>
                    )}

                    {doc.version && (
                      <span className="text-xs text-muted-foreground">v{doc.version}</span>
                    )}
                  </div>

                  {/* Review Status */}
                  {doc.review_date && !compact && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Next review: {new Date(doc.review_date).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}