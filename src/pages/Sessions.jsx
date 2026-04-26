import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { playClick } from '@/lib/audio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Users } from 'lucide-react';
import { useBranchFilter } from '@/hooks/useBranchFilter';

export default function Sessions() {
  const { filterData } = useBranchFilter();

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-created_date'),
  });

  const filteredSessions = filterData(sessions);

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  const getUtilisation = (session) => {
    if (!session.max_capacity) return '-';
    const percent = Math.round((session.attendees_count / session.max_capacity) * 100);
    return `${percent}%`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold">Sessions</h1>
         <Button className="gap-2" disabled title="Session creation coming soon">
           <Plus className="w-4 h-4" />
           Add Session
         </Button>
       </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Utilisation</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.map(session => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">{session.session_name}</TableCell>
                <TableCell className="text-sm capitalize">{session.session_type?.replace('-', ' ')}</TableCell>
                <TableCell className="text-sm">{session.location}</TableCell>
                <TableCell className="text-sm">{new Date(session.scheduled_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {session.attendees_count}/{session.max_capacity || '∞'}
                </TableCell>
                <TableCell className="text-sm">{getUtilisation(session)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[session.status]}>
                    {session.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="text-sm text-muted-foreground">
        Total sessions: {filteredSessions.length}
      </div>
    </div>
  );
}