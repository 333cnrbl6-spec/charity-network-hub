import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CustomerHealthDashboard() {
  const { data: healthScores = [], isLoading } = useQuery({
    queryKey: ['customer-health'],
    queryFn: async () => {
      const scores = await base44.entities.CustomerHealth.list('-health_score', 100);
      return scores;
    }
  });

  const healthyCount = healthScores.filter(s => s.status === 'healthy').length;
  const atRiskCount = healthScores.filter(s => s.status === 'at_risk').length;
  const churningCount = healthScores.filter(s => s.status === 'churning').length;

  const handleRecalculate = async () => {
    try {
      await base44.functions.invoke('calculateCustomerHealth', {});
      alert('Health scores recalculated');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to recalculate scores');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold">Customer Health Dashboard</h1>
        <Button onClick={handleRecalculate}>Recalculate Scores</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthScores.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Healthy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{atRiskCount}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Churning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{churningCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Churn Risk Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">At-Risk & Churning Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthScores.filter(s => s.status !== 'healthy').map(score => (
              <div key={score.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{score.org_name}</p>
                  <p className="text-sm text-slate-600 mt-1">{score.churn_reason}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={score.status === 'at_risk' ? 'secondary' : 'destructive'}>
                      {score.status}
                    </Badge>
                    <Badge variant="outline">
                      {score.churn_risk} risk
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">{score.health_score}/100</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {score.days_since_login} days inactive
                  </div>
                  <Button size="sm" variant="outline" className="mt-2 text-xs">
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Engaged Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {healthScores
              .filter(s => s.status === 'healthy')
              .slice(0, 10)
              .map(score => (
                <div key={score.id} className="flex items-center justify-between p-2 border-b">
                  <div>
                    <p className="font-medium text-sm">{score.org_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {score.feature_usage.ai_generations} AI gens • {score.active_users} active users
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{score.health_score}/100</p>
                    <p className="text-xs text-green-600">£{score.monthly_revenue}/mo</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue at Risk */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-lg">Potential Revenue Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-600">
            £{(healthScores
              .filter(s => s.status === 'churning')
              .reduce((sum, s) => sum + s.monthly_revenue, 0))
              .toFixed(2)}
          </div>
          <p className="text-sm text-slate-600 mt-2">
            {churningCount} customers at risk of cancellation this month
          </p>
        </CardContent>
      </Card>
    </div>
  );
}