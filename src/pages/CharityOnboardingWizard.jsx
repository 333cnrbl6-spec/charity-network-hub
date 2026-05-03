import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import WizardStep1BranchSetup from '@/components/onboarding/WizardStep1BranchSetup';
import WizardStep2TeamInvites from '@/components/onboarding/WizardStep2TeamInvites';
import WizardStep3VolunteerReg from '@/components/onboarding/WizardStep3VolunteerReg';
import WizardCompletionScreen from '@/components/onboarding/WizardCompletionScreen';

export default function CharityOnboardingWizard() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [charity, setCharity] = useState(null);
  const [error, setError] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({
    branch_setup: false,
    team_invites: false,
    volunteer_registration: false
  });

  // Load user and charity data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          setError('You must be logged in to use this wizard.');
          setLoading(false);
          return;
        }
        setUser(currentUser);

        // Get user's charity (filter by created_by, get most recent)
        const charities = await base44.entities.Charity.filter({
          created_by: currentUser.email
        }, '-created_date', 1);
        
        if (!charities || charities.length === 0) {
          setError('No charity found. Please create a charity first.');
          setLoading(false);
          return;
        }

        const userCharity = charities[0];
        setCharity(userCharity);
        
        // Initialize credits with timeout protection (5s max)
        const creditCheckTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Credit initialization timeout')), 5000)
        );
        
        try {
          const credits = await Promise.race([
            base44.entities.CharityCredits.filter({
              charity_id: userCharity.id
            }),
            creditCheckTimeout
          ]);
          
          if (!credits || credits.length === 0) {
            await base44.functions.invoke('initializeCharityCredits', {
              charity_id: userCharity.id,
              subscription_tier: 'trial'
            });
          }
        } catch (creditErr) {
          // Don't block wizard if credit init fails
          console.warn('Credit initialization issue:', creditErr);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load onboarding data');
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleStepComplete = (stepKey) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepKey]: true
    }));
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-lg text-muted-foreground">Loading your onboarding...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Setup Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button asChild>
              <a href="/">Return Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-heading font-bold">Welcome to CharityHub</h1>
          <p className="text-lg text-muted-foreground">
            {charity?.name || 'Your Charity'}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-between items-center">
          {['branch_setup', 'team_invites', 'volunteer_registration'].map((stepKey, index) => (
            <React.Fragment key={stepKey}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step > index + 1
                      ? 'bg-green-500 text-white'
                      : step === index + 1
                      ? 'bg-primary text-white ring-2 ring-primary ring-offset-2'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {completedSteps[stepKey] ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs font-medium text-center w-20">
                  {stepKey === 'branch_setup' && 'Branch Setup'}
                  {stepKey === 'team_invites' && 'Team Invites'}
                  {stepKey === 'volunteer_registration' && 'First Volunteer'}
                </span>
              </div>
              {index < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${
                    step > index + 1 ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            {step === 1 && (
              <>
                <CardTitle>Set Up Your First Branch</CardTitle>
                <CardDescription>
                  Create your main office location and basic settings
                </CardDescription>
              </>
            )}
            {step === 2 && (
              <>
                <CardTitle>Invite Your Team</CardTitle>
                <CardDescription>
                  Add team members so they can start helping
                </CardDescription>
              </>
            )}
            {step === 3 && (
              <>
                <CardTitle>Register Your First Volunteer</CardTitle>
                <CardDescription>
                  Get your first volunteer on the platform for the 'aha moment'
                </CardDescription>
              </>
            )}
            {step === 4 && (
              <>
                <CardTitle>You're All Set! 🎉</CardTitle>
                <CardDescription>
                  Your charity is ready to start managing volunteers
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="min-h-96">
            {step === 1 && (
              <WizardStep1BranchSetup
                charityId={charity.id}
                onComplete={() => handleStepComplete('branch_setup')}
              />
            )}
            {step === 2 && (
              <WizardStep2TeamInvites
                charityId={charity.id}
                onComplete={() => handleStepComplete('team_invites')}
              />
            )}
            {step === 3 && (
              <WizardStep3VolunteerReg
                charityId={charity.id}
                onComplete={() => handleStepComplete('volunteer_registration')}
              />
            )}
            {step === 4 && (
              <WizardCompletionScreen
                charity={charity}
              />
            )}
          </CardContent>

          {/* Navigation */}
          {step < 4 && (
            <div className="px-6 py-4 border-t flex justify-between bg-muted/30">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Badge variant="outline" className="mx-2">
                Step {step} of 3
              </Badge>
              <div className="text-sm text-muted-foreground">
                {/* Next button is handled by step components */}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}