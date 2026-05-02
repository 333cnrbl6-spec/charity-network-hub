import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OperationsMonitoring() {
  const { data: systemStatus } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: () => base44.entities.SystemStatus.list(),
    refetchInterval: 30000
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.filter({ severity: { $in: ['warning', 'critical'] } }),
    refetchInterval: 30000
  });

  const { data: customerHealth } = useQuery({
    queryKey: ['customerHealth'],
    queryFn: () => base44.entities.CustomerHealth.filter({ status: { $in: ['at_risk', 'churning'] } })
  });

  // Mock performance data
  const performanceData = [
    { time: '00:00', response: 85, errors: 2 },
    { time: '04:00', response: 92, errors: 1 },
    { time: '08:00', response: 78, errors: 5 },
    { time: '12:00', response: 88, errors: 2 },
    { time: '16:00', response: 90, errors: 1 },
    { time: '20:00', response: 85, errors: 3 }
  ];

  const status = systemStatus?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Operations Monitor</h1>
        <p className="text-muted-foreground">Real-time system health and performance</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status?.status === 'operational' ? (
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <p className="font-bold capitalize">{status?.status || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{status?.uptime_percentage || 99.9}% uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{alerts?.length || 0}</p>
            <p className="text-xs text-muted-foreground">In last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">At-Risk Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{customerHealth?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Time & Error Rate</CardTitle>
          <CardDescription>Last 24 hours (4-hour intervals)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" label={{ value: 'Response (ms)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Errors', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="response" stroke="#8b5cf6" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts?.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start justify-between pb-3 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customers Requiring Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {customerHealth?.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                <div>
                  <p className="font-medium">{customer.org_name}</p>
                  <p className="text-sm text-muted-foreground">Score: {customer.health_score}/100</p>
                </div>
                <Badge variant={customer.status === 'churning' ? 'destructive' : 'secondary'}>
                  {customer.churn_risk || 'monitoring'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}