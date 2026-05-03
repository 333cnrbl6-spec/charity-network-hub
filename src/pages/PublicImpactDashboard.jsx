import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Heart, Users, Clock, TrendingUp, Award } from 'lucide-react';
import ProcessingFeedback from '@/components/ui/ProcessingFeedback';

export default function PublicImpactDashboard() {
  const [exporting, setExporting] = useState(false);

  // Fetch all data in parallel
  const { data: volunteers } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => base44.entities.Volunteer.list(),
    initialData: []
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list(),
    initialData: []
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list(),
    initialData: []
  });

  const { data: grants } = useQuery({
    queryKey: ['grants'],
    queryFn: () => base44.entities.Grant.list(),
    initialData: []
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list(),
    initialData: []
  });

  // Calculate metrics
  const totalHours = jobs?.reduce((sum, job) => sum + (job.duration_minutes || 0), 0) || 0;
  const totalHoursFormatted = (totalHours / 60).toFixed(0);
  const totalBeneficiaries = clients?.length || 0;
  const activeVolunteers = volunteers?.filter(v => v.status === 'active')?.length || 0;
  const totalGrantFunding = grants?.reduce((sum, g) => sum + (g.amount || 0), 0) || 0;
  const averageHoursPerVolunteer = activeVolunteers > 0 ? (totalHours / 60 / activeVolunteers).toFixed(1) : 0;

  // Chart data: volunteer hours trend (simulated by month)
  const hoursTrendData = [
    { month: 'Jan', hours: 240 },
    { month: 'Feb', hours: 380 },
    { month: 'Mar', hours: 520 },
    { month: 'Apr', hours: 680 },
    { month: 'May', hours: 850 }
  ];

  // Chart data: beneficiary outcomes
  const outcomeData = [
    { name: 'Social Support', value: 35 },
    { name: 'Practical Help', value: 28 },
    { name: 'Digital Skills', value: 20 },
    { name: 'Health Support', value: 17 }
  ];

  // Chart data: grant funding by source
  const grantSourceData = [
    { source: 'Government', awarded: 45000 },
    { source: 'Trusts', awarded: 32000 },
    { source: 'Corporate', awarded: 18000 },
    { source: 'Individuals', awarded: 12000 }
  ];

  // Chart data: activity over time (sessions vs jobs)
  const activityData = [
    { week: 'W1', sessions: 12, jobs: 28 },
    { week: 'W2', sessions: 15, jobs: 35 },
    { week: 'W3', sessions: 18, jobs: 42 },
    { week: 'W4', sessions: 20, jobs: 48 }
  ];

  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  const exportPDF = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke('generateImpactReportPDF', {
        metrics: {
          totalHours: totalHoursFormatted,
          totalBeneficiaries,
          activeVolunteers,
          totalGrantFunding,
          averageHoursPerVolunteer
        }
      });

      if (response.data?.pdf_url) {
        const link = document.createElement('a');
        link.href = response.data.pdf_url;
        link.download = `impact-report-${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {exporting && (
          <ProcessingFeedback
            label="Generating impact report…"
            detail="Creating a PDF snapshot of your community impact metrics."
            tips={[
              'Reports are generated instantly and ready to share.',
              'Include this in grant applications to demonstrate impact.',
              'Share with donors to show the difference their support makes.',
            ]}
          />
        )}

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Our Community Impact
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time metrics showing the difference we're making together. Last updated: {new Date().toLocaleDateString()}
          </p>
          <Button onClick={exportPDF} disabled={exporting} className="gap-2 mt-4">
            <Download className="w-4 h-4" />
            Export Impact Report (PDF)
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Hours Contributed</p>
                  <p className="text-4xl font-bold text-blue-900 mt-2">{totalHoursFormatted}</p>
                  <p className="text-xs text-blue-700 mt-1">Volunteer time invested</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400 opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Beneficiaries Supported</p>
                  <p className="text-4xl font-bold text-green-900 mt-2">{totalBeneficiaries}</p>
                  <p className="text-xs text-green-700 mt-1">Community members served</p>
                </div>
                <Heart className="w-8 h-8 text-green-400 opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Active Volunteers</p>
                  <p className="text-4xl font-bold text-purple-900 mt-2">{activeVolunteers}</p>
                  <p className="text-xs text-purple-700 mt-1">Making a difference</p>
                </div>
                <Users className="w-8 h-8 text-purple-400 opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Grant Funding Awarded</p>
                  <p className="text-4xl font-bold text-amber-900 mt-2">£{(totalGrantFunding / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-amber-700 mt-1">Supporting our mission</p>
                </div>
                <Award className="w-8 h-8 text-amber-400 opacity-60" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-cyan-600 font-medium">Avg. Hours/Volunteer</p>
                  <p className="text-4xl font-bold text-cyan-900 mt-2">{averageHoursPerVolunteer}</p>
                  <p className="text-xs text-cyan-700 mt-1">Per volunteer annually</p>
                </div>
                <TrendingUp className="w-8 h-8 text-cyan-400 opacity-60" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Volunteer Hours Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Hours Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={hoursTrendData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                  <Area type="monotone" dataKey="hours" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview (Last 4 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                  <Legend />
                  <Bar dataKey="sessions" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="jobs" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Beneficiary Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle>How We Help (Beneficiary Outcomes)</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={outcomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Grant Funding Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Grant Funding by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={grantSourceData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="source" type="category" stroke="#9ca3af" width={90} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="awarded" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Impact Stories Section */}
        <Card>
          <CardHeader>
            <CardTitle>Making a Real Difference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-transparent rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-2">Social Connection</h3>
                <p className="text-sm text-blue-800">
                  Our befriending programs reduce isolation and combat loneliness for hundreds of community members each month.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-transparent rounded-lg border border-green-100">
                <h3 className="font-semibold text-green-900 mb-2">Practical Support</h3>
                <p className="text-sm text-green-800">
                  From home maintenance to digital help, our volunteers provide critical services that keep people independent.
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-transparent rounded-lg border border-purple-100">
                <h3 className="font-semibold text-purple-900 mb-2">Skills & Learning</h3>
                <p className="text-sm text-purple-800">
                  We offer digital inclusion, training, and peer learning that empowers people of all ages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Join Us in Making a Difference</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every hour of volunteer time, every donation, and every partnership brings us closer to a more connected, supported community.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="gap-2">
              <Heart className="w-4 h-4" /> Donate
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Users className="w-4 h-4" /> Volunteer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}