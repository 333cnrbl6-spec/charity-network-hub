import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function SelfServeSignup() {
  const [step, setStep] = useState('details'); // details, plan, payment, confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    branch_id: '',
    branch_name: '',
    email: '',
    plan: 'starter'
  });

  const plans = [
    { id: 'starter', name: 'Starter', price: '£49.99/month', features: ['Up to 500 clients', 'Basic reporting'] },
    { id: 'professional', name: 'Professional', price: '£99.99/month', features: ['Up to 2000 clients', 'Advanced reporting', 'API access'] },
    { id: 'enterprise', name: 'Enterprise', price: '£249.99/month', features: ['Unlimited clients', 'Custom integrations', 'Dedicated support'] }
  ];

  const handleCreate = async () => {
    if (!formData.branch_id || !formData.branch_name || !formData.email) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await base44.functions.invoke('createBranchSubscription', {
        branch_id: formData.branch_id,
        branch_name: formData.branch_name,
        email: formData.email,
        plan: formData.plan
      });

      setStep('confirmation');
    } catch (err) {
      setError(err.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'confirmation') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-green-600" />
            Subscription Created
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Your 14-day free trial has started for <strong>{formData.branch_name}</strong>.</p>
          <p className="text-sm text-muted-foreground">
            A payment method will be required before the trial ends. Check your email at {formData.email} for next steps.
          </p>
          <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Branch Subscription</CardTitle>
        <CardDescription>Set up your Age UK branch account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Branch ID</label>
              <Input
                placeholder="e.g., manchester, bury"
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value.toLowerCase() })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Branch Name</label>
              <Input
                placeholder="e.g., Age UK Manchester"
                value={formData.branch_name}
                onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="contact@branch.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <Button onClick={() => setStep('plan')} className="w-full">Next</Button>
          </div>
        )}

        {step === 'plan' && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    formData.plan === p.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setFormData({ ...formData, plan: p.id })}
                >
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-lg font-bold text-primary">{p.price}</div>
                  <ul className="text-sm text-muted-foreground mt-2">
                    {p.features.map((f) => <li key={f}>• {f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('details')}>Back</Button>
              <Button onClick={() => setStep('payment')} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You'll get 14 days free to explore. After that, we'll charge your card monthly.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('plan')}>Back</Button>
              <Button onClick={handleCreate} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="animate-spin" /> : 'Start Free Trial'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}