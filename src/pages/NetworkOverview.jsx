import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function NetworkOverview() {
  const [syncLoading, setSyncLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: () => base44.asServiceRole.entities.BranchConfig.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['branch-reports'],
    queryFn: () => base44.asServiceRole.entities.BranchReport.list(),
  });

  const handleForceSync = async () => {
    setSyncLoading(true);
    try {
      await base44.functions.invoke('syncAllBranches', {});
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      queryClient.invalidateQueries({ queryKey: ['branch-reports'] });
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncLoading(false);
    }
  };

  const activeBranches = branches.filter(b => b.status === 'active').length;
  const totalClients = reports.reduce((sum, r) => sum + (r.stats?.total_clients || 0), 0);
  const totalVolunteers = reports.reduce((sum, r) => sum + (r.stats?.active_volunteers || 0), 0);
  const totalGrants = reports.reduce((sum, r) => sum + (r.stats?.grants_awarded || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Age UK Network Overview</h1>
          <p className="text-muted-foreground mt-1">National aggregated statistics and branch status</p>
        </div>
        <Button 
          onClick={handleForceSync} 
          disabled={syncLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
          {syncLoading ? 'Syncing...' : 'Force Sync'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBranches}</div>
            <p className="text-xs text-muted-foreground mt-1">of {branches.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVolunteers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Network-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Grants Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGrants.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Branch Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Branch Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 font-semibold">Branch</th>
                  <th className="text-left py-2 font-semibold">Status</th>
                  <th className="text-left py-2 font-semibold">Last Sync</th>
                  <th className="text-right py-2 font-semibold">Clients</th>
                  <th className="text-right py-2 font-semibold">Volunteers</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => {
                  const lastReport = reports.find(r => r.branch_id === branch.branch_id);
                  return (
                    <tr key={branch.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">{branch.branch_name}</td>
                      <td className="py-3">
                        <Badge variant={branch.status === 'active' ? 'default' : 'outline'}>
                          {branch.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {branch.last_sync_date ? new Date(branch.last_sync_date).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 text-right">{lastReport?.stats?.total_clients || 0}</td>
                      <td className="py-3 text-right">{lastReport?.stats?.active_volunteers || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}