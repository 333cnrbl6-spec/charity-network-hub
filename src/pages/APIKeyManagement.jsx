import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function APIKeyManagement() {
  const [showForm, setShowForm] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState(['read:donors']);
  const [copiedId, setCopiedId] = useState(null);
  const queryClient = useQueryClient();

  const { data: charity } = useQuery({
    queryKey: ['charity'],
    queryFn: () => base44.auth.me(),
  });

  const { data: keys = [] } = useQuery({
    queryKey: ['apiKeys', charity?.id],
    queryFn: async () => {
      if (!charity?.id) return [];
      const res = await base44.functions.invoke('manageAPIKeys', {
        action: 'list',
        charity_id: charity.id
      });
      return res.data.keys;
    },
    enabled: !!charity?.id
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('manageAPIKeys', {
        action: 'generate',
        charity_id: charity.id,
        key_name: keyName,
        permissions: selectedPermissions
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`API key generated. Save it now: ${data.api_key}`);
      setKeyName('');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    onError: () => toast.error('Failed to generate API key')
  });

  const revokeMutation = useMutation({
    mutationFn: (keyId) => base44.functions.invoke('manageAPIKeys', {
      action: 'revoke',
      charity_id: charity.id,
      key_id: keyId
    }),
    onSuccess: () => {
      toast.success('API key revoked');
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    }
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">Manage API credentials for external integrations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Generate Key
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Generate New API Key</CardTitle>
            <CardDescription>Create a key with specific permissions for your integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Key name (e.g., Zapier Integration)"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
            />
            <div>
              <p className="text-sm font-medium mb-2">Permissions</p>
              <div className="grid grid-cols-2 gap-2">
                {['read:donors', 'write:donors', 'read:campaigns', 'write:campaigns', 'read:grants', 'read:reports'].map((perm) => (
                  <label key={perm} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPermissions([...selectedPermissions, perm]);
                        } else {
                          setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => generateMutation.mutate()}
                disabled={!keyName || generateMutation.isPending}
              >
                {generateMutation.isPending ? 'Generating...' : 'Generate'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {keys.map((key) => (
          <Card key={key.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold">{key.name}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {key.permissions.map((perm) => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>Key: sk_...{key.key_preview}</p>
                    {key.last_used && <p>Last used: {new Date(key.last_used).toLocaleDateString()}</p>}
                    <p>Created: {new Date(key.created_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {key.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeMutation.mutate(key.id)}
                      disabled={revokeMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" /> Revoke
                    </Button>
                  )}
                  {key.status === 'revoked' && (
                    <Badge variant="destructive">Revoked</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}