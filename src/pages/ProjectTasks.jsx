import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Zap,
  Filter,
  Plus,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  backlog: { icon: Circle, color: 'text-gray-500', bg: 'bg-gray-50' },
  todo: { icon: Circle, color: 'text-blue-500', bg: 'bg-blue-50' },
  in_progress: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  review: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
  completed: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  cancelled: { icon: Circle, color: 'text-red-500', bg: 'bg-red-50' }
};

const PRIORITY_CONFIG = {
  low: { color: 'bg-blue-100 text-blue-800' },
  medium: { color: 'bg-yellow-100 text-yellow-800' },
  high: { color: 'bg-orange-100 text-orange-800' },
  critical: { color: 'bg-red-100 text-red-800' }
};

export default function ProjectTasks() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks
  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ['projectTasks'],
    queryFn: () => base44.entities.ProjectTask.list('-created_date', 100),
    refetchInterval: 30000
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      await base44.entities.ProjectTask.update(taskId, {
        status,
        completion_date: status === 'completed' ? new Date().toISOString() : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      toast.success('Task updated');
    }
  });

  // Update task assignee
  const updateAssigneeMutation = useMutation({
    mutationFn: async ({ taskId, assignee, assigneeName }) => {
      await base44.entities.ProjectTask.update(taskId, { assignee, assignee_name: assigneeName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      toast.success('Assignee updated');
    }
  });

  const filteredTasks = allTasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    const searchMatch = !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && priorityMatch && searchMatch;
  });

  // Group tasks by status
  const tasksByStatus = {
    backlog: filteredTasks.filter(t => t.status === 'backlog'),
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    cancelled: filteredTasks.filter(t => t.status === 'cancelled')
  };

  const stats = {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    inProgress: allTasks.filter(t => t.status === 'in_progress').length,
    aiGenerated: allTasks.filter(t => t.source === 'ai_identified').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="border-b">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Project Tasks</h1>
        <p className="text-muted-foreground">Manage action items from AI insights and discussions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI-Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.aiGenerated}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban-style Task Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {['backlog', 'in_progress', 'completed'].map(status => {
          const tasks = tasksByStatus[status];
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;

          return (
            <Card key={status} className={config.bg}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <CardTitle className="text-base capitalize">{status.replace('_', ' ')}</CardTitle>
                  </div>
                  <Badge variant="secondary">{tasks.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tasks</p>
                ) : (
                  tasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 bg-card rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm flex-1">{task.title}</p>
                        <Badge className={PRIORITY_CONFIG[task.priority]?.color || ''} variant="outline">
                          {task.priority}
                        </Badge>
                      </div>
                      {task.source === 'ai_identified' && (
                        <Badge variant="outline" className="text-xs mb-2">
                          <Zap className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      {task.source_channel && (
                        <p className="text-xs text-muted-foreground mb-2">#{task.source_channel}</p>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString('en-GB')}
                        </div>
                      )}
                      {task.assignee_name && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <User className="w-3 h-3" />
                          {task.assignee_name}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedTask.title}</CardTitle>
                <CardDescription className="mt-2">{selectedTask.description}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTask(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Status</Label>
                <Select
                  value={selectedTask.status}
                  onValueChange={(status) =>
                    updateTaskMutation.mutate({ taskId: selectedTask.id, status })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STATUS_CONFIG).map(s => (
                      <SelectItem key={s} value={s}>
                        {s.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <div className="mt-1">
                  <Badge className={PRIORITY_CONFIG[selectedTask.priority].color}>
                    {selectedTask.priority}
                  </Badge>
                </div>
              </div>
              {selectedTask.due_date && (
                <div>
                  <Label className="text-xs">Due Date</Label>
                  <p className="mt-1 text-sm">
                    {new Date(selectedTask.due_date).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}
              {selectedTask.estimated_hours && (
                <div>
                  <Label className="text-xs">Est. Hours</Label>
                  <p className="mt-1 text-sm">{selectedTask.estimated_hours}h</p>
                </div>
              )}
            </div>
            {selectedTask.source_channel && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                Source: #{selectedTask.source_channel} ({selectedTask.source})
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedTask(null)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}