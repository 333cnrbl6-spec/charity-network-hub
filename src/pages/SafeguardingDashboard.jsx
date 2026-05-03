import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, FileText, Filter } from 'lucide-react';

export default function SafeguardingDashboard() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Fetch incidents
  const { data: incidents, isLoading } = useQuery({
    queryKey: ['safeguarding_incidents'],
    queryFn: () => base44.entities.SafeguardingIncident.list(),
    initialData: []
  });

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    if (statusFilter !== 'all' && incident.status !== statusFilter) return false;
    if (severityFilter !== 'all' && incident.severity !== severityFilter) return false;
    return true;
  });

  const selected = selectedIncident ? incidents.find(i => i.id === selectedIncident) : null;

  // Calculate metrics
  const metrics = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    pending: incidents.filter(i => i.status === 'open').length,
    needsFollowUp: incidents.filter(i => {
      if (!i.created_at) return false;
      const createdTime = new Date(i.created_at);
      const hoursSince = (Date.now() - createdTime) / (1000 * 60 * 60);
      return i.status === 'open' && hoursSince >= 48;
    }).length
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-900 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-900 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-900 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-900 border-blue-300';
      default: return 'bg-gray-100 text-gray-900 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'open': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getHoursElapsed = (dateString) => {
    if (!dateString) return 0;
    return Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60));
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <AlertCircle className="w-8 h-8 text-red-600" />
          Safeguarding Incident Tracker
        </h1>
        <p className="text-muted-foreground mt-1">Monitor and track critical incidents with automated follow-ups</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Incidents</p>
            <p className="text-4xl font-bold text-primary mt-2">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700 font-medium">Critical Severity</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{metrics.critical}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-700 font-medium">Open & Pending</p>
            <p className="text-4xl font-bold text-orange-600 mt-2">{metrics.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700 font-medium">Due for Follow-Up</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{metrics.needsFollowUp}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Incidents List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Incidents</CardTitle>
              <div className="space-y-3 mt-4">
                <div>
                  <label className="block text-xs font-medium mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-2">Severity</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {filteredIncidents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No incidents found</p>
              ) : (
                filteredIncidents.map(incident => (
                  <button
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident.id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedIncident === incident.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted border-muted'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">{incident.title}</p>
                      {getStatusIcon(incident.status)}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${selectedIncident === incident.id ? 'border-current text-current' : getSeverityColor(incident.severity)}`}
                      >
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-xs opacity-70">{formatDate(incident.created_at)}</p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Incident Details */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selected.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{selected.description}</p>
                  </div>
                  <Badge className={`${getSeverityColor(selected.severity)}`}>
                    {selected.severity.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Key Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">INCIDENT DATE</p>
                    <p className="text-sm">{formatDate(selected.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">STATUS</p>
                    <p className="text-sm flex items-center gap-2">
                      {getStatusIcon(selected.status)}
                      {selected.status.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">ASSIGNED TO</p>
                    <p className="text-sm">{selected.assigned_to || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">HOURS ELAPSED</p>
                    <p className="text-sm">{getHoursElapsed(selected.created_at)} hours</p>
                  </div>
                </div>

                {/* Involved Parties */}
                {selected.individuals_involved && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">INDIVIDUALS INVOLVED</p>
                    <div className="space-y-2 text-sm">
                      {selected.individuals_involved.map((person, idx) => (
                        <p key={idx} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                          {person}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Agencies Notified */}
                {selected.external_agencies_notified && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">EXTERNAL AGENCIES NOTIFIED</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.external_agencies_notified.map((agency, idx) => (
                        <Badge key={idx} variant="outline">{agency}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow-up Notes */}
                {selected.follow_up_notes && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">FOLLOW-UP NOTES</p>
                    <p className="text-sm bg-muted p-3 rounded">{selected.follow_up_notes}</p>
                  </div>
                )}

                {/* Action Items */}
                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-semibold">Action Items</p>
                  {getHoursElapsed(selected.created_at) >= 48 && selected.status === 'open' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                      <Clock className="w-5 h-5 text-blue-600 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">48-Hour Follow-Up Due</p>
                        <p className="text-xs text-blue-800 mt-1">Automated reminder has been sent to the safeguarding lead.</p>
                      </div>
                    </div>
                  )}
                  <Button className="w-full gap-2">
                    <FileText className="w-4 h-4" /> Add Follow-Up Note
                  </Button>
                  <Button variant="outline" className="w-full">
                    Resolve Incident
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-96">
              <div className="text-center text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select an incident to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}