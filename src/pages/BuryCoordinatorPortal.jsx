import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, Briefcase, CalendarDays, Star, ClipboardList, LogOut,
  CheckCircle2, Clock, AlertCircle, Plus, Phone, MapPin, TrendingUp, Gift
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

const BRANCH_ID = 'bury';

export default function BuryCoordinatorPortal() {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user needs onboarding
  useEffect(() => {
    if (user && !user.onboarding_complete) {
      window.location.replace('/role-onboarding');
    }
  }, [user]);

  const { data: clients = [] } = useQuery({
    queryKey: ['bury-clients'],
    queryFn: () => base44.entities.Client.filter({ status: 'active' }),
  });

  const { data: volunteers = [] } = useQuery({
    queryKey: ['bury-volunteers'],
    queryFn: () => base44.entities.Volunteer.filter({ status: 'active' }),
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['bury-jobs'],
    queryFn: () => base44.entities.Job.list('-scheduled_date', 50),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['bury-sessions'],
    queryFn: () => base44.entities.Session.list('-scheduled_date', 20),
  });

  const { data: grants = [] } = useQuery({
    queryKey: ['bury-grants'],
    queryFn: () => base44.entities.Grant.list(),
  });

  const todaysJobs = jobs.filter(j => j.scheduled_date && isToday(parseISO(j.scheduled_date)));
  const tomorrowsJobs = jobs.filter(j => j.scheduled_date && isTomorrow(parseISO(j.scheduled_date)));
  const pendingJobs = jobs.filter(j => j.status === 'scheduled');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const totalGrantValue = grants.filter(g => g.status === 'awarded').reduce((s, g) => s + (g.amount_awarded || 0), 0);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'jobs', label: "Today's Jobs", icon: Briefcase, badge: todaysJobs.length },
    { id: 'clients', label: 'Clients', icon: Users, badge: clients.length },
    { id: 'volunteers', label: 'Team', icon: ClipboardList },
    { id: 'sessions', label: 'Sessions', icon: CalendarDays },
    { id: 'grants', label: 'Grants', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-xs opacity-70 font-medium">Age UK Bury — Handyperson Coordinator Portal</p>
          <h1 className="text-xl font-bold">Sue Bradley's Workspace</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-white/20 text-white border-white/30 text-xs">Bury Branch</Badge>
          <Button size="sm" variant="outline" className="border-white/40 text-white hover:bg-white/20" onClick={() => logout()}>
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Log Out
          </Button>
        </div>
      </header>

      {/* Tab Nav */}
      <nav className="bg-card border-b border-border px-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[1.2rem] text-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto p-6 space-y-6">

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Today's Jobs", value: todaysJobs.length, icon: Briefcase, color: 'text-primary' },
                { label: 'Active Clients', value: clients.length, icon: Users, color: 'text-blue-600' },
                { label: 'Team Members', value: volunteers.length, icon: ClipboardList, color: 'text-green-600' },
                { label: 'Grants Awarded', value: `£${totalGrantValue.toLocaleString()}`, icon: Gift, color: 'text-amber-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-xs text-muted-foreground flex items-center gap-1.5`}>
                      <Icon className={`w-4 h-4 ${color}`} /> {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Today's schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary" /> Today's Schedule
                  <Badge variant="outline" className="ml-auto">{format(new Date(), 'EEEE d MMM')}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysJobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No jobs scheduled for today.</p>
                ) : (
                  <div className="space-y-3">
                    {todaysJobs.map(job => (
                      <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${job.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{job.client_name}</p>
                          <p className="text-xs text-muted-foreground">{job.job_type?.replace(/-/g, ' ')} • {job.volunteer_name || 'Unassigned'}</p>
                        </div>
                        <Badge variant={job.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tomorrow preview */}
            {tomorrowsJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" /> Tomorrow ({tomorrowsJobs.length} jobs)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {tomorrowsJobs.map(job => (
                      <div key={job.id} className="flex items-center gap-3 text-sm">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground flex-shrink-0" />
                        <span className="font-medium">{job.client_name}</span>
                        <span className="text-muted-foreground">— {job.job_type?.replace(/-/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Completed Jobs</CardTitle>
                </CardHeader>
                <CardContent><p className="text-2xl font-bold text-green-600">{completedJobs.length}</p></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-amber-500" /> Pending Jobs</CardTitle>
                </CardHeader>
                <CardContent><p className="text-2xl font-bold text-amber-600">{pendingJobs.length}</p></CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* JOBS */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Jobs</h2>
              <Badge variant="outline">{jobs.length} total</Badge>
            </div>
            {jobs.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">No jobs found.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 30).map(job => (
                  <Card key={job.id}>
                    <CardContent className="py-3 px-4 flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        job.status === 'completed' ? 'bg-green-500' :
                        job.status === 'cancelled' ? 'bg-red-400' : 'bg-primary'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{job.client_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.job_type?.replace(/-/g, ' ')} • {job.volunteer_name || 'Unassigned'}
                          {job.scheduled_date && ` • ${format(parseISO(job.scheduled_date), 'd MMM yyyy')}`}
                        </p>
                      </div>
                      <Badge variant={job.status === 'completed' ? 'default' : job.status === 'cancelled' ? 'destructive' : 'secondary'} className="text-xs flex-shrink-0">
                        {job.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CLIENTS */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Clients</h2>
              <Badge variant="outline">{clients.length} clients</Badge>
            </div>
            <div className="grid gap-3">
              {clients.slice(0, 30).map(client => (
                <Card key={client.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {client.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{client.full_name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>}
                        {client.postcode && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{client.postcode}</span>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">{client.referral_source?.replace(/-/g, ' ')}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* VOLUNTEERS / TEAM */}
        {activeTab === 'volunteers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Handyperson Team</h2>
              <Badge variant="outline">{volunteers.length} active</Badge>
            </div>
            <div className="grid gap-3">
              {volunteers.map(vol => (
                <Card key={vol.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                      {vol.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{vol.full_name}</p>
                      <p className="text-xs text-muted-foreground">{vol.role?.replace(/-/g, ' ')} • {vol.hours_contributed || 0} hrs contributed</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {vol.dbs_checked && <Badge className="text-xs bg-green-100 text-green-700 border-green-200">DBS ✓</Badge>}
                      <Badge variant={vol.status === 'active' ? 'default' : 'outline'} className="text-xs">{vol.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sessions</h2>
              <Badge variant="outline">{sessions.length} sessions</Badge>
            </div>
            <div className="grid gap-3">
              {sessions.map(session => (
                <Card key={session.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{session.session_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.session_type?.replace(/-/g, ' ')}
                        {session.location && ` • ${session.location}`}
                        {session.scheduled_date && ` • ${format(parseISO(session.scheduled_date), 'd MMM yyyy')}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">{session.attendees_count || 0} attendees</span>
                      <Badge variant={session.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{session.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* GRANTS */}
        {activeTab === 'grants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Grants & Benefits</h2>
              <Badge variant="outline">£{totalGrantValue.toLocaleString()} awarded</Badge>
            </div>
            <div className="grid gap-3">
              {grants.map(grant => (
                <Card key={grant.id}>
                  <CardContent className="py-3 px-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{grant.grant_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {grant.client_name && `${grant.client_name} • `}{grant.funder}
                        {grant.date_awarded && ` • ${format(parseISO(grant.date_awarded), 'd MMM yyyy')}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {grant.amount_awarded && (
                        <span className="text-sm font-semibold text-green-700">£{grant.amount_awarded.toLocaleString()}</span>
                      )}
                      <Badge variant={grant.status === 'awarded' ? 'default' : grant.status === 'rejected' ? 'destructive' : 'secondary'} className="text-xs">
                        {grant.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}