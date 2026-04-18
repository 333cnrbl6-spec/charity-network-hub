import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, Network, Zap, Users, Users2, Briefcase, Gift, MapPin, Globe, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import StatusLight from '@/components/ui/StatusLight';
import CollectivePerformanceChart from '@/components/dashboard/CollectivePerformanceChart';
import { playClick, playSuccess, playLoading } from '@/lib/audio';

const BRANCHES = [
  { id: 'manchester', name: 'Manchester' },
  { id: 'bury', name: 'Bury' },
  { id: 'stockport', name: 'Stockport' },
  { id: 'wigan', name: 'Wigan' },
  { id: 'trafford', name: 'Trafford' },
  { id: 'salford', name: 'Salford' },
  { id: 'bolton', name: 'Bolton' },
  { id: 'lancashire', name: 'Lancashire' },
  { id: 'wirral', name: 'Wirral' },
  { id: 'sefton', name: 'Sefton' },
  { id: 'liverpool', name: 'Liverpool' },
];

export default function NationalDashboard() {
  const queryClient = useQueryClient();
  const [syncLoading, setSyncLoading] = useState(null);
  const [populateProgress, setPopulateProgress] = useState(null);
  const { user: currentUser, logout } = useAuth();
  const isSueBradley = currentUser?.email === 'sue.bradley1@ntlworld.com';

  // Fetch branch configs
  const { data: branches = [] } = useQuery({
    queryKey: ['branchConfigs'],
    queryFn: () => base44.entities.BranchConfig.list(),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Fetch branch reports for latest sync status
  const { data: branchReports = [] } = useQuery({
    queryKey: ['branchReports'],
    queryFn: () => base44.entities.BranchReport.list(),
    refetchInterval: 10000,
  });

  // Fetch sync logs
  const { data: syncLogs = [] } = useQuery({
    queryKey: ['syncLogs'],
    queryFn: () => base44.entities.SyncLog.list(),
    refetchInterval: 15000,
  });

  // Get connection status for each branch
  const getConnectionStatus = (branchId) => {
    const branch = branches.find(b => b.branch_id === branchId);
    if (!branch) return { status: 'offline', lastSync: null };

    const lastReport = branchReports
      .filter(r => r.branch_id === branchId)
      .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))[0];

    if (!lastReport) {
      return { status: 'pending', lastSync: null };
    }

    const hoursAgo = Math.floor((Date.now() - new Date(lastReport.received_at).getTime()) / (1000 * 60 * 60));
    const isStale = hoursAgo > 24;

    return {
      status: isStale ? 'stale' : 'online',
      lastSync: lastReport.received_at,
      report: lastReport,
      hoursAgo,
    };
  };

  // Fetch jobs and volunteers for impact metrics
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list(),
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  // Global stats
  const totalClients = branchReports.reduce((sum, r) => sum + (r.stats?.total_clients || 0), 0);
  const totalVolunteers = branchReports.reduce((sum, r) => sum + (r.stats?.active_volunteers || 0), 0);
  const totalJobs = branchReports.reduce((sum, r) => sum + (r.stats?.total_jobs || 0), 0);
  const totalGrants = branchReports.reduce((sum, r) => sum + (r.stats?.grants_total_value || 0), 0);
  
  // Impact metrics
  const uniqueClientsServed = new Set(jobs.map(j => j.client_id)).size;
  const totalVolunteerHours = volunteers.reduce((sum, v) => sum + (v.hours_contributed || 0), 0);

  const connectedBranches = BRANCHES.filter(b => {
    const status = getConnectionStatus(b.id);
    return status.status === 'online' || status.status === 'stale';
  }).length;

  const handleAutoPopulate = async () => {
    playLoading();
    setSyncLoading('populate');
    setPopulateProgress(0);

    try {
      const totalBranches = BRANCHES.length;
      
      for (let i = 0; i < totalBranches; i++) {
        const branch = BRANCHES[i];
        const progress = Math.round((i / totalBranches) * 100);
        setPopulateProgress(progress);

        try {
          await base44.functions.invoke('populateBranchData', {
            branch_id: branch.id,
            branch_name: branch.name,
          });
          console.log(`✓ Populated ${branch.name}`);
        } catch (error) {
          console.error(`✗ Failed to populate ${branch.name}:`, error);
        }

        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setPopulateProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ['branchReports'] });
      queryClient.invalidateQueries({ queryKey: ['branchConfigs'] });
    } catch (error) {
      console.error('Auto-populate error:', error);
    } finally {
      setSyncLoading(null);
      setPopulateProgress(null);
    }
  };

  const handleSyncAll = async () => {
    playLoading();
    setSyncLoading('sync-all');

    try {
      await base44.functions.invoke('syncAllBranchesToHub', {});
      playSuccess();
      queryClient.invalidateQueries({ queryKey: ['branchReports'] });
    } catch (error) {
      console.error('Sync all error:', error);
    } finally {
      setSyncLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Sue Bradley personalised banner */}
      {isSueBradley && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-5 flex items-center justify-between gap-4 shadow-lg">
          <div>
            <p className="text-sm font-medium opacity-90">👋 Welcome, Sue!</p>
            <h2 className="text-xl font-bold">You're looking at the National Hub</h2>
            <p className="text-sm opacity-80 mt-1">Your personal Age UK Bury Coordinator Portal is ready and waiting for you.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold"
              onClick={() => window.location.href = '/role-onboarding'}
            >
              Go to My Portal <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/50 text-white hover:bg-white/20"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-1" /> Log Out
            </Button>
          </div>
        </div>
      )}

      <LoadingIndicator 
        isLoading={!!syncLoading} 
        message={syncLoading === 'populate' ? 'Auto-populating all branches...' : 'Syncing all branches...'}
        progress={populateProgress}
      />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
            <Globe className="w-8 h-8" />
            Age UK Network Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">National Hub • {connectedBranches}/{BRANCHES.length} branches connected</p>
        </div>
        <StatusLight 
          status={connectedBranches === BRANCHES.length ? 'success' : 'loading'}
          label={connectedBranches === BRANCHES.length ? 'Fully Connected' : 'Connecting'}
          size="md"
        />
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Lives Touched
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{uniqueClientsServed.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Volunteer Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalVolunteerHours.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Jobs Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{jobs.filter(j => j.status === 'completed').length.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Grant Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">£{(totalGrants / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleAutoPopulate}
          disabled={!!syncLoading}
          className="gap-2"
          variant="default"
        >
          <Zap className="w-4 h-4" />
          {syncLoading === 'populate' ? `Populating... ${populateProgress || 0}%` : 'Auto-Populate All Branches'}
        </Button>
        <Button 
          onClick={handleSyncAll}
          disabled={!!syncLoading}
          className="gap-2"
          variant="outline"
        >
          <Network className="w-4 h-4" />
          {syncLoading === 'sync-all' ? 'Syncing...' : 'Sync All Branches'}
        </Button>
      </div>

      {/* Connection Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Branch Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BRANCHES.map(branch => {
              const status = getConnectionStatus(branch.id);
              const isOnline = status.status === 'online';
              const isPending = status.status === 'pending';
              const isStale = status.status === 'stale';

              return (
                <div 
                  key={branch.id} 
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isOnline ? 'border-green-200 bg-green-50' :
                    isStale ? 'border-yellow-200 bg-yellow-50' :
                    isPending ? 'border-blue-200 bg-blue-50' :
                    'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        isOnline ? 'bg-green-500' :
                        isStale ? 'bg-yellow-500' :
                        isPending ? 'bg-blue-500' :
                        'bg-red-500'
                      }`} />
                      <span className="font-semibold">{branch.name}</span>
                    </div>
                    {status.report?.stats && (
                      <Badge variant={isOnline ? 'default' : 'outline'}>
                        {status.report.stats.total_clients || 0} clients
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className={`font-medium ${
                      isOnline ? 'text-green-900' :
                      isStale ? 'text-yellow-900' :
                      isPending ? 'text-blue-900' :
                      'text-red-900'
                    }`}>
                      {isOnline && '✓ Online'}
                      {isStale && '⚠ Stale'}
                      {isPending && '⏳ Pending'}
                      {status.status === 'offline' && '✗ Offline'}
                    </p>
                    {status.lastSync && (
                      <p className="text-xs text-muted-foreground">
                        Last sync: {status.hoursAgo}h ago
                      </p>
                    )}
                    {status.report?.stats && (
                      <div className="text-xs text-muted-foreground pt-1 space-y-1 border-t">
                        <p>Volunteers: {status.report.stats.active_volunteers || 0}</p>
                        <p>Jobs: {status.report.stats.total_jobs || 0}</p>
                        <p>Grant Value: £{((status.report.stats.grants_total_value || 0) / 1000).toFixed(0)}k</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SynergyFlow Collective Performance */}
      <CollectivePerformanceChart />

      {/* Recent Sync Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {syncLogs.slice(-10).reverse().map((log, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded border">
                {log.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.report_period}</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.synced_at).toLocaleString()}</p>
                </div>
                <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}