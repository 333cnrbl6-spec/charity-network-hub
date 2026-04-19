import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Archive, RotateCcw } from 'lucide-react';

export default function KnowledgeBaseManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'guidance',
    file_url: '',
    external_link: '',
    tags: '',
    relevant_to: ['all'],
    version: '1.0',
  });

  const { data: docs = [] } = useQuery({
    queryKey: ['knowledge-base'],
    queryFn: () => base44.entities.KnowledgeBase.list(),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const tagsArray = data.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      return base44.entities.KnowledgeBase.create({
        ...data,
        tags: tagsArray,
        last_updated: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        category: 'guidance',
        file_url: '',
        external_link: '',
        tags: '',
        relevant_to: ['all'],
        version: '1.0',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (params) => base44.entities.KnowledgeBase.update(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base'] });
    },
  });

  const activeDocs = docs.filter(d => d.status === 'active');

  return (
    <div className="space-y-6">
      {/* Add New Document Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base</h2>
          <p className="text-sm text-muted-foreground">
            Manage policies, templates, and guidance documents ({activeDocs.length} active)
          </p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </Button>
      </div>

      {/* Add Document Form */}
      {showForm && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Add New Resource</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
              <Select value={formData.category} onValueChange={cat => setFormData({ ...formData, category: cat })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="guidance">Guidance</SelectItem>
                  <SelectItem value="legislation">Legislation</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="training_material">Training Material</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="min-h-24"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="File URL (or leave blank)"
                value={formData.file_url}
                onChange={e => setFormData({ ...formData, file_url: e.target.value })}
              />
              <Input
                placeholder="External Link (or leave blank)"
                value={formData.external_link}
                onChange={e => setFormData({ ...formData, external_link: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Tags (comma-separated)"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
              />
              <Input
                placeholder="Version (e.g., 1.0)"
                value={formData.version}
                onChange={e => setFormData({ ...formData, version: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Relevant To</label>
              <div className="flex gap-2 flex-wrap">
                {['incident_management', 'training', 'compliance', 'referrals', 'all'].map(option => (
                  <label key={option} className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.relevant_to.includes(option)}
                      onChange={e => {
                        const newRelevant = e.target.checked
                          ? [...formData.relevant_to, option]
                          : formData.relevant_to.filter(r => r !== option);
                        setFormData({ ...formData, relevant_to: newRelevant });
                      }}
                    />
                    <span className="text-sm">{option.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.title || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Resource'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="grid gap-4">
        {activeDocs.map(doc => (
          <Card key={doc.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base">{doc.title}</CardTitle>
                    <Badge variant="outline">{doc.category.replace(/_/g, ' ')}</Badge>
                    {doc.version && <Badge variant="secondary">v{doc.version}</Badge>}
                  </div>
                  {doc.description && (
                    <CardDescription className="mt-2">{doc.description}</CardDescription>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateStatusMutation.mutate({
                        id: doc.id,
                        data: { status: 'archived' },
                      })
                    }
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {doc.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Relevant To */}
              {doc.relevant_to && (
                <div className="text-sm">
                  <p className="text-muted-foreground font-medium mb-1">Relevant to:</p>
                  <div className="flex gap-2 flex-wrap">
                    {doc.relevant_to.map(rel => (
                      <span key={rel} className="text-xs bg-accent px-2 py-1 rounded">
                        {rel.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Link */}
              {(doc.file_url || doc.external_link) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = doc.external_link || doc.file_url;
                    window.open(url, '_blank');
                  }}
                >
                  View Document →
                </Button>
              )}

              {/* Review Date */}
              {doc.review_date && (
                <p className="text-xs text-muted-foreground">
                  Next review: {new Date(doc.review_date).toLocaleDateString('en-GB')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {activeDocs.length === 0 && !showForm && (
        <Card className="text-center py-12">
          <p className="text-muted-foreground mb-4">No resources yet</p>
          <Button onClick={() => setShowForm(true)}>Add your first resource</Button>
        </Card>
      )}
    </div>
  );
}