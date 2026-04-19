import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Globe, Building2, ChevronRight, CheckCircle2, Clock, AlertCircle,
  Plus, ExternalLink, Network, Shield, Landmark, Users, Wallet,
  GitBranch, Layers, ArrowRight, Copy, Eye
} from 'lucide-react';
import NewBranchWizard from '@/components/expansion/NewBranchWizard';

const TEMPLATE_APP = {
  name: 'BuryAssist',
  url: 'https://bury-care-connect.base44.app',
  description: 'The founding branch template — a fully operational care coordination platform with client management, volunteer scheduling, job tracking, grants, sessions, and compliance.',
  capabilities: [
    'Client & Referral Management',
    'Volunteer Scheduling & DBS Tracking',
    'Job/Appointment Coordination',
    'Grants & Benefits Administration',
    'Session Management',
    'Compliance & GDPR Tooling',
    'Funder Reporting',
    'Role-Based Onboarding',
  ],
};

const AUTONOMY_PILLARS = [
  { icon: Landmark, label: 'Financial Autonomy', desc: 'Each branch controls its own budget, grants, and expenditure. No financial dependency on the hub.' },
  { icon: Shield, label: 'Governance Autonomy', desc: 'Independent trustees, board, and local policies. Hub provides shared compliance frameworks only.' },
  { icon: Users, label: 'Staff & Volunteer Independence', desc: 'Branches hire, onboard, and manage their own teams. Hub can view aggregate data only.' },
  { icon: Wallet, label: 'Subscription Choice', desc: 'Each branch subscribes independently—starter, professional, or enterprise. No forced tiers.' },
];

const HUB_TO_BRANCH_STEPS = [
  { step: 1, title: 'Register New Branch', desc: 'Enter organisation name, region, and postcode area. Hub generates a unique branch ID and API key.' },
  { step: 2, title: 'Provision from Template', desc: 'A new app instance is created based on the BuryAssist template — pre-configured with all modules.' },
  { step: 3, title: 'Onboard Branch Admin', desc: 'The branch receives a role-specific onboarding flow to configure their workspace, import data, and set up staff.' },
  { step: 4, title: 'Choose Subscription', desc: 'Branch selects their plan. Billing is independent — invoiced direct to the branch organisation.' },
  { step: 5, title: 'Connect to Hub', desc: 'Branch syncs aggregate (anonymised) performance data to the hub. Full operational data stays local.' },
];

