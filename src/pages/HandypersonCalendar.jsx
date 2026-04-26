import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar, User, MapPin, Phone, Clock, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle2, Clock3
} from 'lucide-react';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import { format, addDays, startOfWeek, isSameDay, addWeeks } from 'date-fns';

export default function HandypersonCalendar() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [selectedJob, setSelectedJob] = useState(null);
  const [clientSearchInput, setClientSearchInput] = useState('');
  const queryClient = useQueryClient();
  const { filterData } = useBranchFilter();

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
  });

  const updateJobMutation = useMutation({
    mutationFn: (updatedJob) =>
      base44.entities.Job.update(updatedJob.id, updatedJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setSelectedJob(null);
    },
  });

  // Filter handyperson jobs (active)
  const handypersonJobs = useMemo(() => {
    return filterData(jobs).filter(
      job => job.job_type === 'home-visit' && job.status !== 'cancelled'
    );
  }, [jobs, filterData]);

  // Group jobs by scheduled date
  const jobsByDate = useMemo(() => {
    const grouped = {};
    const weekEnd = addDays(weekStart, 6);

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      grouped[dateKey] = handypersonJobs.filter(job => {
        if (!job.scheduled_date) return false;
        return isSameDay(new Date(job.scheduled_date), date);
      });
    }
    return grouped;
  }, [handypersonJobs, weekStart]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const jobId = draggableId.split('-')[1];
    const job = handypersonJobs.find(j => j.id === jobId);
    if (!job) return;

    const newDate = destination.droppableId;
    const newScheduledDate = new Date(newDate);
    newScheduledDate.setHours(
      job.scheduled_date
        ? new Date(job.scheduled_date).getHours()
        : 10,
      job.scheduled_date
        ? new Date(job.scheduled_date).getMinutes()
        : 0
    );

    updateJobMutation.mutate({
      ...job,
      scheduled_date: newScheduledDate.toISOString(),
    });
  };

  const handleLinkClient = (jobId, clientId) => {
    const job = handypersonJobs.find(j => j.id === jobId);
    if (job) {
      const client = clients.find(c => c.id === clientId);
      updateJobMutation.mutate({
        ...job,
        client_id: clientId,
        client_name: client?.full_name || job.client_name,
      });
    }
  };

  const statusColors = {
    scheduled: 'bg-blue-50 border-blue-200',
    completed: 'bg-green-50 border-green-200',
    'no-answer': 'bg-yellow-50 border-yellow-200',
  };

  const statusIcons = {
    scheduled: <Clock3 className="w-4 h-4 text-blue-600" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-600" />,
    'no-answer': <AlertCircle className="w-4 h-4 text-yellow-600" />,
  };

  const filteredClients = clients.filter(c =>
    c.full_name.toLowerCase().includes(clientSearchInput.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Handyperson Service Calendar
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(addWeeks(weekStart, -1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-4 py-2 text-sm font-medium">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(weekStart, i);
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayJobs = jobsByDate[dateKey] || [];

            return (
              <Droppable key={dateKey} droppableId={dateKey}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-lg border-2 p-3 min-h-96 transition-colors ${
                      snapshot.isDraggingOver
                        ? 'bg-primary/5 border-primary'
                        : 'bg-white border-border'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-3">
                      {format(date, 'EEE')}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {format(date, 'MMM d')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {dayJobs.map((job, idx) => (
                        <Draggable
                          key={job.id}
                          draggableId={`job-${job.id}`}
                          index={idx}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-2 rounded-lg border text-xs cursor-move transition-all ${
                                statusColors[job.status] || 'bg-gray-50 border-gray-200'
                              } ${
                                snapshot.isDragging
                                  ? 'shadow-lg opacity-90'
                                  : 'hover:shadow-md'
                              }`}
                              onClick={() => setSelectedJob(job)}
                            >
                              <div className="flex items-start gap-1.5">
                                {statusIcons[job.status]}
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold truncate">
                                    {job.client_name || 'Unassigned'}
                                  </p>
                                  {job.volunteer_name && (
                                    <p className="text-muted-foreground truncate">
                                      {job.volunteer_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Job Details Panel */}
      {selectedJob && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Client</p>
                <p className="font-semibold">{selectedJob.client_name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge variant="outline">{selectedJob.status}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Volunteer</p>
                <p className="font-semibold">
                  {selectedJob.volunteer_name || 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Scheduled</p>
                <p className="text-sm">
                  {selectedJob.scheduled_date
                    ? format(new Date(selectedJob.scheduled_date), 'MMM d, HH:mm')
                    : 'Not scheduled'}
                </p>
              </div>
            </div>

            {selectedJob.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{selectedJob.notes}</p>
              </div>
            )}

            {/* Link Client */}
            <div className="pt-4 border-t">
              <p className="text-sm font-semibold mb-2">Link to Client</p>
              <div className="space-y-2">
                <Input
                  placeholder="Search clients..."
                  value={clientSearchInput}
                  onChange={(e) => setClientSearchInput(e.target.value)}
                  className="text-sm"
                />
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredClients.map(client => (
                    <button
                      key={client.id}
                      onClick={() => {
                        handleLinkClient(selectedJob.id, client.id);
                        setClientSearchInput('');
                      }}
                      className={`w-full text-left p-2 rounded text-sm border transition-colors ${
                        selectedJob.client_id === client.id
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-muted border-border'
                      }`}
                    >
                      <p className="font-medium">{client.full_name}</p>
                      <p className="text-xs opacity-70">{client.postcode}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedJob(null)}
              className="w-full mt-4"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}