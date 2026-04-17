import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

// Real-time mock data - replace with SynergyFlow API calls
const COLLECTIVE_METRICS = [
  { product: 'Age UK Bury', readiness: 92, impact: 88, growth: 12, clients: 1240, status: 'operational' },
  { product: 'Premiso', readiness: 78, impact: 71, growth: 8, clients: 650, status: 'operational' },
  { product: 'Species Explorer', readiness: 65, impact: 62, growth: 15, clients: 2100, status: 'developing' },
  { product: 'CaseNarrative', readiness: 71, impact: 68, growth: 5, clients: 890, status: 'operational' }
];

const HISTORICAL_PERFORMANCE = [
  { month: 'Feb', 'Age UK Bury': 88, 'Premiso': 74, 'Species Explorer': 58, 'CaseNarrative': 66 },
  { month: 'Mar', 'Age UK Bury': 90, 'Premiso': 76, 'Species Explorer': 62, 'CaseNarrative': 69 },
  { month: 'Apr', 'Age UK Bury': 92, 'Premiso': 78, 'Species Explorer': 65, 'CaseNarrative': 71 }
];

const READINESS_RADAR = [
  { category: 'Technical', 'Age UK Bury': 95, Premiso: 82, 'Species Explorer': 68, CaseNarrative: 75 },
  { category: 'Commercial', 'Age UK Bury': 88, Premiso: 75, 'Species Explorer': 58, CaseNarrative: 68 },
  { category: 'Data', 'Age UK Bury': 92, Premiso: 80, 'Species Explorer': 62, CaseNarrative: 72 },
  { category: 'Team', 'Age UK Bury': 90, Premiso: 78, 'Species Explorer': 65, CaseNarrative: 70 },
  { category: 'Compliance', 'Age UK Bury': 94, Premiso: 76, 'Species Explorer': 70, CaseNarrative: 73 }
];

const getStatusColor = (readiness) => {
  if (readiness >= 85) return 'text-green-600 bg-green-50';
  if (readiness >= 70) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
};

const getStatusIcon = (status) => {
  return status === 'operational' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
};

export default function CollectivePerformanceChart() {
  const collectiveReadiness = Math.round(COLLECTIVE_METRICS.reduce((sum, m) => sum + m.readiness, 0) / COLLECTIVE_METRICS.length);
  const totalClients = COLLECTIVE_METRICS.reduce((sum, m) => sum + m.clients, 0);
  const avgGrowth = Math.round(COLLECTIVE_METRICS.reduce((sum, m) => sum + m.growth, 0) / COLLECTIVE_METRICS.length);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collective Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getStatusColor(collectiveReadiness).split(' ')[0]}`}>
              {collectiveReadiness}%
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 2 points this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collective Client Base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClients.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-2">↑ 8% growth QoQ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgGrowth}%</div>
            <p className="text-xs text-muted-foreground mt-2">Current month average</p>
          </CardContent>
        </Card>
      </div>

      {/* Product Readiness Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Product Readiness Status
          </CardTitle>
          <CardDescription>Real-time operational readiness across all portfolio products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLLECTIVE_METRICS.map(metric => (
              <div key={metric.product} className={`rounded-lg p-4 ${getStatusColor(metric.readiness)}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm">{metric.product}</h3>
                  {getStatusIcon(metric.status)}
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold">{metric.readiness}%</div>
                    <p className="text-xs opacity-75">Readiness</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="opacity-75">Impact</p>
                      <p className="font-semibold">{metric.impact}%</p>
                    </div>
                    <div>
                      <p className="opacity-75">Growth</p>
                      <p className="font-semibold">+{metric.growth}%</p>
                    </div>
                  </div>
                  <p className="text-xs opacity-75 border-t border-current border-opacity-20 pt-2 mt-2">
                    {metric.clients.toLocaleString()} clients
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Readiness Trend (3 Months)</CardTitle>
          <CardDescription>Collective progress across all products</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={HISTORICAL_PERFORMANCE}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="Age UK Bury" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="Premiso" stroke="hsl(var(--secondary))" strokeWidth={2} />
              <Line type="monotone" dataKey="Species Explorer" stroke="hsl(var(--chart-3))" strokeWidth={2} />
              <Line type="monotone" dataKey="CaseNarrative" stroke="hsl(var(--chart-4))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Readiness Dimensions Radar */}
      <Card>
        <CardHeader>
          <CardTitle>Readiness Dimensions</CardTitle>
          <CardDescription>Multi-dimensional assessment across critical areas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={READINESS_RADAR}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
              <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
              <Radar name="Age UK Bury" dataKey="Age UK Bury" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
              <Radar name="Premiso" dataKey="Premiso" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.1} />
              <Radar name="Species Explorer" dataKey="Species Explorer" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.1} />
              <Radar name="CaseNarrative" dataKey="CaseNarrative" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.1} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}