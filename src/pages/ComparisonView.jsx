import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = [
  'hsl(275, 60%, 45%)',
  'hsl(43, 96%, 56%)',
  'hsl(200, 70%, 45%)',
  'hsl(150, 60%, 40%)',
  'hsl(340, 65%, 50%)',
];

const METRICS = [
  { key: 'total_clients', label: 'Total Clients' },
  { key: 'total_jobs', label: 'Total Jobs' },
  { key: 'active_volunteers', label: 'Active Volunteers' },
  { key: 'total_sessions', label: 'Total Sessions' },
  { key: 'grants_total_value', label: 'Grants Value (£)' },
];

export default function ComparisonView() {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['branchReports'],
    queryFn: () => base44.entities.BranchReport.list('-report_period', 200),
  });

  // Get latest report per branch
  const latestByBranch = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      if (!map[r.branch_id] || r.report_period > map[r.branch_id].report_period) {
        map[r.branch_id] = r;
      }
    });
    return Object.values(map);
  }, [reports]);

  // Build comparison data for bar chart
  const comparisonData = useMemo(() => {
    return METRICS.map((metric) => {
      const row = { metric: metric.label };
      latestByBranch.forEach((r) => {
        row[r.branch_name] = r.stats?.[metric.key] || 0;
      });
      return row;
    });
  }, [latestByBranch]);

  const branchNames = latestByBranch.map((r) => r.branch_name);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold">Branch Comparison</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Side-by-side benchmarking across {latestByBranch.length} branch{latestByBranch.length !== 1 ? 'es' : ''} (latest period)
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg">Key Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {comparisonData.length > 0 && branchNames.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 88%)" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="metric" type="category" width={130} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(260, 15%, 88%)', fontSize: '13px' }} />
                <Legend />
                {branchNames.map((name, i) => (
                  <Bar key={name} dataKey={name} fill={COLORS[i % COLORS.length]} radius={[0, 4, 4, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-sm text-muted-foreground">
              No branch data to compare
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestByBranch.map((r, i) => (
          <Card key={r.branch_id} className="overflow-hidden">
            <div className="h-1.5" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <CardHeader className="pb-3">
              <CardTitle className="font-heading text-base">{r.branch_name}</CardTitle>
              <p className="text-xs text-muted-foreground">Period: {r.report_period}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {METRICS.map((m) => (
                  <div key={m.key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">
                      {m.key === 'grants_total_value' ? '£' : ''}{(r.stats?.[m.key] || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}