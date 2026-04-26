import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Building2, Users, TrendingUp, AlertCircle, Plus, Search, RefreshCw,
  ShieldCheck, PoundSterling, Activity, ChevronRight
} from 'lucide-react';
import { TIER_LABELS, STATUS_LABELS } from '@/lib/tenantContext.jsx';
import CreateTenantModal from '@/components/platform/CreateTenantModal';
import TenantDetailPanel from '@/components/platform/TenantDetailPanel';

export default function PlatformAdmin() {
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('tenantAdmin', { action: 'get_platform_stats' });
    setStats(res.data.stats);
    setTenants(res.data.tenants || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = tenants.filter(t => {
    const matchSearch = !search || t.org_name?.toLowerCase().includes(search.toLowerCase()) || t.primary_contact_email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.subscription_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const KPICard = ({ icon: IconComp, label, value, sub, color = 'text-primary' }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <IconComp className={`w-8 h-8 ${color} opacity-20`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Administration</h1>
          <p className="text-muted-foreground text-sm">Multi-tenant management — all organisations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Tenant
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <KPICard icon={Building2} label="Total Tenants" value={stats.total_tenants} />
          <KPICard icon={Activity} label="Active" value={stats.active_tenants} color="text-green-600" />
          <KPICard icon={AlertCircle} label="Trial" value={stats.trial_tenants} color="text-yellow-600" />
          <KPICard icon={ShieldCheck} label="Suspended" value={stats.suspended_tenants} color="text-red-600" />
          <KPICard icon={Users} label="Total Users" value={stats.total_users} />
          <KPICard icon={PoundSterling} label="MRR" value={`£${(stats.mrr || 0).toLocaleString()}`} color="text-emerald-600" sub="Monthly Recurring" />
        </div>
      )}

      {/* Tier Breakdown */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {['essential', 'professional', 'enterprise'].map(tier => (
            <Card key={tier}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={TIER_LABELS[tier]?.color}>{TIER_LABELS[tier]?.label}</Badge>
                    <p className="text-2xl font-bold mt-2">{stats.by_tier?.[tier] || 0}</p>
                    <p className="text-xs text-muted-foreground">{TIER_LABELS[tier]?.price}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-muted opacity-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tenant Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">All Tenants ({filtered.length})</CardTitle>
            <div className="flex gap-2">
              {['all', 'active', 'trial', 'suspended'].map(s => (
                <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(s)} className="capitalize text-xs h-7">
                  {s}
                </Button>
              ))}
            </div>
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Search tenants…" className="pl-8 h-8 text-xs"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading tenants…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No tenants found. Create your first one.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(tenant => {
                const tier = TIER_LABELS[tenant.subscription_tier] || TIER_LABELS.professional;
                const status = STATUS_LABELS[tenant.subscription_status] || STATUS_LABELS.trial;
                return (
                  <div
                    key={tenant.id}
                    onClick={() => setSelectedTenant(tenant)}
                    className="flex items-center gap-4 py-3 px-2 hover:bg-secondary/30 cursor-pointer rounded-lg transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{tenant.org_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{tenant.primary_contact_email} · {tenant.region || 'No region'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`text-xs ${tier.color}`}>{tier.label}</Badge>
                      <Badge className={`text-xs ${status.color}`}>{status.label}</Badge>
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {tenant.user_count || 0} users
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreate && (
        <CreateTenantModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />
      )}
      {selectedTenant && (
        <TenantDetailPanel
          tenant={selectedTenant}
          onClose={() => setSelectedTenant(null)}
          onUpdated={() => { setSelectedTenant(null); load(); }}
        />
      )}
    </div>
  );
}