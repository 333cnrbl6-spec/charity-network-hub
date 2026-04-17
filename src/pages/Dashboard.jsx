import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, Briefcase, Users2, Gift, RotateCw, AlertCircle, Network, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    const branch = JSON.parse(sessionStorage.getItem('selectedBranch') || '{}');
    setSelectedBranch(branch);
  }, []);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list(),
  });

  const { data: grants = [] } = useQuery({
    queryKey: ['grants'],
    queryFn: () => base44.entities.Grant.list(),
  });

  const { data: syncLogs = [] } = useQuery({
    queryKey: ['syncLogs'],
    queryFn: () => base44.entities.SyncLog.list(),
  });

  const { data: branchReports = [] } = useQuery({
    queryKey: ['branchReports'],
    queryFn: () => base44.asServiceRole.entities.BranchReport.list().catch(() => []),
  });

  const handleManualSync = async () => {
    setSyncLoading(true);
    try {
      await base44.functions.invoke('syncToHub', {});
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncLoading(false);
    }
  };

  const activeClients = clients.filter(c => c.status === 'active').length;
  const activeVolunteers = volunteers.filter(v => v.status === 'active').length;
  const thisMonthJobs = jobs.filter(j => {
    const jobDate = new Date(j.created_date);
    const now = new Date();
    return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
  }).length;
  const thisMonthSessions = sessions.filter(s => {
    const sessionDate = new Date(s.created_date);
    const now = new Date();
    return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear();
  }).length;
  const awardedGrants = grants.filter(g => g.status === 'awarded');
  const grantsValue = awardedGrants.reduce((sum, g) => sum + (g.amount_awarded || 0), 0);

  const lastSync = syncLogs.length > 0 ? syncLogs[syncLogs.length - 1] : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Age UK Manchester</h1>
        <p className="text-muted-foreground mt-1">Operations Dashboard</p>
      </div>

      {lastSync && (
        <Card className={lastSync.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-4 flex items-center gap-3">
            {lastSync.status === 'success' ? (
              <div className="flex items-center gap-3 flex-1">
                <Zap className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Last Sync Successful</p>
                  <p className="text-xs text-green-700">{lastSync.report_period} • {new Date(lastSync.synced_at).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Last Sync Failed</p>
                  <p className="text-xs text-red-700">{lastSync.response_message}</p>
                </div>
              </div>
            )}
            <Button size="sm" onClick={handleManualSync} disabled={syncLoading}>
              {syncLoading ? 'Syncing...' : 'Sync Now'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeClients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users2 className="w-4 h-4" />
              Active Volunteers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeVolunteers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Jobs This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{thisMonthJobs}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Sessions This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{thisMonthSessions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Grants Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">£{grantsValue.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            Network Status - All Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {branchReports.length > 0 ? (
              branchReports.reduce((acc, report) => {
                const existing = acc.find(b => b.branch_id === report.branch_id);
                if (!existing || new Date(report.received_at) > new Date(existing.received_at)) {
                  return [...acc.filter(b => b.branch_id !== report.branch_id), report];
                }
                return acc;
              }, []).map(report => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">{report.branch_name}</p>
                      <p className="text-xs text-muted-foreground">Last report: {new Date(report.received_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-3">No branch reports received yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {jobs.slice(-5).reverse().map(job => (
                <div key={job.id} className="border-b pb-3 last:border-0">
                  <p className="font-medium text-sm">{job.client_name}</p>
                  <p className="text-xs text-muted-foreground">{job.job_type} • {job.status}</p>
                  <p className="text-xs text-muted-foreground">{new Date(job.scheduled_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessions.filter(s => s.status === 'scheduled').slice(0, 5).map(session => (
                <div key={session.id} className="border-b pb-3 last:border-0">
                  <p className="font-medium text-sm">{session.session_name}</p>
                  <p className="text-xs text-muted-foreground">{session.location}</p>
                  <p className="text-xs text-muted-foreground">{new Date(session.scheduled_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}