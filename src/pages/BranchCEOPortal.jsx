/**
 * BranchCEOPortal — for branch_ceo role
 * Full branch picture: all departments, financials, compliance, trustee-ready reports,
 * and connection to the national hub.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Briefcase, Gift, TrendingUp, ShieldCheck,
  AlertCircle, Network, Building2, BarChart3, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

export default function BranchCEOPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const branchId = user?.branch_id || 'bury';

  const { data: clients = [] } = useQuery({
    queryKey: ['ceo-clients'],
    queryFn: () => base44.entities.Client.list(),
  });
  const { data: volunteers = [] } = useQuery({
    queryKey: ['ceo-volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
  });
  const { data: jobs = [] } = useQuery({
    queryKey: ['ceo-jobs'],
    queryFn: () => base44.entities.Job.list('-scheduled_date', 100),
  });
  const { data: grants = [] } = useQuery({
    queryKey: ['ceo-grants'],
    queryFn: () => base44.entities.Grant.list(),
  });
  const { data: sessions = [] } = useQuery({
    queryKey: ['ceo-sessions'],
    queryFn: () => base44.entities.Session.list(),
  });
  const { data: compliance = [] } = useQuery({
    queryKey: ['ceo-compliance'],
    queryFn: () => base44.entities.ComplianceRecord.filter({ branch_id: branchId }),
  });
  const { data: branchReport } = useQuery({
    queryKey: ['ceo-report', branchId],
    queryFn: async () => {
      const all = await base44.entities.BranchReport.filter({ branch_id: branchId });
      return all.sort((a, b) => new Date(b.received_at) - new Date(a.received_at))[0];
    },
  });

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalGrantValue = grants.filter(g => g.status === 'awarded').reduce((s, g) => s + (g.amount_awarded || 0), 0);
  const complianceIssues = compliance.filter(c => c.status !== 'compliant');
  const activeVolunteers = volunteers.filter(v => v.status === 'active');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck, badge: complianceIssues.length },
    { id: 'hub', label: 'Hub Reports', icon: Globe },
  ];

  return (
    <div className="space-y-0">
      <div className="pb-4">
        <h1 className="text-2xl font-bold">CEO Dashboard</h1>
        <p className="text-muted-foreground text-sm">{user?.branch_name || 'Age UK Branch'} — Chief Executive Officer</p>
      </div>

      <nav className="bg-card border border-border rounded-lg px-4 overflow-x-auto mb-6">
        <div className="flex gap-1 min-w-max">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <Icon className="w-4 h-4" />{label}
              {badge > 0 && <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5">{badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Clients Served', value: clients.length, icon: Users, color: 'text-blue-600' },
                { label: 'Active Volunteers', value: activeVolunteers.length, icon: Users, color: 'text-green-600' },
                { label: 'Jobs Completed', value: completedJobs.length, icon: Briefcase, color: 'text-primary' },
                { label: 'Grant Income', value: `£${totalGrantValue.toLocaleString()}`, icon: Gift, color: 'text-amber-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5"><Icon className={`w-4 h-4 ${color}`} />{label}</CardTitle></CardHeader>
                  <CardContent><p className="text-3xl font-bold">{value}</p></CardContent>
                </Card>
              ))}
            </div>

            {/* Compliance flag */}
            {complianceIssues.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-red-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {complianceIssues.length} Compliance Issue{complianceIssues.length > 1 ? 's' : ''} Require Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {complianceIssues.slice(0, 3).map(c => (
                      <p key={c.id} className="text-xs text-red-800 capitalize">• {c.compliance_area?.replace(/_/g, ' ')} — <strong>{c.status?.replace(/_/g, ' ')}</strong></p>
                    ))}
                    {complianceIssues.length > 3 && <p className="text-xs text-red-700">...and {complianceIssues.length - 3} more</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick links to management */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Branch Dashboard', desc: 'Full branch operational view', path: `/branch/${branchId}`, icon: Building2 },
                { label: 'Compliance Detail', desc: 'Area-by-area compliance status', path: '/compliance', icon: ShieldCheck },
                { label: 'Grant Management', desc: 'Applications and awards', path: '/grants', icon: Gift },
                { label: 'Impact Report', desc: 'Service outcomes and reach', path: '/impact', icon: TrendingUp },
                { label: 'Sync to Hub', desc: 'Submit monthly report', path: '/sync-log', icon: Network },
                { label: 'Team Records', desc: 'Volunteers and staff', path: '/volunteers', icon: Users },
              ].map(({ label, desc, path, icon: Icon }) => (
                <Link key={label} to={path}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2"><Icon className="w-4 h-4 text-primary" />{label}</CardTitle>
                      <CardDescription className="text-xs">{desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Branch Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Job Completion Rate</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">
                    {jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{completedJobs.length} of {jobs.length} jobs completed</p>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0}%` }} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Volunteer Retention</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-green-600">
                    {volunteers.length > 0 ? Math.round((activeVolunteers.length / volunteers.length) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{activeVolunteers.length} active of {volunteers.length} total</p>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${volunteers.length > 0 ? (activeVolunteers.length / volunteers.length) * 100 : 0}%` }} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Sessions Delivered</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{sessions.filter(s => s.status === 'completed').length}</p>
                  <p className="text-xs text-muted-foreground mt-1">of {sessions.length} scheduled</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Grant Success Rate</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-amber-600">
                    {grants.length > 0 ? Math.round((grants.filter(g => g.status === 'awarded').length / grants.filter(g => g.status !== 'applied').length) * 100) || 0 : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{grants.filter(g => g.status === 'awarded').length} awarded of {grants.filter(g => g.status !== 'applied').length} decided</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Compliance Register</h2>
            {compliance.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No compliance records found.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {compliance.map(rec => (
                  <Card key={rec.id} className={rec.status === 'non_compliant' ? 'border-red-300' : rec.status === 'at_risk' ? 'border-amber-300' : ''}>
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${rec.status === 'compliant' ? 'bg-green-500' : rec.status === 'non_compliant' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{rec.compliance_area?.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">{rec.assigned_to && `Assigned: ${rec.assigned_to}`}{rec.deadline && ` • Due: ${format(parseISO(rec.deadline), 'd MMM yyyy')}`}</p>
                      </div>
                      <Badge variant={rec.status === 'compliant' ? 'default' : rec.status === 'non_compliant' ? 'destructive' : 'secondary'} className="text-xs flex-shrink-0 capitalize">
                        {rec.status?.replace(/_/g, ' ')}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'hub' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Hub Reporting</h2>
            {branchReport ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2"><Network className="w-4 h-4 text-primary" /> Last Submitted Report</CardTitle>
                  <CardDescription>Period: {branchReport.report_period} • Received: {branchReport.received_at && format(parseISO(branchReport.received_at), 'd MMM yyyy HH:mm')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    {[
                      { label: 'Total Clients', v: branchReport.stats?.total_clients },
                      { label: 'New Clients', v: branchReport.stats?.new_clients },
                      { label: 'Active Volunteers', v: branchReport.stats?.active_volunteers },
                      { label: 'Completed Jobs', v: branchReport.stats?.completed_jobs },
                    ].map(({ label, v }) => (
                      <div key={label} className="bg-muted/40 rounded-lg p-3">
                        <p className="text-xl font-bold">{v ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant={branchReport.status === 'validated' ? 'default' : 'secondary'} className="capitalize">
                      {branchReport.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">No hub reports submitted yet.</CardContent>
              </Card>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p className="font-semibold mb-1">📋 Monthly Reporting Obligations</p>
              <p className="text-xs">Under your Brand Partner Agreement, your branch submits aggregate statistics to the national hub each month. This includes client counts, volunteer activity, job outcomes, and grant totals. Individual client data remains confidential to your branch.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}