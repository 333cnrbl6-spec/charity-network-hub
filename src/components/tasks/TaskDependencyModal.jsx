import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function TaskDependencyModal({ task, allTasks, onClose }) {
  const queryClient = useQueryClient();
  const [selectedBlocker, setSelectedBlocker] = useState('');
  const [selectedParent, setSelectedParent] = useState(task.parent_task_id || '');

  const updateTaskMutation = useMutation({
    mutationFn: async (updates) => {
      await base44.entities.ProjectTask.update(task.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      toast.success('Task updated');
    },
    onError: () => toast.error('Failed to update task')
  });

  const addBlocker = () => {
    if (!selectedBlocker || selectedBlocker === task.id) {
      toast.error('Select a valid blocker task');
      return;
    }
    const newBlockers = [...(task.blocking_task_ids || []), selectedBlocker];
    updateTaskMutation.mutate({
      blocking_task_ids: newBlockers,
      blocked_by_count: newBlockers.length
    });
    setSelectedBlocker('');
  };

  const removeBlocker = (blockerId) => {
    const newBlockers = (task.blocking_task_ids || []).filter(id => id !== blockerId);
    updateTaskMutation.mutate({
      blocking_task_ids: newBlockers,
      blocked_by_count: newBlockers.length
    });
  };

  const updateParent = (parentId) => {
    if (parentId === task.id) {
      toast.error('Task cannot be its own parent');
      return;
    }
    setSelectedParent(parentId);
    updateTaskMutation.mutate({
      parent_task_id: parentId || null
    });
  };

  const blockerTasks = (task.blocking_task_ids || [])
    .map(id => allTasks.find(t => t.id === id))
    .filter(Boolean);

  const availableParents = allTasks.filter(t => 
    t.id !== task.id && 
    !task.subtask_ids?.includes(t.id) &&
    t.parent_task_id !== task.id
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Dependencies</CardTitle>
        <CardDescription>Manage blockers and parent-child relationships</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parent Task */}
        <div>
          <label className="text-sm font-medium mb-2 block">Parent Task</label>
          <Select value={selectedParent} onValueChange={updateParent}>
            <SelectTrigger>
              <SelectValue placeholder="No parent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>None</SelectItem>
              {availableParents.map(t => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Blocking Tasks */}
        <div>
          <label className="text-sm font-medium mb-2 block">Blocked By (Must Complete First)</label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select value={selectedBlocker} onValueChange={setSelectedBlocker}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select task..." />
                </SelectTrigger>
                <SelectContent>
                  {allTasks
                    .filter(t => t.id !== task.id && !task.blocking_task_ids?.includes(t.id))
                    .map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addBlocker} disabled={!selectedBlocker}>
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>

            {blockerTasks.length > 0 && (
              <div className="space-y-1 mt-2">
                {blockerTasks.map(blocker => (
                  <div key={blocker.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <span>{blocker.title}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeBlocker(blocker.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {selectedParent && (
          <div className="p-2 bg-blue-50 rounded text-sm text-blue-700">
            This is a subtask of: <strong>{allTasks.find(t => t.id === selectedParent)?.title}</strong>
          </div>
        )}

        {blockerTasks.length > 0 && (
          <div className="p-2 bg-red-50 rounded text-sm text-red-700">
            {blockerTasks.length} task(s) must complete before this can start
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </CardContent>
    </Card>
  );
}