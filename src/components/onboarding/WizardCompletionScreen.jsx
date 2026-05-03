import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function WizardCompletionScreen({ charity }) {
  return (
    <div className="space-y-8 py-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-heading font-bold">Setup Complete! 🎉</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {charity.name} is now ready to start managing volunteers on CharityHub.
        </p>
      </div>

      {/* What You've Accomplished */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-200 mx-auto">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-center">Branch Created</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your first branch is set up and ready to manage volunteers.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-200 mx-auto">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-center">Team Invited</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your team has been invited and can join to help manage operations.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-200 mx-auto">
              <CheckCircle2 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-center">Aha Moment</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your first volunteer is registered - the core of volunteer management!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg">What's Next?</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex-shrink-0">
                1
              </span>
              <span className="text-sm">
                <strong>Create Your First Volunteer Opportunity</strong> - Post a job and watch volunteers apply
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex-shrink-0">
                2
              </span>
              <span className="text-sm">
                <strong>Use AI Job Matching</strong> - Let our algorithm match the perfect volunteer to opportunities
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex-shrink-0">
                3
              </span>
              <span className="text-sm">
                <strong>Track Impact</strong> - See volunteer hours, outcomes, and the difference you're making
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex-shrink-0">
                4
              </span>
              <span className="text-sm">
                <strong>Explore Premium Features</strong> - Generate reports, send campaigns, and much more
              </span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Credit Info */}
      <Card className="bg-yellow-50 border border-yellow-200">
        <CardContent className="pt-6 space-y-2">
          <p className="font-semibold text-sm text-yellow-900">💡 Free Trial Credits</p>
          <p className="text-sm text-yellow-800">
            You have 500 free trial credits to explore AI features like grant writing, job matching, and report generation. 
            They reset daily during your 30-day trial period.
          </p>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4">
        <Button
          size="lg"
          className="w-full"
          asChild
        >
          <a href="/dashboard">
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          asChild
        >
          <a href="/help">
            View Help & Documentation
          </a>
        </Button>
      </div>
    </div>
  );
}