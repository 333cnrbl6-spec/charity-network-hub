import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateTenantModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    org_name: '',
    org_type: 'age_uk_branch',
    charity_number: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    address: '',
    postcode: '',
    region: '',
    subscription_tier: 'professional',
    billing_cycle: 'monthly',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSave = form.org_name && form.primary_contact_email;

  const handleCreate = async () => {
    setSaving(true);
    const res = await base44.functions.invoke('tenantAdmin', { action: 'create_tenant', ...form });
    if (res.data.success) {
      toast.success(`Tenant "${form.org_name}" created`);
      onCreated();
    } else {
      toast.error(res.data.error || 'Failed to create tenant');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Create New Tenant
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Organisation Name *</Label>
              <Input placeholder="e.g. Age UK Bury" value={form.org_name} onChange={e => set('org_name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Organisation Type</Label>
              <Select value={form.org_type} onValueChange={v => set('org_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="age_uk_branch">Age UK Branch</SelectItem>
                  <SelectItem value="independent_charity">Independent Charity</SelectItem>
                  <SelectItem value="local_authority">Local Authority</SelectItem>
                  <SelectItem value="nhs_trust">NHS Trust</SelectItem>
                  <SelectItem value="housing_association">Housing Association</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Charity Number</Label>
              <Input placeholder="e.g. 1080600" value={form.charity_number} onChange={e => set('charity_number', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Primary Contact Name</Label>
              <Input placeholder="Jane Smith" value={form.primary_contact_name} onChange={e => set('primary_contact_name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Primary Contact Email *</Label>
              <Input type="email" placeholder="jane@charity.org.uk" value={form.primary_contact_email} onChange={e => set('primary_contact_email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input placeholder="0161 XXX XXXX" value={form.primary_contact_phone} onChange={e => set('primary_contact_phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Region</Label>
              <Input placeholder="e.g. North West" value={form.region} onChange={e => set('region', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input placeholder="123 High Street" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Postcode</Label>
              <Input placeholder="BL9 0EL" value={form.postcode} onChange={e => set('postcode', e.target.value)} />
            </div>
          </div>

          {/* Subscription */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-1.5">
              <Label>Subscription Tier</Label>
              <Select value={form.subscription_tier} onValueChange={v => set('subscription_tier', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="essential">Essential — £299/mo</SelectItem>
                  <SelectItem value="professional">Professional — £799/mo</SelectItem>
                  <SelectItem value="enterprise">Enterprise — Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Billing Cycle</Label>
              <Select value={form.billing_cycle} onValueChange={v => set('billing_cycle', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annual">Annual (save ~15%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            A 30-day free trial will start automatically. The primary contact will be set as Tenant Admin.
          </p>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} disabled={!canSave || saving} className="flex-1 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              Create Tenant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}