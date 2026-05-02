import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function UsageAnalyticsDashboard() {
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['usage-metrics'],
    queryFn: async () => {
      const all = await base44.entities.UsageMetric.list('-timestamp', 1000);
      return all;
    }
  });

  // Aggregate by metric type
  const metricTypeCounts = {};
  metrics.forEach(m => {
    metricTypeCounts[m.metric_type] = (metricTypeCounts[m.metric_type] || 0) + 1;
  });

  // Daily active users
  const dailyActive = {};
  metrics.forEach(m => {
    if (m.metric_type === 'login') {
      const date = new Date(m.timestamp).toLocaleDateString();
      dailyActive[date] = (dailyActive[date] || 0) + 1;
    }
  });

  const dailyActiveData = Object.entries(dailyActive)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .slice(-30)
    .map(([date, count]) => ({ date, users: count }));

  const metricTypeData = Object.entries(metricTypeCounts).map(([type, count]) => ({
    name: type.replace(/_/g, ' ').toUpperCase(),
    value: count
  }));

  const COLORS = ['#8b5cf6', '#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'];

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin">Loading...</div></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-heading font-bold">Usage Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.filter(m => m.metric_type === 'ai_generation').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reports Downloaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.filter(m => m.metric_type === 'report_download').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.filter(m => m.metric_type === 'api_call').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Active Users (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyActiveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Metric Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Feature</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={metricTypeData} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="#8884d8" dataKey="value">
                  {metricTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metricTypeData.map(item => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-lg font-bold text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}