import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function VolunteerAvailability({ volunteers, jobs, selectedDate }) {
  const volunteerSchedule = useMemo(() => {
    if (!selectedDate) return [];

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const scheduled = {};

    // Count scheduled jobs per volunteer on this date
    jobs.forEach(job => {
      if (job.status === 'scheduled' || job.status === 'completed') {
        const jobDate = format(new Date(job.scheduled_date), 'yyyy-MM-dd');
        if (jobDate === dateStr && job.volunteer_id) {
          if (!scheduled[job.volunteer_id]) {
            scheduled[job.volunteer_id] = { count: 0, duration: 0 };
          }
          scheduled[job.volunteer_id].count += 1;
          scheduled[job.volunteer_id].duration += job.duration_minutes || 60;
        }
      }
    });

    return volunteers.map(vol => ({
      ...vol,
      jobsToday: scheduled[vol.id]?.count || 0,
      minutesToday: scheduled[vol.id]?.duration || 0,
      available: (scheduled[vol.id]?.duration || 0) < 480 // Less than 8 hours
    }));
  }, [volunteers, jobs, selectedDate]);

  if (!selectedDate) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
          Select a date to view volunteer availability
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4 text-primary" />
          Volunteer Availability — {format(selectedDate, 'EEE, MMM d')}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {volunteerSchedule.length === 0 ? (
          <p className="text-sm text-muted-foreground">No volunteers</p>
        ) : (
          volunteerSchedule.map(vol => (
            <div key={vol.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm">
              <div className="space-y-0.5">
                <p className="font-medium">{vol.full_name}</p>
                <p className="text-xs text-muted-foreground">{vol.role}</p>
              </div>
              <div className="flex items-center gap-2">
                {vol.jobsToday > 0 && (
                  <Badge variant={vol.available ? 'outline' : 'destructive'} className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {vol.minutesToday}m
                  </Badge>
                )}
                {vol.available ? (
                  <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                ) : (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">Full</Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}