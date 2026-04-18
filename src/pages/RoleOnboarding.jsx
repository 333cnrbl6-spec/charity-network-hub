import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Lock, Shield, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import DataParsingGuide from '@/components/onboarding/DataParsingGuide';

const slides = [
  { title: 'Welcome to Age UK Handyperson Coordinator Portal', subtitle: 'Your command centre for service delivery', image: '📋', description: 'Manage appointments, supervise teams, and track service quality—all in one place.' },
  { title: 'Appointment Management', subtitle: 'Never miss a booking', image: '📅', description: 'Schedule handypeople, track response times, and meet funder deadlines effortlessly.' },
  { title: 'Team Supervision', subtitle: 'Support your handypeople daily', image: '👥', description: 'Daily contact logs, task assignments, expense tracking, and performance monitoring.' },
  { title: 'Customer & Quality Tracking', subtitle: 'Build trust through transparency', image: '⭐', description: 'Monitor satisfaction, log compliments, handle complaints, and prove impact.' },
  { title: 'Compliance & Reporting', subtitle: 'Stay audit-ready', image: '✅', description: 'GDPR-compliant data, financial records, health & safety logs, and funder reports.' },
];

const STEPS = [
  { title: 'Understand Your Role', desc: 'We have researched your Handyperson Coordinator responsibilities.' },
  { title: 'Choose Your Workspace', desc: 'Customise how you want to work.' },
  { title: 'Select Your Modules', desc: 'Enable additional features you manage.' },
  { title: 'Import Your Data', desc: 'Replace demo data with your real records or start fresh.' },
  { title: 'AI Data Parsing', desc: 'We\'ll intelligently map your data to our system.' },
  { title: 'Data Safety & Compliance', desc: 'Your data is protected. Here is how.' },
  { title: 'You are Ready!', desc: 'Your workspace is fully set up. Enter the portal.' },
];

const WORKSPACE_OPTIONS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard View', desc: "See today's jobs, team status, and alerts at a glance", badge: 'Recommended for coordinators' },
  { id: 'list', icon: '📋', label: 'List View', desc: 'Detailed appointment & job list with filters', badge: 'Clean & straightforward' },
  { id: 'calendar', icon: '🗓️', label: 'Calendar View', desc: 'Visual schedule of all bookings and team assignments', badge: 'Plan ahead visually' },
];

const MODULES = [
  { id: 'risk-flagging', icon: '⚠️', label: 'At-Risk Client Flagging', desc: 'Identify and track vulnerable clients needing escalation' },
  { id: 'referrals', icon: '➡️', label: 'Referrals', desc: 'Manage referrals to other Age UK departments' },
  { id: 'befriending', icon: '💬', label: 'Befriending', desc: 'Coordinate befriending services and check-ins' },
  { id: 'hospital', icon: '🏥', label: 'Home from Hospital', desc: 'Track post-hospital support and recovery progress' },
  { id: 'info-advice', icon: '💡', label: 'Information & Advice', desc: 'Provide and record information/advice sessions' },
];

