import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, Gift, Calendar, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const ICON_MAP = {
  job: Briefcase,
  session: Users,
  grant: Gift,
  note: FileText,
};

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  awarded: 'bg-yellow-100 text-yellow-800',
  applied: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  'in-progress': 'bg-purple-100 text-purple-800',
};

export default function ActivityFeed({ jobs = [], sessions = [], grants = [], clientId }) {
  // Build unified timeline of activities
  const timeline = useMemo(() => {
    const activities = [];

    // Add jobs
    jobs.forEach(job => {
      if (job.client_id === clientId) {
        activities.push({
          id: `job-${job.id}`,
          type: 'job',
          date: new Date(job.scheduled_date || job.created_date),
          title: `${job.job_type?.replace('-', ' ')} with ${job.volunteer_name || 'Volunteer'}`,
          description: job.notes || 'No notes provided',
          status: job.status,
          details: {
            duration: job.duration_minutes,
            volunteer: job.volunteer_name,
            type: job.job_type,
          }
        });
      }
    });

    // Add sessions
    sessions.forEach(session => {
      // Check if client attended by matching session data (simplified)
      activities.push({
        id: `session-${session.id}`,
        type: 'session',
        date: new Date(session.scheduled_date || session.created_date),
        title: `${session.session_name}`,
        description: session.notes || `Session facilitated by ${session.facilitator || 'Staff'}`,
        status: session.status,
        details: {
          location: session.location,
          attendees: session.attendees_count,
          type: session.session_type,
        }
      });
    });

    // Add grants
    grants.forEach(grant => {
      if (grant.client_id === clientId || grant.client_name === clientId) {
        activities.push({
          id: `grant-${grant.id}`,
          type: 'grant',
          date: new Date(grant.date_awarded || grant.created_date),
          title: `Grant: ${grant.grant_name}`,
          description: `${grant.grant_type?.replace('-', ' ')} - £${(grant.amount_awarded || 0).toFixed(2)}`,
          status: grant.status,
          details: {
            amount: grant.amount_awarded,
            funder: grant.funder,
            grantType: grant.grant_type,
          }
        });
      }
    });

    // Sort by date descending (newest first)
    return activities.sort((a, b) => b.date - a.date);
  }, [jobs, sessions, grants, clientId]);

  if (timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No activities recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activity Timeline
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">{timeline.length} total activities</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((activity, idx) => {
            const Icon = ICON_MAP[activity.type] || FileText;
            const statusColor = STATUS_COLORS[activity.status] || 'bg-gray-100 text-gray-800';

            return (
              <div key={activity.id} className="flex gap-4">
                {/* Timeline connector */}
                <div className="flex flex-col items-center">
                  <div className={`p-2.5 rounded-full ${
                    activity.type === 'job' ? 'bg-blue-100' :
                    activity.type === 'session' ? 'bg-purple-100' :
                    'bg-yellow-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      activity.type === 'job' ? 'text-blue-600' :
                      activity.type === 'session' ? 'text-purple-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-border mt-2"></div>
                  )}
                </div>

                {/* Activity content */}
                <div className="flex-1 pt-1 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {activity.date.toLocaleDateString('en-GB', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge className={statusColor}>
                      {activity.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground mb-3">{activity.description}</p>

                  {/* Activity-specific details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
                    {activity.type === 'job' && activity.details.duration && (
                      <div>Duration: <span className="text-foreground font-medium">{activity.details.duration}m</span></div>
                    )}
                    {activity.type === 'job' && activity.details.volunteer && (
                      <div>Volunteer: <span className="text-foreground font-medium">{activity.details.volunteer}</span></div>
                    )}
                    {activity.type === 'session' && activity.details.location && (
                      <div>Location: <span className="text-foreground font-medium">{activity.details.location}</span></div>
                    )}
                    {activity.type === 'session' && activity.details.attendees && (
                      <div>Attendees: <span className="text-foreground font-medium">{activity.details.attendees}</span></div>
                    )}
                    {activity.type === 'grant' && activity.details.amount && (
                      <div>Amount: <span className="text-foreground font-medium">£{activity.details.amount.toFixed(2)}</span></div>
                    )}
                    {activity.type === 'grant' && activity.details.funder && (
                      <div>Funder: <span className="text-foreground font-medium">{activity.details.funder}</span></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}