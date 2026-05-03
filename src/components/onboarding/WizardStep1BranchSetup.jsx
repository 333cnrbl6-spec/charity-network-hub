import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2, Check } from 'lucide-react';

export default function WizardStep1BranchSetup({ charityId, onComplete }) {
  const [formData, setFormData] = useState({
    branch_name: '',
    location_city: '',
    location_postcode: '',
    contact_email: '',
    contact_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completed, setCompleted] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validatePostcode = (postcode) => {
    // Basic UK postcode format validation (e.g., M1 1AE, B33 8TH)
    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    return postcodeRegex.test(postcode.trim());
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !email || emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.branch_name.trim() || !formData.location_postcode.trim()) {
      setError('Branch name and postcode are required');
      return;
    }

    // Validate postcode format
    if (!validatePostcode(formData.location_postcode)) {
      setError('Please enter a valid UK postcode (e.g., M1 1AE)');
      return;
    }

    // Validate email if provided
    if (!validateEmail(formData.contact_email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Check for duplicate branch name within charity (prevent accidental duplicates)
      const existingBranches = await base44.entities.BranchConfig.filter({
        charity_id: charityId,
        branch_name: formData.branch_name.trim()
      });

      if (existingBranches && existingBranches.length > 0) {
        setError('A branch with this name already exists for your charity');
        setLoading(false);
        return;
      }

      // Set 10-second timeout for branch creation
      const createTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout - please try again')), 10000)
      );

      const branchConfig = await Promise.race([
        base44.entities.BranchConfig.create({
          charity_id: charityId,
          branch_name: formData.branch_name.trim(),
          location_city: formData.location_city.trim(),
          location_postcode: formData.location_postcode.trim().toUpperCase(),
          contact_email: formData.contact_email.trim(),
          contact_phone: formData.contact_phone.trim(),
          status: 'active',
          created_date: new Date().toISOString()
        }),
        createTimeout
      ]);

      // Initialize location config for the branch
      await Promise.race([
        base44.entities.LocationConfig.create({
          branch_id: branchConfig.id,
          charity_id: charityId,
          location_name: formData.branch_name.trim(),
          postcode: formData.location_postcode.trim().toUpperCase(),
          city: formData.location_city.trim(),
          timezone: 'Europe/London'
        }),
        createTimeout
      ]);

      setCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (err) {
      if (err.message.includes('timeout')) {
        setError('Request took too long. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to create branch');
      }
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-lg font-medium text-center">Branch created successfully!</p>
        <p className="text-sm text-muted-foreground text-center">Moving to next step...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Branch Name *
          </label>
          <Input
            placeholder="e.g., Main Office, North Branch"
            value={formData.branch_name}
            onChange={(e) => handleChange('branch_name', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              City
            </label>
            <Input
              placeholder="e.g., Manchester"
              value={formData.location_city}
              onChange={(e) => handleChange('location_city', e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Postcode *
            </label>
            <Input
              placeholder="e.g., M1 1AE"
              value={formData.location_postcode}
              onChange={(e) => handleChange('location_postcode', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Contact Email
          </label>
          <Input
            type="email"
            placeholder="branch@charity.org"
            value={formData.contact_email}
            onChange={(e) => handleChange('contact_email', e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Contact Phone
          </label>
          <Input
            type="tel"
            placeholder="020 1234 5678"
            value={formData.contact_phone}
            onChange={(e) => handleChange('contact_phone', e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !formData.branch_name.trim() || !formData.location_postcode.trim()}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {loading ? 'Creating Branch...' : 'Create Branch & Continue'}
      </Button>
    </form>
  );
}