import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

import StepBranchSelect from '@/components/onboarding/StepBranchSelect';
import StepRoleSelect from '@/components/onboarding/StepRoleSelect';
import StepPersonalInfo from '@/components/onboarding/StepPersonalInfo';
import StepRoleInsight from '@/components/onboarding/StepRoleInsight';
import StepBranchConnect from '@/components/onboarding/StepBranchConnect';
import StepModuleSelect from '@/components/onboarding/StepModuleSelect';
import StepWorkspaceConfig from '@/components/onboarding/StepWorkspaceConfig';
import DataParsingGuide from '@/components/onboarding/DataParsingGuide';
import StepComplete from '@/components/onboarding/StepComplete';
import { getBranchById } from '@/lib/ageukBranches';

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1,  title: 'Select Your Branch',       desc: 'Find your Age UK branch — we\'ll place you in the right region automatically.' },
  { id: 2,  title: 'Select Your Role',         desc: 'Choose your specific job title from the full Age UK role taxonomy.' },
  { id: 3,  title: 'Your Details',             desc: 'Tell us a bit about yourself so we can personalise your workspace.' },
  { id: 4,  title: 'Your Role & Responsibilities', desc: 'We\'ve researched your role — here\'s what we\'ll build for you.' },
  { id: 5,  title: 'Connect to Hub',           desc: 'Verifying your branch in the Age UK network hub.' },
  { id: 6,  title: 'Your Modules',             desc: 'Enable the tools you need for your day-to-day work.' },
  { id: 7,  title: 'Workspace Preferences',    desc: 'Choose how you want your portal to look and behave.' },
  { id: 8,  title: 'Import Your Data',         desc: 'Bring in existing records — or start with demo data.' },
  { id: 9,  title: 'AI Data Mapping',          desc: 'We\'ll intelligently map your data to the right fields.' },
  { id: 10, title: 'Data Safety',              desc: 'Your data is fully protected. Here\'s how.' },
  { id: 11, title: 'You\'re Ready!',           desc: 'Your portal is configured. Let\'s get started.' },
];
const TOTAL = STEPS.length;

