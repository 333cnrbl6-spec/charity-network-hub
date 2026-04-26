import React from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Target, AlertCircle, DollarSign } from 'lucide-react';

export default function ImpactAnalyticsDashboard({ charityData, donations = [], campaigns = [], volunteers = [], grants = [] }) {
  // Calculate KPIs
  const totalFundsYTD = donations.reduce((sum, d) => sum + d.amount, 0);
  const activeVolunteers = volunteers.filter(v => v.availability !== 'unavailable').length;
  const retentionRate = donations.length > 0 ? Math.round((donations.filter(d => d.payment_method !== 'one_time').length / donations.length) * 100) : 0;
  const openGrants = grants.filter(g => g.status === 'draft' || g.status === 'submitted').length;
  const upcomingDeadlines = grants.filter(g => {
    const deadline = new Date(g.deadline);
    const daysUntil = (deadline - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntil > 0 && daysUntil <= 30;
  }).length;

  // Monthly donations data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(new Date().getFullYear(), i, 1);
    const monthDonations = donations.filter(d => {
      const donDate = new Date(d.donation_date);
      return donDate.getMonth() === i && donDate.getFullYear() === new Date().getFullYear();
    });
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      amount: monthDonations.reduce((sum, d) => sum + d.amount, 0)
    };
  });

  // Donor by source
  const donorBySource = ['website', 'event', 'referral', 'corporate', 'grant'].map(source => ({
    name: source.charAt(0).toUpperCase() + source.slice(1),
    value: donations.filter(d => d.donor.source === source).length
  })).filter(d => d.value > 0);

  // Volunteer hours by month
  const volunteerHoursData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(new Date().getFullYear(), i, 1).toLocaleDateString('en-US', { month: 'short' }),
    hours: Math.floor(Math.random() * 100) + 20
  }));

  // Grant pipeline funnel
  const grantPipelineData = [
    { name: 'Draft', value: grants.filter(g => g.status === 'draft').length },
    { name: 'Submitted', value: grants.filter(g => g.status === 'submitted').length },
    { name: 'Awarded', value: grants.filter(g => g.status === 'awarded').length }
  ];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Funds Raised YTD</p>
                <p className="text-2xl font-bold">£{totalFundsYTD.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Volunteers</p>
                <p className="text-2xl font-bold">{activeVolunteers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Retention Rate</p>
                <p className="text-2xl font-bold">{retentionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Open Grants</p>
                <p className="text-2xl font-bold">{openGrants}</p>
              </div>
              <Target className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={upcomingDeadlines > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Deadlines This Month</p>
                <p className="text-2xl font-bold">{upcomingDeadlines}</p>
              </div>
              <AlertCircle className={`w-8 h-8 ${upcomingDeadlines > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `£${value}`} />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donors by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={donorBySource} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {donorBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volunteer Hours by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volunteerHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grant Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={grantPipelineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}