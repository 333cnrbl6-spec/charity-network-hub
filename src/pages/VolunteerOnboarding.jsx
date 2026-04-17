import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle2, ClipboardCheck, Calendar, Mail, ArrowRight } from 'lucide-react';
import SignatureCapture from '@/components/forms/SignatureCapture';
import AvailabilityScheduler from '@/components/forms/AvailabilityScheduler';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { playSuccess, playClick } from '@/lib/audio';

const STEPS = [
  { id: 1, label: 'Personal Info', icon: 'User' },
  { id: 2, label: 'DBS Consent', icon: 'ClipboardCheck' },
  { id: 3, label: 'Availability', icon: 'Calendar' },
  { id: 4, label: 'Review', icon: 'CheckCircle2' },
];

const VOLUNTEER_ROLES = [
  'Befriender',
  'Digital Champion',
  'Transport Driver',
  'Reception Volunteer',
  'Ageing Well Facilitator',
  'Shop Volunteer',
  'Other',
];

export default function VolunteerOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    area: '',
    role: '',
    startDate: '',
    dbsConsent: false,
    dbsSignature: null,
    availability: {},
    termsAccepted: false,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignatureCapture = (signature) => {
    setFormData(prev => ({ ...prev, dbsSignature: signature }));
  };

  const handleAvailabilityChange = (availability) => {
    setFormData(prev => ({ ...prev, availability }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.phone && formData.role && formData.area;
      case 2:
        return formData.dbsConsent && formData.dbsSignature;
      case 3:
        return Object.keys(formData.availability).length > 0;
      case 4:
        return formData.termsAccepted;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    playClick();
    setLoading(true);
    try {
      // Create volunteer record
      const volunteer = await base44.entities.Volunteer.create({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role.toLowerCase().replace(/\s+/g, '-'),
        status: 'active',
        dbs_checked: false,
        date_joined: new Date().toISOString().split('T')[0],
        area: formData.area,
      });

      // Send welcome email
      await base44.functions.invoke('sendVolunteerWelcomeEmail', {
        volunteer_name: formData.fullName,
        volunteer_email: formData.email,
        branch_id: formData.area.toLowerCase(),
        role: formData.role,
        start_date: formData.startDate,
      });

      playSuccess();
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-700" />
            </div>
            <CardTitle className="text-green-900">Welcome Aboard!</CardTitle>
            <CardDescription className="text-green-700">
              Your volunteer application has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-green-800">
              A welcome email has been sent to <strong>{formData.email}</strong> with your local branch details and next steps.
            </p>
            <div className="bg-white p-3 rounded-lg space-y-2 text-left text-sm">
              <p><strong>Next Steps:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>DBS check will be processed within 5-10 business days</li>
                <li>You will receive a welcome call from your coordinator</li>
                <li>Complete any required training</li>
                <li>Schedule your first shift</li>
              </ul>
            </div>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
      <LoadingIndicator isLoading={loading} message="Processing your application..." />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Volunteer Onboarding</h1>
          <p className="text-muted-foreground mt-2">Join our team and make a difference in your community</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                    step.id <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                <p className={`ml-3 text-sm font-medium ${
                  step.id <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    step.id < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Smith"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="07700 000000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="text-sm font-medium">Preferred Role *</Label>
                  <Select value={formData.role} onValueChange={(val) => handleInputChange('role', val)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {VOLUNTEER_ROLES.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="area" className="text-sm font-medium">Local Branch *</Label>
                  <Select value={formData.area} onValueChange={(val) => handleInputChange('area', val)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manchester">Manchester</SelectItem>
                      <SelectItem value="Bristol">Bristol</SelectItem>
                      <SelectItem value="London">London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium">Preferred Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Step 2: DBS Consent */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900 text-sm">DBS Check Required</p>
                      <p className="text-sm text-blue-700 mt-1">
                        All volunteers must undergo a Disclosure and Barring Service check for safeguarding purposes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                  <p className="text-sm font-medium">DBS Check Information:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                    <li>Processing typically takes 5-10 working days</li>
                    <li>You will need to provide ID documentation</li>
                    <li>Results are confidential</li>
                    <li>A valid check is required before starting shifts</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Digital Signature (for DBS consent)</Label>
                  <SignatureCapture onSignatureCapture={handleSignatureCapture} />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="dbsConsent"
                    checked={formData.dbsConsent}
                    onCheckedChange={(val) => handleInputChange('dbsConsent', val)}
                  />
                  <Label htmlFor="dbsConsent" className="text-sm cursor-pointer">
                    I consent to a DBS check and confirm the information provided is accurate
                  </Label>
                </div>
              </div>
            )}

            {/* Step 3: Availability */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please indicate when you are available to volunteer. Select all applicable days and times.
                </p>
                <AvailabilityScheduler onAvailabilityChange={handleAvailabilityChange} />
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">Personal Information</p>
                      <p className="text-sm text-muted-foreground mt-1">{formData.fullName}</p>
                      <p className="text-sm text-muted-foreground">{formData.email}</p>
                      <p className="text-sm text-muted-foreground">{formData.phone}</p>
                    </div>
                    <Badge variant="outline">{formData.role}</Badge>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <p className="font-semibold text-sm">Branch & Availability</p>
                  <p className="text-sm text-muted-foreground">{formData.area}</p>
                  <p className="text-sm text-muted-foreground">{Object.keys(formData.availability).length} time slots selected</p>
                </div>

                <div className="flex items-start gap-3 pt-4">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(val) => handleInputChange('termsAccepted', val)}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    I confirm that all information provided is accurate and I agree to Age UK's volunteer policies and safeguarding procedures.
                  </Label>
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation */}
          <div className="border-t p-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Submit Application
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className="gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}