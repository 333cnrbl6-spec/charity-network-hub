import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BranchDetails() {
  const { branchId } = useParams();

  const { data: branch } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      const all = await base44.asServiceRole.entities.BranchConfig.list();
      return all.find(b => b.branch_id === branchId);
    },
  });

  const { data: report } = useQuery({
    queryKey: ['branch-report', branchId],
    queryFn: async () => {
      const all = await base44.asServiceRole.entities.BranchReport.list();
      const latest = all.filter(r => r.branch_id === branchId).sort((a, b) => 
        new Date(b.received_at) - new Date(a.received_at)
      )[0];
      return latest;
    },
  });

  if (!branch) {
    return <div className="p-6">Branch not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{branch.branch_name}</h1>
        <p className="text-muted-foreground mt-1">Branch overview and performance</p>
      </div>

      {/* Branch Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={branch.status === 'active' ? 'default' : 'outline'}>
              {branch.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Sync</p>
            <p className="font-medium">
              {branch.last_sync_date ? new Date(branch.last_sync_date).toLocaleString() : 'Never'}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sync Result</p>
            <Badge variant={branch.last_sync_result === 'success' ? 'default' : 'destructive'}>
              {branch.last_sync_result}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.stats?.total_clients || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {report.stats?.new_clients || 0} new
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.stats?.active_volunteers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.stats?.completed_jobs || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                of {report.stats?.total_jobs || 0} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Grants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{(report.stats?.grants_total_value || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {report.stats?.grants_awarded || 0} awarded
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}