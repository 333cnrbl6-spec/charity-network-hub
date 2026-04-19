import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ChevronRight, Loader2, Building2, Globe, Wallet, Shield } from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '£49/mo',
    features: ['Up to 100 clients', 'Basic job scheduling', 'Volunteer management', 'Monthly reports to hub'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '£99/mo',
    features: ['Unlimited clients', 'Full grants management', 'Compliance toolkit', 'Real-time hub sync', 'Custom branding'],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    features: ['Multi-site management', 'Dedicated onboarding', 'SLA support', 'Data export', 'White-label option'],
  },
];

const REGIONS = [
  'North West', 'London', 'South East', 'South West',
  'Midlands', 'North East', 'Yorkshire', 'East', 'Wales',
];

const steps = ['Organisation', 'Location', 'Autonomy', 'Subscription', 'Confirm'];

export default function NewBranchWizard({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    branch_name: '',
    org_type: 'charity',
    contact_email: '',
    region: '',
    postcode_area: '',
    town: '',
    financial_autonomy: true,
    governance_autonomy: true,
    staffing_autonomy: true,
    plan: 'professional',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const branchId = form.branch_name
    ? form.branch_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    : '';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create branch config record in the hub
      const newBranch = await base44.entities.BranchConfig.create({
        branch_id: branchId,
        branch_name: form.branch_name,
        api_key: `key_${Math.random().toString(36).substr(2, 16)}`,
        hub_api_url: `${window.location.origin}/api/sync`,
        status: 'pending',
        last_sync_result: 'pending',
      });

      // Create subscription record
      await base44.entities.BranchSubscription.create({
        branch_id: branchId,
        branch_name: form.branch_name,
        plan: form.plan,
        status: 'pending',
        amount_monthly: form.plan === 'starter' ? 49 : form.plan === 'professional' ? 99 : 0,
        invoice_email: form.contact_email,
        auto_renew: true,
      });

      setDone(true);
      onSuccess(newBranch);
    } catch (error) {
      console.error('Failed to provision branch:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
          <h3 className="text-xl font-bold text-green-900">Branch Provisioned!</h3>
          <p className="text-sm text-green-800">
            <strong>{form.branch_name}</strong> has been registered in the hub. Their onboarding team will receive setup instructions using the BuryAssist template.
          </p>
          <div className="bg-white border border-green-200 rounded-lg p-3 text-left space-y-1 text-sm">
            <p><span className="font-medium">Branch ID:</span> <code className="text-xs bg-muted px-1 rounded">{branchId}</code></p>
            <p><span className="font-medium">Region:</span> {form.region}</p>
            <p><span className="font-medium">Plan:</span> {PLANS.find(p => p.id === form.plan)?.name}</p>
            <p><span className="font-medium">Status:</span> <Badge variant="outline">Pending Onboarding</Badge></p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${i === step ? 'text-primary' : i < step ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                i < step ? 'bg-green-600 text-white' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-green-400' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Organisation */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Organisation Details</CardTitle>
            <CardDescription>Who is this branch? This will become their unique hub identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Organisation Name *</label>
              <input
                type="text"
                value={form.branch_name}
                onChange={e => set('branch_name', e.target.value)}
                placeholder="e.g. Age UK Oldham, Bolton Care Connect"
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {branchId && <p className="text-xs text-muted-foreground mt-1">Branch ID: <code>{branchId}</code></p>}
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Organisation Type</label>
              <select
                value={form.org_type}
                onChange={e => set('org_type', e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="charity">Registered Charity</option>
                <option value="cic">Community Interest Company (CIC)</option>
                <option value="nhs">NHS / Public Body</option>
                <option value="council">Local Council</option>
                <option value="social_enterprise">Social Enterprise</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Admin Contact Email *</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={e => set('contact_email', e.target.value)}
                placeholder="coordinator@organisation.org.uk"
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Service Location</CardTitle>
            <CardDescription>Where will this branch operate?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Region *</label>
              <select
                value={form.region}
                onChange={e => set('region', e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select region...</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Town / City *</label>
              <input
                type="text"
                value={form.town}
                onChange={e => set('town', e.target.value)}
                placeholder="e.g. Oldham, Bolton"
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Primary Postcode Area</label>
              <input
                type="text"
                value={form.postcode_area}
                onChange={e => set('postcode_area', e.target.value)}
                placeholder="e.g. OL1, BL1"
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Autonomy */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Autonomy Configuration</CardTitle>
            <CardDescription>Each branch operates independently. Confirm their autonomy settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'financial_autonomy', label: 'Financial Autonomy', desc: 'Branch controls its own budget, grants, and expenditure.' },
              { key: 'governance_autonomy', label: 'Governance Autonomy', desc: 'Independent board, trustees, and local policies.' },
              { key: 'staffing_autonomy', label: 'Staffing & Volunteer Independence', desc: 'Branch manages its own team and volunteers.' },
            ].map(({ key, label, desc }) => (
              <div key={key} className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${form[key] ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                onClick={() => set(key, !form[key])}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${form[key] ? 'text-primary' : 'text-muted-foreground/30'}`} />
                </div>
              </div>
            ))}
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <strong>Hub oversight:</strong> The hub only receives aggregated, anonymised metrics (counts, totals). No personal or financial data is shared with the hub.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Subscription */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5" /> Choose Subscription Plan</CardTitle>
            <CardDescription>The branch will be invoiced independently. They can upgrade at any time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                onClick={() => set('plan', plan.id)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${form.plan === plan.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{plan.name}</p>
                    {plan.recommended && <Badge className="text-xs">Recommended</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{plan.price}</span>
                    {form.plan === plan.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                </div>
                <ul className="space-y-1">
                  {plan.features.map(f => (
                    <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm & Provision</CardTitle>
            <CardDescription>Review the details before provisioning this branch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Organisation</span><span className="font-semibold">{form.branch_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{form.org_type}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{form.town}, {form.region}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Branch ID</span><code className="text-xs bg-muted px-1 rounded">{branchId}</code></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-semibold">{PLANS.find(p => p.id === form.plan)?.name} — {PLANS.find(p => p.id === form.plan)?.price}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Template</span><span className="text-primary font-medium">BuryAssist v1</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Contact</span><span>{form.contact_email}</span></div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <strong>What happens next:</strong> The branch will be registered in the hub with a unique API key. Their admin will receive onboarding instructions to set up their BuryAssist-template workspace with full autonomy.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)}>
            Back
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button
            className="flex-1 gap-2"
            onClick={() => setStep(s => s + 1)}
            disabled={
              (step === 0 && (!form.branch_name || !form.contact_email)) ||
              (step === 1 && (!form.region || !form.town))
            }
          >
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="flex-1 gap-2" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning...</>
            ) : (
              <><CheckCircle2 className="w-4 h-4" /> Provision Branch</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}