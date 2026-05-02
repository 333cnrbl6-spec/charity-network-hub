import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function OnboardingChecklistPage() {
  const queryClient = useQueryClient();

  const { data: charity } = useQuery({
    queryKey: ['charity'],
    queryFn: () => base44.auth.me(),
  });

  const { data: checklist } = useQuery({
    queryKey: ['onboardingChecklist', charity?.id],
    queryFn: async () => {
      if (!charity?.id) return null;
      try {
        const items = await base44.entities.OnboardingChecklist.filter({ charity_id: charity.id });
        return items[0] || null;
      } catch {
        return null;
      }
    },
    enabled: !!charity?.id
  });

  const createChecklistMutation = useMutation({
    mutationFn: async () => {
      const newChecklist = await base44.entities.OnboardingChecklist.create({
        charity_id: charity.id,
        status: 'in_progress',
        completion_percentage: 0
      });
      return newChecklist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardingChecklist'] });
    }
  });

  useEffect(() => {
    if (charity?.id && !checklist && !createChecklistMutation.isPending) {
      createChecklistMutation.mutate();
    }
  }, [charity?.id, checklist]);

  if (!checklist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const items = [
    { key: 'billing_info_complete', label: 'Billing Information', description: 'Add payment method and billing details' },
    { key: 'compliance_review_complete', label: 'Compliance Review', description: 'Review and acknowledge compliance requirements' },
    { key: 'team_invited', label: 'Invite Team Members', description: 'Add at least one team member to your account' },
    { key: 'api_keys_generated', label: 'Generate API Keys', description: 'Create API credentials for integrations' },
    { key: 'training_completed', label: 'Complete Training', description: 'Watch onboarding tutorials and guides' },
    { key: 'data_imported', label: 'Import Data', description: 'Load your initial data or create first records' }
  ];

  const completed = items.filter(item => checklist[item.key]).length;
  const percentage = Math.round((completed / items.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Setup Checklist</h1>
        <p className="text-muted-foreground">Complete these steps to unlock all platform features</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
          <CardDescription>{completed} of {items.length} items complete</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={percentage} className="h-2" />
          <p className="text-2xl font-bold">{percentage}%</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.map((item) => {
          const isComplete = checklist[item.key];
          const isLocked = !isComplete && completed < 2; // Lock items until 2 items are done

          return (
            <Card
              key={item.key}
              className={`transition-all ${isComplete ? 'border-green-200 bg-green-50/50' : isLocked ? 'opacity-60' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {isComplete ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6 text-muted-foreground mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  {!isComplete && !isLocked && (
                    <Button variant="outline" size="sm">
                      Start
                    </Button>
                  )}
                  {isComplete && (
                    <Badge className="bg-green-600">Complete</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {percentage === 100 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-semibold">Setup Complete!</p>
                <p className="text-sm text-muted-foreground">You now have access to all platform features.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}