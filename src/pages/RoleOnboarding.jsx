import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Lock, Shield, FileText, CheckCircle2, Loader2, Building2, Globe, GitBranch, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import DataParsingGuide from '@/components/onboarding/DataParsingGuide';

// ─── Step definitions ───────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Welcome & Role Overview',       desc: 'We researched your Handyperson Coordinator responsibilities at Age UK Bury.' },
  { id: 2, title: 'Connect to Your Branch',        desc: 'We\'re verifying and connecting your Age UK Bury branch to the network hub.' },
  { id: 3, title: 'Choose Your Workspace',         desc: 'Customise how you want to work day-to-day.' },
  { id: 4, title: 'Select Your Modules',           desc: 'Enable the additional services you coordinate.' },
  { id: 5, title: 'Import Your Data',              desc: 'Bring in your existing client, volunteer & job records — or start fresh.' },
  { id: 6, title: 'AI Data Mapping',               desc: 'We\'ll intelligently map your data to the right fields.' },
  { id: 7, title: 'Data Safety & Compliance',      desc: 'Your data is protected. Here\'s exactly how.' },
  { id: 8, title: 'Invite Your Team',              desc: 'Optionally add colleagues to your portal.' },
  { id: 9, title: 'You\'re Ready!',                desc: 'Your workspace is fully set up. Enter the portal.' },
];

const TOTAL = STEPS.length;

const WORKSPACE_OPTIONS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard View',  desc: "See today's jobs, team status, and alerts at a glance", badge: 'Recommended' },
  { id: 'list',      icon: '📋', label: 'List View',       desc: 'Detailed appointment & job list with filters',          badge: 'Clean & simple' },
  { id: 'calendar',  icon: '🗓️', label: 'Calendar View',   desc: 'Visual schedule of all bookings and team assignments',  badge: 'Plan ahead' },
];

const MODULES = [
  { id: 'risk-flagging', icon: '⚠️', label: 'At-Risk Client Flagging',  desc: 'Identify and track vulnerable clients needing escalation' },
  { id: 'referrals',     icon: '➡️', label: 'Referrals',                desc: 'Manage referrals to other Age UK departments' },
  { id: 'befriending',   icon: '💬', label: 'Befriending',              desc: 'Coordinate befriending services and check-ins' },
  { id: 'hospital',      icon: '🏥', label: 'Home from Hospital',       desc: 'Track post-hospital support and recovery progress' },
  { id: 'info-advice',   icon: '💡', label: 'Information & Advice',     desc: 'Provide and record information/advice sessions' },
];

