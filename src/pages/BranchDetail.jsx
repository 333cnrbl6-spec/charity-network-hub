import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Briefcase, HeartHandshake, CalendarCheck, PoundSterling, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import KPICard from '../components/dashboard/KPICard';

export default function BranchDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const branchId = window.location.pathname.split('/branch/')[1];

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['branchReports', branchId],
    queryFn: () => base44.entities.BranchReport.filter({ branch_id: branchId }, '-report_period', 50),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branchConfigs'],
    queryFn: () => base44.entities.BranchConfig.list(),
  });

  const branch = branches.find((b) => b.branch_id === branchId);
  const sortedReports = [...reports].sort((a, b) => a.report_period.localeCompare(b.report_period));
  const latest = sortedReports[sortedReports.length - 1];

  const chartData = sortedReports.map((r) => ({
    period: r.report_period,
    clients: r.stats?.total_clients || 0,
    jobs: r.stats?.total_jobs || 0,
    volunteers: r.stats?.active_volunteers || 0,
    sessions: r.stats?.total_sessions || 0,
    grants: r.stats?.grants_total_value || 0,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold">{branch?.branch_name || branchId}</h1>
          <p className="text-sm text-muted-foreground">
            {sortedReports.length} report{sortedReports.length !== 1 ? 's' : ''} on file
            {branch?.status && (
              <Badge variant="outline" className="ml-2">{branch.status}</Badge>
            )}
          </p>
        </div>
      </div>

      {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard title="Clients" value={(latest.stats?.total_clients || 0).toLocaleString()} icon={Users} />
          <KPICard title="Jobs" value={(latest.stats?.total_jobs || 0).toLocaleString()} icon={Briefcase} />
          <KPICard title="Volunteers" value={(latest.stats?.active_volunteers || 0).toLocaleString()} icon={HeartHandshake} />
          <KPICard title="Sessions" value={(latest.stats?.total_sessions || 0).toLocaleString()} icon={CalendarCheck} />
          <KPICard title="Grants Value" value={`£${(latest.stats?.grants_total_value || 0).toLocaleString()}`} icon={PoundSterling} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg">Clients & Volunteers Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 88%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(260, 15%, 88%)', fontSize: '13px' }} />
                  <Line type="monotone" dataKey="clients" stroke="hsl(275, 60%, 45%)" strokeWidth={2} dot={{ r: 4 }} name="Clients" />
                  <Line type="monotone" dataKey="volunteers" stroke="hsl(43, 96%, 56%)" strokeWidth={2} dot={{ r: 4 }} name="Volunteers" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-lg">Jobs & Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 88%)" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(260, 15%, 88%)', fontSize: '13px' }} />
                  <Bar dataKey="jobs" fill="hsl(275, 60%, 45%)" radius={[4, 4, 0, 0]} name="Jobs" />
                  <Bar dataKey="sessions" fill="hsl(43, 96%, 56%)" radius={[4, 4, 0, 0]} name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-lg">Report History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedReports.reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{r.report_period}</p>
                    <p className="text-xs text-muted-foreground">
                      Received {r.received_at ? new Date(r.received_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{r.status}</Badge>
              </div>
            ))}
            {sortedReports.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No reports yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}