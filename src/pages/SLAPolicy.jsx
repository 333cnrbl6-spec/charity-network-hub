import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

export default function SLAPolicy() {
  const slaTerms = [
    {
      title: 'Uptime Guarantee',
      details: [
        { label: 'Starter', value: '99.5%' },
        { label: 'Professional', value: '99.9%' },
        { label: 'Enterprise', value: '99.99%' }
      ]
    },
    {
      title: 'Support Response Times',
      details: [
        { label: 'Critical Issues', value: '1 hour' },
        { label: 'High Priority', value: '4 hours' },
        { label: 'Standard', value: '24 hours' }
      ]
    },
    {
      title: 'Data Backups',
      details: [
        { label: 'Frequency', value: 'Daily' },
        { label: 'Retention', value: '30 days' },
        { label: 'Recovery Time', value: '4 hours' }
      ]
    },
    {
      title: 'Maintenance Windows',
      details: [
        { label: 'Scheduled', value: 'Monthly' },
        { label: 'Duration', value: 'Max 2 hours' },
        { label: 'Notice Period', value: '14 days' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Service Level Agreement</h1>
          <p className="text-lg text-muted-foreground">
            Our commitment to reliability and support
          </p>
        </div>

        <div className="grid gap-6 mb-12">
          {slaTerms.map((section, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {section.details.map((detail, didx) => (
                    <div key={didx} className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">{detail.label}</p>
                      <p className="text-lg font-bold text-primary">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Credits for SLA Breaches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              If we fail to meet our SLA commitments, you're eligible for service credits:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="font-semibold min-w-fit">99.0% - 99.5%:</span>
                <span>10% monthly fee credit</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold min-w-fit">95.0% - 99.0%:</span>
                <span>25% monthly fee credit</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold min-w-fit">Below 95%:</span>
                <span>50% monthly fee credit</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Exclusions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              SLA does not apply to issues caused by:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Scheduled maintenance (with notice)</li>
              <li>Customer misconfiguration or abuse</li>
              <li>Third-party service failures</li>
              <li>Forces of nature or circumstances beyond our control</li>
              <li>Customer network issues</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}