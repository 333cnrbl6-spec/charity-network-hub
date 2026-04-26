import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Lightbulb, Users } from 'lucide-react';

export default function OpportunityIntelligence({ branches, referrals }) {
  const opportunities = useMemo(() => {
    return branches.map(branch => {
      const branchReferrals = referrals.filter(r => r.branch_id === branch.branch_id);
      const pendingReferrals = branchReferrals.filter(r => r.status === 'received' || r.status === 'qualified');
      const declinedReferrals = branchReferrals.filter(r => r.status === 'declined');
      
      // Service demand analysis
      const serviceTypes = {};
      branchReferrals.forEach(r => {
        r.required_services?.forEach(service => {
          serviceTypes[service] = (serviceTypes[service] || 0) + 1;
        });
      });

      const topServices = Object.entries(serviceTypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([service, count]) => ({ service, count }));

      return {
        branch: branch.branch_name,
        branchId: branch.branch_id,
        pendingOpportunities: pendingReferrals.length,
        declinedReferrals: declinedReferrals.length,
        topServices,
        urgentReferrals: branchReferrals.filter(r => r.urgency === 'urgent').length,
        totalReferrals: branchReferrals.length,
      };
    }).filter(o => o.totalReferrals > 0).sort((a, b) => b.pendingOpportunities - a.pendingOpportunities);
  }, [branches, referrals]);

  const highestOpportunity = opportunities[0];
  const totalPendingNetwork = opportunities.reduce((sum, o) => sum + o.pendingOpportunities, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Network Pending Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPendingNetwork}</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate assignment opportunities</p>
          </CardContent>
        </Card>

        {highestOpportunity && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{highestOpportunity.branch}</div>
              <p className="text-xs text-muted-foreground mt-1">{highestOpportunity.pendingOpportunities} pending referrals</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Urgent Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {opportunities.reduce((sum, o) => sum + o.urgentReferrals, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branch Opportunity Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map(opp => (
              <div key={opp.branchId} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{opp.branch}</h3>
                    <p className="text-sm text-muted-foreground">{opp.totalReferrals} total referrals this period</p>
                  </div>
                  {opp.urgentReferrals > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {opp.urgentReferrals} Urgent
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-green-700 font-medium">{opp.pendingOpportunities}</p>
                    <p className="text-xs text-green-600">Pending Assignment</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded">
                    <p className="text-red-700 font-medium">{opp.declinedReferrals}</p>
                    <p className="text-xs text-red-600">Declined</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded">
                    <p className="text-blue-700 font-medium">{((opp.pendingOpportunities / opp.totalReferrals) * 100).toFixed(0)}%</p>
                    <p className="text-xs text-blue-600">Assignment Rate</p>
                  </div>
                </div>

                {opp.topServices.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Top Requested Services</p>
                    <div className="flex gap-2 flex-wrap">
                      {opp.topServices.map(svc => (
                        <Badge key={svc.service} variant="outline">
                          {svc.service.replace(/_/g, ' ')} ({svc.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}