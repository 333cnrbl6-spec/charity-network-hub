import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Lock, Shield, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { playClick, playSuccess, playCover } from '@/lib/audio';

// --- Audio context safe resume helper ---
const resumeAudio = async () => {
  try {
    const ctx = window._audioCtx;
    if (ctx && ctx.state === 'suspended') await ctx.resume();
  } catch (_) {}
};

// --- Slides data (static, outside component) ---
const slides = [
  { title: 'Welcome to Age UK Handyperson Coordinator Portal', subtitle: 'Your command centre for service delivery', image: '📋', description: 'Manage appointments, supervise teams, and track service quality—all in one place.' },
  { title: 'Appointment Management', subtitle: 'Never miss a booking', image: '📅', description: 'Schedule handypeople, track response times, and meet funder deadlines effortlessly.' },
  { title: 'Team Supervision', subtitle: 'Support your handypeople daily', image: '👥', description: 'Daily contact logs, task assignments, expense tracking, and performance monitoring.' },
  { title: 'Customer & Quality Tracking', subtitle: 'Build trust through transparency', image: '⭐', description: 'Monitor satisfaction, log compliments, handle complaints, and prove impact.' },
  { title: 'Compliance & Reporting', subtitle: 'Stay audit-ready', image: '✅', description: 'GDPR-compliant data, financial records, health & safety logs, and funder reports.' },
  { title: 'Mobile Handyperson App', subtitle: 'Optional—power in your pocket', image: '📱', description: 'Jobs on-site, photo documentation, signatures, and instant updates to Sue.' }
];

// --- Step content components (static, outside main component) ---
function StepRole() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Age UK describes your role as:</p>
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-sm mb-1">Core Responsibilities</h4>
        <ul className="text-sm space-y-1 text-foreground">
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> Manage appointment bookings for handypeople</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> Supervise handyperson team daily</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> Ensure service meets contract deadlines</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> Monitor customer satisfaction &amp; complaints</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> Maintain financial &amp; admin records</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> Ensure GDPR &amp; health/safety compliance</li>
        </ul>
      </div>
      <p className="text-xs text-muted-foreground italic">We've built this portal specifically to make these tasks simpler. Ready to continue?</p>
    </div>
  );
}