export default function NetworkExpansion() {
  const queryClient = useQueryClient();
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview | branches | provision

  const { data: branches = [] } = useQuery({
    queryKey: ['branchConfigs'],
    queryFn: () => base44.entities.BranchConfig.list(),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.entities.BranchSubscription.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['branchReports'],
    queryFn: () => base44.entities.BranchReport.list(),
  });

  const activeBranches = branches.filter(b => b.status === 'active').length;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const pendingBranches = branches.filter(b => b.status === 'pending').length;

  const getSubForBranch = (branchId) => subscriptions.find(s => s.branch_id === branchId);
  const getLastReport = (branchId) => reports
    .filter(r => r.branch_id === branchId)
    .sort((a, b) => new Date(b.received_at) - new Date(a.received_at))[0];

  const tabs = [
    { id: 'overview', label: 'Architecture' },
    { id: 'branches', label: `Branches (${branches.length})` },
    { id: 'provision', label: 'Provision New Branch' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Globe className="w-4 h-4" />
            <span>Network Hub</span>
            <ChevronRight className="w-3 h-3" />
            <span>Expansion</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Hub → Branch Network</h1>
          <p className="text-muted-foreground mt-1">
            Expand the care network by provisioning new autonomous branches from the BuryAssist template.
          </p>
        </div>
        <Button onClick={() => { setActiveTab('provision'); setShowWizard(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Provision New Branch
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Branches', value: activeBranches, icon: Building2, color: 'text-green-600' },
          { label: 'Pending Onboarding', value: pendingBranches, icon: Clock, color: 'text-yellow-600' },
          { label: 'Active Subscriptions', value: activeSubscriptions, icon: Wallet, color: 'text-blue-600' },
          { label: 'Template Version', value: 'BuryAssist v1', icon: GitBranch, color: 'text-primary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Template Card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Branch Template: {TEMPLATE_APP.name}
                  </CardTitle>
                  <CardDescription className="mt-1">{TEMPLATE_APP.description}</CardDescription>
                </div>
                <a href={TEMPLATE_APP.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2 shrink-0">
                    <Eye className="w-4 h-4" /> View Live
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {TEMPLATE_APP.capabilities.map(cap => (
                  <div key={cap} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-primary/10 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Autonomy Pillars */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Branch Autonomy Model
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {AUTONOMY_PILLARS.map(({ icon: Icon, label, desc }) => (
                <Card key={label}>
                  <CardContent className="pt-5 space-y-2">
                    <Icon className="w-6 h-6 text-primary" />
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Provisioning Flow */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" />
              Hub → Branch Provisioning Flow
            </h2>
            <div className="flex flex-col md:flex-row gap-3">
              {HUB_TO_BRANCH_STEPS.map((s, idx) => (
                <React.Fragment key={s.step}>
                  <Card className="flex-1">
                    <CardContent className="pt-5 space-y-2">
                      <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {s.step}
                      </div>
                      <p className="font-semibold text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                    </CardContent>
                  </Card>
                  {idx < HUB_TO_BRANCH_STEPS.length - 1 && (
                    <div className="hidden md:flex items-center text-muted-foreground">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Data Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Flow: Branch ↔ Hub</CardTitle>
              <CardDescription>What stays local vs what syncs to the hub</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> Stays at Branch (Private)
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {['Individual client records & personal data','Volunteer personal details & DBS records','Financial transactions & bank details','Staff HR records','Internal governance documents','Local funder agreements'].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-1">
                    <Globe className="w-4 h-4" /> Syncs to Hub (Aggregate)
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {['Monthly client count (no names)','Volunteer hours (totals only)','Jobs completed count','Grant value totals','Session attendance figures','Compliance status flags'].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* BRANCHES TAB */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          {branches.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-lg font-semibold">No branches provisioned yet</p>
                <p className="text-muted-foreground text-sm mt-1 mb-4">Bury is the founding template. Start expanding the network below.</p>
                <Button onClick={() => setActiveTab('provision')} className="gap-2">
                  <Plus className="w-4 h-4" /> Provision First Branch
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* BuryAssist — the template/origin */}
              <Card className="border-primary/40 bg-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">Bury (Template Origin)</CardTitle>
                      <CardDescription className="text-xs mt-0.5">BuryAssist — founding branch</CardDescription>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Origin</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4" /> Live & Operational
                  </div>
                  <a href={TEMPLATE_APP.url} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                      <ExternalLink className="w-3 h-3" /> Open BuryAssist
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {branches.map(branch => {
                const sub = getSubForBranch(branch.branch_id);
                const report = getLastReport(branch.branch_id);
                const isActive = branch.status === 'active';
                const isPending = branch.status === 'pending';
                return (
                  <Card key={branch.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{branch.branch_name}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">{branch.branch_id}</CardDescription>
                        </div>
                        <Badge variant={isActive ? 'default' : isPending ? 'outline' : 'destructive'}>
                          {branch.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Subscription</span>
                        <span className={sub?.status === 'active' ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                          {sub ? `${sub.plan} • ${sub.status}` : 'Not subscribed'}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-xs">
                        <span>Last Sync</span>
                        <span>{report ? new Date(report.received_at).toLocaleDateString() : 'Never'}</span>
                      </div>
                      {report?.stats && (
                        <div className="border-t pt-2 grid grid-cols-3 gap-2 text-center">
                          <div><p className="text-xs text-muted-foreground">Clients</p><p className="font-bold text-sm">{report.stats.total_clients || 0}</p></div>
                          <div><p className="text-xs text-muted-foreground">Volunteers</p><p className="font-bold text-sm">{report.stats.active_volunteers || 0}</p></div>
                          <div><p className="text-xs text-muted-foreground">Jobs</p><p className="font-bold text-sm">{report.stats.total_jobs || 0}</p></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PROVISION TAB */}
      {activeTab === 'provision' && (
        <div className="max-w-2xl">
          <NewBranchWizard
            onSuccess={(newBranch) => {
              queryClient.invalidateQueries({ queryKey: ['branchConfigs'] });
              queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
              setActiveTab('branches');
            }}
          />
        </div>
      )}

    </div>
  );
}