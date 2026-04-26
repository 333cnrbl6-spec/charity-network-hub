import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Users, User, AlertCircle } from 'lucide-react';
import ActivityFeed from '@/components/client/ActivityFeed';

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const { data: client = null, isLoading: clientLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => base44.entities.Client.list().then(clients => 
      clients.find(c => c.id === clientId)
    ),
    enabled: !!clientId,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => base44.entities.Job.list('-created_date'),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-created_date'),
  });

  const { data: grants = [] } = useQuery({
    queryKey: ['grants'],
    queryFn: () => base44.entities.Grant.list('-created_date'),
  });

  // Filter data for this client
  const clientJobs = useMemo(() => 
    jobs.filter(j => j.client_id === clientId),
    [jobs, clientId]
  );

  const clientGrants = useMemo(() => 
    grants.filter(g => g.client_id === clientId || g.client_name === client?.full_name),
    [grants, clientId, client]
  );

  const stats = useMemo(() => ({
    completedJobs: clientJobs.filter(j => j.status === 'completed').length,
    upcomingJobs: clientJobs.filter(j => j.status === 'scheduled').length,
    grantValue: clientGrants.filter(g => g.status === 'awarded')
      .reduce((sum, g) => sum + (g.amount_awarded || 0), 0),
    totalGrants: clientGrants.length,
  }), [clientJobs, clientGrants]);

  if (clientLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <Button onClick={() => navigate('/clients')} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Button>
        <div className="mt-8 text-center text-muted-foreground">
          <p>Client not found</p>
        </div>
      </div>
    );
  }

  const age = client.date_of_birth ? 
    Math.floor((new Date() - new Date(client.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : 
    null;

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    deceased: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Button onClick={() => navigate('/clients')} variant="outline" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{client.full_name}</h1>
            <p className="text-muted-foreground mt-1">Client ID: {clientId}</p>
          </div>
          <Badge className={statusColors[client.status]}>
            {client.status}
          </Badge>
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Age
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{age || 'N/A'}</p>
            {client.date_of_birth && (
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(client.date_of_birth).toLocaleDateString('en-GB')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Jobs Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.completedJobs}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.upcomingJobs} upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Total Grants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalGrants}</p>
            <p className="text-xs text-muted-foreground mt-1">
              £{stats.grantValue.toFixed(0)} awarded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Registered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {client.date_registered ? 
                new Date(client.date_registered).toLocaleDateString('en-GB') : 
                'N/A'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contact & Details */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {client.phone && (
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{client.phone}</p>
                  </div>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{client.email}</p>
                  </div>
                </div>
              )}
            </div>
            <div>
              {client.address && (
                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium">{client.address}</p>
                    {client.postcode && <p className="text-sm">{client.postcode}</p>}
                  </div>
                </div>
              )}
              {client.key_worker && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Key Worker</p>
                    <p className="text-sm font-medium">{client.key_worker}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {client.notes && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground font-semibold">Notes</p>
              <p className="text-sm mt-1">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <ActivityFeed 
        jobs={clientJobs}
        sessions={sessions}
        grants={clientGrants}
        clientId={clientId}
      />
    </div>
  );
}