/**
 * GovernancePortal — for national_governance (Trustee/Board) role
 * Read-only strategic view: KPIs across the network, compliance status,
 * impact metrics, financials summary. No operational controls.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Gift, LogOut, TrendingUp, ShieldCheck, Globe, Network,
  BarChart3, FileText, AlertTriangle, CheckCircle2, Scale
} from 'lucide-react';

export default function GovernancePortal() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: clients = [] } = useQuery({
    queryKey: ['gov-clients'],
    queryFn: () => base44.entities.Client.list(),
  });
  const { data: volunteers = [] } = useQuery({
    queryKey: ['gov-volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
  });
  const { data: grants = [] } = useQuery({
    queryKey: ['gov-grants'],
    queryFn: () => base44.entities.Grant.list(),
  });
  const { data: branchReports = [] } = useQuery({
    queryKey: ['gov-reports'],
    queryFn: () => base44.entities.BranchReport.list(),
  });
  const { data: compliance = [] } = useQuery({
    queryKey: ['gov-compliance'],
    queryFn: () => base44.entities.ComplianceRecord.list(),
  });
  const { data: branchConfigs = [] } = useQuery({
    queryKey: ['gov-branches'],
    queryFn: () => base44.entities.BranchConfig.list(),
  });
  const { data: jobs = [] } = useQuery({
    queryKey: ['gov-jobs'],
    queryFn: () => base44.entities.Job.list(),
  });

  const totalGrantValue = grants.filter(g => g.status === 'awarded').reduce((s, g) => s + (g.amount_awarded || 0), 0);
  const networkClients = branchReports.reduce((s, r) => s + (r.stats?.total_clients || 0), 0);
  const networkVolunteers = volunteers.filter(v => v.status === 'active').length;
  const complianceIssues = compliance.filter(c => c.status === 'non_compliant' || c.status === 'at_risk');
  const complianceOk = compliance.filter(c => c.status === 'compliant').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;

  // Branches reporting recently (within 30 days)
  const activeBranches = branchConfigs.filter(b => b.status === 'active').length;

  const tabs = [
    { id: 'dashboard', label: 'Strategic Overview', icon: BarChart3 },
    { id: 'network', label: 'Network Health', icon: Globe },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck, badge: complianceIssues.length },
    { id: 'impact', label: 'Impact', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow">
        <div>
          <p className="text-xs opacity-70">Age UK Network — Board of Trustees</p>
          <h1 className="text-xl font-bold">{user?.full_name || 'Trustee'} — Governance Portal</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-white/20 text-white border-white/30 text-xs">{user?.job_title || 'Trustee'}</Badge>
          <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/20" onClick={() => logout()}>
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Log Out
          </Button>
        </div>
      </header>

      <nav className="bg-card border-b px-6 overflow-x-auto">
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

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Read-only banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2 text-xs text-blue-800">
          <Scale className="w-3.5 h-3.5 flex-shrink-0" />
          <span><strong>Governance View:</strong> Strategic read-only access. Operational controls are available to executive staff.</span>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Network Strategic Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Branches', value: activeBranches, icon: Network, color: 'text-primary', sub: 'in network' },
                { label: 'Clients Served', value: networkClients.toLocaleString(), icon: Users, color: 'text-blue-600', sub: 'across network' },
                { label: 'Volunteers', value: networkVolunteers.toLocaleString(), icon: Users, color: 'text-green-600', sub: 'active' },
                { label: 'Grant Income', value: `£${(totalGrantValue / 1000).toFixed(0)}k`, icon: Gift, color: 'text-amber-600', sub: 'awarded' },
              ].map(({ label, value, icon: Icon, color, sub }) => (
                <Card key={label}>
                  <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5"><Icon className={`w-4 h-4 ${color}`} />{label}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mission alignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Mission Alignment</CardTitle>
                <CardDescription>Progress against charitable objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { obj: 'Reduce social isolation among older people', metric: `${completedJobs.toLocaleString()} support visits completed`, pct: Math.min(100, Math.round((completedJobs / 1000) * 100)) },
                    { obj: 'Improve financial wellbeing through benefits advice', metric: `£${(totalGrantValue / 1000).toFixed(0)}k in grants/benefits accessed`, pct: Math.min(100, Math.round((totalGrantValue / 50000) * 100)) },
                    { obj: 'Maintain volunteer engagement and capacity', metric: `${networkVolunteers} active volunteers`, pct: Math.min(100, Math.round((networkVolunteers / 50) * 100)) },
                  ].map(({ obj, metric, pct }) => (
                    <div key={obj}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm">{obj}</p>
                        <span className="text-sm font-bold text-primary flex-shrink-0">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{metric}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trustee reminders */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">📋 Trustee Duties Reminder</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-1.5 text-muted-foreground">
                  <li>• Monitor strategic objectives and overall performance against annual plan</li>
                  <li>• Ensure financial sustainability — review budget vs actuals quarterly</li>
                  <li>• Safeguarding oversight: any escalated issues are flagged in the Compliance tab</li>
                  <li>• Brand Partner Agreement obligations: ensure branch operates within Age UK framework</li>
                  <li>• CEO appraisal: annual performance review of Chief Officer</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Network Health</h2>
            <div className="grid gap-3">
              {branchConfigs.map(branch => {
                const latestReport = branchReports
                  .filter(r => r.branch_id === branch.branch_id)
                  .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))[0];
                const isActive = branch.status === 'active';
                const hasReport = !!latestReport;
                return (
                  <Card key={branch.id}>
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isActive && hasReport ? 'bg-green-500' : isActive ? 'bg-amber-500' : 'bg-red-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{branch.branch_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {hasReport ? `Last report: ${latestReport.report_period}` : 'No report received'}
                          {latestReport?.stats?.total_clients && ` • ${latestReport.stats.total_clients} clients`}
                        </p>
                      </div>
                      <Badge variant={isActive && hasReport ? 'default' : isActive ? 'secondary' : 'destructive'} className="text-xs">
                        {isActive && hasReport ? 'Reporting' : isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
              {branchConfigs.length === 0 && (
                <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">No branches registered.</CardContent></Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Network Compliance</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <Card><CardContent className="pt-4"><p className="text-3xl font-bold text-green-600">{complianceOk}</p><p className="text-xs text-muted-foreground mt-1">Compliant</p></CardContent></Card>
              <Card><CardContent className="pt-4"><p className="text-3xl font-bold text-amber-600">{compliance.filter(c => c.status === 'at_risk').length}</p><p className="text-xs text-muted-foreground mt-1">At Risk</p></CardContent></Card>
              <Card><CardContent className="pt-4"><p className="text-3xl font-bold text-red-600">{compliance.filter(c => c.status === 'non_compliant').length}</p><p className="text-xs text-muted-foreground mt-1">Non-Compliant</p></CardContent></Card>
            </div>
            {complianceIssues.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Issues Requiring Board Awareness</h3>
                {complianceIssues.map(rec => (
                  <Card key={rec.id} className={rec.status === 'non_compliant' ? 'border-red-300' : 'border-amber-300'}>
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      {rec.status === 'non_compliant' ? <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{rec.branch_name} — <span className="capitalize">{rec.compliance_area?.replace(/_/g, ' ')}</span></p>
                        <p className="text-xs text-muted-foreground">{rec.notes || 'No additional notes'}</p>
                      </div>
                      <Badge variant={rec.status === 'non_compliant' ? 'destructive' : 'secondary'} className="text-xs capitalize">{rec.status?.replace(/_/g, ' ')}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-sm text-green-900">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>All compliance areas are currently marked compliant. No board escalation required.</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Social Impact Report</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Total Support Visits</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold">{completedJobs.toLocaleString()}</p><p className="text-xs text-muted-foreground mt-1">completed jobs across network</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Financial Benefits Accessed</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold text-green-600">£{(totalGrantValue / 1000).toFixed(0)}k</p><p className="text-xs text-muted-foreground mt-1">in grants & benefits for clients</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Volunteer Community</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold">{networkVolunteers}</p><p className="text-xs text-muted-foreground mt-1">active volunteers in network</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">People Supported</CardTitle></CardHeader>
                <CardContent><p className="text-4xl font-bold">{clients.length.toLocaleString()}</p><p className="text-xs text-muted-foreground mt-1">clients in database</p></CardContent>
              </Card>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">📊 For Annual Report / Trustee Board Pack:</p>
              <p>These figures represent the aggregate activity reported by all branches to the national hub. Individual client data remains confidential to each branch in line with GDPR obligations. The full impact report (including year-on-year comparisons) is available via the Impact Dashboard.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}