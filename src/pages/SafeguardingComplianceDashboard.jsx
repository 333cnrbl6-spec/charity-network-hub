import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, TrendingUp, Shield } from 'lucide-react';
import RiskScoreCard from '@/components/safeguarding/RiskScoreCard';

export default function SafeguardingComplianceDashboard() {
  const { user } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all risk scores
  const { data: riskScores, isLoading, refetch } = useQuery({
    queryKey: ['risk-scores'],
    queryFn: async () => {
      const scores = await base44.entities.SafeguardingRiskScore.filter({});
      return scores || [];
    }
  });

  // Fetch branch details
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const branchData = await base44.entities.BranchConfig.filter({});
      return branchData || [];
    }
  });

  // Fetch incidents for selected branch
  const { data: incidents } = useQuery({
    queryKey: ['incidents', selectedBranch?.id],
    queryFn: async () => {
      if (!selectedBranch?.id) return [];
      const incidentData = await base44.entities.SafeguardingIncident.filter({
        branch_id: selectedBranch.id
      }, '-created_date', 50);
      return incidentData || [];
    },
    enabled: !!selectedBranch?.id
  });

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await base44.functions.invoke('calculateSafeguardingRiskScores', {});
      await refetch();
      
      // Alert any critical risks
      const criticalRisks = riskScores?.filter(s => s.overall_risk_level === 'critical' || s.overall_risk_level === 'high') || [];
      for (const risk of criticalRisks) {
        if (risk.alert_sent !== true) {
          await base44.functions.invoke('alertSafeguardingLead', {
            branch_id: risk.branch_id,
            risk_level: risk.overall_risk_level,
            risk_score: risk.overall_risk_score,
            recommendations: risk.recommendations
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing risk scores:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Summary stats
  const criticalCount = riskScores?.filter(s => s.overall_risk_level === 'critical').length || 0;
  const highCount = riskScores?.filter(s => s.overall_risk_level === 'high').length || 0;
  const mediumCount = riskScores?.filter(s => s.overall_risk_level === 'medium').length || 0;
  const lowCount = riskScores?.filter(s => s.overall_risk_level === 'low').length || 0;

  const selectedRiskScore = selectedBranch ? 
    riskScores?.find(s => s.branch_id === selectedBranch.id) : null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Safeguarding Compliance Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Real-time risk monitoring and compliance tracking</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
            {isRefreshing ? 'Updating...' : 'Refresh Risk Scores'}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-3xl font-bold text-orange-600">{highCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Medium</p>
                <p className="text-3xl font-bold text-yellow-600">{mediumCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Compliant</p>
                <p className="text-3xl font-bold text-green-600">{lowCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Risk Score Grid */}
          <div className="col-span-2">
            <h2 className="text-lg font-semibold mb-4">Branch Risk Scores</h2>
            <div className="grid grid-cols-2 gap-4">
              {riskScores?.map(score => {
                const branch = branches?.find(b => b.id === score.branch_id);
                return (
                  <RiskScoreCard
                    key={score.id}
                    score={score}
                    branch={branch}
                    onClick={() => setSelectedBranch(branch || { id: score.branch_id })}
                  />
                );
              })}
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-4">
            {selectedRiskScore && selectedBranch ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedBranch.branch_name || 'Branch Details'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Overall Risk</p>
                      <Badge className={
                        selectedRiskScore.overall_risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                        selectedRiskScore.overall_risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        selectedRiskScore.overall_risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {selectedRiskScore.overall_risk_level.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">RECOMMENDATIONS</p>
                      {selectedRiskScore.recommendations?.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedRiskScore.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-xs text-slate-700 leading-relaxed">
                              <AlertCircle className="w-3 h-3 inline mr-1 text-amber-600" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-muted-foreground">No action items</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Incidents */}
                {incidents && incidents.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Recent Incidents (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {incidents.slice(0, 5).map(incident => (
                        <div key={incident.id} className="text-xs border-b pb-2 last:border-b-0">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className={
                              incident.priority === 'high' ? 'bg-red-50' : 'bg-yellow-50'
                            }>
                              {incident.priority}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{incident.incident_type}</p>
                              <p className="text-muted-foreground">
                                {new Date(incident.created_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground text-center">Select a branch to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';