/**
 * BranchOpsPortal — for branch_operations_manager and branch_service_manager
 * Shows: branch-wide operations, all departments, staff scheduling, compliance, financials
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Briefcase, CalendarDays, Gift, TrendingUp,
  ShieldCheck, CheckCircle2, AlertCircle, Clock, ClipboardList, Building2, Upload
} from 'lucide-react';
import AIFileDropZone from '@/components/import/AIFileDropZone';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

export default function BranchOpsPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const branchId = user?.branch_id || 'bury';

  const { data: clients = [] } = useQuery({
    queryKey: ['ops-clients', branchId],
    queryFn: () => base44.entities.Client.filter({ status: 'active' }),
  });
  const { data: volunteers = [] } = useQuery({
    queryKey: ['ops-volunteers', branchId],
    queryFn: () => base44.entities.Volunteer.filter({ status: 'active' }),
  });
  const { data: jobs = [] } = useQuery({
    queryKey: ['ops-jobs', branchId],
    queryFn: () => base44.entities.Job.list('-scheduled_date', 50),
  });
  const { data: sessions = [] } = useQuery({
    queryKey: ['ops-sessions', branchId],
    queryFn: () => base44.entities.Session.list('-scheduled_date', 20),
  });
  const { data: grants = [] } = useQuery({
    queryKey: ['ops-grants', branchId],
    queryFn: () => base44.entities.Grant.list(),
  });
  const { data: compliance = [] } = useQuery({
    queryKey: ['ops-compliance', branchId],
    queryFn: () => base44.entities.ComplianceRecord.filter({ branch_id: branchId }),
  });

  const completedJobs = jobs.filter(j => j.status === 'completed');
  const pendingJobs = jobs.filter(j => j.status === 'scheduled');
  const awardsGrantsValue = grants.filter(g => g.status === 'awarded').reduce((s, g) => s + (g.amount_awarded || 0), 0);
  const complianceAt_risk = compliance.filter(c => c.status === 'at_risk' || c.status === 'non_compliant');
  const dbsExpiring = volunteers.filter(v => {
    if (!v.dbs_expiry) return false;
    const exp = new Date(v.dbs_expiry);
    const in60Days = new Date();
    in60Days.setDate(in60Days.getDate() + 60);
    return exp < in60Days;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'staff', label: 'Staff & Volunteers', icon: Users, badge: dbsExpiring.length },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck, badge: complianceAt_risk.length },
    { id: 'finance', label: 'Finance', icon: Gift },
    { id: 'import', label: 'Import Data', icon: Upload },
  ];

  const isOpsManager = user?.org_role === 'branch_operations_manager';

  return (
    <div className="space-y-0">
      <div className="pb-4">
        <h1 className="text-2xl font-bold">{isOpsManager ? 'Operations Dashboard' : 'Service Manager Dashboard'}</h1>
        <p className="text-muted-foreground text-sm">{user?.branch_name || 'Age UK Branch'}</p>
      </div>

      <nav className="bg-card border border-border rounded-lg px-4 overflow-x-auto mb-6">
        <div className="flex gap-1 min-w-max">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
              {badge > 0 && <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-1.5 py-0.5">{badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Clients', value: clients.length, icon: Users, color: 'text-blue-600' },
                { label: 'Active Volunteers', value: volunteers.length, icon: ClipboardList, color: 'text-green-600' },
                { label: 'Jobs Logged', value: jobs.length, icon: Briefcase, color: 'text-primary' },
                { label: 'Grants Awarded', value: `£${awardsGrantsValue.toLocaleString()}`, icon: Gift, color: 'text-amber-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5"><Icon className={`w-4 h-4 ${color}`} />{label}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-3xl font-bold">{value}</p></CardContent>
                </Card>
              ))}
            </div>

            {/* Import prompt when no operational data */}
            {clients.length === 0 && jobs.length === 0 && volunteers.length === 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Upload className="w-4 h-4 text-primary" /> No operational data yet — import to get started</CardTitle>
                  <p className="text-xs text-muted-foreground">Drop a spreadsheet, PDF or Word doc and AI will extract clients, jobs or volunteers for you.</p>
                </CardHeader>
                <CardContent>
                  <AIFileDropZone compact onImportComplete={() => {}} />
                </CardContent>
              </Card>
            )}

            {/* Alerts */}
            {(complianceAt_risk.length > 0 || dbsExpiring.length > 0) && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-900 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Attention Required</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {complianceAt_risk.length > 0 && (
                    <p className="text-sm text-amber-800">• <strong>{complianceAt_risk.length} compliance area{complianceAt_risk.length > 1 ? 's' : ''}</strong> at risk or non-compliant</p>
                  )}
                  {dbsExpiring.length > 0 && (
                    <p className="text-sm text-amber-800">• <strong>{dbsExpiring.length} DBS check{dbsExpiring.length > 1 ? 's' : ''}</strong> expiring within 60 days</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Job performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Job Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-2xl font-bold text-green-600">{completedJobs.length}</p><p className="text-xs text-muted-foreground">Completed</p></div>
                  <div><p className="text-2xl font-bold text-amber-600">{pendingJobs.length}</p><p className="text-xs text-muted-foreground">Pending</p></div>
                  <div><p className="text-2xl font-bold text-primary">{jobs.length > 0 ? Math.round((completedJobs.length / jobs.length) * 100) : 0}%</p><p className="text-xs text-muted-foreground">Completion Rate</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Staff & Volunteers</h2>
              <Badge variant="outline">{volunteers.length} active</Badge>
            </div>
            {dbsExpiring.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
                ⚠ <strong>{dbsExpiring.length} DBS checks</strong> expiring within 60 days — action required
              </div>
            )}
            <div className="grid gap-3">
              {volunteers.map(vol => {
                const dbsExpiring = vol.dbs_expiry && new Date(vol.dbs_expiry) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
                return (
                  <Card key={vol.id} className={dbsExpiring ? 'border-amber-300' : ''}>
                    <CardContent className="py-3 px-4 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                        {vol.full_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{vol.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{vol.role?.replace(/-/g, ' ')} • {vol.hours_contributed || 0}hrs</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {vol.dbs_checked ? (
                          <Badge className={`text-xs ${dbsExpiring ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-green-100 text-green-700 border-green-200'}`}>
                            DBS {dbsExpiring ? '⚠ Expiring' : '✓'}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">No DBS</Badge>
                        )}
                        <Badge variant={vol.status === 'active' ? 'default' : 'outline'} className="text-xs">{vol.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Jobs</h2>
              <div className="flex gap-2">
                <Badge variant="outline">{completedJobs.length} completed</Badge>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">{pendingJobs.length} pending</Badge>
              </div>
            </div>
            <div className="space-y-2">
              {jobs.slice(0, 40).map(job => (
                <Card key={job.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${job.status === 'completed' ? 'bg-green-500' : job.status === 'cancelled' ? 'bg-red-400' : 'bg-amber-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{job.client_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {job.job_type?.replace(/-/g, ' ')} • {job.volunteer_name || 'Unassigned'}
                        {job.scheduled_date && ` • ${format(parseISO(job.scheduled_date), 'd MMM')}`}
                      </p>
                    </div>
                    <Badge variant={job.status === 'completed' ? 'default' : job.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-xs flex-shrink-0">
                      {job.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Compliance Overview</h2>
            {compliance.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No compliance records found for {user?.branch_name}.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {compliance.map(rec => (
                  <Card key={rec.id} className={rec.status === 'non_compliant' ? 'border-red-300' : rec.status === 'at_risk' ? 'border-amber-300' : ''}>
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      {rec.status === 'compliant'
                        ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : rec.status === 'non_compliant'
                          ? <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          : <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{rec.compliance_area?.replace(/_/g, ' ')}</p>
                        {rec.deadline && <p className="text-xs text-muted-foreground">Deadline: {format(parseISO(rec.deadline), 'd MMM yyyy')}</p>}
                      </div>
                      <Badge
                        variant={rec.status === 'compliant' ? 'default' : rec.status === 'non_compliant' ? 'destructive' : 'secondary'}
                        className="text-xs flex-shrink-0 capitalize"
                      >
                        {rec.status?.replace(/_/g, ' ')}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'import' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Import Data</h2>
              <p className="text-sm text-muted-foreground">Drop any file — Excel, CSV, PDF, Word or image — and AI will read and guide you through importing it into the system.</p>
            </div>
            <AIFileDropZone onImportComplete={() => {}} />
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Financial Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Grants Awarded</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-green-600">£{awardsGrantsValue.toLocaleString()}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Pending Applications</CardTitle></CardHeader>
                <CardContent><p className="text-3xl font-bold text-amber-600">{grants.filter(g => g.status === 'applied').length}</p></CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Grant Applications</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {grants.map(grant => (
                    <div key={grant.id} className="flex items-center gap-3 py-2 border-b last:border-0 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{grant.grant_name}</p>
                        <p className="text-xs text-muted-foreground">{grant.funder} • {grant.client_name}</p>
                      </div>
                      <span className="font-semibold text-sm">£{grant.amount_awarded?.toLocaleString() || '—'}</span>
                      <Badge variant={grant.status === 'awarded' ? 'default' : grant.status === 'rejected' ? 'destructive' : 'secondary'} className="text-xs flex-shrink-0">
                        {grant.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}