import React from 'react';
import OnboardingWizard from '@/components/charity/OnboardingWizard';

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to CharityHub</h1>
          <p className="text-gray-600">Set up your charity in just 3 steps</p>
        </div>
        <OnboardingWizard />
      </div>
    </div>
  );
}