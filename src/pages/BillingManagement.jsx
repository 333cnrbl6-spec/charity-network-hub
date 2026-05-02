import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, CreditCard, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function BillingManagement() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: charities = [] } = useQuery({
    queryKey: ['charities'],
    queryFn: () => base44.entities.Charity.list(),
    enabled: !!user
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices', user?.email],
    queryFn: () => base44.entities.Invoice.filter({ charity_id: charities[0]?.id }),
    enabled: charities.length > 0
  });

  const charity = charities[0];

  if (!user || !charity) {
    return <div className="p-8">Loading...</div>;
  }

  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Billing & Invoices</h1>

        {/* Current Plan */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold capitalize mb-2">{charity.subscription_tier}</h3>
                <Badge variant={charity.subscription_status === 'active' ? 'default' : 'outline'}>
                  {charity.subscription_status}
                </Badge>
              </div>
              <Button variant="outline">Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Managed through Stripe. Click to update payment details.
            </p>
            <Button>Update Payment Method</Button>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="font-semibold">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.issued_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">£{invoice.amount.toFixed(2)}</p>
                        <Badge className={statusColors[invoice.status] || ''}>
                          {invoice.status}
                        </Badge>
                      </div>
                      {invoice.pdf_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No invoices yet</p>
            )}
          </CardContent>
        </Card>

        {/* Cancellation Warning */}
        {charity.subscription_status === 'active' && (
          <Card className="mt-8 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-2">Danger Zone</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Canceling your subscription will result in immediate access loss.
                </p>
                <Button variant="destructive">Cancel Subscription</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}