import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function TemplateApplier({ onClose }) {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [projectName, setProjectName] = useState('');
  const [channel, setChannel] = useState('general');

  const { data: templates = [] } = useQuery({
    queryKey: ['projectTemplates'],
    queryFn: () => base44.entities.ProjectTemplate.list('-created_date', 50)
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('applyProjectTemplate', {
        template_id: selectedTemplate,
        project_name: projectName,
        project_channel: channel
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      toast.success(`Created ${data.tasks_created} tasks from template`);
      onClose();
    },
    onError: () => {
      toast.error('Failed to apply template');
    }
  });

  const handleApply = async () => {
    if (!selectedTemplate || !projectName.trim()) {
      toast.error('Select template and enter project name');
      return;
    }
    applyTemplateMutation.mutate();
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply Project Template</CardTitle>
        <CardDescription>Create tasks from a template for a new project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Select Template</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} ({template.task_count || 0} tasks)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplateData && (
          <div className="p-3 bg-muted rounded text-sm">
            <p className="font-medium mb-2">{selectedTemplateData.name}</p>
            {selectedTemplateData.description && (
              <p className="text-muted-foreground text-xs mb-2">{selectedTemplateData.description}</p>
            )}
            <div className="space-y-1">
              <p className="text-xs font-medium">Preview tasks:</p>
              {selectedTemplateData.template_tasks?.slice(0, 3).map((task, idx) => (
                <div key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                  • {task.title}
                  <Badge variant="outline" className="text-xs">{task.priority}</Badge>
                </div>
              ))}
              {selectedTemplateData.template_tasks?.length > 3 && (
                <p className="text-xs text-muted-foreground">+{selectedTemplateData.template_tasks.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        <div>
          <Label className="text-xs">Project Name</Label>
          <Input
            placeholder="e.g., Q2 Product Launch"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Channel</Label>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="prospects">Prospects</SelectItem>
              <SelectItem value="governance">Governance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={applyTemplateMutation.isPending || !selectedTemplate}>
            {applyTemplateMutation.isPending ? 'Applying...' : 'Apply Template'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}