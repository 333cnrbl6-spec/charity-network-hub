import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SaaSMetricsDashboard() {
  const { data: metrics = [] } = useQuery({
    queryKey: ['saasMetrics'],
    queryFn: async () => {
      const res = await base44.entities.SaaSMetric.list('-metric_date', 90);
      return res;
    },
    refetchInterval: 3600000 // hourly
  });

  const currentMetric = metrics[0];
  const previousMetric = metrics[1];

  const calculateChange = (current, previous, field) => {
    if (!previous || !current) return 0;
    const curr = current[field] || 0;
    const prev = previous[field] || 0;
    return ((curr - prev) / prev * 100).toFixed(1);
  };

  const KPICard = ({ title, value, change, icon: IconComponent, color }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {change !== null && (
              <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <IconComponent className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SaaS Metrics</h1>
        <p className="text-muted-foreground">Business KPIs and financial performance</p>
      </div>

      {currentMetric && (
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            title="MRR"
            value={`£${currentMetric.mrr?.toLocaleString()}`}
            change={calculateChange(currentMetric, previousMetric, 'mrr')}
            icon={DollarSign}
            color="bg-blue-100"
          />
          <KPICard
            title="ARR"
            value={`£${currentMetric.arr?.toLocaleString()}`}
            change={calculateChange(currentMetric, previousMetric, 'arr')}
            icon={TrendingUp}
            color="bg-green-100"
          />
          <KPICard
            title="Active Customers"
            value={currentMetric.active_customers}
            change={calculateChange(currentMetric, previousMetric, 'active_customers')}
            icon={Users}
            color="bg-purple-100"
          />
          <KPICard
            title="Churn Rate"
            value={`${currentMetric.churn_rate?.toFixed(1)}%`}
            change={-calculateChange(currentMetric, previousMetric, 'churn_rate')}
            icon={AlertTriangle}
            color="bg-orange-100"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (30 days)</CardTitle>
            <CardDescription>MRR over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.slice(0, 30).reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric_date" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value}`} />
                <Line type="monotone" dataKey="mrr" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Acquisition & Churn</CardTitle>
            <CardDescription>Monthly changes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.slice(0, 12).reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric_date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="new_customers" fill="#10b981" name="New" />
                <Bar dataKey="churn_rate" fill="#ef4444" name="Churn %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {currentMetric && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">CAC</CardTitle>
              <CardDescription>Customer Acquisition Cost</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">£{currentMetric.cac?.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">LTV</CardTitle>
              <CardDescription>Lifetime Value (3yr)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">£{currentMetric.ltv?.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Retention Rate</CardTitle>
              <CardDescription>Month over month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currentMetric.customer_retention_rate?.toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {currentMetric?.failed_payments > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-semibold">⚠️ {currentMetric.failed_payments} Failed Payments</p>
                <p className="text-sm text-red-600">Automatic retries scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}