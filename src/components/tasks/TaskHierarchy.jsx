import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Lock, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIORITY_COLOR = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const STATUS_ICON = {
  backlog: '○',
  todo: '◎',
  in_progress: '◗',
  review: '◑',
  completed: '●',
  cancelled: '✕'
};

export default function TaskHierarchy({ task, allTasks, onSelect, expanded = false, onExpand }) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  const subtasks = allTasks.filter(t => t.parent_task_id === task.id) || [];
  const blockerTasks = task.blocking_task_ids?.length > 0 
    ? allTasks.filter(t => task.blocking_task_ids.includes(t.id))
    : [];
  
  const hasBlockers = blockerTasks.length > 0;
  const isBlocked = blockerTasks.some(t => t.status !== 'completed');

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    onExpand?.(task.id, !isExpanded);
  };

  return (
    <div className="space-y-1">
      {/* Main Task Row */}
      <div
        onClick={() => onSelect(task)}
        className={cn(
          'p-2 rounded border cursor-pointer transition-all',
          'hover:bg-accent hover:shadow-sm',
          isBlocked && 'border-red-300 bg-red-50'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Expand Button */}
          {subtasks.length > 0 ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={toggleExpand}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          ) : (
            <div className="w-5" />
          )}

          {/* Status Icon */}
          <span className="text-sm font-bold text-muted-foreground w-4">{STATUS_ICON[task.status]}</span>

          {/* Task Title */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{task.title}</p>
          </div>

          {/* Blockers Badge */}
          {isBlocked && (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Blocked
            </Badge>
          )}

          {/* Subtasks Count */}
          {subtasks.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {subtasks.length} sub
            </Badge>
          )}

          {/* Priority */}
          <Badge className={cn(PRIORITY_COLOR[task.priority], 'text-xs')}>
            {task.priority}
          </Badge>
        </div>

        {/* Blockers Info */}
        {hasBlockers && (
          <div className="mt-1 ml-9 text-xs text-red-700 flex items-center gap-1">
            <Link2 className="w-3 h-3" />
            <span>Waiting on: {blockerTasks.map(t => t.title).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Subtasks */}
      {isExpanded && subtasks.length > 0 && (
        <div className="ml-4 border-l-2 border-muted pl-2 space-y-1">
          {subtasks.map(subtask => (
            <TaskHierarchy
              key={subtask.id}
              task={subtask}
              allTasks={allTasks}
              onSelect={onSelect}
              onExpand={onExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}