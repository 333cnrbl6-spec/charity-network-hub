import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { playSuccess } from '@/lib/audio';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import SessionCard from '@/components/sessions/SessionCard';
import SessionDetailPanel from '@/components/sessions/SessionDetailPanel';
import DragDropCalendar from '@/components/calendar/DragDropCalendar';
import { format } from 'date-fns';

export default function Sessions() {
  const queryClient = useQueryClient();
  const { filterData } = useBranchFilter();
  const [selectedSession, setSelectedSession] = useState(null);
  const [calendarView, setCalendarView] = useState(false);

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-scheduled_date'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Session.update(selectedSession.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setSelectedSession(null);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ sessionId, data }) => base44.entities.Session.update(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      playSuccess();
    }
  });

  const filteredSessions = useMemo(() => {
    const filtered = filterData(sessions);
    return filtered.sort((a, b) => 
      new Date(b.scheduled_date) - new Date(a.scheduled_date)
    );
  }, [sessions, filterData]);

  const upcomingSessions = filteredSessions.filter(s => 
    new Date(s.scheduled_date) >= new Date()
  );
  const pastSessions = filteredSessions.filter(s => 
    new Date(s.scheduled_date) < new Date()
  );

  const handleDropSession = (session, newDate) => {
    const newDateTime = new Date(newDate);
    const originalTime = new Date(session.scheduled_date);
    newDateTime.setHours(originalTime.getHours(), originalTime.getMinutes(), 0, 0);

    updateSessionMutation.mutate({
      sessionId: session.id,
      data: { scheduled_date: newDateTime.toISOString() }
    });
  };

  const renderSessionItem = (session) => (
    <div
      onClick={() => setSelectedSession(session)}
      className="px-2 py-1 bg-amber-100 text-amber-900 text-xs rounded cursor-pointer hover:bg-amber-200"
    >
      <div className="font-semibold truncate">{session.session_name}</div>
      <div className="text-xs opacity-75">{format(new Date(session.scheduled_date), 'HH:mm')}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold">Sessions</h1>
         <div className="flex gap-2">
           <Button
             variant={calendarView ? 'default' : 'outline'}
             size="sm"
             className="gap-2"
             onClick={() => setCalendarView(!calendarView)}
           >
             <Calendar className="w-4 h-4" />
             Calendar View
           </Button>
           <Button className="gap-2" disabled title="Session creation coming soon">
             <Plus className="w-4 h-4" />
             Add Session
           </Button>
         </div>
       </div>

      {calendarView ? (
        <DragDropCalendar
          items={filteredSessions}
          onDrop={handleDropSession}
          renderItem={renderSessionItem}
          itemDateField="scheduled_date"
        />
      ) : (
        <>
          {/* Upcoming Sessions */}
           {upcomingSessions.length > 0 && (
             <div className="space-y-3">
               <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-primary" />
                 <h2 className="font-semibold text-lg">Upcoming Sessions</h2>
                 <span className="text-xs text-muted-foreground ml-auto">{upcomingSessions.length}</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {upcomingSessions.map(session => (
                   <SessionCard
                     key={session.id}
                     session={session}
                     onClick={() => setSelectedSession(session)}
                   />
                 ))}
               </div>
             </div>
           )}

           {/* Past Sessions */}
           {pastSessions.length > 0 && (
             <div className="space-y-3">
               <h2 className="font-semibold text-lg text-muted-foreground">Past Sessions</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {pastSessions.map(session => (
                   <SessionCard
                     key={session.id}
                     session={session}
                     onClick={() => setSelectedSession(session)}
                   />
                 ))}
               </div>
             </div>
           )}

           {filteredSessions.length === 0 && (
             <Card>
               <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                 No sessions found
               </CardContent>
             </Card>
           )}
        </>
      )}

      {selectedSession && (
        <SessionDetailPanel
          session={selectedSession}
          onUpdate={(data) => updateMutation.mutate(data)}
          onClose={() => setSelectedSession(null)}
          loading={updateMutation.isPending}
        />
      )}
    </div>
  );
}