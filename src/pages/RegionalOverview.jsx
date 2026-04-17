import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const REGIONS = {
  north_west: 'North West',
  london: 'London',
  south_east: 'South East',
  south_west: 'South West',
  midlands: 'Midlands',
  north_east: 'North East',
  yorkshire: 'Yorkshire & Humber',
  east_midlands: 'East Midlands',
  east: 'East',
  wales: 'Wales',
};

const REGION_BRANCHES = {
  north_west: ['manchester', 'salford', 'trafford', 'wigan', 'bury', 'bolton', 'stockport'],
};

export default function RegionalOverview() {
  const { region } = useParams();
  const regionName = REGIONS[region] || region;
  const branchIds = REGION_BRANCHES[region] || [];

  const { data: branches = [] } = useQuery({
    queryKey: ['branches', region],
    queryFn: async () => {
      const all = await base44.asServiceRole.entities.BranchConfig.list();
      return all.filter(b => branchIds.includes(b.branch_id));
    },
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', region],
    queryFn: async () => {
      const all = await base44.asServiceRole.entities.BranchReport.list();
      return all.filter(r => branchIds.includes(r.branch_id));
    },
  });

  const totalClients = reports.reduce((sum, r) => sum + (r.stats?.total_clients || 0), 0);
  const totalVolunteers = reports.reduce((sum, r) => sum + (r.stats?.active_volunteers || 0), 0);
  const totalGrants = reports.reduce((sum, r) => sum + (r.stats?.grants_awarded || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{regionName} Region</h1>
        <p className="text-muted-foreground mt-1">Regional statistics and branch performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-muted-foreground mt-1">In region</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVolunteers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Grants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGrants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Branches in Region */}
      <Card>
        <CardHeader>
          <CardTitle>Branches in {regionName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {branches.map((branch) => {
              const report = reports.find(r => r.branch_id === branch.branch_id);
              return (
                <div key={branch.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{branch.branch_name}</p>
                    <p className="text-xs text-muted-foreground">Last sync: {branch.last_sync_date ? new Date(branch.last_sync_date).toLocaleDateString() : 'Never'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{report?.stats?.total_clients || 0} clients</Badge>
                    <Badge variant="outline">{report?.stats?.active_volunteers || 0} volunteers</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}