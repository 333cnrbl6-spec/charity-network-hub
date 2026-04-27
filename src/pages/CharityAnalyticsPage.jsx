import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Target, AlertCircle, PoundSterling, Clock, Loader2 } from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function KPICard({ title, value, icon: Icon, color, sub }) { // eslint-disable-line no-unused-vars
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </div>
          <Icon className={`w-9 h-9 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CharityAnalyticsPage() {
  const { data: charities } = useQuery({ queryKey: ['charities'], queryFn: () => base44.entities.Charity.list() });
  const charity = charities?.[0];
  const cid = charity?.id;

  const { data: donations = [], isLoading: loadD } = useQuery({ queryKey: ['donations', cid], queryFn: () => cid ? base44.entities.Donation.filter({ charity_id: cid }) : [], enabled: !!cid });
  const { data: campaigns = [] } = useQuery({ queryKey: ['campaigns', cid], queryFn: () => cid ? base44.entities.Campaign.filter({ charity_id: cid }) : [], enabled: !!cid });
  const { data: volunteers = [] } = useQuery({ queryKey: ['volunteers', cid], queryFn: () => cid ? base44.entities.Volunteer.filter({ charity_id: cid }) : [], enabled: !!cid });
  const { data: grants = [] } = useQuery({ queryKey: ['grants', cid], queryFn: () => cid ? base44.entities.Grant.filter({ charity_id: cid }) : [], enabled: !!cid });
  const { data: donors = [] } = useQuery({ queryKey: ['donors', cid], queryFn: () => cid ? base44.entities.Donor.filter({ charity_id: cid }) : [], enabled: !!cid });

  // KPIs
  const totalFundsYTD = donations.filter(d => new Date(d.donation_date).getFullYear() === new Date().getFullYear()).reduce((s, d) => s + d.amount, 0);
  const activeVolunteers = volunteers.filter(v => v.availability !== 'unavailable');
  const totalVolHours = activeVolunteers.reduce((s, v) => s + (v.hours_contributed || 0), 0);
  const repeatingDonors = donors.filter(d => d.donation_frequency !== 'one_time').length;
  const retentionRate = donors.length > 0 ? Math.round((repeatingDonors / donors.length) * 100) : 0;
  const openGrantsValue = grants.filter(g => ['draft', 'submitted'].includes(g.status)).reduce((s, g) => s + g.amount, 0);
  const upcomingDeadlines = grants.filter(g => {
    const d = (new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return d >= 0 && d <= 30;
  }).length;

  // Monthly donations + target
  const currentYear = new Date().getFullYear();
  const monthlyTarget = charity?.annual_income ? Math.round(charity.annual_income / 12) : 5000;
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const amount = donations.filter(d => {
      const dt = new Date(d.donation_date);
      return dt.getMonth() === i && dt.getFullYear() === currentYear;
    }).reduce((s, d) => s + d.amount, 0);
    return {
      month: new Date(currentYear, i).toLocaleDateString('en-GB', { month: 'short' }),
      amount,
      target: monthlyTarget
    };
  });

  // Donors by source
  const sourceMap = {};
  donors.forEach(d => { sourceMap[d.source || 'other'] = (sourceMap[d.source || 'other'] || 0) + 1; });
  const donorBySource = Object.entries(sourceMap).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Volunteer hours by month (from hours_contributed distributed evenly)
  const volunteerMonthly = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(currentYear, i).toLocaleDateString('en-GB', { month: 'short' }),
    hours: Math.round(totalVolHours / 12)
  }));

  // Grant pipeline
  const grantPipeline = [
    { name: 'Draft', value: grants.filter(g => g.status === 'draft').length },
    { name: 'Submitted', value: grants.filter(g => g.status === 'submitted').length },
    { name: 'Awarded', value: grants.filter(g => g.status === 'awarded').length },
    { name: 'Rejected', value: grants.filter(g => g.status === 'rejected').length }
  ].filter(g => g.value > 0);

  // Campaign performance
  const campaignPerformance = campaigns.slice(0, 6).map(c => ({
    name: c.title.length > 20 ? c.title.slice(0, 20) + '…' : c.title,
    raised: c.raised_amount || 0,
    goal: c.goal_amount || 0,
    pct: c.goal_amount ? Math.round(((c.raised_amount || 0) / c.goal_amount) * 100) : 0
  }));

  if (loadD) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Impact Analytics</h1>
        <p className="text-gray-500 mt-1">{charity?.name} — Year to date performance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Funds Raised YTD" value={`£${totalFundsYTD.toLocaleString()}`} icon={PoundSterling} color="text-green-500" />
        <KPICard title="Active Volunteers" value={activeVolunteers.length} icon={Users} color="text-blue-500" sub={`${totalVolHours.toLocaleString()} hrs this month`} />
        <KPICard title="Donor Retention" value={`${retentionRate}%`} icon={TrendingUp} color="text-purple-500" sub={`${repeatingDonors} repeat donors`} />
        <KPICard title="Open Grant Value" value={`£${openGrantsValue.toLocaleString()}`} icon={Target} color="text-amber-500" />
        <KPICard title="Deadlines (30d)" value={upcomingDeadlines} icon={AlertCircle} color={upcomingDeadlines > 0 ? 'text-red-500' : 'text-gray-400'} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Monthly Donations vs Target</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `£${v}`} />
                <Tooltip formatter={(v) => `£${v.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} name="Raised" />
                <Area type="monotone" dataKey="target" stroke="#e2e8f0" fill="#f1f5f9" fillOpacity={0.4} name="Target" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Donor Acquisition by Source</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={donorBySource} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {donorBySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Volunteer Hours by Month</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={volunteerMonthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hours" fill="#06b6d4" name="Hours" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Grant Pipeline by Stage</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={grantPipeline} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Grants" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaign performance */}
      {campaignPerformance.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Campaign Performance Comparison</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={campaignPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `£${v}`} />
                <YAxis dataKey="name" type="category" width={140} />
                <Tooltip formatter={(v) => `£${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="raised" fill="#8b5cf6" name="Raised" radius={[0, 4, 4, 0]} />
                <Bar dataKey="goal" fill="#e2e8f0" name="Goal" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}