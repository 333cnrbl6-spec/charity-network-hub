import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { playClick } from '@/lib/audio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock } from 'lucide-react';
import { useBranchFilter } from '@/hooks/useBranchFilter';

export default function Jobs() {
  const [statusFilter, setStatusFilter] = useState('all');
  const { filterData } = useBranchFilter();

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list('-created_date'),
  });

  const filtered = filterData(jobs).filter(j => statusFilter === 'all' || j.status === statusFilter);

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    'no-answer': 'bg-orange-100 text-orange-800',
  };

  const isOverdue = (job) => {
    if (job.status === 'completed' || job.status === 'cancelled') return false;
    return new Date(job.scheduled_date) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Job
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="all">All Jobs</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-answer">No Answer</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Volunteer</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(job => (
              <TableRow key={job.id} className={isOverdue(job) ? 'bg-red-50' : ''}>
                <TableCell className="font-medium">{job.client_name}</TableCell>
                <TableCell className="text-sm">{job.volunteer_name || '-'}</TableCell>
                <TableCell className="text-sm capitalize">{job.job_type?.replace('-', ' ')}</TableCell>
                <TableCell className="text-sm">{new Date(job.scheduled_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm">{job.duration_minutes}m</TableCell>
                <TableCell>
                  <Badge className={statusColors[job.status]}>
                    {isOverdue(job) && <Clock className="w-3 h-3 mr-1" />}
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} of {jobs.length} jobs
      </div>
    </div>
  );
}