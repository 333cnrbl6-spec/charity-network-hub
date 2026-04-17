import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Users,
  Target,
  Clock,
  Zap
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import PerformanceTrendChart from '@/components/analytics/PerformanceTrendChart';
import StatusDistributionChart from '@/components/analytics/StatusDistributionChart';
import TeamProductivityChart from '@/components/analytics/TeamProductivityChart';
import BottleneckAlert from '@/components/analytics/BottleneckAlert';

const DEPARTMENTS = ['Strategy', 'Products', 'Prospects', 'Governance'];

export default function AnalyticsDashboard() {
  const [selectedDept, setSelectedDept] = useState('all');

  // Fetch tasks
  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ['projectTasks'],
    queryFn: () => base44.entities.ProjectTask.list('-created_date', 200),
  });

  const tasksByChannel = useMemo(() => {
    const grouped = {};
    allTasks.forEach(task => {
      const channel = task.source_channel || 'general';
      if (!grouped[channel]) {
        grouped[channel] = [];
      }
      grouped[channel].push(task);
    });
    return grouped;
  }, [allTasks]);

  // Filter by department
  const filteredTasks = useMemo(() => {
    if (selectedDept === 'all') return allTasks;
    return allTasks.filter(t => t.source_channel === selectedDept.toLowerCase());
  }, [allTasks, selectedDept]);

  // Performance trend data (last 4 weeks)
  const performanceTrend = useMemo(() => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const tasksInWeek = filteredTasks.filter(t => {
        const taskDate = new Date(t.created_date || t.updated_date);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const completed = tasksInWeek.filter(t => t.status === 'completed').length;
      const velocity = completed / Math.max(tasksInWeek.length, 1);

      weeks.push({
        week: `W${weekStart.getWeek()}`,
        completed,
        total: tasksInWeek.length,
        velocity: Math.round(velocity * 100)
      });
    }
    return weeks;
  }, [filteredTasks]);

  // Task status distribution
  const statusDistribution = useMemo(() => {
    const dist = {
      backlog: 0,
      todo: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
      cancelled: 0
    };

    filteredTasks.forEach(task => {
      dist[task.status]++;
    });

    return Object.entries(dist)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.replace('_', ' '),
        value: count
      }));
  }, [filteredTasks]);

  // Priority distribution
  const priorityDistribution = useMemo(() => {
    const dist = { low: 0, medium: 0, high: 0, critical: 0 };
    filteredTasks.forEach(task => {
      dist[task.priority]++;
    });
    return Object.entries(dist)
      .filter(([, count]) => count > 0)
      .map(([priority, count]) => ({
        name: priority,
        value: count
      }));
  }, [filteredTasks]);

  // Team productivity by assignee
  const teamProductivity = useMemo(() => {
    const productivity = {};
    filteredTasks.filter(t => t.assignee_name).forEach(task => {
      if (!productivity[task.assignee_name]) {
        productivity[task.assignee_name] = {
          assigned: 0,
          completed: 0,
          inProgress: 0
        };
      }
      productivity[task.assignee_name].assigned++;
      if (task.status === 'completed') {
        productivity[task.assignee_name].completed++;
      }
      if (task.status === 'in_progress') {
        productivity[task.assignee_name].inProgress++;
      }
    });

    return Object.entries(productivity)
      .map(([name, stats]) => ({
        name,
        assigned: stats.assigned,
        completed: stats.completed,
        inProgress: stats.inProgress,
        completionRate: Math.round((stats.completed / stats.assigned) * 100)
      }))
      .sort((a, b) => b.completionRate - a.completionRate);
  }, [filteredTasks]);

  // Bottleneck detection (tasks stuck in review or long-running)
  const bottlenecks = useMemo(() => {
    const stuck = [];
    const now = new Date();

    filteredTasks.forEach(task => {
      const createdDate = new Date(task.created_date);
      const daysOpen = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

      // Tasks in review for more than 3 days
      if (task.status === 'review' && daysOpen > 3) {
        stuck.push({
          title: task.title,
          status: 'review',
          daysStuck: daysOpen,
          priority: task.priority,
          channel: task.source_channel
        });
      }

      // Critical tasks in progress for more than 5 days
      if (task.status === 'in_progress' && task.priority === 'critical' && daysOpen > 5) {
        stuck.push({
          title: task.title,
          status: 'in_progress',
          daysStuck: daysOpen,
          priority: task.priority,
          channel: task.source_channel
        });
      }

      // Any task backlog for more than 14 days
      if (task.status === 'backlog' && daysOpen > 14) {
        stuck.push({
          title: task.title,
          status: 'backlog',
          daysStuck: daysOpen,
          priority: task.priority,
          channel: task.source_channel
        });
      }
    });

    return stuck.sort((a, b) => b.daysStuck - a.daysStuck).slice(0, 5);
  }, [filteredTasks]);

  // Department breakdown
  const departmentStats = useMemo(() => {
    return Object.entries(tasksByChannel).map(([dept, tasks]) => ({
      name: dept,
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      overdue: tasks.filter(t => {
        const due = new Date(t.due_date);
        return due < new Date() && t.status !== 'completed';
      }).length
    }));
  }, [tasksByChannel]);

  // Key metrics
  const metrics = {
    totalTasks: filteredTasks.length,
    completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
    completionRate: filteredTasks.length > 0
      ? Math.round((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100)
      : 0,
    overdueTasks: filteredTasks.filter(t => {
      const due = new Date(t.due_date);
      return due < new Date() && t.status !== 'completed';
    }).length,
    aiGeneratedTasks: filteredTasks.filter(t => t.source === 'ai_identified').length,
    avgTimeInProgress: Math.round(
      filteredTasks
        .filter(t => t.status === 'in_progress')
        .reduce((sum, t) => {
          const created = new Date(t.created_date);
          return sum + Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
        }, 0) / Math.max(filteredTasks.filter(t => t.status === 'in_progress').length, 1)
    )
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Project performance, team productivity & bottleneck insights</p>
          </div>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {DEPARTMENTS.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={Target}
          label="Total Tasks"
          value={metrics.totalTasks}
          color="text-blue-600"
        />
        <MetricCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${metrics.completionRate}%`}
          color="text-green-600"
        />
        <MetricCard
          icon={Users}
          label="In Progress"
          value={filteredTasks.filter(t => t.status === 'in_progress').length}
          color="text-yellow-600"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Overdue"
          value={metrics.overdueTasks}
          color="text-red-600"
        />
        <MetricCard
          icon={Zap}
          label="AI-Generated"
          value={metrics.aiGeneratedTasks}
          color="text-purple-600"
        />
        <MetricCard
          icon={Clock}
          label="Avg Days In Progress"
          value={metrics.avgTimeInProgress}
          color="text-orange-600"
        />
      </div>

      {/* Performance Trend & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceTrendChart data={performanceTrend} />
        <StatusDistributionChart data={statusDistribution} />
      </div>

      {/* Team Productivity & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamProductivityChart data={teamProductivity} />

        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>Task distribution by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Metrics across all channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentStats.map(dept => (
              <div key={dept.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold capitalize">#{dept.name}</h4>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>{dept.total} total</span>
                    <span className="text-green-600">{dept.completed} completed</span>
                    <span className="text-yellow-600">{dept.inProgress} in progress</span>
                    {dept.overdue > 0 && <span className="text-red-600">{dept.overdue} overdue</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {dept.total > 0 ? Math.round((dept.completed / dept.total) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">completion</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottleneck Identification */}
      <BottleneckAlert bottlenecks={bottlenecks} />
    </div>
  );
}

function MetricCard({ icon: IconComponent, label, value, color }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <IconComponent className={`w-8 h-8 ${color} opacity-20`} />
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function for week calculation
Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  yearStart.setHours(0, 0, 0, 0);
  yearStart.setDate(yearStart.getDate() + 4 - (yearStart.getDay() || 7));
  const weekNum = Math.round((date - yearStart) / 86400000 / 7) + 1;
  return weekNum;
};