export default function RoleOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedWorkspace, setSelectedWorkspace] = useState('dashboard');
  const [selectedModules, setSelectedModules] = useState(new Set());
  const [demoDataAction, setDemoDataAction] = useState(null); // 'keep' | 'clear' | 'upload'
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [dataImported, setDataImported] = useState(false);

  const TOTAL = STEPS.length;

  useEffect(() => {
    if (currentStep !== 0) return;
    const t = setTimeout(() => setSlideIndex(i => (i + 1) % slides.length), 5000);
    return () => clearTimeout(t);
  }, [slideIndex, currentStep]);

  const goTo = useCallback((step) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const handleContinue = async () => {
    // If on step 4 with upload and files shown but not yet parsed, don't advance
    if (currentStep === 4 && demoDataAction === 'upload' && uploadedFiles.length > 0 && !dataImported) {
      return; // Stay on step 4, DataParsingGuide handles progression
    }

    // If on step 4 and no action selected yet, don't advance
    if (currentStep === 4 && !demoDataAction) {
      return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (currentStep >= TOTAL) {
      setTimeout(() => { window.location.href = '/coordinator-portal'; }, 400);
    } else {
      goTo(currentStep + 1);
    }
  };

  const clearDemoData = async () => {
    try {
      const response = await base44.functions.invoke('clearSueBradleyData', {});
      if (response.data.success) {
        console.log('All data cleared successfully');
      }
    } catch (error) {
      console.error('Failed to clear demo data:', error);
      throw error;
    }
  };

  const uploadUserData = async () => {
    try {
      const formData = new FormData();
      uploadedFiles.forEach(file => formData.append('files', file));
      
      const response = await base44.functions.invoke('importUserData', {
        files: uploadedFiles
      });
      
      if (response.data.success) {
        console.log('Data imported successfully');
      }
    } catch (error) {
      console.error('Failed to upload data:', error);
      throw error;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Age UK describes your role as:</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3">Core Responsibilities</h4>
              <ul className="text-sm space-y-2">
                {['Manage appointment bookings for handypeople','Supervise handyperson team daily','Ensure service meets contract deadlines','Monitor customer satisfaction & complaints','Maintain financial & admin records','Ensure GDPR & health/safety compliance'].map(r => (
                  <li key={r} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <span className="text-amber-600 text-lg flex-shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-amber-800">Demo data is currently loaded</p>
                <p className="text-xs text-amber-700 mt-0.5">Your portal has sample data for demonstration. You can import your real records at any time from the portal.</p>
              </div>
            </div>
          </div>
        );

      case 2:
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
            <p className="text-xs text-muted-foreground">You can change this anytime in settings.</p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">Select the additional modules you manage:</p>
            <div className="space-y-2">
              {MODULES.map(mod => (
                <Card
                  key={mod.id}
                  onClick={() => {
                    const newModules = new Set(selectedModules);
                    if (newModules.has(mod.id)) {
                      newModules.delete(mod.id);
                    } else {
                      newModules.add(mod.id);
                    }
                    setSelectedModules(newModules);
                  }}
                  className={`cursor-pointer border-2 transition-all duration-200 ${selectedModules.has(mod.id) ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/40'}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {mod.icon} {mod.label}
                      {selectedModules.has(mod.id) && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                    </CardTitle>
                    <CardDescription>{mod.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">You can enable or disable modules later from settings.</p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">How would you like to start?</p>
            
            {!demoDataAction ? (
              <div className="space-y-2">
                <Card
                  onClick={() => setDemoDataAction('upload')}
                  className={`cursor-pointer border-2 transition-all ${
                    demoDataAction === 'upload' ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/40'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      📤 Import Your Data
                      {demoDataAction === 'upload' && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                    </CardTitle>
                    <CardDescription className="text-xs">Upload your client, volunteer & job records (CSV, Excel, JSON)</CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  onClick={() => setDemoDataAction('fresh')}
                  className={`cursor-pointer border-2 transition-all ${
                    demoDataAction === 'fresh' ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/40'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      ✨ Start Fresh
                      {demoDataAction === 'fresh' && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                    </CardTitle>
                    <CardDescription className="text-xs">Begin with an empty portal and add data manually</CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  onClick={() => setDemoDataAction('explore')}
                  className={`cursor-pointer border-2 transition-all ${
                    demoDataAction === 'explore' ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/40'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      👀 Explore Demo Data
                      {demoDataAction === 'explore' && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                    </CardTitle>
                    <CardDescription className="text-xs">Play with sample records first, import real data later</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ) : demoDataAction === 'upload' && !uploadedFiles.length ? (
              <div className="p-4 border-2 border-dashed border-primary rounded-lg">
                <p className="text-xs text-muted-foreground mb-3">Supported formats: CSV, Excel (.xlsx), JSON</p>
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.json"
                  onChange={(e) => {
                    setUploadedFiles(Array.from(e.target.files || []));
                    setParseError(null);
                  }}
                  className="text-sm w-full cursor-pointer"
                />
                {parseError && (
                  <p className="text-xs text-red-600 mt-2">Error: {parseError}</p>
                )}
              </div>
            ) : demoDataAction === 'upload' && uploadedFiles.length > 0 ? (
              <DataParsingGuide
                files={uploadedFiles}
                onComplete={(result) => {
                  setDataImported(true);
                  setParseError(null);
                }}
                onError={(error) => {
                  setParseError(error);
                }}
              />
            ) : null}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            {demoDataAction === 'upload' && dataImported ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-green-900 text-sm">✓ Data Import Complete</h4>
                <p className="text-xs text-green-800">Your files have been parsed and mapped to your system. The next step covers data security.</p>
              </div>
            ) : demoDataAction === 'fresh' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-blue-900 text-sm">Fresh Portal Ready</h4>
                <p className="text-xs text-blue-800">Your portal is empty and ready. Add clients, volunteers, and jobs as needed. You can always import data later from settings.</p>
              </div>
            ) : demoDataAction === 'explore' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-amber-900 text-sm">Demo Data Loaded</h4>
                <p className="text-xs text-amber-800">Sample data is ready to explore. When you're ready to use real data, go to Settings → Data Import.</p>
              </div>
            ) : null}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            {[
              { icon: Lock, title: 'Bank-Level Encryption', desc: 'All data is encrypted in transit and at rest.' },
              { icon: Shield, title: 'GDPR Compliant', desc: 'We follow UK data protection regulations. Only you control who sees what data.' },
              { icon: FileText, title: 'Role-Based Access', desc: 'Your handypeople see jobs—not compliance data. Role-specific visibility.' },
              { icon: CheckCircle2, title: 'Your Data, Your Control', desc: 'You can download or delete all your data at any time. No lock-in.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border border-border rounded-lg p-4 flex items-start gap-3">
                <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">{title}</h4>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="font-semibold text-green-900 text-lg">Welcome to Your Coordinator Portal!</h4>
              <p className="text-sm text-green-800">Everything is ready. Start managing appointments, supervising your team, and tracking impact.</p>
              {demoDataAction && (
                <p className="text-xs text-green-700 pt-2 border-t border-green-200 mt-3">
                  {demoDataAction === 'upload' && dataImported && '✓ Your data imported and ready to use'}
                  {demoDataAction === 'fresh' && '✓ Fresh portal ready for your data'}
                  {demoDataAction === 'explore' && '✓ Demo data loaded for exploration'}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentStep === 0 && (
        <div className={`h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-full max-w-2xl px-6 py-12 space-y-8 text-center">
            <div className="text-6xl">{slides[slideIndex].image}</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{slides[slideIndex].title}</h1>
              <p className="text-xl text-primary mb-4">{slides[slideIndex].subtitle}</p>
              <p className="text-muted-foreground text-lg">{slides[slideIndex].description}</p>
            </div>
            <div className="flex gap-2 justify-center">
              {slides.map((_, idx) => (
                <button key={idx} onClick={() => setSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === slideIndex ? 'bg-primary w-8' : 'bg-primary/30 w-2'}`} />
              ))}
            </div>
            <Button size="lg" onClick={() => goTo(1)} className="w-full text-lg py-6 shadow-lg">
              Start Setup <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {currentStep > 0 && (
        <div className={`max-w-3xl mx-auto py-12 px-6 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Step {currentStep} of {TOTAL}</span>
              <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${(currentStep / TOTAL) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-primary">{Math.round((currentStep / TOTAL) * 100)}%</span>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">{STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription>{STEPS[currentStep - 1].desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderStepContent()}
              <div className="flex gap-3 pt-4 border-t border-border">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={() => goTo(currentStep - 1)} disabled={isTransitioning || isProcessing}>
                    Back
                  </Button>
                )}
                <Button 
                  onClick={handleContinue} 
                  disabled={
                    isTransitioning || 
                    isProcessing || 
                    (currentStep === 4 && !demoDataAction) ||
                    (currentStep === 4 && demoDataAction === 'upload' && uploadedFiles.length > 0 && !dataImported)
                  } 
                  className="flex-1 py-5 text-base"
                >
                  {isTransitioning
                    ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</span>
                    : (currentStep === 4 && demoDataAction === 'upload' && uploadedFiles.length > 0 && !dataImported)
                    ? <span className="flex items-center justify-center gap-2">Parsing data...</span>
                    : currentStep === TOTAL
                      ? <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Finish & Enter Portal</span>
                      : <span className="flex items-center justify-center gap-2">Continue <ChevronRight className="w-4 h-4" /></span>
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}