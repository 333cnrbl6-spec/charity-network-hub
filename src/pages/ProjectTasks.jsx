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
  User,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import TemplateBuilder from '@/components/templates/TemplateBuilder';
import TemplateApplier from '@/components/templates/TemplateApplier';
import TaskHierarchy from '@/components/tasks/TaskHierarchy';
import TaskDependencyModal from '@/components/tasks/TaskDependencyModal';

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
  const [filterAIPriority, setFilterAIPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [showTemplateApplier, setShowTemplateApplier] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});

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
    const aiPriorityMatch = filterAIPriority === 'all' || task.ai_assigned_priority === filterAIPriority;
    const searchMatch = !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && priorityMatch && aiPriorityMatch && searchMatch;
  });

  // Filter root tasks (no parent)
  const rootTasks = filteredTasks.filter(t => !t.parent_task_id);

  // Group tasks by status
  const tasksByStatus = {
    backlog: filteredTasks.filter(t => t.status === 'backlog'),
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    cancelled: filteredTasks.filter(t => t.status === 'cancelled')
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  const handleExpandTask = (taskId, expanded) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: expanded
    }));
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
      <div className="border-b pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Project Tasks</h1>
          <p className="text-muted-foreground">Manage action items from AI insights and discussions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateApplier(true)}
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" /> Apply Template
          </Button>
          <Button
            size="sm"
            onClick={() => setShowTemplateBuilder(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Template
          </Button>
        </div>
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
           <div className="w-40">
             <Select value={filterAIPriority} onValueChange={setFilterAIPriority}>
               <SelectTrigger>
                 <SelectValue placeholder="AI Priority" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All AI Priority</SelectItem>
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

      {/* Hierarchy View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Hierarchy</CardTitle>
          <CardDescription>Parent-child relationships and blocking dependencies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {rootTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No root tasks matching filters</p>
          ) : (
            rootTasks.map(task => (
              <TaskHierarchy
                key={task.id}
                task={task}
                allTasks={filteredTasks}
                onSelect={handleTaskSelect}
                expanded={expandedTasks[task.id]}
                onExpand={handleExpandTask}
              />
            ))
          )}
        </CardContent>
      </Card>

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
              {selectedTask.ai_assigned_priority && (
                <div>
                  <Label className="text-xs">AI Assigned Priority</Label>
                  <div className="mt-1">
                    <Badge className={PRIORITY_CONFIG[selectedTask.ai_assigned_priority].color}>
                      {selectedTask.ai_assigned_priority}
                    </Badge>
                  </div>
                </div>
              )}
              {selectedTask.ai_priority_keywords && selectedTask.ai_priority_keywords.length > 0 && (
                <div className="col-span-2">
                  <Label className="text-xs">Priority Keywords</Label>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {selectedTask.ai_priority_keywords.map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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
              className="w-full mb-2"
              onClick={() => {
                setShowDependencies(true);
              }}
            >
              Manage Dependencies
            </Button>
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

      {/* Dependency Management Modal */}
      {showDependencies && selectedTask && (
        <TaskDependencyModal 
          task={selectedTask}
          allTasks={allTasks}
          onClose={() => {
            setShowDependencies(false);
            queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
          }}
        />
      )}

      {/* Template Builder Modal */}
      {showTemplateBuilder && (
        <TemplateBuilder onClose={() => setShowTemplateBuilder(false)} />
      )}

      {/* Template Applier Modal */}
      {showTemplateApplier && (
        <TemplateApplier onClose={() => setShowTemplateApplier(false)} />
      )}
    </div>
  );
}