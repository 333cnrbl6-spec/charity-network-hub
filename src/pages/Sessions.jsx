import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
import { useBranchFilter } from '@/hooks/useBranchFilter';
import SessionCard from '@/components/sessions/SessionCard';
import SessionDetailPanel from '@/components/sessions/SessionDetailPanel';

export default function Sessions() {
  const queryClient = useQueryClient();
  const { filterData } = useBranchFilter();
  const [selectedSession, setSelectedSession] = useState(null);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <Button className="gap-2" disabled title="Session creation coming soon">
          <Plus className="w-4 h-4" />
          Add Session
        </Button>
      </div>

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