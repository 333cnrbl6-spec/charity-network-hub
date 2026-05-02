import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Bug, Sparkles, AlertCircle } from 'lucide-react';

const RELEASES = [
  {
    version: '1.0.0',
    date: 'May 2, 2026',
    status: 'released',
    changes: [
      { type: 'feature', text: 'Customer health scoring & churn prediction' },
      { type: 'feature', text: 'Usage analytics dashboard for enterprise' },
      { type: 'feature', text: 'White-label configuration for premium tiers' },
      { type: 'feature', text: 'API documentation portal' },
      { type: 'feature', text: 'Automated billing & invoice management' },
      { type: 'improvement', text: 'Performance optimization across all dashboards' },
    ]
  },
  {
    version: '0.9.0',
    date: 'April 28, 2026',
    status: 'beta',
    changes: [
      { type: 'feature', text: 'Multi-tenant platform foundation' },
      { type: 'feature', text: 'Stripe payment integration' },
      { type: 'feature', text: 'Feature flags for tiered access' },
      { type: 'improvement', text: 'Enhanced security audit logging' },
      { type: 'bug', text: 'Fixed dashboard loading on slow connections' }
    ]
  }
];

const changeTypeConfig = {
  feature: { icon: Sparkles, color: 'bg-blue-100 text-blue-800', label: 'Feature' },
  improvement: { icon: Zap, color: 'bg-green-100 text-green-800', label: 'Improvement' },
  bug: { icon: Bug, color: 'bg-red-100 text-red-800', label: 'Bug Fix' },
  security: { icon: AlertCircle, color: 'bg-purple-100 text-purple-800', label: 'Security' }
};

export default function Changelog() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Changelog</h1>
          <p className="text-lg text-muted-foreground">Track updates and improvements to CharityHub</p>
        </div>

        <div className="space-y-8">
          {RELEASES.map((release, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">v{release.version}</h2>
                    <Badge variant={release.status === 'released' ? 'default' : 'secondary'}>
                      {release.status === 'released' ? 'Released' : 'Beta'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{release.date}</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {release.changes.map((change, changeIdx) => {
                    const config = changeTypeConfig[change.type];
                    const Icon = config.icon;
                    return (
                      <div key={changeIdx} className="flex items-start gap-3">
                        <Icon className="h-4 w-4 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <Badge className={config.color} variant="outline">
                            {config.label}
                          </Badge>
                          <p className="mt-1">{change.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground">
            Subscribe to <a href="#" className="text-primary hover:underline">release updates</a> to be notified of new features
          </p>
        </div>
      </div>
    </div>
  );
}