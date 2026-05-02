import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { validateCharityData, validateField } from '@/utils/validation';
import { parseAPIError, withRetry } from '@/utils/apiErrorHandler';

const CAUSE_AREAS = [
  'health', 'education', 'environment', 'poverty', 'disability', 
  'elderly', 'animal_welfare', 'arts', 'community', 'other'
];

export default function OnboardingFormHardened() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    charity_number: '',
    cause_area: '',
    description: '',
    website: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFieldBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur for instant feedback
    if (field === 'charity_number') {
      const validation = validateField(formData[field], 'charityNumber');
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, [field]: validation.error }));
      }
    } else if (field === 'website' && formData[field]) {
      const validation = validateField(formData[field], 'url');
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, [field]: validation.error }));
      }
    }
  };

  const validateStep = () => {
    if (step === 1) {
      const validation = validateCharityData(formData);
      if (!validation.valid) {
        setErrors(validation.errors);
        setGlobalError('Please fill in all required fields correctly');
        return false;
      }
    }
    setErrors({});
    setGlobalError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setLoading(true);
    setGlobalError(null);

    try {
      // Attempt to create charity with retry logic
      const result = await withRetry(
        () => base44.entities.Charity.create(formData),
        { maxRetries: 3 }
      );

      // Update user to mark onboarding complete
      await base44.auth.updateMe({ onboarding_complete: true });

      // Redirect on success
      window.location.href = '/charity-dashboard';
    } catch (error) {
      const parsed = parseAPIError(error);
      
      // Handle specific error scenarios
      if (error.code === 'CONFLICT') {
        setErrors({ charity_number: 'This charity number is already registered' });
        setGlobalError('Charity already exists. Please contact support if this is your charity.');
      } else if (parsed.code === 'UNAUTHORIZED') {
        window.location.href = '/login';
      } else {
        setGlobalError(parsed.message);
      }

      // Log error for monitoring
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-6 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Register Your Charity</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of 1 — Basic information
          </p>
        </CardHeader>
        <CardContent>
          {globalError && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Charity Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Charity Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                placeholder="e.g., Age UK Manchester"
                className={errors.name ? 'border-destructive' : ''}
                disabled={loading}
                required
              />
              {touched.name && errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            {/* Charity Number */}
            <div>
              <label className="block text-sm font-medium mb-2">
                UK Charity Number *
              </label>
              <Input
                type="text"
                value={formData.charity_number}
                onChange={e => handleFieldChange('charity_number', e.target.value)}
                onBlur={() => handleFieldBlur('charity_number')}
                placeholder="e.g., 1234567"
                className={errors.charity_number ? 'border-destructive' : ''}
                disabled={loading}
                required
              />
              {touched.charity_number && errors.charity_number && (
                <p className="text-xs text-destructive mt-1">{errors.charity_number}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Found in your Charity Commission registration
              </p>
            </div>

            {/* Cause Area */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Primary Cause Area *
              </label>
              <select
                value={formData.cause_area}
                onChange={e => handleFieldChange('cause_area', e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                disabled={loading}
                required
              >
                <option value="">Select a cause area</option>
                {CAUSE_AREAS.map(area => (
                  <option key={area} value={area}>
                    {area.replace(/_/g, ' ').charAt(0).toUpperCase() + area.replace(/_/g, ' ').slice(1)}
                  </option>
                ))}
              </select>
              {touched.cause_area && errors.cause_area && (
                <p className="text-xs text-destructive mt-1">{errors.cause_area}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Mission Statement
              </label>
              <textarea
                value={formData.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                placeholder="What does your charity do?"
                className="w-full px-3 py-2 border rounded-md text-sm h-24"
                disabled={loading}
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Website (optional)
              </label>
              <Input
                type="url"
                value={formData.website}
                onChange={e => handleFieldChange('website', e.target.value)}
                onBlur={() => handleFieldBlur('website')}
                placeholder="https://example.org"
                className={errors.website ? 'border-destructive' : ''}
                disabled={loading}
              />
              {touched.website && errors.website && (
                <p className="text-xs text-destructive mt-1">{errors.website}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating charity...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Charity
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}