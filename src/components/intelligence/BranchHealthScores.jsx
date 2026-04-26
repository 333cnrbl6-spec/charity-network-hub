import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { AlertCircle, CheckCircle2, TrendingDown } from 'lucide-react';

export default function BranchHealthScores({ branches, clients, volunteers, jobs, referrals }) {
  const healthScores = useMemo(() => {
    return branches.map(branch => {
      const branchClients = clients.filter(c => c.branch_id === branch.branch_id);
      const branchVolunteers = volunteers.filter(v => {
        const jobs_for_volunteer = jobs.filter(j => j.volunteer_id === v.id);
        return jobs_for_volunteer.some(j => j.client_id && branchClients.some(bc => bc.id === j.client_id));
      });
      const branchJobs = jobs.filter(j => branchClients.some(c => c.id === j.client_id));
      const branchReferrals = referrals.filter(r => r.branch_id === branch.branch_id);

      // Calculate health metrics (0-100)
      const clientCount = Math.min(branchClients.length / 2, 25); // Normalize to 0-25
      const volunteerCoverage = Math.min((branchVolunteers.length / (branchClients.length || 1)) * 50, 25); // 0-25
      const jobCompletion = branchJobs.length > 0 
        ? (branchJobs.filter(j => j.status === 'completed').length / branchJobs.length) * 25 
        : 0; // 0-25
      const referralTurnaround = branchReferrals.length > 0 
        ? (branchReferrals.filter(r => r.status === 'active' || r.status === 'completed').length / branchReferrals.length) * 25 
        : 0; // 0-25

      const healthScore = Math.round(clientCount + volunteerCoverage + jobCompletion + referralTurnaround);

      return {
        name: branch.branch_name,
        healthScore,
        clients: branchClients.length,
        volunteers: branchVolunteers.length,
        completedJobs: branchJobs.filter(j => j.status === 'completed').length,
        activeReferrals: branchReferrals.filter(r => r.status === 'active').length,
      };
    }).sort((a, b) => b.healthScore - a.healthScore);
  }, [branches, clients, volunteers, jobs, referrals]);

  const getHealthStatus = (score) => {
    if (score >= 75) return { label: 'Excellent', color: 'bg-green-100 text-green-800', icon: CheckCircle2 };
    if (score >= 50) return { label: 'Good', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 };
    if (score >= 25) return { label: 'At Risk', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
    return { label: 'Critical', color: 'bg-red-100 text-red-800', icon: TrendingDown };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Branch Health Score Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthScores.map(branch => {
              const status = getHealthStatus(branch.healthScore);
              const StatusIcon = status.icon;
              return (
                <div key={branch.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <StatusIcon className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{branch.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {branch.clients} clients • {branch.volunteers} volunteers • {branch.completedJobs} completed jobs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${branch.healthScore}%` }}
                      />
                    </div>
                    <Badge className={status.color}>{branch.healthScore}/100</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health Score Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="healthScore" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}