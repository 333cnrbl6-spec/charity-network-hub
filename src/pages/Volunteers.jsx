import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { useBranchFilter } from '@/hooks/useBranchFilter';

export default function Volunteers() {
  const [search, setSearch] = useState('');
  const { filterData } = useBranchFilter();

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
  });

  const filtered = filterData(volunteers).filter(v =>
    v.full_name.toLowerCase().includes(search.toLowerCase()) ||
    v.area?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
  };

  const getDBSStatus = (volunteer) => {
    if (!volunteer.dbs_checked) return 'Not checked';
    if (!volunteer.dbs_expiry) return 'Checked';
    
    const expiryDate = new Date(volunteer.dbs_expiry);
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry < 30) return `Expiring soon (${daysUntilExpiry}d)`;
    return 'Valid';
  };

  const getDBSColor = (status) => {
    if (status === 'Expired') return 'bg-red-100 text-red-800';
    if (status.includes('Expiring soon')) return 'bg-amber-100 text-amber-800';
    if (status === 'Valid') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Volunteers</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Volunteer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Volunteers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>DBS Status</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(volunteer => {
              const dbsStatus = getDBSStatus(volunteer);
              return (
                <TableRow key={volunteer.id}>
                  <TableCell className="font-medium">{volunteer.full_name}</TableCell>
                  <TableCell className="text-sm capitalize">{volunteer.role?.replace('-', ' ')}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[volunteer.status]}>
                      {volunteer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{volunteer.area || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getDBSColor(dbsStatus)} variant="outline">
                      <div className="flex items-center gap-1">
                        {(dbsStatus === 'Expired' || dbsStatus.includes('soon')) && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {dbsStatus}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{volunteer.hours_contributed || 0}h</TableCell>
                  <TableCell className="text-sm">{volunteer.date_joined ? new Date(volunteer.date_joined).toLocaleDateString() : '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {volunteers.length} volunteers
      </div>
    </div>
  );
}