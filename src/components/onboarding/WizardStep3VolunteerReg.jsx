import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2, Check } from 'lucide-react';

export default function WizardStep3VolunteerReg({ charityId, onComplete }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    skills: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    try {
      // Create volunteer
      const volunteer = await base44.entities.Volunteer.create({
        charity_id: charityId,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
        status: 'active',
        dbs_checked: false,
        dbs_expiry: null,
        hours_contributed: 0,
        availability: {},
        created_date: new Date().toISOString()
      });

      // Send welcome email
      await base44.integrations.Core.SendEmail({
        to: formData.email,
        subject: 'Welcome to CharityHub - Your Volunteer Account',
        body: `Hi ${formData.full_name},

Welcome to the CharityHub volunteer management platform! We're excited to have you on board.

You can now:
- View available volunteer opportunities
- Manage your availability
- Track your volunteer hours
- Connect with the team

Log in to get started: https://app.charityhub.org/login

Best regards,
The CharityHub Team`
      });

      // Log the registration
      await base44.functions.invoke('logAuditEvent', {
        charity_id: charityId,
        action: 'first_volunteer_registered_onboarding',
        entity_type: 'Volunteer',
        entity_id: volunteer.id,
        changes: {
          volunteer_name: formData.full_name,
          status: 'aha_moment_triggered'
        }
      });

      setCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to register volunteer');
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
        <p className="text-lg font-medium text-center">Your first volunteer is registered! 🎉</p>
        <p className="text-sm text-muted-foreground text-center">
          This is your "aha moment" - now you can start creating opportunities
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-900">
          ✨ <strong>Your Aha Moment:</strong> Registering your first volunteer here shows you how CharityHub works. Once done, you'll see real volunteer management in action!
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Full Name *
          </label>
          <Input
            placeholder="e.g., Sarah Johnson"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email *
          </label>
          <Input
            type="email"
            placeholder="sarah@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Phone
          </label>
          <Input
            type="tel"
            placeholder="07700 900000"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Location / Postcode
          </label>
          <Input
            placeholder="e.g., M1 1AE"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Skills (comma-separated)
          </label>
          <Input
            placeholder="e.g., Gardening, Carpentry, Admin"
            value={formData.skills}
            onChange={(e) => handleChange('skills', e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="font-medium text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !formData.full_name.trim() || !formData.email.trim()}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        {loading ? 'Registering Volunteer...' : 'Register First Volunteer & Complete Setup'}
      </Button>
    </form>
  );
}