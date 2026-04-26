import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2 } from 'lucide-react';

const CAUSE_AREAS = ['health', 'education', 'environment', 'poverty', 'disability', 'elderly', 'animal_welfare', 'arts', 'community', 'other'];

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    charity_number: '',
    cause_area: '',
    description: '',
    campaign_title: '',
    campaign_description: '',
    trustee_email: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step === 3) {
      // Final step - complete onboarding
      setLoading(true);
      try {
        // Create charity
        const charity = await base44.entities.Charity.create({
          name: formData.name,
          charity_number: formData.charity_number,
          cause_area: formData.cause_area,
          description: formData.description,
          subscription_tier: 'starter',
          onboarding_complete: true
        });

        // Create first campaign
        if (formData.campaign_title) {
          await base44.entities.Campaign.create({
            charity_id: charity.id,
            title: formData.campaign_title,
            description: formData.campaign_description,
            goal_amount: 5000,
            status: 'draft'
          });
        }

        // Update current user
        await base44.auth.updateMe({ onboarding_complete: true, current_charity_id: charity.id });

        setStep(4);
      } catch (error) {
        console.error('Onboarding failed:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  if (step === 4) {
    return (
      <Card className="border-green-300 bg-green-50">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to CharityHub!</h2>
          <p className="text-gray-700 mb-6">Your charity is all set up. You can now start managing campaigns, donors, and grants.</p>
          <Button onClick={() => window.location.href = '/dashboard'} className="bg-green-600 hover:bg-green-700">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Set Up Your Charity - Step {step}/3</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Charity Name</label>
              <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Your charity name" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Charity Number</label>
              <Input value={formData.charity_number} onChange={(e) => handleInputChange('charity_number', e.target.value)} placeholder="e.g., 1234567" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Cause Area</label>
              <Select value={formData.cause_area} onValueChange={(value) => handleInputChange('cause_area', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cause area" />
                </SelectTrigger>
                <SelectContent>
                  {CAUSE_AREAS.map(area => (
                    <SelectItem key={area} value={area}>{area.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Mission Statement</label>
              <Input value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="What does your charity do?" as="textarea" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Campaign Title</label>
              <Input value={formData.campaign_title} onChange={(e) => handleInputChange('campaign_title', e.target.value)} placeholder="e.g., Summer Appeal 2026" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Campaign Description</label>
              <Input value={formData.campaign_description} onChange={(e) => handleInputChange('campaign_description', e.target.value)} placeholder="What is this campaign about?" as="textarea" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Trustee/Volunteer Email</label>
              <Input value={formData.trustee_email} onChange={(e) => handleInputChange('trustee_email', e.target.value)} placeholder="Invite a team member" type="email" />
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-800">Complete setup to start using CharityHub. You can invite more team members later.</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={loading} className="flex-1">
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {step === 3 ? 'Complete Setup' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}