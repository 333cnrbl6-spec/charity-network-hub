import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';

export default function ComplianceBadges() {
  const badges = [
    {
      icon: Lock,
      title: 'GDPR Compliant',
      description: 'Full data protection compliance'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Industry-standard encryption & protection'
    },
    {
      icon: CheckCircle2,
      title: 'SOC 2 Ready',
      description: 'Audit-ready security controls'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <Card key={idx} className="text-center">
            <CardContent className="pt-6">
              <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}