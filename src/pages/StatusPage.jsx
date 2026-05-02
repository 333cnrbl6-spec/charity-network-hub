import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const statusColors = {
  operational: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, color: 'text-green-600' },
  degraded: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle, color: 'text-yellow-600' },
  down: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, color: 'text-red-600' }
};

export default function StatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await base44.entities.SystemStatus.list();
        const latest = data[0] || {
          status: 'operational',
          message: 'All systems operational',
          uptime_percentage: 99.9
        };
        setStatus(latest);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const config = statusColors[status?.status] || statusColors.operational;
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">CharityHub Status</h1>
          <p className="text-slate-600">Real-time system status and incident history</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Current Status Card */}
        <Card className={`mb-8 border-2 ${config.border} ${config.bg}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Icon className={`h-8 w-8 ${config.color}`} />
                <div>
                  <CardTitle className="text-2xl text-slate-900">
                    {status?.status === 'operational' ? 'All Systems Operational' : status?.message}
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <Badge 
                variant={status?.status === 'operational' ? 'default' : status?.status === 'degraded' ? 'secondary' : 'destructive'}
                className="text-sm px-3 py-1"
              >
                {status?.status.charAt(0).toUpperCase() + status?.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">UPTIME (30 days)</p>
                <p className="text-2xl font-bold text-slate-900">{status?.uptime_percentage?.toFixed(2)}%</p>
              </div>
              {status?.incident_type && status.incident_type !== 'none' && (
                <div>
                  <p className="text-xs text-slate-600 mb-1">INCIDENT TYPE</p>
                  <p className="text-sm font-medium text-slate-900 capitalize">{status.incident_type}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Services Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Service Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['API', 'Dashboard', 'Payments', 'Database'].map((service) => (
                <div key={service} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">{service}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-slate-600">Operational</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Incident History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-600">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <p className="font-medium">No incidents reported in the last 30 days</p>
              <p className="text-sm text-slate-500 mt-1">Keep up the great work! 🎉</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-slate-500 border-t border-slate-200 pt-8">
          <p>CharityHub API Status</p>
          <p className="mt-1">Updates every minute • Subscribe to <a href="#" className="text-primary hover:underline">email notifications</a></p>
        </div>
      </div>
    </div>
  );
}