import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, Lock, Shield, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  { title: 'Data Safety & Compliance', desc: 'Your data is protected. Here is how.' },
  { title: 'You are Ready!', desc: 'Your workspace is set up. What is next?' },
];

const WORKSPACE_OPTIONS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard View', desc: "See today's jobs, team status, and alerts at a glance", badge: 'Recommended for coordinators' },
  { id: 'list', icon: '📋', label: 'List View', desc: 'Detailed appointment & job list with filters', badge: 'Clean & straightforward' },
  { id: 'calendar', icon: '🗓️', label: 'Calendar View', desc: 'Visual schedule of all bookings and team assignments', badge: 'Plan ahead visually' },
];

export default function RoleOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedWorkspace, setSelectedWorkspace] = useState('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const handleContinue = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep >= TOTAL) {
      setTimeout(() => { window.location.href = '/coordinator-portal'; }, 400);
    } else {
      goTo(currentStep + 1);
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

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h4 className="font-semibold text-green-900 text-lg">Welcome to Your Coordinator Portal!</h4>
              <p className="text-sm text-green-800">Everything is ready. Start managing appointments, supervising your team, and tracking impact.</p>
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
                  <Button variant="outline" onClick={() => goTo(currentStep - 1)} disabled={isTransitioning}>
                    Back
                  </Button>
                )}
                <Button onClick={handleContinue} disabled={isTransitioning} className="flex-1 py-5 text-base">
                  {isTransitioning
                    ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</span>
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