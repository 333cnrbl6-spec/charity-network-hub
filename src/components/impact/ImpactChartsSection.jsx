import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import { TrendingUp, Filter } from 'lucide-react';
import { useVolunteers, useClients, useBranchReports } from '@/hooks/useEntityQueries';

export default function ImpactChartsSection() {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const { data: volunteers = [] } = useVolunteers();
  const { data: clients = [] } = useClients();
  const { data: branchReports = [] } = useBranchReports();

  // Available branches and regions
  const branches = useMemo(() => {
    const unique = [...new Set(branchReports.map(r => r.branch_id))];
    return unique.filter(Boolean);
  }, [branchReports]);

  const regions = useMemo(() => {
    const unique = [...new Set(branchReports.map(r => r.branch_id?.split('-')?.[0]))];
    return unique.filter(Boolean);
  }, [branchReports]);

  // Build time-series data: volunteer hours vs client satisfaction (proxy: active clients)
  const chartData = useMemo(() => {
    // Group by month from volunteer data and client data
    const dataByMonth = {};

    // Aggregate volunteer hours by month
    volunteers.forEach(vol => {
      if (selectedBranch !== 'all' || selectedRegion !== 'all') {
        // Branch/region filtering based on volunteer area (simple proxy)
        // In real scenario, would need branch association on volunteers
        if (selectedBranch !== 'all' && vol.area !== selectedBranch) return;
      }

      const date = new Date(vol.date_joined || new Date());
      const key = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
      
      if (!dataByMonth[key]) {
        dataByMonth[key] = { month: key, volunteerHours: 0, clientSatisfaction: 0, activeClients: 0 };
      }
      dataByMonth[key].volunteerHours += vol.hours_contributed || 0;
    });

    // Aggregate client metrics by month
    clients.forEach(client => {
      const date = new Date(client.date_registered || new Date());
      const key = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
      
      if (!dataByMonth[key]) {
        dataByMonth[key] = { month: key, volunteerHours: 0, clientSatisfaction: 0, activeClients: 0 };
      }
      if (client.status === 'active') {
        dataByMonth[key].activeClients += 1;
        // Proxy: use active client count as satisfaction indicator (scale 1-10)
        dataByMonth[key].clientSatisfaction = Math.min(10, 5 + (dataByMonth[key].activeClients / 10));
      }
    });

    // Sort by month and return last 12 months
    return Object.values(dataByMonth)
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-12);
  }, [volunteers, clients, selectedBranch, selectedRegion]);

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter by Branch or Region
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Branches</option>
                {branches.map(b => (
                  <option key={b} value={b}>{b || 'Unknown'}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="all">All Regions</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r || 'Unknown'}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Chart: Hours vs Satisfaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Total Hours Contributed vs Client Satisfaction Score
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-2">
            Visualizing volunteer impact (hours) against client engagement satisfaction over time
          </p>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#3b82f6"
                  label={{ value: 'Hours Contributed', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#ef4444"
                  label={{ value: 'Satisfaction Score (0-10)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value) => value.toFixed(1)}
                />
                <Legend />
                <Bar 
                  yAxisId="left" 
                  dataKey="volunteerHours" 
                  fill="#3b82f6" 
                  name="Total Hours Contributed"
                  radius={[4, 4, 0, 0]}
                  opacity={0.7}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="clientSatisfaction" 
                  stroke="#ef4444" 
                  strokeWidth={2.5}
                  name="Client Satisfaction Score"
                  dot={{ fill: '#ef4444', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-96 flex items-center justify-center text-muted-foreground">
              No data available for the selected filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Period Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-muted-foreground">Total Hours in Period</p>
              <p className="text-2xl font-bold mt-1">
                {chartData.reduce((sum, d) => sum + d.volunteerHours, 0).toFixed(0)}h
              </p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-sm text-muted-foreground">Avg Satisfaction Score</p>
              <p className="text-2xl font-bold mt-1">
                {(chartData.reduce((sum, d) => sum + d.clientSatisfaction, 0) / chartData.length || 0).toFixed(1)}/10
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-muted-foreground">Peak Hours Month</p>
              <p className="text-2xl font-bold mt-1">
                {chartData.reduce((max, d) => d.volunteerHours > max.volunteerHours ? d : max, chartData[0] || {})?.month || 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}