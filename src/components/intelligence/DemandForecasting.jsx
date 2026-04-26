import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function DemandForecasting({ branches, clients, referrals }) {
  const demandAnalysis = useMemo(() => {
    // Group clients by demographic characteristics
    const demographicDemand = {};
    const ageGroups = { '65-74': 0, '75-84': 0, '85+': 0 };
    
    clients.forEach(client => {
      if (client.date_of_birth) {
        const age = new Date().getFullYear() - new Date(client.date_of_birth).getFullYear();
        if (age >= 65 && age < 75) ageGroups['65-74']++;
        else if (age >= 75 && age < 85) ageGroups['75-84']++;
        else if (age >= 85) ageGroups['85+']++;
      }
    });

    // Analyze service demand trends
    const serviceGrowth = {};
    referrals.forEach(ref => {
      ref.required_services?.forEach(service => {
        if (!serviceGrowth[service]) {
          serviceGrowth[service] = { name: service.replace(/_/g, ' '), count: 0, trend: 'stable' };
        }
        serviceGrowth[service].count++;
      });
    });

    // Forecast by branch demographics
    const branchForecast = branches.map(branch => {
      const branchClients = clients.filter(c => c.branch_id === branch.branch_id);
      const branchReferrals = referrals.filter(r => r.branch_id === branch.branch_id);
      
      // Calculate growth rate (simulated)
      const growthRate = branchReferrals.length > 0 ? (branchClients.length / branchReferrals.length) * 10 : 0;
      
      return {
        name: branch.branch_name,
        currentDemand: branchReferrals.length,
        clientBase: branchClients.length,
        forecastedDemand: Math.round(branchReferrals.length * (1 + growthRate / 100)),
        growthRate: growthRate.toFixed(1),
      };
    });

    // Monthly trend simulation
    const monthlyTrend = [
      { month: 'Jan', demand: 45, forecast: 48 },
      { month: 'Feb', demand: 52, forecast: 56 },
      { month: 'Mar', demand: 48, forecast: 62 },
      { month: 'Apr', demand: 61, forecast: 70 },
      { month: 'May', demand: 55, forecast: 72 },
      { month: 'Jun', demand: 68, forecast: 75 },
    ];

    return {
      ageGroups,
      serviceGrowth: Object.values(serviceGrowth).sort((a, b) => b.count - a.count),
      branchForecast,
      monthlyTrend,
    };
  }, [branches, clients, referrals]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ages 65-74</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demandAnalysis.ageGroups['65-74']}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ages 75-84</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demandAnalysis.ageGroups['75-84']}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ages 85+</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demandAnalysis.ageGroups['85+']}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
              <TrendingUp className="w-5 h-5" /> +18%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={demandAnalysis.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="demand" stroke="hsl(var(--primary))" name="Current Demand" />
              <Line type="monotone" dataKey="forecast" stroke="hsl(var(--chart-2)))" name="Forecasted Demand" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Demand Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demandAnalysis.serviceGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--chart-3)))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branch Demand Forecast (Next Quarter)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {demandAnalysis.branchForecast.map(branch => (
              <div key={branch.name} className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">{branch.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Current: {branch.currentDemand} | Forecast: {branch.forecastedDemand}
                  </p>
                </div>
                <Badge variant="outline" className={branch.growthRate > 10 ? 'bg-green-50' : ''}>
                  +{branch.growthRate}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}