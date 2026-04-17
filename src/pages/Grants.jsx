import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Gift } from 'lucide-react';

export default function Grants() {
  const { data: grants = [] } = useQuery({
    queryKey: ['grants'],
    queryFn: () => base44.entities.Grant.list(),
  });

  const statusColors = {
    applied: 'bg-blue-100 text-blue-800',
    awarded: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const awardedGrants = grants.filter(g => g.status === 'awarded');
  const totalValue = awardedGrants.reduce((sum, g) => sum + (g.amount_awarded || 0), 0);
  const thisMonthAwarded = awardedGrants.filter(g => {
    const grantDate = new Date(g.date_awarded);
    const now = new Date();
    return grantDate.getMonth() === now.getMonth() && grantDate.getFullYear() === now.getFullYear();
  }).length;
  const thisMonthValue = grants.filter(g => {
    const grantDate = new Date(g.date_awarded);
    const now = new Date();
    return g.status === 'awarded' && grantDate.getMonth() === now.getMonth() && grantDate.getFullYear() === now.getFullYear();
  }).reduce((sum, g) => sum + (g.amount_awarded || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Grants & Benefits</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Grant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Total Awarded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">£{totalValue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground mt-1">{awardedGrants.length} grants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{thisMonthAwarded}</p>
            <p className="text-xs text-muted-foreground mt-1">£{thisMonthValue.toFixed(0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{grants.filter(g => g.status === 'applied').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grant Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date Awarded</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grants.map(grant => (
              <TableRow key={grant.id}>
                <TableCell className="font-medium">{grant.grant_name}</TableCell>
                <TableCell className="text-sm capitalize">{grant.grant_type?.replace('-', ' ')}</TableCell>
                <TableCell className="text-sm">{grant.client_name || '-'}</TableCell>
                <TableCell className="text-sm font-medium">£{grant.amount_awarded?.toFixed(2) || '0.00'}</TableCell>
                <TableCell className="text-sm">{grant.date_awarded ? new Date(grant.date_awarded).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <Badge className={statusColors[grant.status]}>
                    {grant.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}