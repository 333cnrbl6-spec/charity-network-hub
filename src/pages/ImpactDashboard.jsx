import React, { useState, useMemo } from 'react';
import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Users, TrendingUp, Download, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useJobs, useSessions, useVolunteers, useClients, useGrants, useBranchReports } from '@/hooks/useEntityQueries';

export default function ImpactDashboard() {
  const [exportLoading, setExportLoading] = useState(false);

  const { data: jobs = [] } = useJobs();
  const { data: sessions = [] } = useSessions();
  const { data: volunteers = [] } = useVolunteers();
  const { data: clients = [] } = useClients();
  const { data: grants = [] } = useGrants();
  const { data: branchReports = [] } = useBranchReports();

  // Calculate impact metrics
  const metrics = useMemo(() => {
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const totalJobHours = jobs.reduce((sum, j) => sum + (j.duration_minutes || 0), 0);
    const hoursPerJob = completedJobs > 0 ? (totalJobHours / 60 / completedJobs).toFixed(1) : 0;
    
    const sessionAttendees = sessions.reduce((sum, s) => sum + (s.attendees_count || 0), 0);
    const uniqueClientsServed = new Set(jobs.map(j => j.client_id)).size;
    
    const awardedGrants = grants.filter(g => g.status === 'awarded');
    const grantsValue = awardedGrants.reduce((sum, g) => sum + (g.amount_awarded || 0), 0);
    
    const activeVolunteers = volunteers.filter(v => v.status === 'active').length;
    const totalVolunteerHours = volunteers.reduce((sum, v) => sum + (v.hours_contributed || 0), 0);
    
    return {
      completedJobs,
      totalJobHours: Math.round(totalJobHours / 60),
      hoursPerJob,
      sessionAttendees,
      uniqueClientsServed,
      grantsValue,
      awardedGrants: awardedGrants.length,
      activeVolunteers,
      totalVolunteerHours,
    };
  }, [jobs, sessions, volunteers, clients, grants]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const months = {};
    jobs.forEach(job => {
      const date = new Date(job.created_date);
      const key = date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
      if (!months[key]) months[key] = { month: key, jobs: 0, hours: 0, volunteers: new Set() };
      if (job.status === 'completed') {
        months[key].jobs += 1;
        months[key].hours += (job.duration_minutes || 0) / 60;
      }
      if (job.volunteer_id) months[key].volunteers.add(job.volunteer_id);
    });

    return Object.values(months)
      .slice(-12)
      .map(m => ({
        ...m,
        hours: Math.round(m.hours),
        volunteers: m.volunteers.size,
      }));
  }, [jobs]);

  // Volunteer contribution breakdown
  const topVolunteers = useMemo(() => {
    const contrib = {};
    jobs.forEach(job => {
      if (job.volunteer_id && job.status === 'completed') {
        if (!contrib[job.volunteer_id]) {
          contrib[job.volunteer_id] = { name: job.volunteer_name, hours: 0, jobs: 0 };
        }
        contrib[job.volunteer_id].hours += (job.duration_minutes || 0) / 60;
        contrib[job.volunteer_id].jobs += 1;
      }
    });
    return Object.values(contrib)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
  }, [jobs]);

  const handleExportReport = async () => {
    setExportLoading(true);
    try {
      await base44.functions.invoke('exportImpactReport', {});
      // Trigger download
      setTimeout(() => {
        window.location.href = '/api/export/impact-report';
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            Impact Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Measure the difference we make in our communities</p>
        </div>
        <Button
          onClick={handleExportReport}
          disabled={exportLoading}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {exportLoading ? 'Exporting...' : 'Export Report'}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Lives Touched
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.uniqueClientsServed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Unique individuals served</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.totalVolunteerHours.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Volunteer hours contributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              Grants Awarded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">£{(metrics.grantsValue / 1000).toFixed(0)}k</p>
            <p className="text-xs text-muted-foreground mt-1">{metrics.awardedGrants} successful awards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              Active Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.activeVolunteers}</p>
            <p className="text-xs text-muted-foreground mt-1">Volunteers making a difference</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Impact Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="jobs" stroke="#8b5cf6" strokeWidth={2} name="Jobs Completed" />
                <Line yAxisId="right" type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} name="Hours (right)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topVolunteers.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                  <div>
                    <p className="font-semibold text-sm">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.jobs} jobs completed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{v.hours.toFixed(0)}h</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Impact Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Jobs Completed</p>
              <p className="text-2xl font-bold mt-1">{metrics.completedJobs}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Hours per Job</p>
              <p className="text-2xl font-bold mt-1">{metrics.hoursPerJob}h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Session Attendees</p>
              <p className="text-2xl font-bold mt-1">{metrics.sessionAttendees.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Client Retention</p>
              <p className="text-2xl font-bold mt-1">{((metrics.uniqueClientsServed / (clients.length || 1)) * 100).toFixed(0)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}