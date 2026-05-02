import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, Eye, EyeOff, Plus } from 'lucide-react';

export default function APIKeysDashboard() {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copied, setCopied] = useState(null);
  const [hiddenKeys, setHiddenKeys] = useState({});

  const queryClient = useQueryClient();

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

  const { data: apiKeys = [] } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      if (!charity) return [];
      return base44.entities.APIKey.filter({
        charity_id: charity.id
      });
    },
    enabled: !!charity
  });

  const createKeyMutation = useMutation({
    mutationFn: async () => {
      // In real implementation, would generate actual API key
      const apiKey = `ch_${Math.random().toString(36).substr(2, 20)}`;
      return base44.entities.APIKey.create({
        charity_id: charity.id,
        name: newKeyName,
        key_hash: `hash_${Math.random()}`,
        key_preview: apiKey.slice(-4),
        permissions: ['read:data', 'write:data', 'api_calls'],
        status: 'active',
        created_by: 'user'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setNewKeyName('');
      setShowNewForm(false);
    }
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (keyId) =>
      base44.entities.APIKey.update(keyId, { status: 'revoked' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    }
  });

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(`ch_demo_${key.id}`);
    setCopied(key.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleHideKey = (keyId) => {
    setHiddenKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  if (!charity) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">API Keys</h1>
          <Button onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Create API Key
          </Button>
        </div>

        {/* Create New Key Form */}
        {showNewForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Key name (e.g., Production Integration)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => createKeyMutation.mutate()}
                  disabled={!newKeyName || createKeyMutation.isPending}
                >
                  Create
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

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-muted-foreground">No API keys yet</p>
            ) : (
              <div className="space-y-3">
                {apiKeys.map(key => (
                  <div
                    key={key.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{key.name}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {hiddenKeys[key.id]
                            ? '••••••••••••' + key.key_preview
                            : 'ch_demo_' + key.id.slice(0, 8)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHideKey(key.id)}
                        >
                          {hiddenKeys[key.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(key)}
                        >
                          <Copy className="w-4 h-4" />
                          {copied === key.id && <span className="ml-2 text-xs">Copied!</span>}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last used: {key.last_used
                          ? new Date(key.last_used).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                        {key.status}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeKeyMutation.mutate(key.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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