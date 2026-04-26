import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertCircle, Target } from 'lucide-react';

export default function PortfolioOptimization({ branches, clients, jobs }) {
  const portfolioAnalysis = useMemo(() => {
    const analysis = branches.map(branch => {
      const branchClients = clients.filter(c => c.branch_id === branch.branch_id);
      const branchJobs = jobs.filter(j => {
        const client = branchClients.find(c => c.id === j.client_id);
        return !!client;
      });

      const clientCount = branchClients.length;
      const jobCompletion = branchJobs.length > 0 
        ? (branchJobs.filter(j => j.status === 'completed').length / branchJobs.length) * 100 
        : 0;
      const effortRequired = branchClients.length > 100 ? 'high' : branchClients.length > 50 ? 'medium' : 'low';
      
      // ROI Calculation: clients served per effort unit
      const roiScore = branchJobs.length > 0 ? (clientCount / branchJobs.length) * 10 : 0;

      return {
        name: branch.branch_name,
        clientCount,
        jobCompletion,
        roiScore: Math.round(roiScore),
        effortRequired,
        priority: 0, // Calculated below
        investmentRecommendation: '',
      };
    });

    // Prioritize branches for investment
    analysis.forEach(branch => {
      const completionScore = branch.jobCompletion / 100;
      const capacityScore = Math.min(branch.clientCount / 100, 1);
      const priorityScore = (completionScore * 0.4) + (capacityScore * 0.6);
      
      branch.priority = Math.round(priorityScore * 100);

      if (branch.priority >= 70) {
        branch.investmentRecommendation = 'Scale Up';
      } else if (branch.priority >= 40) {
        branch.investmentRecommendation = 'Optimize';
      } else {
        branch.investmentRecommendation = 'Support';
      }
    });

    // Portfolio categorization
    const scaleUp = analysis.filter(b => b.investmentRecommendation === 'Scale Up');
    const optimize = analysis.filter(b => b.investmentRecommendation === 'Optimize');
    const support = analysis.filter(b => b.investmentRecommendation === 'Support');

    return {
      allBranches: analysis,
      scaleUp,
      optimize,
      support,
      averagePriority: Math.round(analysis.reduce((sum, b) => sum + b.priority, 0) / analysis.length),
    };
  }, [branches, clients, jobs]);

  const getRecommendationColor = (rec) => {
    switch(rec) {
      case 'Scale Up': return 'bg-green-100 text-green-800';
      case 'Optimize': return 'bg-yellow-100 text-yellow-800';
      case 'Support': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIcon = (rec) => {
    switch(rec) {
      case 'Scale Up': return CheckCircle2;
      case 'Optimize': return Target;
      case 'Support': return AlertCircle;
      default: return CheckCircle2;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scale Up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{portfolioAnalysis.scaleUp.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Strong performers ready to expand</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Optimize</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{portfolioAnalysis.optimize.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Growing branches needing refinement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{portfolioAnalysis.support.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Need targeted support & development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Network Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{portfolioAnalysis.averagePriority}</div>
            <p className="text-xs text-muted-foreground mt-1">Average priority score</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {portfolioAnalysis.scaleUp.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-green-700">🚀 Scale Up Priority</h3>
              <div className="space-y-2">
                {portfolioAnalysis.scaleUp.map(branch => (
                  <div key={branch.name} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-muted-foreground">{branch.clientCount} clients | {branch.jobCompletion.toFixed(0)}% completion</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {portfolioAnalysis.optimize.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-yellow-700">⚙️ Optimize</h3>
              <div className="space-y-2">
                {portfolioAnalysis.optimize.map(branch => (
                  <div key={branch.name} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-muted-foreground">{branch.clientCount} clients | {branch.jobCompletion.toFixed(0)}% completion</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {portfolioAnalysis.support.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-orange-700">🆘 Support</h3>
              <div className="space-y-2">
                {portfolioAnalysis.support.map(branch => (
                  <div key={branch.name} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-medium">{branch.name}</p>
                    <p className="text-sm text-muted-foreground">{branch.clientCount} clients | {branch.jobCompletion.toFixed(0)}% completion</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branch Performance Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {portfolioAnalysis.allBranches.sort((a, b) => b.priority - a.priority).map(branch => (
              <div key={branch.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{branch.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {branch.clientCount} clients • {branch.roiScore} ROI score
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${branch.priority}%` }}
                    />
                  </div>
                  <Badge className={getRecommendationColor(branch.investmentRecommendation)}>
                    {branch.investmentRecommendation}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}