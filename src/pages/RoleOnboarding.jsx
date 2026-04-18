import React, { useState, useEffect } from 'react';
import { ChevronRight, Lock, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RoleOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [userRole, setUserRole] = useState('handyperson_coordinator');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        setSlideIndex((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [slideIndex, currentStep]);

  const slides = [
    {
      title: 'Welcome to Age UK Handyperson Coordinator Portal',
      subtitle: 'Your command centre for service delivery',
      image: '📋',
      description: 'Manage appointments, supervise teams, and track service quality—all in one place.'
    },
    {
      title: 'Appointment Management',
      subtitle: 'Never miss a booking',
      image: '📅',
      description: 'Schedule handypeople, track response times, and meet funder deadlines effortlessly.'
    },
    {
      title: 'Team Supervision',
      subtitle: 'Support your handypeople daily',
      image: '👥',
      description: 'Daily contact logs, task assignments, expense tracking, and performance monitoring.'
    },
    {
      title: 'Customer & Quality Tracking',
      subtitle: 'Build trust through transparency',
      image: '⭐',
      description: 'Monitor satisfaction, log compliments, handle complaints, and prove impact.'
    },
    {
      title: 'Compliance & Reporting',
      subtitle: 'Stay audit-ready',
      image: '✅',
      description: 'GDPR-compliant data, financial records, health & safety logs, and funder reports.'
    },
    {
      title: 'Mobile Handyperson App',
      subtitle: 'Optional—power in your pocket',
      image: '📱',
      description: 'Jobs on-site, photo documentation, signatures, and instant updates to Sue.'
    }
  ];

  const onboardingSteps = [
    {
      title: 'Understand Your Role',
      description: 'We have researched your Handyperson Coordinator responsibilities.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Age UK describes your role as:
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">Core Responsibilities</h4>
              <ul className="text-sm space-y-1 text-foreground">
                <li>✓ Manage appointment bookings for handypeople</li>
                <li>✓ Supervise handyperson team daily</li>
                <li>✓ Ensure service meets contract deadlines</li>
                <li>✓ Monitor customer satisfaction & complaints</li>
                <li>✓ Maintain financial & admin records</li>
                <li>✓ Ensure GDPR & health/safety compliance</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground italic">
            We've built this portal specifically to make these tasks simpler. Ready to continue?
          </p>
        </div>
      )
    },
    {
      title: 'Choose Your Workspace',
      description: 'Customize how you want to work.',
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <Card className="cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">📊 Dashboard View</CardTitle>
                <CardDescription>See today's jobs, team status, and alerts at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge>Recommended for coordinators</Badge>
              </CardContent>
            </Card>
            <Card className="cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">📋 List View</CardTitle>
                <CardDescription>Detailed appointment & job list with filters</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Clean & straightforward</Badge>
              </CardContent>
            </Card>
            <Card className="cursor-pointer border-2 border-transparent hover:border-primary transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">🗓️ Calendar View</CardTitle>
                <CardDescription>Visual schedule of all bookings and team assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Plan ahead visually</Badge>
              </CardContent>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground">You can change this anytime in settings.</p>
        </div>
      )
    },
    {
      title: 'Import Your Data',
      description: 'Bring your existing records into the system.',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm text-blue-900">Drop Your Files Here</h4>
            <p className="text-sm text-blue-800">
              Have existing spreadsheets? No problem. We'll transform them into your database.
            </p>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-100 transition-colors">
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm font-medium text-blue-900">Drag & drop Excel/CSV files here</p>
              <p className="text-xs text-blue-700 mt-1">Or click to browse</p>
            </div>
            <div className="bg-white rounded p-3 space-y-2">
              <p className="text-xs font-semibold text-foreground">We can import:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Client contact details & addresses</li>
                <li>• Job history & service records</li>
                <li>• Handyperson team info</li>
                <li>• Payment & expense records</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Don't worry if your files are not perfect - we will guide you through any questions.
          </p>
        </div>
      )
    },
    {
      title: 'Data Safety & Compliance',
      description: 'Your data is protected. Here is how.',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Bank-Level Encryption</h4>
                  <p className="text-sm text-muted-foreground">All data is encrypted in transit and at rest.</p>
                </div>
              </div>
            </div>
            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">GDPR Compliant</h4>
                  <p className="text-sm text-muted-foreground">We follow UK data protection regulations. Only you control who sees what data.</p>
                </div>
              </div>
            </div>
            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Role-Based Access</h4>
                  <p className="text-sm text-muted-foreground">Your handypeople see jobs—not compliance data. Role-specific visibility.</p>
                </div>
              </div>
            </div>
            <div className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Your Data, Your Control</h4>
                  <p className="text-sm text-muted-foreground">You can download or delete all your data at any time. No lock-in.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold">Terms & Conditions</p>
            <p className="text-xs text-muted-foreground">
              By using this service, you're signing up to use a platform built specifically for Age UK coordinators. Your data is private, your usage is monitored only for support, and you can cancel anytime.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'You are Ready!',
      description: 'Your workspace is set up. What is next?',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <h4 className="font-semibold text-green-900">Welcome to Your Coordinator Portal, Sue!</h4>
              <p className="text-sm text-green-800 mt-2">
                Everything is ready. Start managing appointments, supervising your team, and tracking impact.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Optional: Mobile App for Your Team</CardTitle>
              <CardDescription>Make fieldwork even easier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                Would you like to give your handypeople a mobile app? They can:
              </p>
              <ul className="text-sm space-y-2 ml-4">
                <li>✓ See today's jobs with one tap</li>
                <li>✓ Take photos of work completed</li>
                <li>✓ Get customer signatures on-site</li>
                <li>✓ Message you directly if issues arise</li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => setShowMobilePreview(!showMobilePreview)}
              >
                {showMobilePreview ? 'Hide' : 'Show'} Mobile App Preview
              </Button>
              {showMobilePreview && (
                <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-2 text-xs">
                  <p className="font-semibold">📱 Handyperson Mobile App Preview</p>
                  <div className="bg-white rounded p-3 space-y-2 border border-border/50">
                    <p className="text-xs text-muted-foreground italic">Visual representation of mobile interface...</p>
                    <div className="bg-gray-100 rounded p-4 h-40 flex items-center justify-center text-gray-500">
                      [Mobile app mockup view]
                    </div>
                  </div>
                  <Button variant="outline" className="w-full text-xs">Learn More About Mobile App</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const handleStepComplete = (step) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    if (step < onboardingSteps.length - 1) {
      setCurrentStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Slideshow */}
      {currentStep === 0 && (
        <div className="h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <div className="w-full max-w-2xl px-6 py-12 space-y-8 text-center">
            <div className="text-6xl mb-4">{slides[slideIndex].image}</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{slides[slideIndex].title}</h1>
              <p className="text-xl text-primary mb-4">{slides[slideIndex].subtitle}</p>
              <p className="text-muted-foreground text-lg">{slides[slideIndex].description}</p>
            </div>

            <div className="flex gap-2 justify-center">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === slideIndex ? 'bg-primary w-8' : 'bg-primary/30 w-2'
                  }`}
                />
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => setCurrentStep(1)}
              className="w-full"
            >
              Start Setup <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Onboarding Steps */}
      {currentStep > 0 && (
        <div className="max-w-3xl mx-auto py-12 px-6">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium">Step {currentStep} of {onboardingSteps.length}</span>
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(currentStep / onboardingSteps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Current Step */}
          <Card>
            <CardHeader>
              <CardTitle>{onboardingSteps[currentStep - 1].title}</CardTitle>
              <CardDescription>{onboardingSteps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {onboardingSteps[currentStep - 1].content}

              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (currentStep === onboardingSteps.length) {
                      window.location.href = '/dashboard';
                    } else {
                      handleStepComplete(currentStep - 1);
                    }
                  }}
                  className="flex-1"
                >
                  {currentStep === onboardingSteps.length ? 'Finish & Enter Portal' : 'Continue'}{' '}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}