// ─── Main component ───────────────────────────────────────────────────────────
export default function SmartOnboarding() {
  const [currentStep, setCurrentStep]   = useState(1);
  const [transitioning, setTransition]  = useState(false);

  // Step 1
  const [selectedBranch, setBranch]     = useState(null);
  // Step 2
  const [selectedRole, setRole]         = useState(null);
  // Step 3
  const [personalInfo, setPersonalInfo] = useState({});
  // Step 5 — hub connection
  const [branchStatus, setBranchStatus] = useState('idle'); // idle | checking | found | created | error
  const [branchRecord, setBranchRecord] = useState(null);
  // Step 6
  const [selectedModules, setSelectedModules] = useState(new Set());
  // Step 7
  const [workspaceConfig, setWorkspaceConfig] = useState({ workspace: 'dashboard', notifications: 'important' });
  // Step 8
  const [dataChoice, setDataChoice]     = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // Step 9
  const [dataImported, setDataImported] = useState(false);

  // ── Initialise modules from role ─────────────────────────────────────────
  useEffect(() => {
    if (selectedRole?.modules) {
      setSelectedModules(new Set(selectedRole.modules));
    }
  }, [selectedRole]);

  // ── Auto-connect branch when arriving at step 5 ──────────────────────────
  useEffect(() => {
    if (currentStep === 5 && selectedBranch && branchStatus === 'idle') {
      connectBranch();
    }
  }, [currentStep, selectedBranch]);

  const connectBranch = async () => {
    setBranchStatus('checking');
    try {
      const configs = await base44.entities.BranchConfig.list();
      const existing = configs.find(b =>
        b.branch_id === selectedBranch.id ||
        b.branch_name?.toLowerCase().includes(selectedBranch.name.toLowerCase().slice(0, 10))
      );
      if (existing) {
        setBranchRecord(existing);
        setBranchStatus('found');
        return;
      }
      // First user from this branch — provision it
      const newBranch = await base44.entities.BranchConfig.create({
        branch_id: selectedBranch.id,
        branch_name: selectedBranch.name,
        api_key: `key_${Math.random().toString(36).substr(2, 16)}`,
        hub_api_url: `${window.location.origin}/api/sync`,
        status: 'active',
        last_sync_result: 'pending',
      });
      // Try to seed demo data (non-fatal)
      try {
        await base44.functions.invoke('populateBranchData', {
          branch_id: selectedBranch.id,
          branch_name: selectedBranch.name,
          branch_region: selectedBranch.region,
        });
      } catch (e) {
        console.warn('Demo seed skipped:', e.message);
      }
      setBranchRecord(newBranch);
      setBranchStatus('created');
    } catch (err) {
      console.error('Branch connect failed:', err);
      setBranchStatus('error');
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goTo = useCallback((step) => {
    setTransition(true);
    setTimeout(() => { setCurrentStep(step); setTransition(false); }, 160);
  }, []);

  const canContinue = () => {
    if (currentStep === 1 && !selectedBranch) return false;
    if (currentStep === 2 && !selectedRole) return false;
    if (currentStep === 3 && (!personalInfo.full_name || !personalInfo.work_email)) return false;
    if (currentStep === 5) return branchStatus === 'found' || branchStatus === 'created' || branchStatus === 'error';
    if (currentStep === 8 && !dataChoice) return false;
    if (currentStep === 8 && dataChoice === 'import' && !uploadedFiles.length) return false;
    if (currentStep === 9 && dataChoice === 'import' && !dataImported) return false;
    return true;
  };

  const handleContinue = async () => {
    if (!canContinue()) return;

    // Skip AI parsing if not importing
    if (currentStep === 8 && dataChoice !== 'import') {
      goTo(10);
      return;
    }

    // Final step — save and redirect
    if (currentStep === TOTAL) {
      try {
        await base44.auth.updateMe({
          org_role:              selectedRole?.org_role || 'branch_staff',
          branch_id:             selectedBranch?.id || '',
          branch_name:           selectedBranch?.name || '',
          branch_region:         selectedBranch?.region || '',
          job_title:             selectedRole?.title || '',
          department:            selectedRole?.department || '',
          workspace_preference:  workspaceConfig.workspace,
          notifications_pref:    workspaceConfig.notifications,
          enabled_modules:       Array.from(selectedModules),
          line_manager:          personalInfo.line_manager || '',
          work_phone:            personalInfo.phone || '',
          onboarding_complete:   true,
          onboarding_role_id:    selectedRole?.id || '',
        });
      } catch (e) {
        console.warn('Profile save failed:', e.message);
      }
      window.location.href = selectedRole?.portal || '/coordinator-portal';
      return;
    }

    goTo(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep === 9) { setUploadedFiles([]); setDataImported(false); }
    if (currentStep === 5) { setBranchStatus('idle'); setBranchRecord(null); }
    goTo(currentStep - 1);
  };

  const toggleModule = (key) => {
    const s = new Set(selectedModules);
    s.has(key) ? s.delete(key) : s.add(key);
    setSelectedModules(s);
  };

  // ── Render step content ───────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBranchSelect selectedBranch={selectedBranch} onSelect={setBranch} />;

      case 2:
        return <StepRoleSelect selectedRole={selectedRole} onSelect={setRole} />;

      case 3:
        return (
          <StepPersonalInfo
            data={personalInfo}
            onChange={setPersonalInfo}
            selectedBranch={selectedBranch}
            selectedRole={selectedRole}
          />
        );

      case 4:
        return <StepRoleInsight selectedRole={selectedRole} selectedBranch={selectedBranch} />;

      case 5:
        return (
          <StepBranchConnect
            branch={selectedBranch}
            status={branchStatus}
            branchRecord={branchRecord}
            onRetry={() => { setBranchStatus('idle'); connectBranch(); }}
          />
        );

      case 6:
        return (
          <StepModuleSelect
            selectedRole={selectedRole}
            selectedModules={selectedModules}
            onToggle={toggleModule}
          />
        );

      case 7:
        return <StepWorkspaceConfig config={workspaceConfig} onChange={setWorkspaceConfig} />;

      case 8:
        // Sub-state: file picker
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
                  onChange={e => setUploadedFiles(Array.from(e.target.files || []))}
                  className="text-sm w-full cursor-pointer"
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">How would you like to populate your portal?</p>
            {[
              { id: 'import', icon: '📤', label: 'Import My Own Data',     desc: 'Upload existing spreadsheets — clients, volunteers, jobs' },
              { id: 'fresh',  icon: '✨', label: 'Start Fresh',             desc: 'Empty portal, add records manually as you go' },
              { id: 'demo',   icon: '👀', label: 'Explore with Demo Data',  desc: 'Keep sample data for now, import real data later' },
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

      case 9:
        return (
          <DataParsingGuide
            files={uploadedFiles}
            onComplete={() => setDataImported(true)}
            onError={err => console.error('Parse error:', err)}
          />
        );

      case 10:
        return (
          <div className="space-y-3">
            {[
              { icon: '🔒', title: 'Bank-Level Encryption',   desc: 'All data encrypted in transit and at rest using AES-256.' },
              { icon: '⚖️', title: 'GDPR Compliant',           desc: 'UK GDPR and Data Protection Act 2018. You control access.' },
              { icon: '👥', title: 'Role-Based Access',        desc: 'Each team member only sees data relevant to their role.' },
              { icon: '🏢', title: 'Branch Data Stays Local',  desc: 'Client and staff data never leaves your branch. Only aggregate stats go to the hub.' },
              { icon: '✅', title: 'Your Data, Your Control',  desc: 'Export or delete everything at any time. No lock-in.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="border border-border rounded-lg p-4 flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 11:
        return (
          <StepComplete
            selectedBranch={selectedBranch}
            selectedRole={selectedRole}
            personalInfo={personalInfo}
            selectedModules={selectedModules}
            workspaceConfig={workspaceConfig}
            dataChoice={dataChoice}
            dataImported={dataImported}
          />
        );

      default: return null;
    }
  };

  const step = STEPS[currentStep - 1];

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className={`max-w-2xl mx-auto py-10 px-5 transition-opacity duration-150 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>

        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Age UK Network</p>
          <h1 className="text-2xl font-bold mt-1">Smart Onboarding</h1>
        </div>

        {/* Progress bar */}
        <div className="mb-8 space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Step {currentStep} of {TOTAL}</span>
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / TOTAL) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary">{Math.round((currentStep / TOTAL) * 100)}%</span>
          </div>
          {/* Dots */}
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
            <CardTitle className="text-xl">{step.title}</CardTitle>
            <CardDescription>{step.desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}

            {/* Navigation */}
            <div className="flex gap-3 pt-4 border-t border-border">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={transitioning || (currentStep === 5 && branchStatus === 'checking')}>
                  Back
                </Button>
              )}
              <Button
                onClick={handleContinue}
                disabled={transitioning || !canContinue() || (currentStep === 5 && branchStatus === 'checking')}
                className="flex-1 py-5 text-base"
              >
                {transitioning ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Please wait…</span>
                ) : currentStep === 5 && branchStatus === 'checking' ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</span>
                ) : currentStep === TOTAL ? (
                  <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Enter My Portal</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">Continue <ChevronRight className="w-4 h-4" /></span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Branch / role context pill - shown from step 3 onward */}
        {currentStep >= 3 && (selectedBranch || selectedRole) && (
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            {selectedBranch && <span className="bg-muted px-2 py-1 rounded-full">📍 {selectedBranch.name}</span>}
            {selectedRole && <span className="bg-muted px-2 py-1 rounded-full">👤 {selectedRole.title}</span>}
          </div>
        )}
      </div>
    </div>
  );
}