// ─── Main component ─────────────────────────────────────────────────────────
export default function RoleOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Step 2 — branch
  const [branchStatus, setBranchStatus] = useState('checking'); // checking | found | created | error
  const [branchDetails, setBranchDetails] = useState(null);

  // Step 3
  const [selectedWorkspace, setSelectedWorkspace] = useState('dashboard');

  // Step 4
  const [selectedModules, setSelectedModules] = useState(new Set());

  // Step 5 — data import choice
  const [dataChoice, setDataChoice] = useState(null); // 'import' | 'fresh' | 'demo'
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Step 6 — parsing result
  const [dataImported, setDataImported] = useState(false);
  const [parseError, setParseError] = useState(null);

  // Step 8 — invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  // ── Auto-check branch when we arrive at step 2 ──────────────────────────
  useEffect(() => {
    if (currentStep !== 2) return;
    checkOrCreateBranch();
  }, [currentStep]);

  const checkOrCreateBranch = async () => {
    setBranchStatus('checking');
    try {
      // Check if Bury branch exists
      const configs = await base44.entities.BranchConfig.list();
      const buryBranch = configs.find(b =>
        b.branch_id === 'bury' ||
        b.branch_name?.toLowerCase().includes('bury')
      );

      if (buryBranch) {
        setBranchDetails(buryBranch);
        setBranchStatus('found');
        return;
      }

      // Branch doesn't exist — create it from the BuryAssist template
      const newBranch = await base44.entities.BranchConfig.create({
        branch_id: 'bury',
        branch_name: 'Age UK Bury',
        api_key: `key_${Math.random().toString(36).substr(2, 16)}`,
        hub_api_url: `${window.location.origin}/api/sync`,
        status: 'active',
        last_sync_result: 'pending',
      });

      // Seed Bury with demo data from the BuryAssist template
      try {
        await base44.functions.invoke('populateBranchData', {
          branch_id: 'bury',
          branch_name: 'Age UK Bury',
        });
      } catch (e) {
        // Non-fatal — branch is still created
        console.warn('Demo data population skipped:', e.message);
      }

      setBranchDetails(newBranch);
      setBranchStatus('created');
    } catch (err) {
      console.error('Branch check failed:', err);
      setBranchStatus('error');
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goTo = useCallback((step) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 180);
  }, []);

  const canContinue = () => {
    if (currentStep === 2) return branchStatus === 'found' || branchStatus === 'created';
    if (currentStep === 5 && !dataChoice) return false;
    if (currentStep === 5 && dataChoice === 'import' && !uploadedFiles.length) return false;
    if (currentStep === 6 && dataChoice === 'import' && !dataImported) return false;
    return true;
  };

  const handleContinue = () => {
    if (!canContinue()) return;
    // Skip step 6 (AI parsing) if not importing files
    if (currentStep === 5 && dataChoice !== 'import') {
      goTo(7);
      return;
    }
    if (currentStep === TOTAL) {
      window.location.href = '/coordinator-portal';
      return;
    }
    goTo(currentStep + 1);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviteLoading(true);
    try {
      await base44.users.inviteUser(inviteEmail, 'user');
      setInviteSent(true);
    } catch (e) {
      console.error('Invite failed:', e);
    } finally {
      setInviteLoading(false);
    }
  };

  // ── Step content ──────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {

      // ── Step 1: Role overview ──────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-primary text-primary-foreground">Age UK Bury</Badge>
                <Badge variant="outline">Handyperson Coordinator</Badge>
              </div>
              <h4 className="font-semibold text-sm mb-3">Your Core Responsibilities</h4>
              <ul className="text-sm space-y-2">
                {[
                  'Manage appointment bookings for handypeople',
                  'Supervise handyperson team daily',
                  'Ensure service meets contract deadlines',
                  'Monitor customer satisfaction & complaints',
                  'Maintain financial & admin records',
                  'Ensure GDPR & health/safety compliance',
                ].map(r => (
                  <li key={r} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <strong>📋 Demo data is pre-loaded</strong> — your portal has sample records so you can explore straight away. You can replace these with your real data in step 5.
            </div>
          </div>
        );

      // ── Step 2: Branch connect / create ───────────────────────────────
      case 2:
        return (
          <div className="space-y-4">
            {branchStatus === 'checking' && (
              <div className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Searching for Age UK Bury in the network hub...</p>
              </div>
            )}

            {branchStatus === 'found' && (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm">Branch Found ✓</p>
                    <p className="text-xs text-green-800 mt-0.5">Age UK Bury is already registered in the hub network.</p>
                  </div>
                </div>
                <BranchCard branch={branchDetails} />
              </div>
            )}

            {branchStatus === 'created' && (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <GitBranch className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Branch Created & Connected ✓</p>
                    <p className="text-xs text-blue-800 mt-0.5">
                      Age UK Bury has been provisioned from the <strong>BuryAssist template</strong> and connected to the hub. Demo data has been loaded.
                    </p>
                  </div>
                </div>
                <BranchCard branch={branchDetails} isNew />
              </div>
            )}

            {branchStatus === 'error' && (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900 text-sm">Connection Issue</p>
                    <p className="text-xs text-red-800 mt-0.5">Could not connect to the hub. You can still continue — this can be resolved later.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={checkOrCreateBranch} className="w-full">
                  Retry Connection
                </Button>
              </div>
            )}

            <div className="bg-muted/40 rounded-lg p-3 text-xs text-muted-foreground">
              <Globe className="w-3.5 h-3.5 inline mr-1" />
              <strong>Hub architecture:</strong> Your Bury branch operates with full autonomy — finance, governance, and staff stay local. Only aggregate metrics sync to the national hub.
            </div>
          </div>
        );

      // ── Step 3: Workspace ──────────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-3">
            {WORKSPACE_OPTIONS.map(opt => (
              <Card
                key={opt.id}
                onClick={() => setSelectedWorkspace(opt.id)}
                className={`cursor-pointer border-2 transition-all duration-200 ${selectedWorkspace === opt.id ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/40'}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {opt.icon} {opt.label}
                    {selectedWorkspace === opt.id && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                  </CardTitle>
                  <CardDescription>{opt.desc}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="outline">{opt.badge}</Badge>
                </CardContent>
              </Card>
            ))}
            <p className="text-xs text-muted-foreground">You can change this anytime in your portal settings.</p>
          </div>
        );

      // ── Step 4: Modules ────────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select any additional services you coordinate:</p>
            {MODULES.map(mod => {
              const active = selectedModules.has(mod.id);
              return (
                <Card
                  key={mod.id}
                  onClick={() => {
                    const s = new Set(selectedModules);
                    active ? s.delete(mod.id) : s.add(mod.id);
                    setSelectedModules(s);
                  }}
                  className={`cursor-pointer border-2 transition-all duration-200 ${active ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/40'}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {mod.icon} {mod.label}
                      {active && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                    </CardTitle>
                    <CardDescription>{mod.desc}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
            <p className="text-xs text-muted-foreground">Modules can be toggled on/off later from settings.</p>
          </div>
        );

      // ── Step 5: Data import choice ─────────────────────────────────────
      case 5:
        // Sub-state: file picker shown after choosing 'import'
        if (dataChoice === 'import' && !uploadedFiles.length) {
          return (
            <div className="space-y-4">
              <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                onClick={() => setDataChoice(null)}>← Back to options</button>
              <div className="p-5 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
                <p className="text-sm font-medium mb-1">Upload your records</p>
                <p className="text-xs text-muted-foreground mb-3">CSV, Excel (.xlsx), JSON — any format is fine</p>
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.json,.tsv,.txt"
                  onChange={e => {
                    setUploadedFiles(Array.from(e.target.files || []));
                    setParseError(null);
                  }}
                  className="text-sm w-full cursor-pointer"
                />
              </div>
              {parseError && <p className="text-xs text-red-600">⚠ {parseError}</p>}
            </div>
          );
        }

        // Choice picker
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">How would you like to populate your portal?</p>
            {[
              { id: 'import', icon: '📤', label: 'Import My Own Data',    desc: 'Upload your existing spreadsheets — clients, volunteers, jobs' },
              { id: 'fresh',  icon: '✨', label: 'Start Fresh',           desc: 'Empty portal, add records manually as you go' },
              { id: 'demo',   icon: '👀', label: 'Explore with Demo Data', desc: 'Keep the sample data for now, import real data later' },
            ].map(opt => (
              <Card
                key={opt.id}
                onClick={() => setDataChoice(opt.id)}
                className={`cursor-pointer border-2 transition-all ${dataChoice === opt.id ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/40'}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {opt.icon} {opt.label}
                    {dataChoice === opt.id && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                  </CardTitle>
                  <CardDescription className="text-xs">{opt.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        );

      // ── Step 6: AI parsing ─────────────────────────────────────────────
      case 6:
        return (
          <DataParsingGuide
            files={uploadedFiles}
            onComplete={() => {
              setDataImported(true);
              setParseError(null);
            }}
            onError={err => setParseError(err)}
          />
        );

      // ── Step 7: Data safety ────────────────────────────────────────────
      case 7:
        return (
          <div className="space-y-3">
            {[
              { icon: Lock,        title: 'Bank-Level Encryption',  desc: 'All data encrypted in transit and at rest.' },
              { icon: Shield,      title: 'GDPR Compliant',         desc: 'UK data protection laws. You control who sees what.' },
              { icon: FileText,    title: 'Role-Based Access',      desc: 'Handypeople see only their jobs — not client or compliance data.' },
              { icon: CheckCircle2,title: 'Your Data, Your Control', desc: 'Download or delete everything at any time. No lock-in.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border border-border rounded-lg p-4 flex items-start gap-3">
                <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        );

      // ── Step 8: Invite team ────────────────────────────────────────────
      case 8:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can invite colleagues to your Bury portal. They'll receive an email with login instructions.
            </p>
            {!inviteSent ? (
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@ageukbury.org.uk"
                  className="flex-1 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={handleInvite} disabled={!inviteEmail || inviteLoading} size="sm">
                  {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invite'}
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-sm text-green-900">
                <CheckCircle2 className="w-4 h-4" /> Invite sent to <strong>{inviteEmail}</strong>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              You can skip this step — you can invite people any time from the portal settings.
            </p>
          </div>
        );

      // ── Step 9: All done ───────────────────────────────────────────────
      case 9:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="font-semibold text-green-900 text-lg">Welcome to Your Coordinator Portal!</h4>
              <p className="text-sm text-green-800">Everything is configured and ready. Manage appointments, supervise your team, and track your impact.</p>
              <div className="pt-3 border-t border-green-200 space-y-1 text-xs text-green-700">
                <p>✓ Branch: Age UK Bury — connected to hub</p>
                <p>✓ Workspace: {WORKSPACE_OPTIONS.find(o => o.id === selectedWorkspace)?.label}</p>
                {selectedModules.size > 0 && <p>✓ Modules: {selectedModules.size} enabled</p>}
                {dataChoice === 'import' && dataImported && <p>✓ Your data imported & mapped</p>}
                {dataChoice === 'fresh' && <p>✓ Fresh portal — ready to fill</p>}
                {dataChoice === 'demo' && <p>✓ Demo data loaded for exploration</p>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className={`max-w-2xl mx-auto py-10 px-6 transition-opacity duration-180 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Age UK Bury · Handyperson Coordinator</p>
          <h1 className="text-2xl font-bold mt-1">Portal Setup</h1>
        </div>

        {/* Progress */}
        <div className="mb-8 space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Step {currentStep} of {TOTAL}</span>
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / TOTAL) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary">{Math.round((currentStep / TOTAL) * 100)}%</span>
          </div>
          {/* Step dots */}
          <div className="flex gap-1 justify-center pt-1">
            {STEPS.map(s => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s.id < currentStep ? 'bg-green-500 w-4' :
                  s.id === currentStep ? 'bg-primary w-6' :
                  'bg-border w-1.5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}

            {/* Navigation */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Going back from step 6 (parsing) should go to step 5 choice
                    if (currentStep === 6) { setUploadedFiles([]); setDataImported(false); }
                    // Going back from step 7 when non-import, return to step 5
                    goTo(currentStep - 1);
                  }}
                  disabled={isTransitioning || branchStatus === 'checking'}
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleContinue}
                disabled={isTransitioning || !canContinue()}
                className="flex-1 py-5 text-base"
              >
                {isTransitioning ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</span>
                ) : branchStatus === 'checking' && currentStep === 2 ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Connecting branch...</span>
                ) : currentStep === TOTAL ? (
                  <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Enter My Portal</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">Continue <ChevronRight className="w-4 h-4" /></span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Small branch info card ───────────────────────────────────────────────
function BranchCard({ branch, isNew }) {
  if (!branch) return null;
  return (
    <div className="border border-border rounded-lg p-3 flex items-start gap-3 text-sm">
      <Building2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="font-semibold">{branch.branch_name || 'Age UK Bury'}</p>
        <p className="text-xs text-muted-foreground">Branch ID: <code className="bg-muted px-1 rounded">{branch.branch_id || 'bury'}</code></p>
        <div className="flex gap-2 pt-1">
          <Badge variant={branch.status === 'active' ? 'default' : 'outline'}>{branch.status || 'active'}</Badge>
          {isNew && <Badge className="bg-blue-100 text-blue-800">Provisioned from BuryAssist template</Badge>}
        </div>
      </div>
    </div>
  );
}