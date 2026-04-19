import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, MapPin, Shield, Activity, Clock } from 'lucide-react';
import { format, startOfMonth, subMonths } from 'date-fns';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
const INCIDENT_COLORS = {
  physical_abuse: '#ef4444',
  sexual_abuse: '#dc2626',
  emotional_abuse: '#f97316',
  financial_abuse: '#eab308',
  neglect: '#84cc16',
  domestic_violence: '#ef4444',
  modern_slavery: '#dc2626',
  organisational_abuse: '#f97316',
  self_neglect: '#84cc16',
  radicalisation: '#dc2626',
  cse_child_sexual_exploitation: '#dc2626',
  fgm_female_genital_mutilation: '#dc2626',
  honour_based_violence: '#ef4444',
  discriminatory_abuse: '#f97316',
  near_miss: '#84cc16',
  concern_disclosure: '#6b7280',
  allegation_against_staff: '#f97316',
  allegation_against_volunteer: '#eab308',
  other: '#6b7280',
};

export default function SafeguardingAnalytics() {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateRange, setDateRange] = useState('6');

  const { data: incidents = [] } = useQuery({
    queryKey: ['safeguarding-incidents'],
    queryFn: () => base44.entities.SafeguardingIncident.list(),
  });

  const filteredData = useMemo(() => {
    return incidents.filter(incident => {
      if (severityFilter !== 'all' && incident.ai_severity_classification !== severityFilter) {
        return false;
      }
      
      // Filter by date range
      const incidentDate = new Date(incident.incident_date);
      const cutoffDate = subMonths(new Date(), parseInt(dateRange));
      return incidentDate >= cutoffDate;
    });
  }, [incidents, severityFilter, dateRange]);

  // Trend data (by month)
  const trendData = useMemo(() => {
    const monthlyData = {};
    
    filteredData.forEach(incident => {
      const month = format(new Date(incident.incident_date), 'MMM yyyy');
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    // Generate all months in range
    const months = [];
    for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
      months.push(format(subMonths(new Date(), i), 'MMM yyyy'));
    }

    return months.map(month => ({
      month,
      count: monthlyData[month] || 0,
    }));
  }, [filteredData, dateRange]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categories = {};
    filteredData.forEach(incident => {
      const type = incident.incident_type;
      categories[type] = (categories[type] || 0) + 1;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({
        name: name.replace(/_/g, ' ').charAt(0).toUpperCase() + name.replace(/_/g, ' ').slice(1),
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredData]);

  // Severity breakdown
  const severityData = useMemo(() => {
    const severity = {};
    filteredData.forEach(incident => {
      const level = incident.ai_severity_classification || 'unknown';
      severity[level] = (severity[level] || 0) + 1;
    });

    return Object.entries(severity).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[['critical', 'high', 'medium', 'low'].indexOf(name)] || '#6b7280',
    }));
  }, [filteredData]);

  // High-risk locations
  const locationData = useMemo(() => {
    const locations = {};
    filteredData
      .filter(i => i.ai_severity_classification === 'critical' || i.ai_severity_classification === 'high')
      .forEach(incident => {
        const location = incident.incident_location || 'Unknown';
        locations[location] = (locations[location] || 0) + 1;
      });

    return Object.entries(locations)
      .map(([name, value]) => ({ name, count: value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredData]);

  // Response time analysis
  const responseMetrics = useMemo(() => {
    const openIncidents = filteredData.filter(i => i.status !== 'closed');
    const daysInSystem = openIncidents.map(i => {
      const days = Math.floor((new Date() - new Date(i.incident_date)) / (1000 * 60 * 60 * 24));
      return days;
    });
    
    return {
      avgDaysOpen: daysInSystem.length > 0 ? Math.round(daysInSystem.reduce((a, b) => a + b) / daysInSystem.length) : 0,
      overdue: daysInSystem.filter(d => d > 28).length
    };
  }, [filteredData]);

  // Risk trend analysis
  const riskTrendData = useMemo(() => {
    const timeGroups = {};
    filteredData.forEach(incident => {
      const month = format(new Date(incident.incident_date), 'MMM yyyy');
      if (!timeGroups[month]) timeGroups[month] = { critical: 0, high: 0, medium: 0, low: 0 };
      const severity = incident.ai_severity_classification || 'low';
      timeGroups[month][severity]++;
    });

    const months = [];
    for (let i = parseInt(dateRange) - 1; i >= 0; i--) {
      months.push(format(subMonths(new Date(), i), 'MMM yyyy'));
    }

    return months.map(month => ({
      month,
      critical: timeGroups[month]?.critical || 0,
      high: timeGroups[month]?.high || 0,
      medium: timeGroups[month]?.medium || 0,
      low: timeGroups[month]?.low || 0,
    }));
  }, [filteredData, dateRange]);

  // KPI calculations
  const stats = useMemo(() => ({
    total: filteredData.length,
    critical: filteredData.filter(i => i.ai_severity_classification === 'critical').length,
    high: filteredData.filter(i => i.ai_severity_classification === 'high').length,
    requiresReferral: filteredData.filter(i => i.ai_risk_assessment?.statutory_referral_required).length,
  }), [filteredData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Safeguarding Analytics</h1>
        <p className="text-muted-foreground">Track incident trends, hotspots, and patterns</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-48">
          <label className="text-sm font-medium mb-2 block">Severity Level</label>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical Only</SelectItem>
              <SelectItem value="high">High Only</SelectItem>
              <SelectItem value="medium">Medium Only</SelectItem>
              <SelectItem value="low">Low Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
              <SelectItem value="24">Last 24 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">in selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
            <p className="text-xs text-muted-foreground mt-1">immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{stats.high}</p>
            <p className="text-xs text-muted-foreground mt-1">urgent response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats.requiresReferral}</p>
            <p className="text-xs text-muted-foreground mt-1">external agencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg. Days Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{responseMetrics.avgDaysOpen}</p>
            <p className="text-xs text-muted-foreground mt-1">{responseMetrics.overdue} overdue</p>
          </CardContent>
        </Card>
        </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Risk Trend Over Time */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Risk Trend Analysis
            </CardTitle>
            <CardDescription>Incident severity distribution over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={riskTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                <Bar dataKey="high" stackId="a" fill="#f97316" name="High" />
                <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                <Bar dataKey="low" stackId="a" fill="#84cc16" name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Incident Trend
            </CardTitle>
            <CardDescription>Total incidents monthly</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} name="Total" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>Incidents by classification</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Categories</CardTitle>
            <CardDescription>Top types of safeguarding incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={190} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* High-Risk Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              High-Risk Hotspots
            </CardTitle>
            <CardDescription>Critical & high severity incidents by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {locationData.length > 0 ? (
                locationData.map((location, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg border">
                    <span className="text-sm font-medium truncate">{location.name}</span>
                    <Badge variant="destructive">{location.count}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No high-risk incidents in selected period</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}