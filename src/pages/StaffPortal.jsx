/**
 * StaffPortal — for branch_staff and volunteer roles
 * Shows: their assigned jobs today, upcoming schedule, and impact reporting to manager
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, Clock, CheckCircle2, AlertCircle, FileBarChart2, Send, Loader2, ThumbsUp } from 'lucide-react';
import { format, isToday, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export default function StaffPortal() {
  const { user } = useAuth();
  const [reportState, setReportState] = useState('idle'); // idle | sending | done | error
  const [report, setReport] = useState({
    highlights: '',
    concerns: '',
    extra_hours: '',
  });

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

  // This week's stats for the report
  const weekInterval = { start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) };
  const thisWeekJobs = jobs.filter(j => j.scheduled_date && isWithinInterval(parseISO(j.scheduled_date), weekInterval));
  const weekCompleted = thisWeekJobs.filter(j => j.status === 'completed');
  const weekClients = [...new Set(weekCompleted.map(j => j.client_name))];
  const weekHours = weekCompleted.reduce((sum, j) => sum + (j.duration_minutes || 60), 0) / 60;

  const isVolunteer = user?.org_role === 'volunteer';

  const handleSendReport = async () => {
    setReportState('sending');
    const summary = `Weekly Impact Report from ${user?.full_name || 'Staff Member'}
Branch: ${user?.branch_name || 'Age UK'}
Week ending: ${format(weekInterval.end, 'dd MMM yyyy')}

ACTIVITY SUMMARY
- Jobs completed: ${weekCompleted.length}
- Clients supported: ${weekClients.length}
- Estimated hours: ${(weekHours + parseFloat(report.extra_hours || 0)).toFixed(1)}h

CLIENTS SUPPORTED
${weekClients.length > 0 ? weekClients.map(c => `• ${c}`).join('\n') : '• None recorded this week'}

HIGHLIGHTS & ACHIEVEMENTS
${report.highlights || 'None noted.'}

CONCERNS OR ISSUES
${report.concerns || 'None noted.'}`;

    await base44.integrations.Core.SendEmail({
      to: user?.email,
      subject: `Weekly Impact Report — ${user?.full_name} — w/e ${format(weekInterval.end, 'dd MMM yyyy')}`,
      body: summary,
    });

    setReportState('done');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isVolunteer ? 'Volunteer Portal' : 'Staff Portal'}</h1>
        <p className="text-muted-foreground text-sm">{user?.branch_name || 'Age UK'} — Welcome, {user?.full_name?.split(' ')[0] || 'there'}</p>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList>
          <TabsTrigger value="schedule">My Schedule</TabsTrigger>
          <TabsTrigger value="report">Impact Report</TabsTrigger>
        </TabsList>

        {/* ── Schedule Tab ── */}
        <TabsContent value="schedule">
          <div className="max-w-2xl space-y-6 mt-4">
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
          </div>
        </TabsContent>

        {/* ── Impact Report Tab ── */}
        <TabsContent value="report">
          <div className="max-w-2xl mt-4 space-y-5">
            <div className="flex items-center gap-2">
              <FileBarChart2 className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-semibold text-base">Weekly Impact Report</h2>
                <p className="text-xs text-muted-foreground">Week ending {format(weekInterval.end, 'EEEE d MMMM yyyy')}</p>
              </div>
            </div>

            {reportState === 'done' ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="py-10 text-center space-y-3">
                  <ThumbsUp className="w-10 h-10 text-green-600 mx-auto" />
                  <p className="font-semibold text-green-900">Report sent!</p>
                  <p className="text-sm text-green-700">Your impact report has been emailed to your inbox for forwarding to your coordinator.</p>
                  <Button variant="outline" size="sm" onClick={() => setReportState('idle')}>Submit another</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Auto-populated stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground font-medium">This week's activity (auto-calculated)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4 text-center pt-0">
                    <div>
                      <p className="text-2xl font-bold text-primary">{weekCompleted.length}</p>
                      <p className="text-xs text-muted-foreground">Jobs completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{weekClients.length}</p>
                      <p className="text-xs text-muted-foreground">Clients supported</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{weekHours.toFixed(1)}h</p>
                      <p className="text-xs text-muted-foreground">Logged hours</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional hours not in system */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Additional hours not in system (optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g. 2.5"
                    value={report.extra_hours}
                    onChange={e => setReport(r => ({ ...r, extra_hours: e.target.value }))}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Highlights */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Highlights & achievements this week</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Helped a client apply for Attendance Allowance, ran a digital session..."
                    value={report.highlights}
                    onChange={e => setReport(r => ({ ...r, highlights: e.target.value }))}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {/* Concerns */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Concerns, issues or escalations</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Client welfare concern, missed visit, equipment issue..."
                    value={report.concerns}
                    onChange={e => setReport(r => ({ ...r, concerns: e.target.value }))}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                {reportState === 'error' && (
                  <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
                )}

                <Button onClick={handleSendReport} disabled={reportState === 'sending'} className="w-full gap-2">
                  {reportState === 'sending' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Report to Coordinator</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Report will be emailed to you — forward it to your coordinator or manager.
                </p>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}