import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Building2, Users, ShieldCheck, BarChart3, BookOpen, AlertCircle,
  Settings, UserPlus, CheckCircle2, ChevronRight, Loader2, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { useTenant, hasModule, isActiveSubscription, TIER_LABELS, STATUS_LABELS } from '@/lib/tenantContext.jsx';
import TenantUserManager from '@/components/platform/TenantUserManager';

const MODULE_CARDS = [
  { key: 'incident_management', icon: ShieldCheck, label: 'Safeguarding', desc: 'Report, manage and track incidents', path: '/safeguarding', color: 'text-red-600' },
  { key: 'analytics_dashboard', icon: BarChart3, label: 'Analytics', desc: 'Real-time insights and trends', path: '/safeguarding/analytics', color: 'text-blue-600' },
  { key: 'training_tracking', icon: BookOpen, label: 'Training', desc: 'Volunteer training & DBS tracking', path: '/training', color: 'text-green-600' },
  { key: 'client_directory', icon: Users, label: 'Clients', desc: 'Client management & records', path: '/clients', color: 'text-purple-600' },
  { key: 'knowledge_base', icon: BookOpen, label: 'Knowledge Base', desc: 'Policies, guidance & templates', path: '/compliance-hub', color: 'text-amber-600' },
  { key: 'ai_risk_assessment', icon: AlertCircle, label: 'AI Assessment', desc: 'AI-powered risk classification', path: '/safeguarding', color: 'text-orange-600' },
];

export default function TenantPortal() {
  const { currentTenant, tenantUser, loading } = useTenant();
  const [tab, setTab] = useState('home');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => setUser(u)).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold">No Organisation Found</h2>
            <p className="text-muted-foreground text-sm">Your account is not linked to any organisation. Please contact your administrator or start onboarding.</p>
            <Button onClick={() => window.location.href = '/charity-onboarding'}>
              Start Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tier = TIER_LABELS[currentTenant.subscription_tier] || TIER_LABELS.professional;
  const status = STATUS_LABELS[currentTenant.subscription_status] || STATUS_LABELS.trial;
  const isActive = isActiveSubscription(currentTenant);

  const handleInviteUser = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, 'user');
    await base44.entities.TenantUser.create({
      tenant_id: currentTenant.tenant_id,
      user_email: inviteEmail,
      tenant_role: 'staff',
      is_active: true,
      invited_by: user?.email || '',
    });
    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subscription Banner */}
      {currentTenant.subscription_status === 'trial' && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-sm text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>Trial ends on <strong>{currentTenant.trial_ends_date}</strong>. Upgrade to continue access after trial.</span>
          <Button size="sm" className="ml-auto h-6 text-xs" onClick={() => window.location.href = '/pricing'}>Upgrade Now</Button>
        </div>
      )}
      {currentTenant.subscription_status === 'suspended' && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-2 text-sm text-red-900 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span><strong>Account Suspended.</strong> Contact support to reactivate your subscription.</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{currentTenant.org_name}</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.full_name || tenantUser?.user_name || 'Team Member'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={tier.color}>{tier.label}</Badge>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {[
            { id: 'home', label: 'Dashboard' },
            { id: 'users', label: 'Users & Roles' },
            { id: 'settings', label: 'Settings' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Home Tab */}
        {tab === 'home' && (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Users', value: currentTenant.user_count || 1 },
                { label: 'Subscription', value: tier.label },
                { label: 'Data Retention', value: `${currentTenant.data_retention_years || 6} years` },
                { label: 'Health Score', value: `${currentTenant.health_score || 0}%` },
              ].map(({ label, value }) => (
                <Card key={label}>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold mt-1">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Module Grid */}
            <div>
              <h2 className="text-base font-semibold mb-3">Your Modules</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {MODULE_CARDS.map(mod => {
                  const unlocked = hasModule(currentTenant, mod.key) && isActive;
                  const Icon = mod.icon;
                  return (
                    <Card
                      key={mod.key}
                      className={`transition-all cursor-pointer ${unlocked ? 'hover:shadow-md' : 'opacity-50'}`}
                      onClick={() => unlocked && (window.location.href = mod.path)}
                    >
                      <CardContent className="pt-5 pb-5">
                        <div className="flex items-start gap-3">
                          <Icon className={`w-6 h-6 flex-shrink-0 ${unlocked ? mod.color : 'text-muted-foreground'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{mod.label}</p>
                              {!unlocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Quick Invite */}
            {tenantUser?.tenant_role === 'tenant_admin' && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary" /> Invite a Team Member
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="colleague@yourorg.org.uk"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                    />
                    <Button onClick={handleInviteUser} disabled={!inviteEmail || inviting} className="gap-2">
                      {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <TenantUserManager tenantId={currentTenant.tenant_id} currentUserEmail={user?.email} />
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organisation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Organisation Name</Label><p className="font-medium">{currentTenant.org_name}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Charity Number</Label><p className="font-medium">{currentTenant.charity_number || 'Not set'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Primary Contact</Label><p className="font-medium">{currentTenant.primary_contact_email}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Region</Label><p className="font-medium">{currentTenant.region || 'Not set'}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Subscription Tier</Label><p className="font-medium">{tier.label} — {tier.price}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Tenant ID</Label><p className="font-mono text-xs text-muted-foreground">{currentTenant.tenant_id}</p></div>
                </div>
                <p className="text-xs text-muted-foreground">To update organisation details, contact your platform administrator.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subscription & Billing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{tier.label} Plan</p>
                    <p className="text-sm text-muted-foreground">{tier.price} · {currentTenant.billing_cycle}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/pricing'}>
                    Upgrade Plan <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}