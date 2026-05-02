import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Plus, AlertCircle } from 'lucide-react';

export default function WebhooksDashboard() {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [copied, setCopied] = useState(null);

  const queryClient = useQueryClient();

  const availableEvents = [
    'invoice.created',
    'invoice.paid',
    'invoice.failed',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'campaign.created',
    'donor.added'
  ];

  const { data: charity } = useQuery({
    queryKey: ['charity'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const charities = await base44.entities.Charity.filter({
        created_by: user.email
      });
      return charities[0];
    }
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      if (!charity) return [];
      return base44.entities.WebhookConfig.filter({
        charity_id: charity.id
      });
    },
    enabled: !!charity
  });

  const createWebhookMutation = useMutation({
    mutationFn: async () => {
      const secret = Math.random().toString(36).substring(2, 15);
      return base44.entities.WebhookConfig.create({
        charity_id: charity.id,
        endpoint_url: newWebhookUrl,
        events: selectedEvents,
        secret,
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setNewWebhookUrl('');
      setSelectedEvents([]);
      setShowNewForm(false);
    }
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: (webhookId) =>
      base44.entities.WebhookConfig.update(webhookId, { status: 'inactive' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    }
  });

  if (!charity) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <Button onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Webhook
          </Button>
        </div>

        {/* Create New Webhook */}
        {showNewForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Webhook URL (https://...)"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                type="url"
              />

              <div>
                <label className="block text-sm font-semibold mb-2">Select Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableEvents.map(event => (
                    <label key={event} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEvents([...selectedEvents, event]);
                          } else {
                            setSelectedEvents(selectedEvents.filter(s => s !== event));
                          }
                        }}
                      />
                      <span className="text-sm">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => createWebhookMutation.mutate()}
                  disabled={!newWebhookUrl || selectedEvents.length === 0}
                >
                  Create Webhook
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Webhooks List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <p className="text-muted-foreground">No webhooks configured</p>
            ) : (
              <div className="space-y-4">
                {webhooks.map(webhook => (
                  <div key={webhook.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{webhook.endpoint_url}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                            {webhook.status}
                          </Badge>
                          {webhook.failed_attempts > 0 && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {webhook.failed_attempts} failures
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Subscribed Events:</p>
                      <div className="flex flex-wrap gap-2">
                        {webhook.events.map(event => (
                          <Badge key={event} variant="outline">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-3">
                      Last delivery: {webhook.last_delivery
                        ? new Date(webhook.last_delivery).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}