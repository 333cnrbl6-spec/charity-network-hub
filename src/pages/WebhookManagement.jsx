import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function WebhookManagement() {
  const [showForm, setShowForm] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState(['invoice.created']);
  const queryClient = useQueryClient();

  const { data: charity } = useQuery({
    queryKey: ['charity'],
    queryFn: () => base44.auth.me(),
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks', charity?.id],
    queryFn: async () => {
      if (!charity?.id) return [];
      const res = await base44.functions.invoke('manageWebhooks', {
        action: 'list',
        charity_id: charity.id
      });
      return res.data.webhooks;
    },
    enabled: !!charity?.id
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('manageWebhooks', {
        action: 'create',
        charity_id: charity.id,
        endpoint_url: endpointUrl,
        events: selectedEvents
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Webhook created. Secret: ${data.secret.slice(0, 10)}...`);
      setEndpointUrl('');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (webhook) => base44.functions.invoke('manageWebhooks', {
      action: 'toggle',
      charity_id: charity.id,
      webhook_id: webhook.id,
      status: webhook.status
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (webhookId) => base44.functions.invoke('manageWebhooks', {
      action: 'delete',
      charity_id: charity.id,
      webhook_id: webhookId
    }),
    onSuccess: () => {
      toast.success('Webhook deleted');
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    }
  });

  const availableEvents = [
    'invoice.created',
    'invoice.paid',
    'customer.churn_risk',
    'customer.active',
    'compliance.alert',
    'system.alert'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">Subscribe to real-time platform events</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Webhook
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Create Webhook Endpoint</CardTitle>
            <CardDescription>We'll send POST requests with event data to your endpoint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="https://your-domain.com/webhooks"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
            />
            <div>
              <p className="text-sm font-medium mb-2">Events to Subscribe</p>
              <div className="grid grid-cols-2 gap-2">
                {availableEvents.map((evt) => (
                  <label key={evt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(evt)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvents([...selectedEvents, evt]);
                        } else {
                          setSelectedEvents(selectedEvents.filter(e => e !== evt));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{evt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!endpointUrl || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{webhook.endpoint_url}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {webhook.events.map((evt) => (
                      <Badge key={evt} variant="secondary" className="text-xs">
                        {evt}
                      </Badge>
                    ))}
                  </div>
                  {webhook.last_delivery && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Last delivery: {new Date(webhook.last_delivery).toLocaleString()}
                    </p>
                  )}
                  {webhook.failed_attempts > 0 && (
                    <Badge variant="destructive" className="mt-2">
                      {webhook.failed_attempts} failed attempts
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleMutation.mutate(webhook)}
                  >
                    {webhook.status === 'active' ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(webhook.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}