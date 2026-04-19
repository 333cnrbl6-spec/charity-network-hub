import React, { useState, useEffect } from 'react';
import { CheckCircle2, Shield, Lock, Users, Calendar, TrendingUp, ChevronRight, BadgeCheck, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';

export default function SueBradleyOnboarding() {
  const [step, setStep] = useState('welcome');
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      setIsAuthenticated(authed);
      // If already logged in, go straight to role onboarding (not the hub dashboard)
      if (authed) {
        window.location.href = '/role-onboarding';
      }
    });
  }, []);

  if (step === 'onboarding') {
    window.location.href = '/dashboard';
    return null;
  }

  // Show sign-in prompt if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-3 w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <LogIn className="w-7 h-7 text-primary" />
            </div>
            <CardTitle>Welcome, Sue Bradley</CardTitle>
            <CardDescription>
              Please sign in with your Age UK email address to access your Coordinator Portal setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              className="w-full"
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
            >
              Sign In to Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <p className="text-xs text-muted-foreground">
              You should have received an invite email from Age UK. Use that link to set up your password first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Pre-Authorization Banner */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-green-900">
          <BadgeCheck className="w-5 h-5 flex-shrink-0 text-green-600" />
          <span><strong>Pre-authorized by William Mark Bradley</strong> — Age UK Leadership. This is a secure, approved setup.</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground">Age UK Bury</h2>
            <h1 className="text-2xl font-bold">Welcome, Sue Bradley</h1>
          </div>
          <Badge className="bg-green-100 text-green-900">Handyperson Coordinator</Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Your Coordinator Portal is Ready</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for Age UK handyperson coordinators. Manage appointments, supervise teams, and track impact—all in one place.
            </p>
          </div>

          {/* What We Know About You */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                We Know Your Role
              </CardTitle>
              <CardDescription>
                We researched what Age UK describes as your responsibilities as Handyperson Coordinator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Appointment Management
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Book handypeople, meet response time deadlines, manage funder contract specs.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Team Supervision
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Daily contact logs, task assignments, expense tracking, support & development.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Quality & Impact Tracking
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor customer satisfaction, log compliments, handle complaints, prove outcomes.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Compliance & Reporting
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    GDPR-compliant data, health & safety logs, financial records, funder reports.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Safety */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Your Data is Completely Safe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3 text-sm text-green-900">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span><strong>Bank-level encryption</strong> for all data</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span><strong>GDPR compliant</strong> — UK data protection laws</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span><strong>Role-based access</strong> — handypeople see only jobs</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span><strong>You own your data</strong> — download or delete anytime</span>
                </div>
              </div>
              <div className="bg-white/50 rounded p-3 text-xs text-green-900 italic border border-green-200">
                <strong>Terms & Conditions:</strong> This is your private, role-specific workspace for Age UK Bury. Your usage is monitored only for support. You can cancel anytime and take your data with you.
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">What You Can Do</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">📋 Manage Appointments</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Book jobs for your handypeople, ensure deadlines are met, track completion in real-time.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">👥 Supervise Your Team</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Daily logs, task assignments, expense tracking, and professional development records.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">📊 Track Impact</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  See how many clients you've helped, hours invested, complaints vs. compliments.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">📁 Import Your Data</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Drag and drop your Excel spreadsheets. We'll transform them into your database.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">✅ Stay Compliant</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  GDPR, health & safety, financial records—all audit-ready and organized.
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">📱 Optional Mobile App</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Let your handypeople see jobs, take photos, and sign off work on-site.
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Personalization Offer */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>Make This Your Own</CardTitle>
              <CardDescription>
                In the setup, you'll choose how you want to work—dashboard view, list, or calendar. You can change it anytime.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* CTA */}
          <div className="space-y-4">
            <Button
              size="lg"
              onClick={() => window.location.href = '/role-onboarding'}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Start Your Setup <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Takes about 5-10 minutes. No technical knowledge needed.
            </p>
          </div>

          {/* Reassurance Footer */}
          <div className="border-t pt-8 text-center space-y-2">
            <p className="text-sm font-semibold">Questions?</p>
            <p className="text-sm text-muted-foreground">
              We've built in help throughout the setup process. Click "Help" or "?" anytime for guidance.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Age UK Bury | Handyperson Coordinator Portal | Version 1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}