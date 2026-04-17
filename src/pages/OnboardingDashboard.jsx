import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Trash2, Zap, MapPin, AlertTriangle } from 'lucide-react';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { playSuccess, playClick } from '@/lib/audio';

export default function OnboardingDashboard() {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleBootstrapConfigs = async () => {
    setActionLoading('bootstrap');
    playClick();
    try {
      await base44.functions.invoke('bootstrapBranchConfigs', {});
      queryClient.invalidateQueries({ queryKey: ['locationConfigs'] });
      playSuccess();
    } catch (error) {
      console.error('Bootstrap error:', error);
      alert(`Bootstrap failed: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const { data: locations = [] } = useQuery({
    queryKey: ['locationConfigs'],
    queryFn: () => base44.entities.LocationConfig.list(),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => base44.entities.BranchConfig.list(),
  });

  const { data: stats = {} } = useQuery({
    queryKey: ['demoStats'],
    queryFn: async () => {
      const clients = await base44.entities.Client.list();
      const volunteers = await base44.entities.Volunteer.list();
      const jobs = await base44.entities.Job.list();
      const sessions = await base44.entities.Session.list();
      const grants = await base44.entities.Grant.list();
      
      return {
        totalClients: clients.length,
        totalVolunteers: volunteers.length,
        totalJobs: jobs.length,
        totalSessions: sessions.length,
        totalGrants: grants.length,
      };
    },
  });

  const handlePurgeDemo = async (branchId) => {
    playClick();
    setActionLoading(`purge_${branchId}`);
    try {
      await base44.functions.invoke('finalizeBranchOnboarding', {
        branch_id: branchId,
        action: 'purge_demo'
      });
      
      queryClient.invalidateQueries({ queryKey: ['locationConfigs'] });
      queryClient.invalidateQueries({ queryKey: ['demoStats'] });
      playSuccess();
      setConfirmDelete(null);
    } catch (error) {
      console.error('Purge error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkReady = async (branchId) => {
    playClick();
    setActionLoading(`ready_${branchId}`);
    try {
      await base44.functions.invoke('finalizeBranchOnboarding', {
        branch_id: branchId,
        action: 'mark_ready'
      });
      
      queryClient.invalidateQueries({ queryKey: ['locationConfigs'] });
      playSuccess();
    } catch (error) {
      console.error('Mark ready error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const demoLocations = locations.filter(l => l.is_demo === true);
  const readyLocations = locations.filter(l => l.onboarded === true && l.is_demo === false);

  return (
    <div className="p-6 space-y-6">
      <LoadingIndicator isLoading={!!actionLoading} message="Processing branch data..." />

      <div>
        <h1 className="text-3xl font-bold text-foreground">Branch Onboarding</h1>
        <p className="text-muted-foreground mt-1">Transition branches from demo data to live operations</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Demo Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{demoLocations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Live Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{readyLocations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Demo Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalClients || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Demo Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalVolunteers || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Demo Data Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {(stats.totalClients || 0) + (stats.totalJobs || 0) + (stats.totalSessions || 0) + (stats.totalGrants || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Branches Ready for Onboarding */}
      {demoLocations.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertTriangle className="w-5 h-5" />
              Branches in Demo Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoLocations.map(location => (
                <div key={location.id} className="p-4 bg-white rounded-lg border border-yellow-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground capitalize">{location.branch_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{location.catchment_area}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          Demo Data Active
                        </Badge>
                        <Badge variant="outline">{location.sample_clients_count} sample clients</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleMarkReady(location.branch_id)}
                        disabled={actionLoading === `ready_${location.branch_id}`}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {actionLoading === `ready_${location.branch_id}` ? 'Processing...' : 'Mark Ready'}
                      </Button>
                      <Button
                        onClick={() => setConfirmDelete(location.branch_id)}
                        disabled={actionLoading === `purge_${location.branch_id}`}
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Purge Data
                      </Button>
                    </div>
                  </div>

                  {/* Confirmation Dialog */}
                  {confirmDelete === location.branch_id && (
                    <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                      <p className="text-sm font-semibold text-red-900 mb-3">
                        Are you sure? This will permanently delete all demo records for {location.branch_name}.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePurgeDemo(location.branch_id)}
                          disabled={actionLoading === `purge_${location.branch_id}`}
                          variant="destructive"
                          size="sm"
                        >
                          {actionLoading === `purge_${location.branch_id}` ? 'Purging...' : 'Confirm Purge'}
                        </Button>
                        <Button
                          onClick={() => setConfirmDelete(null)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live/Onboarded Branches */}
      {readyLocations.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="w-5 h-5" />
              Live Branches ({readyLocations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {readyLocations.map(location => (
                <div key={location.id} className="p-4 bg-white rounded-lg border border-green-200 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground capitalize">{location.branch_name}</p>
                    <p className="text-sm text-muted-foreground">{location.location_type} • {location.postcode_area}</p>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Live
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {demoLocations.length === 0 && readyLocations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
            <div>
              <p className="text-muted-foreground">No location configs synced yet</p>
              <p className="text-sm text-muted-foreground mt-1">Bootstrap all 11 branch configs or go to Locations page to sync manually</p>
            </div>
            <Button 
              onClick={handleBootstrapConfigs}
              disabled={actionLoading === 'bootstrap'}
              className="gap-2"
            >
              {actionLoading === 'bootstrap' ? 'Bootstrapping...' : 'Bootstrap All 11 Branches'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Auto-Populate All Branches */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="w-5 h-5" />
            Auto-Populate All Branches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            Populate all 11 North West branches with standardized Bury demo data (10 clients, 5 volunteers, 8 jobs, 4 sessions, 3 grants each).
          </p>
          <Button 
            onClick={async () => {
              setActionLoading('auto-populate');
              try {
                await base44.functions.invoke('autopopulateAllBranches', {});
                alert('✅ All branches auto-populated with Bury standard');
              } catch (error) {
                alert(`❌ Error: ${error.message}`);
              } finally {
                setActionLoading(null);
              }
            }}
            disabled={actionLoading === 'auto-populate'}
            className="gap-2"
          >
            {actionLoading === 'auto-populate' ? 'Populating...' : 'Auto-Populate All Branches'}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Onboarding Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="font-bold text-primary">1.</span>
            <span>Sync branch location configs from the Locations page</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">2.</span>
            <span>Review demo data populated for each branch (clients, volunteers, jobs)</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">3.</span>
            <span>Collect real data from branch administrators</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">4.</span>
            <span>Import real data using data upload tools</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">5.</span>
            <span>Purge demo records once real data is verified</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">6.</span>
            <span>Mark branch as ready for live operations</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}