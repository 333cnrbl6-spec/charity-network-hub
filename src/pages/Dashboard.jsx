import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, Briefcase, HeartHandshake, CalendarCheck, PoundSterling } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import BranchStatusTable from '../components/dashboard/BranchStatusTable';
import NetworkTrendChart from '../components/dashboard/NetworkTrendChart';

export default function Dashboard() {
  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['branchReports'],
    queryFn: () => base44.entities.BranchReport.list('-report_period', 200),
  });

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ['branchConfigs'],
    queryFn: () => base44.entities.BranchConfig.list(),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['networkAlerts'],
    queryFn: () => base44.entities.NetworkAlert.filter({ resolved: false }),
  });

  // Aggregate KPIs from latest reports per branch
  const latestByBranch = {};
  reports.forEach((r) => {
    if (!latestByBranch[r.branch_id] || r.report_period > latestByBranch[r.branch_id].report_period) {
      latestByBranch[r.branch_id] = r;
    }
  });
  const latestReports = Object.values(latestByBranch);

  const totalClients = latestReports.reduce((s, r) => s + (r.stats?.total_clients || 0), 0);
  const totalJobs = latestReports.reduce((s, r) => s + (r.stats?.total_jobs || 0), 0);
  const totalVolunteers = latestReports.reduce((s, r) => s + (r.stats?.active_volunteers || 0), 0);
  const totalSessions = latestReports.reduce((s, r) => s + (r.stats?.total_sessions || 0), 0);
  const totalGrants = latestReports.reduce((s, r) => s + (r.stats?.grants_total_value || 0), 0);

  if (loadingReports || loadingBranches) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold">Network Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Federation-wide overview across {branches.length} branch{branches.length !== 1 ? 'es' : ''}
          {alerts.length > 0 && (
            <span className="ml-2 text-amber-600 font-medium">• {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Clients" value={totalClients.toLocaleString()} icon={Users} />
        <KPICard title="Total Jobs" value={totalJobs.toLocaleString()} icon={Briefcase} />
        <KPICard title="Volunteers" value={totalVolunteers.toLocaleString()} icon={HeartHandshake} />
        <KPICard title="Sessions" value={totalSessions.toLocaleString()} icon={CalendarCheck} />
        <KPICard title="Grants Value" value={`£${totalGrants.toLocaleString()}`} icon={PoundSterling} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NetworkTrendChart reports={reports} />
        </div>
        <BranchStatusTable branches={branches} />
      </div>
    </div>
  );
}