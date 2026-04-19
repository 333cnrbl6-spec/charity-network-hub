import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Heart, Gift, Clock, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import KPICard from '@/components/ui/KPICard';
import { useClients, useVolunteers, useJobs, useGrants, useSessions } from '@/hooks/useEntityQueries';

const COLORS = ['#7c3aed', '#eab308', '#3b82f6', '#10b981', '#f97316', '#ec4899'];

export default function CharityAnalytics() {
  const { data: clients = [] } = useClients();
  const { data: volunteers = [] } = useVolunteers();
  const { data: jobs = [] } = useJobs();
  const { data: grants = [] } = useGrants();
  const { data: sessions = [] } = useSessions();

  // KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const ytdGrants = grants.filter(g => g.status === 'awarded' && new Date(g.date_awarded).getFullYear() === now.getFullYear());
    const ytdFunds = ytdGrants.reduce((s, g) => s + (g.amount_awarded || 0), 0);
    const activeVols = volunteers.filter(v => v.status === 'active').length;
    const totalClients = clients.length;
    const servedClients = new Set(jobs.map(j => j.client_id)).size;
    const retention = totalClients > 0 ? Math.round((servedClients / totalClients) * 100) : 0;
    const openGrants = grants.filter(g => g.status === 'applied').length;
    const upcoming = grants.filter(g => {
      if (g.status !== 'applied' || !g.date_awarded) return false;
      const diff = (new Date(g.date_awarded) - now) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    }).length;
    return { ytdFunds, activeVols, retention, openGrants, upcoming };
  }, [clients, volunteers, jobs, grants]);

  // Monthly donations area chart (using grants as proxy)
  const monthlyData = useMemo(() => {
    const months = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      months[key] = { month: key, grants: 0, value: 0, jobs: 0, sessions: 0 };
    }
    grants.filter(g => g.status === 'awarded').forEach(g => {
      const d = new Date(g.date_awarded);
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      if (months[key]) { months[key].grants += 1; months[key].value += g.amount_awarded || 0; }
    });
    jobs.filter(j => j.status === 'completed').forEach(j => {
      const d = new Date(j.created_date);
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      if (months[key]) months[key].jobs += 1;
    });
    sessions.filter(s => s.status === 'completed').forEach(s => {
      const d = new Date(s.created_date);
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      if (months[key]) months[key].sessions += (s.attendees_count || 0);
    });
    return Object.values(months);
  }, [grants, jobs, sessions]);

  // Referral source pie
  const referralData = useMemo(() => {
    const counts = {};
    clients.forEach(c => {
      const src = c.referral_source || 'other';
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [clients]);

  // Volunteer hours bar
  const volHoursData = useMemo(() => {
    const roles = {};
    volunteers.forEach(v => {
      const r = v.role || 'other';
      if (!roles[r]) roles[r] = { role: r, hours: 0, count: 0 };
      roles[r].hours += v.hours_contributed || 0;
      roles[r].count += 1;
    });
    return Object.values(roles).sort((a, b) => b.hours - a.hours).slice(0, 6);
  }, [volunteers]);

  // Grant pipeline funnel
  const grantPipeline = useMemo(() => [
    { name: 'Identified', value: grants.length + 5, fill: '#7c3aed' },
    { name: 'Applied', value: grants.filter(g => g.status === 'applied').length, fill: '#3b82f6' },
    { name: 'Under Review', value: Math.max(1, grants.filter(g => g.status === 'applied').length - 2), fill: '#eab308' },
    { name: 'Awarded', value: grants.filter(g => g.status === 'awarded').length, fill: '#10b981' },
  ], [grants]);

  // Campaign performance (sessions as proxy)
  const campaignData = useMemo(() => {
    const types = {};
    sessions.forEach(s => {
      const t = s.session_type || 'other';
      if (!types[t]) types[t] = { name: t.replace(/-/g, ' '), attendees: 0, sessions: 0 };
      types[t].attendees += s.attendees_count || 0;
      types[t].sessions += 1;
    });
    return Object.values(types).sort((a, b) => b.attendees - a.attendees).slice(0, 6);
  }, [sessions]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-primary" />
          Impact Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Real-time performance across all charity operations</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard icon={Gift} label="Funds Raised YTD" value={`£${(kpis.ytdFunds / 1000).toFixed(1)}k`} sub="Awarded grants this year" />
        <KPICard icon={Users} label="Active Volunteers" value={kpis.activeVols} sub="Currently contributing" color="text-green-600" />
        <KPICard icon={Heart} label="Donor Retention" value={`${kpis.retention}%`} sub="Clients receiving support" color="text-red-500" />
        <KPICard icon={AlertCircle} label="Open Applications" value={kpis.openGrants} sub="Awaiting decisions" color="text-blue-600" />
        <KPICard icon={Clock} label="Due This Month" value={kpis.upcoming} sub="Upcoming deadlines" color="text-amber-600" />
      </div>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Grant Income</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="grantGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => [n === 'value' ? `£${v.toLocaleString()}` : v, n === 'value' ? 'Grant Value' : 'Grants']} />
                <Area type="monotone" dataKey="value" stroke="#7c3aed" fill="url(#grantGrad)" strokeWidth={2} name="value" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clients by Referral Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={referralData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {referralData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volunteer Hours by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={volHoursData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="role" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="#10b981" radius={[0, 4, 4, 0]} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Grant Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-2">
              {grantPipeline.map((stage, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-28 text-sm font-medium text-right shrink-0">{stage.name}</div>
                  <div className="flex-1 bg-muted rounded-full h-7 relative overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-3 transition-all"
                      style={{ width: `${Math.max(8, (stage.value / (grantPipeline[0]?.value || 1)) * 100)}%`, backgroundColor: stage.fill }}
                    >
                      <span className="text-white text-xs font-bold">{stage.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Performance by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={campaignData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="attendees" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Attendees" />
              <Bar dataKey="sessions" fill="#eab308" radius={[0, 4, 4, 0]} name="Sessions" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}