function StepWorkspace({ selected, onSelect }) {
  const options = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard View', desc: "See today's jobs, team status, and alerts at a glance", badge: 'Recommended for coordinators', badgeVariant: 'default' },
    { id: 'list', icon: '📋', label: 'List View', desc: 'Detailed appointment & job list with filters', badge: 'Clean & straightforward', badgeVariant: 'secondary' },
    { id: 'calendar', icon: '🗓️', label: 'Calendar View', desc: 'Visual schedule of all bookings and team assignments', badge: 'Plan ahead visually', badgeVariant: 'outline' },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {options.map(opt => (
          <Card
            key={opt.id}
            onClick={() => { playClick(); onSelect(opt.id); }}
            className={`cursor-pointer border-2 transition-all duration-200 ${selected === opt.id ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-primary/40'}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {opt.icon} {opt.label}
                {selected === opt.id && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
              </CardTitle>
              <CardDescription>{opt.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={opt.badgeVariant}>{opt.badge}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">You can change this anytime in settings.</p>
    </div>
  );
}

function StepImport() {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-sm text-blue-900">Drop Your Files Here</h4>
        <p className="text-sm text-blue-800">Have existing spreadsheets? No problem. We'll transform them into your database.</p>
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-100 transition-colors">
          <div className="text-3xl mb-2">📁</div>
          <p className="text-sm font-medium text-blue-900">Drag &amp; drop Excel/CSV files here</p>
          <p className="text-xs text-blue-700 mt-1">Or click to browse</p>
        </div>
        <div className="bg-white rounded p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">We can import:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Client contact details &amp; addresses</li>
            <li>• Job history &amp; service records</li>
            <li>• Handyperson team info</li>
            <li>• Payment &amp; expense records</li>
          </ul>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Don't worry if your files are not perfect - we will guide you through any questions.</p>
    </div>
  );
}

function StepSafety() {
  const items = [
    { icon: Lock, title: 'Bank-Level Encryption', desc: 'All data is encrypted in transit and at rest.' },
    { icon: Shield, title: 'GDPR Compliant', desc: 'We follow UK data protection regulations. Only you control who sees what data.' },
    { icon: FileText, title: 'Role-Based Access', desc: 'Your handypeople see jobs—not compliance data. Role-specific visibility.' },
    { icon: CheckCircle2, title: 'Your Data, Your Control', desc: 'You can download or delete all your data at any time. No lock-in.' },
  ];
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold">Terms &amp; Conditions</p>
        <p className="text-xs text-muted-foreground">By using this service, you're signing up to use a platform built specifically for Age UK coordinators. Your data is private, your usage is monitored only for support, and you can cancel anytime.</p>
      </div>
    </div>
  );
}

function StepReady({ showMobilePreview, onToggleMobilePreview }) {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
        <div>
          <h4 className="font-semibold text-green-900">Welcome to Your Coordinator Portal, Sue!</h4>
          <p className="text-sm text-green-800 mt-2">Everything is ready. Start managing appointments, supervising your team, and tracking impact.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Optional: Mobile App for Your Team</CardTitle>
          <CardDescription>Make fieldwork even easier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="text-sm space-y-2 ml-4">
            <li>✓ See today's jobs with one tap</li>
            <li>✓ Take photos of work completed</li>
            <li>✓ Get customer signatures on-site</li>
            <li>✓ Message you directly if issues arise</li>
          </ul>
          <Button variant="outline" className="w-full" onClick={() => { playClick(); onToggleMobilePreview(); }}>
            {showMobilePreview ? 'Hide' : 'Show'} Mobile App Preview
          </Button>
          {showMobilePreview && (
            <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-2 text-xs">
              <p className="font-semibold">📱 Handyperson Mobile App Preview</p>
              <div className="bg-white rounded p-3 border border-border/50">
                <div className="bg-gray-100 rounded p-4 h-40 flex items-center justify-center text-gray-500">[Mobile app mockup view]</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main onboarding component ---
export default function RoleOnboarding() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = slideshow, 1-5 = steps
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedWorkspace, setSelectedWorkspace] = useState('dashboard');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const TOTAL_STEPS = 5;

  // Auto-advance slideshow
  useEffect(() => {
    if (currentStep !== 0) return;
    const timer = setTimeout(() => setSlideIndex(prev => (prev + 1) % slides.length), 5000);
    return () => clearTimeout(timer);
  }, [slideIndex, currentStep]);

  const advanceWithFeedback = useCallback((nextStep) => {
    setIsTransitioning(true);
    playClick();
    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsTransitioning(false);
    }, 250);
  }, []);

  const handleStartSetup = () => {
    playCover();
    advanceWithFeedback(1);
  };

  const handleContinue = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep >= TOTAL_STEPS) {
      playSuccess();
      setTimeout(() => { window.location.href = '/clients'; }, 400);
    } else {
      playSuccess();
      advanceWithFeedback(currentStep + 1);
    }
  };

  const handleBack = () => {
    playClick();
    advanceWithFeedback(currentStep - 1);
  };

  const stepContent = [
    null, // placeholder for index 0
    <StepRole key="role" />,
    <StepWorkspace key="workspace" selected={selectedWorkspace} onSelect={setSelectedWorkspace} />,
    <StepImport key="import" />,
    <StepSafety key="safety" />,
    <StepReady key="ready" showMobilePreview={showMobilePreview} onToggleMobilePreview={() => setShowMobilePreview(p => !p)} />,
  ];

  const stepTitles = [
    null,
    'Understand Your Role',
    'Choose Your Workspace',
    'Import Your Data',
    'Data Safety & Compliance',
    'You are Ready!',
  ];

  const stepDescs = [
    null,
    'We have researched your Handyperson Coordinator responsibilities.',
    'Customise how you want to work.',
    'Bring your existing records into the system.',
    'Your data is protected. Here is how.',
    'Your workspace is set up. What is next?',
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* === SLIDESHOW === */}
      {currentStep === 0 && (
        <div className={`h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-full max-w-2xl px-6 py-12 space-y-8 text-center">
            <div className="text-6xl mb-4 transition-all duration-500">{slides[slideIndex].image}</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{slides[slideIndex].title}</h1>
              <p className="text-xl text-primary mb-4">{slides[slideIndex].subtitle}</p>
              <p className="text-muted-foreground text-lg">{slides[slideIndex].description}</p>
            </div>

            {/* Slide dots */}
            <div className="flex gap-2 justify-center">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { playClick(); setSlideIndex(idx); }}
                  className={`h-2 rounded-full transition-all duration-300 ${idx === slideIndex ? 'bg-primary w-8' : 'bg-primary/30 w-2'}`}
                />
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleStartSetup}
              className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
            >
              Start Setup <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* === ONBOARDING STEPS === */}
      {currentStep > 0 && (
        <div className={`max-w-3xl mx-auto py-12 px-6 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

          {/* Progress bar + step indicators */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Step {currentStep} of {TOTAL_STEPS}</span>
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-primary">{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
            </div>

            {/* Step pill indicators */}
            <div className="flex gap-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(step => (
                <div
                  key={step}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    completedSteps.has(step) ? 'bg-green-500' :
                    step === currentStep ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-1">
                {completedSteps.has(currentStep) && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                <CardTitle className="text-xl">{stepTitles[currentStep]}</CardTitle>
              </div>
              <CardDescription>{stepDescs[currentStep]}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {stepContent[currentStep]}

              {/* Navigation buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={isTransitioning}
                    className="active:scale-95 transition-transform"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleContinue}
                  disabled={isTransitioning}
                  className="flex-1 py-5 text-base shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                >
                  {isTransitioning ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
                  ) : currentStep === TOTAL_STEPS ? (
                    <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Finish &amp; Enter Portal</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">Continue <ChevronRight className="w-4 h-4" /></span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Completed steps summary */}
          {completedSteps.size > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from(completedSteps).sort().map(step => (
                <span key={step} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
                  <CheckCircle2 className="w-3 h-3" /> {stepTitles[step]}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}