import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, TrendingDown, AlertTriangle, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CreditManagement() {
  const { data: charityCredits } = useQuery({
    queryKey: ['charity-credits'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      // In real app, would filter by user's charity_id
      const records = await base44.entities.CharityCredits.filter({ subscription_tier: { $ne: null } });
      return records[0];
    }
  });

  const { data: consumption = [] } = useQuery({
    queryKey: ['credit-consumption'],
    queryFn: async () => {
      return await base44.entities.CreditConsumption.filter({}, '-timestamp', 30);
    }
  });

  const { data: pricing = [] } = useQuery({
    queryKey: ['credit-pricing'],
    queryFn: async () => {
      return await base44.entities.CreditPricing.filter({ active: true });
    }
  });

  if (!charityCredits) {
    return <div className="text-center py-12 text-muted-foreground">Loading credit information...</div>;
  }

  const usagePercent = charityCredits.monthly_credit_allowance
    ? (charityCredits.credits_used_month / charityCredits.monthly_credit_allowance) * 100
    : 0;

  const consumptionByType = consumption.reduce((acc, item) => {
    const existing = acc.find(x => x.operation_type === item.operation_type);
    if (existing) {
      existing.count += 1;
      existing.credits += item.credits_consumed;
    } else {
      acc.push({
        operation_type: item.operation_type,
        count: 1,
        credits: item.credits_consumed
      });
    }
    return acc;
  }, []);

  const statusColor = usagePercent >= 90 ? 'text-destructive' : usagePercent >= 75 ? 'text-yellow-600' : 'text-green-600';
  const statusBg = usagePercent >= 90 ? 'bg-destructive/5' : usagePercent >= 75 ? 'bg-yellow-50' : 'bg-green-50';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Credit Management</h1>
          <p className="text-muted-foreground">Monitor and manage your CharityHub credits allocation</p>
        </div>

        {/* Credit Alert */}
        {usagePercent >= 75 && (
          <Alert className={statusBg}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You're using {Math.round(usagePercent)}% of your monthly credit allowance. 
              {charityCredits.subscription_tier === 'starter' && ' Consider upgrading to Professional for more credits.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Status Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground mb-1">Available Credits</div>
              <div className={`text-3xl font-bold ${statusColor}`}>
                {Math.round(charityCredits.credits_available)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ~£{(charityCredits.credits_available / 100).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground mb-1">Used This Month</div>
              <div className="text-3xl font-bold">{charityCredits.credits_used_month}</div>
              <p className="text-xs text-muted-foreground mt-2">
                of {charityCredits.monthly_credit_allowance}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground mb-1">Usage Rate</div>
              <div className="text-3xl font-bold">{Math.round(usagePercent)}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${usagePercent >= 90 ? 'bg-destructive' : usagePercent >= 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground mb-1">Subscription Tier</div>
              <div className="text-3xl font-bold capitalize">{charityCredits.subscription_tier}</div>
              {charityCredits.subscription_tier === 'trial' && (
                <p className="text-xs text-amber-600 mt-2">
                  Ends {new Date(charityCredits.trial_ends).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Chart */}
        {consumption.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Usage by Operation Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={consumptionByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="operation_type" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="credits" fill="#8b5cf6" name="Credits Used" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pricing Table */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Pricing & Allowances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2">Operation</th>
                    <th className="text-right py-2 px-2">Cost</th>
                    <th className="text-right py-2 px-2">Starter/Month</th>
                    <th className="text-right py-2 px-2">Pro/Month</th>
                    <th className="text-right py-2 px-2">Enterprise/Month</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map(p => (
                    <tr key={p.id} className="border-b hover:bg-muted/30">
                      <td className="py-3 px-2 text-xs">{p.operation_type}</td>
                      <td className="py-3 px-2 text-right font-semibold">{p.base_cost_credits} cr</td>
                      <td className="py-3 px-2 text-right">{p.starter_monthly_allowance || '—'}</td>
                      <td className="py-3 px-2 text-right">{p.professional_monthly_allowance || '—'}</td>
                      <td className="py-3 px-2 text-right">{p.enterprise_monthly_allowance || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Note: 1 credit = £0.01. Monthly allowances reset on the 1st of each month.
            </p>
          </CardContent>
        </Card>

        {/* Tier Upgrade CTA */}
        {charityCredits.subscription_tier === 'starter' && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold mb-2">Upgrade for More Credits</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Professional plan gives you 5x more credits and access to advanced features.
                  </p>
                </div>
                <Button className="ml-4">Upgrade Now</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}