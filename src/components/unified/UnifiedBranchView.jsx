import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Users2, Briefcase, Zap, Gift, TrendingUp } from 'lucide-react';

export default function UnifiedBranchView({ branchId, branchName, showPopulator, onPopulate }) {
  // Fetch all branch data - clients, volunteers, jobs, sessions, grants
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', branchId],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers', branchId],
    queryFn: () => base44.entities.Volunteer.list(),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs', branchId],
    queryFn: () => base44.entities.Job.list(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', branchId],
    queryFn: () => base44.entities.Session.list(),
  });

  const { data: grants = [] } = useQuery({
    queryKey: ['grants', branchId],
    queryFn: () => base44.entities.Grant.list(),
  });

  const { data: report } = useQuery({
    queryKey: ['branch-report', branchId],
    queryFn: async () => {
      const all = await base44.asServiceRole.entities.BranchReport.list();
      return all.filter(r => r.branch_id === branchId).sort((a, b) => 
        new Date(b.received_at) - new Date(a.received_at)
      )[0];
    },
  });

  // Calculate KPIs
  const kpis = useMemo(() => ({
    activeClients: clients.filter(c => c.status === 'active').length,
    activeVolunteers: volunteers.filter(v => v.status === 'active').length,
    scheduledJobs: jobs.filter(j => j.status === 'scheduled').length,
    completedJobs: jobs.filter(j => j.status === 'completed').length,
    upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
    awardedGrants: grants.filter(g => g.status === 'awarded'),
    grantsValue: grants
      .filter(g => g.status === 'awarded')
      .reduce((sum, g) => sum + (g.amount_awarded || 0), 0),
  }), [clients, volunteers, jobs, sessions, grants]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.activeClients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users2 className="w-4 h-4" />
              Active Volunteers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.activeVolunteers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis.completedJobs}/{kpis.scheduledJobs}</p>
            <p className="text-xs text-muted-foreground mt-1">Completed/Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Grants Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">£{kpis.grantsValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpis.awardedGrants.length} awarded</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {jobs.slice(-5).reverse().map(job => (
                <div key={job.id} className="border-b pb-3 last:border-0">
                  <p className="font-medium text-sm">{job.client_name}</p>
                  <p className="text-xs text-muted-foreground">{job.job_type} • {job.status}</p>
                </div>
              ))}
              {jobs.length === 0 && (
                <p className="text-xs text-muted-foreground">No jobs yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {sessions.filter(s => s.status === 'scheduled').slice(0, 5).map(session => (
                <div key={session.id} className="border-b pb-3 last:border-0">
                  <p className="font-medium text-sm">{session.session_name}</p>
                  <p className="text-xs text-muted-foreground">{session.location}</p>
                </div>
              ))}
              {sessions.filter(s => s.status === 'scheduled').length === 0 && (
                <p className="text-xs text-muted-foreground">No sessions scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showPopulator && onPopulate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Branch Data Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ready to populate with demo data. Use the onboarding panel to auto-populate all branches.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}