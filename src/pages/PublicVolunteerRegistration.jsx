import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Upload, Users } from 'lucide-react';
import ProcessingFeedback from '@/components/ui/ProcessingFeedback';

const SKILLS = [
  'Befriending', 'Home Maintenance', 'Gardening', 'IT Support',
  'Shopping Assistance', 'Driving', 'Cooking/Meals', 'Handyman Skills',
  'Admin Help', 'Digital Skills Teaching'
];

const AVAILABILITY = [
  { day: 'Monday', times: ['Morning', 'Afternoon', 'Evening'] },
  { day: 'Tuesday', times: ['Morning', 'Afternoon', 'Evening'] },
  { day: 'Wednesday', times: ['Morning', 'Afternoon', 'Evening'] },
  { day: 'Thursday', times: ['Morning', 'Afternoon', 'Evening'] },
  { day: 'Friday', times: ['Morning', 'Afternoon', 'Evening'] },
  { day: 'Saturday', times: ['Morning', 'Afternoon'] },
  { day: 'Sunday', times: ['Morning', 'Afternoon'] }
];

export default function PublicVolunteerRegistration() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [dbsFile, setDbsFile] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    skills: [],
    availability: {},
    about: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleAvailability = (day, time) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day]?.includes(time)
          ? prev.availability[day].filter(t => t !== time)
          : [...(prev.availability[day] || []), time]
      }
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
        setDbsFile(file);
        setError(null);
      } else {
        setError('Please upload a PDF file under 5MB');
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.email || !formData.phone || !formData.role || formData.skills.length === 0 || !dbsFile) {
      setError('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await base44.functions.invoke('createVolunteerApplication', {
        volunteer_data: {
          name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          skills: formData.skills,
          availability: formData.availability,
          about: formData.about
        },
        dbs_file: dbsFile
      });

      if (response.data?.success) {
        setSubmitted(true);
      } else {
        setError(response.data?.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
        <Card className="max-w-md border-green-200">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-900 mb-2">Thank You!</h1>
              <p className="text-green-800">Your volunteer application has been received.</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-left text-sm">
              <p className="font-semibold text-green-900">What happens next:</p>
              <ul className="space-y-1 text-green-800">
                <li>✓ Your DBS documents will be verified</li>
                <li>✓ Our team will review your application</li>
                <li>✓ You'll receive an email within 7-10 days</li>
                <li>✓ Get started with your first volunteering opportunity</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Questions? Contact us at <a href="mailto:volunteers@charityhub.org" className="text-primary hover:underline">volunteers@charityhub.org</a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Become a Volunteer</h1>
          </div>
          <p className="text-lg text-muted-foreground">Join us in making a real difference in our community.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full transition ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {submitting && (
          <ProcessingFeedback
            label="Processing your application…"
            detail="Uploading your documents and registering as a volunteer."
            tips={[
              'Your DBS documents are securely stored.',
              'Our team will review your application shortly.',
              'You will receive a confirmation email once processed.',
            ]}
          />
        )}

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex gap-3 py-4">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1 of 3: Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <Input
                  placeholder="John Smith"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address *</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <Input
                  placeholder="0161 123 4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Preferred Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Select a role...</option>
                  <option value="befriender">Befriender</option>
                  <option value="handyperson">Handyperson</option>
                  <option value="digital_support">Digital Support</option>
                  <option value="general">General Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">About You (Optional)</label>
                <textarea
                  placeholder="Tell us a bit about yourself and why you want to volunteer..."
                  value={formData.about}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none h-24"
                />
              </div>
              <Button onClick={() => setStep(2)} className="w-full">Continue to Skills</Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Skills & Availability */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2 of 3: Skills & Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Select Your Skills *</label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(skill => (
                    <Badge
                      key={skill}
                      variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                      className="cursor-pointer px-3 py-2"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">When Can You Help? *</label>
                <div className="space-y-3">
                  {AVAILABILITY.map(({ day, times }) => (
                    <div key={day} className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{day}</p>
                      <div className="flex flex-wrap gap-2">
                        {times.map(time => (
                          <Badge
                            key={`${day}-${time}`}
                            variant={formData.availability[day]?.includes(time) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleAvailability(day, time)}
                          >
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continue to DBS</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: DBS Upload */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3 of 3: DBS Documents</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                All volunteers require DBS (Disclosure and Barring Service) verification for safeguarding.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-semibold text-blue-900">DBS Requirements:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Standard DBS check (preferred) or Enhanced DBS check</li>
                  <li>• Must be dated within the last 3 years</li>
                  <li>• PDF file format, maximum 5MB</li>
                  <li>• We'll verify against the DBS register</li>
                </ul>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-primary/5 transition"
                onClick={() => document.getElementById('dbs-input')?.click()}>
                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold text-foreground">Drop your DBS document here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
                {dbsFile && <p className="text-sm text-green-600 mt-2">✓ {dbsFile.name} selected</p>}
                <input
                  id="dbs-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Data Privacy:</strong> Your DBS documents are encrypted and stored securely. We only use them for safeguarding verification and comply fully with GDPR.
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="flex-1">Submit Application</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}