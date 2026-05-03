import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, Briefcase, Users2, Gift, AlertCircle, Network, CheckCircle2 } from 'lucide-react';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import StatusLight from '@/components/ui/StatusLight';
import { playLoading, playSuccess } from '@/lib/audio';
import CharityAlerts from '@/components/alerts/CharityAlerts';
import PDFExporter from '@/components/reports/PDFExporter';
import VolunteerLeaderboard from '@/components/gamification/VolunteerLeaderboard';
import CommunityImpactBar from '@/components/gamification/CommunityImpactBar';
import { useClients, useVolunteers, useJobs, useSessions, useGrants, useCompliance, useBranches, useBranchReports, useSyncLogs } from '@/hooks/useEntityQueries';

export default function Dashboard() {
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('national');
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    const region = sessionStorage.getItem('selectedRegion') || 'national';
    const branch = JSON.parse(sessionStorage.getItem('selectedBranch') || 'null');
    setSelectedRegion(region);
    setSelectedBranch(branch);
  }, []);

  const { data: clients = [] } = useClients();
  const { data: volunteers = [] } = useVolunteers();
  const { data: jobs = [] } = useJobs();
  const { data: sessions = [] } = useSessions();
  const { data: grants = [] } = useGrants();
  const { data: compliance = [] } = useCompliance();
  const { data: branches = [] } = useBranches();
  const { data: branchReports = [] } = useBranchReports();
  const { data: syncLogs = [] } = useSyncLogs();

  const handleManualSync = async () => {
    setSyncLoading(true);
    playLoading();
    try {
      await base44.functions.invoke('syncToHub', {});
      playSuccess();
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
  
  const complianceStatus = {
    compliant: compliance.filter(c => c.status === 'compliant').length,
    at_risk: compliance.filter(c => c.status === 'at_risk').length,
    non_compliant: compliance.filter(c => c.status === 'non_compliant').length,
  };

  const lastSync = syncLogs.length > 0 ? syncLogs[syncLogs.length - 1] : null;

  const getTitle = () => {
    if (selectedBranch) return selectedBranch.branch_name;
    if (selectedRegion === 'national') return 'Age UK Network';
    const regionMap = {
      north_west: 'North West Region',
      london: 'London Region',
      south_east: 'South East Region',
      south_west: 'South West Region',
      midlands: 'Midlands Region',
      north_east: 'North East Region',
      yorkshire: 'Yorkshire & Humber Region',
      east_midlands: 'East Midlands Region',
      east: 'East Region',
      wales: 'Wales Region',
    };
    return regionMap[selectedRegion] || 'Age UK Network';
  };

  return (
    <div className="p-6 space-y-6">
      <LoadingIndicator isLoading={syncLoading} message="Syncing network..." />
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{getTitle()}</h1>
          <p className="text-muted-foreground mt-1">{selectedBranch ? 'Branch Operations' : 'Network Overview'}</p>
        </div>
        <StatusLight 
          status={syncLoading ? 'loading' : (lastSync?.status === 'success' ? 'success' : 'idle')} 
          label={syncLoading ? 'Syncing' : (lastSync?.status === 'success' ? 'Online' : 'Ready')}
          size="md"
        />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
             <p className="text-3xl font-bold">£{grantsValue.toLocaleString()}</p>
           </CardContent>
         </Card>

         <Card>
           <CardHeader className="pb-3">
             <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
               <CheckCircle2 className="w-4 h-4" />
               Compliance
             </CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-3xl font-bold text-green-600">{complianceStatus.compliant}</p>
             <p className="text-xs text-muted-foreground mt-1">{complianceStatus.at_risk} at risk</p>
           </CardContent>
         </Card>
       </div>

      {selectedRegion === 'national' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Connected Branches Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {branches.length > 0 ? (
                branches.map(branch => {
                  const latestReport = branchReports
                    .filter(r => r.branch_id === branch.branch_id)
                    .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))[0];
                  
                  const isActive = branch.status === 'active';
                  const lastSyncTime = latestReport ? new Date(latestReport.received_at) : new Date(branch.last_sync_date || 0);
                  const hoursAgo = Math.floor((Date.now() - lastSyncTime.getTime()) / (1000 * 60 * 60));
                  
                  return (
                    <div key={branch.branch_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <p className="font-semibold">{branch.branch_name}</p>
                          <div className="text-xs text-muted-foreground space-y-1 mt-1">
                            <p>Status: <span className={isActive ? 'text-green-600' : 'text-gray-500'}>{branch.status}</span></p>
                            {latestReport && (
                              <p>Clients: {latestReport.stats?.total_clients || 0} | Volunteers: {latestReport.stats?.active_volunteers || 0} | Jobs: {latestReport.stats?.completed_jobs || 0}/{latestReport.stats?.total_jobs || 0}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={isActive ? 'default' : 'outline'} className={isActive ? 'bg-green-100 text-green-800' : ''}>
                          {isActive ? 'Online' : 'Offline'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">
                          {hoursAgo === 0 ? 'Now' : `${hoursAgo}h ago`}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground p-4 text-center">No branches configured yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <CharityAlerts />
      <PDFExporter />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommunityImpactBar charityId={selectedBranch?.charity_id} targetImpactScore={5000} />
        <VolunteerLeaderboard charityId={selectedBranch?.charity_id} limit={5} />
      </div>

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