/**
 * StaffPortal — for branch_staff and volunteer roles
 * Shows: their assigned jobs today, client contact info, basic instructions
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

export default function StaffPortal() {
  const { user } = useAuth();

  const { data: jobs = [] } = useQuery({
    queryKey: ['my-jobs', user?.full_name],
    queryFn: () => base44.entities.Job.filter({ volunteer_name: user?.full_name }),
    enabled: !!user,
  });

  const todaysJobs = jobs.filter(j => j.scheduled_date && isToday(parseISO(j.scheduled_date)));
  const upcomingJobs = jobs.filter(j => {
    if (!j.scheduled_date) return false;
    const d = parseISO(j.scheduled_date);
    return d > new Date() && !isToday(d) && j.status === 'scheduled';
  }).slice(0, 5);

  const isVolunteer = user?.org_role === 'volunteer';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isVolunteer ? 'Volunteer Portal' : 'Staff Portal'}</h1>
        <p className="text-muted-foreground text-sm">{user?.branch_name || 'Age UK'} — Welcome, {user?.full_name?.split(' ')[0] || 'there'}</p>
      </div>

      <main className="max-w-2xl space-y-6">
        {/* Today's summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-primary">{todaysJobs.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Today's Jobs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-600">{todaysJobs.filter(j => j.status === 'completed').length}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{todaysJobs.filter(j => j.status === 'scheduled').length}</p>
              <p className="text-xs text-muted-foreground mt-1">Remaining</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="w-4 h-4 text-primary" />
              Today — {format(new Date(), 'EEEE d MMMM')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaysJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No jobs scheduled for today.</p>
            ) : (
              <div className="space-y-3">
                {todaysJobs.map(job => (
                  <div key={job.id} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{job.client_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{job.job_type?.replace(/-/g, ' ')}</p>
                      </div>
                      <Badge variant={job.status === 'completed' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                        {job.status === 'completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                        {job.status}
                      </Badge>
                    </div>
                    {job.notes && (
                      <p className="text-xs bg-muted/50 rounded p-2">{job.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming */}
        {upcomingJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" /> Upcoming Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingJobs.map(job => (
                  <div key={job.id} className="flex items-center gap-3 text-sm py-1 border-b last:border-0">
                    <span className="text-xs text-muted-foreground w-20 flex-shrink-0">
                      {format(parseISO(job.scheduled_date), 'EEE d MMM')}
                    </span>
                    <span className="font-medium">{job.client_name}</span>
                    <span className="text-muted-foreground text-xs capitalize ml-auto">{job.job_type?.replace(/-/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Important reminder */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-sm text-amber-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Before every visit:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Check client name and address match your records</li>
              <li>• Carry your ID badge at all times</li>
              <li>• Call your coordinator if you cannot attend</li>
              <li>• Log any safeguarding concerns immediately</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );

}