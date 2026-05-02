import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, AlertCircle } from 'lucide-react';

export default function BillingCustomer() {
  const [loading, setLoading] = useState(false);

  const { data: charity } = useQuery({
    queryKey: ['charity'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const charities = await base44.entities.Charity.filter({
        created_by: user.email
      });
      return charities[0];
    }
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!charity) return [];
      return base44.entities.Invoice.filter({
        charity_id: charity.id
      });
    },
    enabled: !!charity
  });

  const handleUpdateBilling = async () => {
    setLoading(true);
    try {
      // Redirect to Stripe customer portal
      window.location.href = `https://billing.stripe.com/p/login/test_${charity.stripe_customer_id}`;
    } catch (err) {
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  if (!charity) return <div>Loading...</div>;

  const statusColor = {
    'active': 'bg-green-100 text-green-800',
    'trial': 'bg-blue-100 text-blue-800',
    'past_due': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Plan
              <Badge className={statusColor[charity.subscription_status]}>
                {charity.subscription_tier.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold capitalize">{charity.subscription_status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Billing Cycle</p>
                <p className="font-semibold">Monthly</p>
              </div>
              {charity.subscription_status === 'trial' && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Trial Ends</p>
                  <p className="font-semibold">
                    {new Date(charity.trial_ends_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {charity.subscription_status === 'past_due' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800">Payment overdue</p>
                  <p className="text-sm text-red-700">Update payment method to restore access</p>
                </div>
              </div>
            )}

            <Button onClick={handleUpdateBilling} disabled={loading}>
              <CreditCard className="w-4 h-4 mr-2" />
              {loading ? 'Opening...' : 'Update Payment Method'}
            </Button>
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-muted-foreground">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {invoices.map(invoice => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">Invoice #{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.issued_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">£{invoice.amount.toFixed(2)}</p>
                      <Badge
                        variant={
                          invoice.status === 'paid'
                            ? 'default'
                            : invoice.status === 'overdue'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}