import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function NetworkTrendChart({ reports }) {
  // Aggregate reports by period
  const periodMap = {};
  reports.forEach((r) => {
    const period = r.report_period;
    if (!periodMap[period]) {
      periodMap[period] = { period, clients: 0, jobs: 0, volunteers: 0, sessions: 0 };
    }
    periodMap[period].clients += r.stats?.total_clients || 0;
    periodMap[period].jobs += r.stats?.total_jobs || 0;
    periodMap[period].volunteers += r.stats?.active_volunteers || 0;
    periodMap[period].sessions += r.stats?.total_sessions || 0;
  });

  const chartData = Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">Network Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(275, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(275, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 88%)" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid hsl(260, 15%, 88%)',
                  fontSize: '13px'
                }} 
              />
              <Area type="monotone" dataKey="clients" stroke="hsl(275, 60%, 45%)" fill="url(#colorClients)" strokeWidth={2} name="Clients" />
              <Area type="monotone" dataKey="jobs" stroke="hsl(43, 96%, 56%)" fill="url(#colorJobs)" strokeWidth={2} name="Jobs" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
            No report data yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}