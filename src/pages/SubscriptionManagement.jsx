import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function SubscriptionManagement() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => base44.asServiceRole.entities.BranchSubscription.list(),
    enabled: user?.role === 'admin'
  });

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle2 className="w-4 h-4" />,
      trialing: <Clock className="w-4 h-4" />,
      past_due: <AlertTriangle className="w-4 h-4" />,
      suspended: <AlertCircle className="w-4 h-4" />,
      cancelled: <AlertCircle className="w-4 h-4" />
    };
    return icons[status];
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Only administrators can view subscription details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage all branch subscriptions and billing</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>{subscriptions.length} branch subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Monthly Cost</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Days Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.branch_name}</TableCell>
                  <TableCell className="capitalize">{sub.plan}</TableCell>
                  <TableCell>
                    <Badge className={`flex w-fit items-center gap-1 ${getStatusColor(sub.status)}`}>
                      {getStatusIcon(sub.status)}
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>£{sub.amount_monthly.toFixed(2)}</TableCell>
                  <TableCell>{sub.next_billing_date}</TableCell>
                  <TableCell>
                    {sub.days_overdue > 0 ? (
                      <span className="text-red-600 font-semibold">{sub.days_overdue} days</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {subscriptions.filter(s => s.status === 'past_due').length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">⚠️ Payment Reminders Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-800">
              {subscriptions.filter(s => s.status === 'past_due').length} branches have overdue payments.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}