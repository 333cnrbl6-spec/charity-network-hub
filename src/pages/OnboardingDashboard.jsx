import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Trash2, Zap, MapPin, AlertTriangle } from 'lucide-react';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { playSuccess, playClick, playError, playLoading } from '@/lib/audio';

export default function OnboardingDashboard() {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleBootstrapConfigs = async () => {
    setActionLoading('bootstrap');
    playLoading();
    try {
      await base44.functions.invoke('bootstrapBranchConfigs', {});
      queryClient.invalidateQueries({ queryKey: ['locationConfigs'] });
      playSuccess();
    } catch (error) {
      console.error('Bootstrap error:', error);
      playError();
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
      const compliance = await base44.entities.ComplianceRecord.list();
      
      const grantValue = grants.filter(g => g.status === 'awarded')
        .reduce((sum, g) => sum + (g.amount_awarded || 0), 0);
      
      return {
        totalClients: clients.length,
        totalVolunteers: volunteers.length,
        totalJobs: jobs.length,
        totalSessions: sessions.length,
        totalGrants: grants.length,
        totalCompliance: compliance.length,
        totalGrantValue: grantValue,
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
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
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
            <CardTitle className="text-xs text-muted-foreground">Compliance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalCompliance || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Grant Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">£{(stats.totalGrantValue || 0).toLocaleString()}</p>
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
            Auto-Populate with Realistic Demo Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            Populate all 11 North West branches with branch-specific, realistic data:
          </p>
          <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
            <li>35–80 clients per branch (based on population demographics)</li>
            <li>15–35 volunteers per branch with realistic roles and DBS status</li>
            <li>65–150 jobs per branch with varied job types</li>
            <li>20–45 sessions per branch across multiple session types</li>
            <li>28–65 grants per branch from real UK funders (National Lottery, Age UK, local authorities)</li>
            <li>Full compliance records from real UK regulators (DBS, HSE, Charity Commission, ICO)</li>
          </ul>
          <Button 
            onClick={async () => {
              setActionLoading('auto-populate');
              playLoading();
              try {
                await base44.functions.invoke('autopopulateAllBranches', {});
                queryClient.invalidateQueries({ queryKey: ['demoStats'] });
                queryClient.invalidateQueries({ queryKey: ['locationConfigs'] });
                playSuccess();
              } catch (error) {
                playError();
                alert(`❌ Error: ${error.message}`);
              } finally {
                setActionLoading(null);
              }
            }}
            disabled={actionLoading === 'auto-populate'}
            className="gap-2"
          >
            {actionLoading === 'auto-populate' ? 'Populating...' : 'Auto-Populate All 11 Branches'}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Network Onboarding Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="font-bold text-primary">1.</span>
            <span>Bootstrap or sync all 11 branch location configs (demographics, services, postcode areas)</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">2.</span>
            <span>Auto-populate all branches with branch-specific realistic demo data and real compliance records</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">3.</span>
            <span>Review demo data across clients, volunteers, jobs, sessions, grants, and compliance</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">4.</span>
            <span>Share credentials with regional leads; each branch standardized with unified navigation and modules</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">5.</span>
            <span>Collect real operational data from branch administrators</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">6.</span>
            <span>Import real data and purge demo records by branch</span>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-primary">7.</span>
            <span>Mark each branch ready for live operations</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}