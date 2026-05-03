import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ChevronRight, Building2, Megaphone, Users, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const CAUSE_AREAS = [
  'Older People', 'Children & Young People', 'Disability', 'Mental Health',
  'Homelessness', 'Poverty & Social Exclusion', 'Environment', 'Arts & Culture',
  'Health & Wellbeing', 'Education', 'Animal Welfare', 'Other'
];

const STEPS = [
  { id: 1, title: 'Charity Profile', desc: 'Tell us about your organisation', icon: Building2 },
  { id: 2, title: 'First Campaign', desc: 'Set up your first fundraising campaign', icon: Megaphone },
  { id: 3, title: 'Invite Your Team', desc: 'Bring in trustees and volunteers', icon: Users },
];

export default function CharityOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const [profile, setProfile] = useState({ name: '', charity_number: '', cause_area: '', website: '' });
  const [campaign, setCampaign] = useState({ title: '', description: '', target_amount: '', end_date: '' });
  const [invite, setInvite] = useState({ email: '', role: 'user' });

  const handleFinish = async () => {
    setLoading(true);
    await base44.auth.updateMe({
      org_name: profile.name,
      charity_number: profile.charity_number,
      cause_area: profile.cause_area,
      onboarding_complete: true,
    });
    setLoading(false);
    toast.success('Profile created! Moving to setup wizard...');
    // Redirect to the guided wizard for branch/volunteer setup
    window.location.href = '/charity-wizard';
  };

  const handleInvite = async () => {
    if (!invite.email) return;
    setLoading(true);
    await base44.users.inviteUser(invite.email, invite.role);
    setInviteSent(true);
    setLoading(false);
    toast.success(`Invite sent to ${invite.email}`);
  };

  const canNext1 = profile.name && profile.charity_number && profile.cause_area;
  const canNext2 = campaign.title && campaign.target_amount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> CharityHub Setup
          </div>
          <h1 className="text-3xl font-bold">Welcome! Let's get you started.</h1>
          <p className="text-muted-foreground mt-2">3 quick steps to set up your charity workspace</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${step === s.id ? 'bg-primary text-primary-foreground' : step > s.id ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                {step > s.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
                {s.title}
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-6 ${step > s.id + 1 ? 'bg-green-400' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /> Charity Profile</CardTitle>
              <CardDescription>We'll use this to personalise your workspace and AI-generated content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Charity Name *</Label>
                <Input placeholder="e.g. Age UK Bury" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Charity Number *</Label>
                <Input placeholder="e.g. 1080600" value={profile.charity_number} onChange={e => setProfile(p => ({ ...p, charity_number: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Cause Area *</Label>
                <select value={profile.cause_area} onChange={e => setProfile(p => ({ ...p, cause_area: e.target.value }))} className="w-full px-3 py-2 border rounded-lg bg-white">
                  <option value="">Select cause area...</option>
                  {CAUSE_AREAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Website <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input placeholder="https://www.yourcharity.org.uk" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} />
              </div>
              <Button onClick={() => setStep(2)} disabled={!canNext1} className="w-full gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" /> First Campaign</CardTitle>
              <CardDescription>Set up your first fundraising or service campaign.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Campaign Title *</Label>
                <Input placeholder="e.g. Winter Warmth Fund 2026" value={campaign.title} onChange={e => setCampaign(c => ({ ...c, title: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="What does this campaign aim to achieve?"
                  value={campaign.description}
                  onChange={e => setCampaign(c => ({ ...c, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Target Amount (£) *</Label>
                  <Input type="number" placeholder="5000" value={campaign.target_amount} onChange={e => setCampaign(c => ({ ...c, target_amount: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input type="date" value={campaign.end_date} onChange={e => setCampaign(c => ({ ...c, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} disabled={!canNext2} className="flex-1 gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Invite Your Team</CardTitle>
              <CardDescription>Add trustees, staff, or volunteers to collaborate in CharityHub.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!inviteSent ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      placeholder="trustee@yourcharity.org.uk"
                      value={invite.email}
                      onChange={e => setInvite(i => ({ ...i, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <select value={invite.role} onChange={e => setInvite(i => ({ ...i, role: e.target.value }))} className="w-full px-3 py-2 border rounded-lg bg-white">
                      <option value="user">Volunteer / Staff</option>
                      <option value="admin">Trustee / Admin</option>
                    </select>
                  </div>
                  <Button onClick={handleInvite} disabled={!invite.email || loading} variant="outline" className="w-full gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    Send Invite
                  </Button>
                </>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm">Invite sent to {invite.email}</p>
                    <p className="text-xs text-green-800">They'll receive an email with login instructions.</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">You can skip this and invite people later from Settings.</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={handleFinish} disabled={loading} className="flex-1 gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Enter CharityHub
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}