import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  X, Building2, Mail, Phone, MapPin, Calendar, Shield, AlertTriangle,
  CheckCircle2, Users, ShieldOff, RefreshCw, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { TIER_LABELS, STATUS_LABELS } from '@/lib/tenantContext.jsx';

export default function TenantDetailPanel({ tenant, onClose, onUpdated }) {
  const [saving, setSaving] = useState(false);
  const [newTier, setNewTier] = useState(tenant.subscription_tier || 'professional');
  const [newStatus, setNewStatus] = useState(tenant.subscription_status || 'trial');

  const tier = TIER_LABELS[tenant.subscription_tier] || TIER_LABELS.professional;
  const status = STATUS_LABELS[tenant.subscription_status] || STATUS_LABELS.trial;

  const handleActivate = async () => {
    setSaving(true);
    const res = await base44.functions.invoke('tenantAdmin', {
      action: 'activate_tenant', id: tenant.id, tenant_id: tenant.tenant_id
    });
    if (res.data.success) { toast.success('Tenant activated — trial converted to active'); onUpdated(); }
    else toast.error('Failed to activate tenant');
    setSaving(false);
  };

  const handleSuspend = async () => {
    setSaving(true);
    const res = await base44.functions.invoke('tenantAdmin', {
      action: 'suspend_tenant', id: tenant.id, tenant_id: tenant.tenant_id
    });
    if (res.data.success) { toast.success('Tenant suspended'); onUpdated(); }
    else toast.error('Failed to suspend');
    setSaving(false);
  };

  const handleReactivate = async () => {
    setSaving(true);
    const res = await base44.functions.invoke('tenantAdmin', {
      action: 'reactivate_tenant', id: tenant.id, tenant_id: tenant.tenant_id
    });
    if (res.data.success) { toast.success('Tenant reactivated'); onUpdated(); }
    else toast.error('Failed to reactivate');
    setSaving(false);
  };

  const handleChangeTier = async () => {
    setSaving(true);
    const res = await base44.functions.invoke('tenantAdmin', {
      action: 'update_tenant', id: tenant.id,
      updates: { subscription_tier: newTier, tenant_id: tenant.tenant_id }
    });
    if (res.data.success) { toast.success('Tier updated'); onUpdated(); }
    else toast.error('Failed to update tier');
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{tenant.org_name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{tenant.tenant_id}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={tier.color}>{tier.label}</Badge>
                <Badge className={status.color}>{status.label}</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contact</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" />{tenant.primary_contact_email}</div>
                {tenant.primary_contact_phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" />{tenant.primary_contact_phone}</div>}
                {tenant.primary_contact_name && <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-muted-foreground" />{tenant.primary_contact_name}</div>}
              </div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</p>
              <div className="space-y-1.5 text-sm">
                {tenant.region && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />{tenant.region}</div>}
                {tenant.postcode && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground opacity-50" />{tenant.postcode}</div>}
                {tenant.charity_number && <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-muted-foreground" />#{tenant.charity_number}</div>}
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="border rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subscription</p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Monthly Fee</p>
                <p className="font-bold text-lg">£{tenant.monthly_fee_gbp || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Users</p>
                <p className="font-bold text-lg">{tenant.user_count || 0} / {tenant.max_users || '∞'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Trial Ends</p>
                <p className="font-semibold text-sm">{tenant.trial_ends_date || 'N/A'}</p>
              </div>
            </div>

            {/* Change Tier */}
            <div className="pt-2 border-t flex gap-2 items-end">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Change Tier</p>
                <Select value={newTier} onValueChange={setNewTier}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essential">Essential — £299/mo</SelectItem>
                    <SelectItem value="professional">Professional — £799/mo</SelectItem>
                    <SelectItem value="enterprise">Enterprise — Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" onClick={handleChangeTier} disabled={saving || newTier === tenant.subscription_tier} className="h-8">
                Save
              </Button>
            </div>
          </div>

          {/* Enabled Modules */}
          {tenant.enabled_modules?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Active Modules</p>
              <div className="flex flex-wrap gap-1.5">
                {tenant.enabled_modules.map(m => (
                  <Badge key={m} variant="outline" className="text-xs capitalize">{m.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            {tenant.subscription_status === 'suspended' ? (
              <Button onClick={handleReactivate} disabled={saving} className="gap-2 flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4" /> Reactivate
              </Button>
            ) : tenant.subscription_status === 'trial' ? (
              <>
                <Button onClick={handleActivate} disabled={saving} className="gap-2 flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="w-4 h-4" /> Activate (Convert from Trial)
                </Button>
                <Button variant="destructive" onClick={handleSuspend} disabled={saving} className="gap-2 flex-1">
                  <ShieldOff className="w-4 h-4" /> Suspend
                </Button>
              </>
            ) : tenant.subscription_status !== 'cancelled' && (
              <Button variant="destructive" onClick={handleSuspend} disabled={saving} className="gap-2 flex-1">
                <ShieldOff className="w-4 h-4" /> Suspend
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}