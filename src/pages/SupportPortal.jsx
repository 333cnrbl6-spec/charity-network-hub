import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function SupportPortal() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => base44.auth.me()
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      return base44.entities.Alert.filter({
        created_by: 'system'
      });
    },
    refetchInterval: 30000,
    enabled: !!user && user.role === 'admin'
  });

  const replyMutation = useMutation({
    mutationFn: async (reply) => {
      await base44.entities.Alert.update(selectedTicket.id, {
        notes: (selectedTicket.notes || '') + '\n[Support Reply]\n' + reply
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setReplyText('');
    }
  });

  const closeMutation = useMutation({
    mutationFn: async (ticketId) => {
      await base44.entities.Alert.update(ticketId, {
        status: 'resolved'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setSelectedTicket(null);
    }
  });

  // Only admins can access support portal
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

  const openCount = tickets.filter(t => t.status === 'active').length;
  const avgResponseTime = 4; // hours

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Support Portal</h1>
          <p className="text-muted-foreground">Manage customer support tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                  <p className="text-2xl font-bold">{openCount}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">{avgResponseTime}h</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'active', 'resolved'].map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="col-span-2 space-y-3">
            {filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">No tickets</p>
                </CardContent>
              </Card>
            ) : (
              filteredTickets.map(ticket => (
                <Card
                  key={ticket.id}
                  className={`cursor-pointer transition ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{ticket.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(ticket.created_date).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          ticket.status === 'active'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Ticket Detail */}
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold">ID</p>
                  <p className="text-xs text-muted-foreground font-mono">{selectedTicket.id}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold">Status</p>
                  <Badge className="mt-1">
                    {selectedTicket.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-semibold">Priority</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedTicket.priority || 'Medium'}
                  </Badge>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Notes</p>
                  <div className="bg-muted p-3 rounded text-sm max-h-32 overflow-y-auto">
                    {selectedTicket.notes || 'No notes yet'}
                  </div>
                </div>

                {selectedTicket.status === 'active' && (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Add reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => replyMutation.mutate(replyText)}
                        disabled={!replyText || replyMutation.isPending}
                      >
                        Reply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => closeMutation.mutate(selectedTicket.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">Select a ticket to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}