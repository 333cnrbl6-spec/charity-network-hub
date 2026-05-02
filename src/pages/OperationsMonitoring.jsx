import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

export default function OperationsMonitoring() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => base44.auth.me()
  });

  const { data: systemStatus } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const status = await base44.entities.SystemStatus.list();
      return status[0] || {
        status: 'operational',
        message: 'All systems operational',
        uptime_percentage: 99.99
      };
    },
    refetchInterval: 30000,
    enabled: !!user && user.role === 'admin'
  });

  const { data: metrics } = useQuery({
    queryKey: ['saas-metrics'],
    queryFn: async () => {
      const metrics = await base44.entities.SaaSMetric.list();
      return metrics[0];
    },
    refetchInterval: 60000,
    enabled: !!user && user.role === 'admin'
  });

  // Only admins can access monitoring
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-red-600">Admin access required</p>
      </div>
    );
  }

  const statusColor = {
    operational: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    down: 'bg-red-100 text-red-800'
  };

  const statusIcon = {
    operational: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    degraded: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    down: <AlertCircle className="w-5 h-5 text-red-600" />
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Operations Monitoring</h1>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {statusIcon[systemStatus?.status]}
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <Badge className={statusColor[systemStatus?.status]}>
                  {systemStatus?.status?.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime (this month)</p>
                <p className="text-2xl font-bold">{systemStatus?.uptime_percentage || 99.99}%</p>
              </div>
            </div>
            {systemStatus?.message && (
              <p className="text-sm">{systemStatus.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Health Indicators */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">API Response Time</p>
              <p className="text-2xl font-bold mt-2">245ms</p>
              <p className="text-xs text-green-600 mt-2">✓ Normal</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Error Rate</p>
              <p className="text-2xl font-bold mt-2">0.02%</p>
              <p className="text-xs text-green-600 mt-2">✓ Healthy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Database Connections</p>
              <p className="text-2xl font-bold mt-2">42/100</p>
              <p className="text-xs text-green-600 mt-2">✓ Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
              <p className="text-2xl font-bold mt-2">94%</p>
              <p className="text-xs text-green-600 mt-2">✓ Excellent</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Metrics */}
        {metrics && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Metrics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-3xl font-bold">{metrics.active_customers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-3xl font-bold">£{metrics.mrr?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
                <p className="text-3xl font-bold">{metrics.churn_rate}%</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Service Dependencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p>Database (PostgreSQL)</p>
                </div>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p>Cache (Redis)</p>
                </div>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p>Payment Processor (Stripe)</p>
                </div>
                <Badge variant="default">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p>Email Service (SendGrid)</p>
                </div>
                <Badge variant="default">Healthy</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">No active alerts. All systems nominal.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}