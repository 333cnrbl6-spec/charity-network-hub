import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const severityConfig = {
  low: { icon: Info, color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  medium: { icon: AlertTriangle, color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  high: { icon: AlertCircle, color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  critical: { icon: ShieldAlert, color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
};

const typeLabels = {
  missed_sync: 'Missed Sync',
  anomaly: 'Anomaly',
  connection_error: 'Connection Error',
  data_quality: 'Data Quality',
};

export default function AlertsLog() {
  const [filter, setFilter] = useState('active');
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['networkAlerts'],
    queryFn: () => base44.entities.NetworkAlert.list('-created_date', 100),
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => base44.entities.NetworkAlert.update(id, { resolved: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networkAlerts'] });
      toast.success('Alert resolved');
    },
  });

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'active') return !a.resolved;
    if (filter === 'resolved') return a.resolved;
    return true;
  });

  const activeCount = alerts.filter((a) => !a.resolved).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Alerts Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Network health monitoring — {activeCount} active alert{activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredAlerts.map((alert) => {
              const sev = severityConfig[alert.severity] || severityConfig.medium;
              const SevIcon = sev.icon;
              return (
                <div key={alert.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${alert.resolved ? 'bg-muted' : sev.color.split(' ')[0]}`}>
                    {alert.resolved ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-muted-foreground" />
                    ) : (
                      <SevIcon className={`w-4.5 h-4.5 ${sev.color.split(' ')[1]}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">{alert.branch_id}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <Badge variant="outline" className={`text-xs ${sev.color}`}>
                        {alert.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[alert.alert_type] || alert.alert_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {alert.created_date ? format(new Date(alert.created_date), 'dd MMM yyyy HH:mm') : ''}
                      </span>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button variant="outline" size="sm" className="shrink-0" onClick={() => resolveMutation.mutate(alert.id)}>
                      Resolve
                    </Button>
                  )}
                </div>
              );
            })}
            {filteredAlerts.length === 0 && (
              <div className="text-center py-16 text-sm text-muted-foreground">
                {filter === 'active' ? 'No active alerts — network is healthy' : 'No alerts found'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}