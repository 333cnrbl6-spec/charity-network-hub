import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function TemplateBuilder({ onClose }) {
  const queryClient = useQueryClient();
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [category, setCategory] = useState('general');
  const [tasks, setTasks] = useState([]);
  const [currentTask, setCurrentTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimated_hours: 4,
    assignee_name: '',
    tags: []
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (templateData) => {
      await base44.entities.ProjectTemplate.create({
        ...templateData,
        task_count: tasks.length,
        template_tasks: tasks
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTemplates'] });
      toast.success('Template created successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create template');
    }
  });

  const addTask = () => {
    if (!currentTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    setTasks([...tasks, { ...currentTask }]);
    setCurrentTask({
      title: '',
      description: '',
      priority: 'medium',
      estimated_hours: 4,
      assignee_name: '',
      tags: []
    });
  };

  const removeTask = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (tasks.length === 0) {
      toast.error('Add at least one task');
      return;
    }
    createTemplateMutation.mutate({
      name: templateName,
      description: templateDesc,
      category
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Project Template</CardTitle>
        <CardDescription>Define a reusable task template</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Info */}
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Template Name</Label>
            <Input
              placeholder="e.g., Product Launch"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="Optional description"
              value={templateDesc}
              onChange={(e) => setTemplateDesc(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
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
        </div>

        {/* Task Builder */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Add Tasks to Template</h3>
          <div className="space-y-2">
            <Input
              placeholder="Task title"
              value={currentTask.title}
              onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
            />
            <Input
              placeholder="Task description (optional)"
              value={currentTask.description}
              onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <Select value={currentTask.priority} onValueChange={(val) => setCurrentTask({ ...currentTask, priority: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Hours"
                value={currentTask.estimated_hours}
                onChange={(e) => setCurrentTask({ ...currentTask, estimated_hours: parseFloat(e.target.value) })}
              />
              <Input
                placeholder="Assignee"
                value={currentTask.assignee_name}
                onChange={(e) => setCurrentTask({ ...currentTask, assignee_name: e.target.value })}
              />
            </div>
            <Button size="sm" onClick={addTask} className="w-full">
              <Plus className="w-4 h-4 mr-1" /> Add Task
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Template Tasks ({tasks.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.map((task, idx) => (
                <div key={idx} className="p-2 bg-muted rounded flex items-start justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{task.priority}</Badge>
                      <Badge variant="secondary" className="text-xs">{task.estimated_hours}h</Badge>
                      {task.assignee_name && <Badge variant="outline" className="text-xs">{task.assignee_name}</Badge>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTask(idx)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={createTemplateMutation.isPending}>
            {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}