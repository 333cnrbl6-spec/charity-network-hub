import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function SupportPortal() {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const queryClient = useQueryClient();

  const { data: charity } = useQuery({
    queryKey: ['charity'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tickets = [] } = useQuery({
    queryKey: ['supportTickets', charity?.id],
    queryFn: async () => {
      if (!charity?.id) return [];
      // In production, would call backend to list tickets for this charity
      return [];
    },
    enabled: !!charity?.id
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('createSupportTicket', {
        charity_id: charity.id,
        subject,
        description,
        priority
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Support ticket created. Our team will respond within 24 hours.');
      setSubject('');
      setDescription('');
      setPriority('medium');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
    onError: () => toast.error('Failed to create ticket')
  });

  const statusColor = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  };

  const priorityColor = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Create Support Ticket</CardTitle>
            <CardDescription>Describe your issue and we'll get back to you ASAP</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <textarea
              placeholder="Detailed description of your issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows="4"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
            <div className="flex gap-2">
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!subject || !description || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto opacity-20 mb-3" />
              <p>No support tickets yet</p>
            </CardContent>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                    <div className="flex gap-2 mt-3">
                      <Badge className={statusColor[ticket.status]}>
                        {ticket.status}
                      </Badge>
                      <Badge className={priorityColor[ticket.priority]}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(ticket.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support Hours & Response Times</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Critical:</strong> 1 hour response time, 24/7 support</p>
          <p><strong>High:</strong> 4 hour response time, business hours</p>
          <p><strong>Medium:</strong> 24 hour response time, business hours</p>
          <p><strong>Low:</strong> 48 hour response time</p>
        </CardContent>
      </Card>
    </div>
  );
}