import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Sparkles, Calendar, DollarSign } from 'lucide-react';
import ProcessingFeedback from '@/components/ui/ProcessingFeedback';
import AIWritingAssistant from '@/components/charity/AIWritingAssistant';

export default function Grants() {
  const [charityId, setCharityId] = useState(null);
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [showNewGrant, setShowNewGrant] = useState(false);
  const [newGrant, setNewGrant] = useState({});

  const queryClient = useQueryClient();

  const { data: charities } = useQuery({
    queryKey: ['charities'],
    queryFn: () => base44.entities.Charity.list()
  });

  const { data: grants, isLoading } = useQuery({
    queryKey: ['grants', charityId],
    queryFn: () => charityId ? base44.entities.Grant.filter({ charity_id: charityId }) : [],
    enabled: !!charityId
  });

  const createGrantMutation = useMutation({
    mutationFn: (data) => base44.entities.Grant.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grants'] });
      setShowNewGrant(false);
      setNewGrant({});
    }
  });

  const charity = charities?.[0];
  const currentCharityId = charityId || charity?.id;

  const handleCreateGrant = () => {
    createGrantMutation.mutate({
      ...newGrant,
      charity_id: currentCharityId
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <ProcessingFeedback
          label="Loading grants…"
          detail="Fetching grant applications from your database."
          tips={[
            'Grant data is cached for fast loading on future visits.',
            'Use the search feature to quickly find grants by name or funder.',
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Grant Applications</h1>
        <Button onClick={() => setShowNewGrant(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> New Grant
        </Button>
      </div>

      {showNewGrant && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Create New Grant Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Grant name"
              value={newGrant.grant_name || ''}
              onChange={(e) => setNewGrant({...newGrant, grant_name: e.target.value})}
            />
            <Input
              placeholder="Funder name"
              value={newGrant.funder_name || ''}
              onChange={(e) => setNewGrant({...newGrant, funder_name: e.target.value})}
            />
            <Input
              placeholder="Amount (£)"
              type="number"
              value={newGrant.amount || ''}
              onChange={(e) => setNewGrant({...newGrant, amount: parseFloat(e.target.value)})}
            />
            <Input
              placeholder="Deadline"
              type="date"
              value={newGrant.deadline || ''}
              onChange={(e) => setNewGrant({...newGrant, deadline: e.target.value})}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateGrant} disabled={createGrantMutation.isPending} className="flex-1">
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowNewGrant(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-2">
            {grants?.map(grant => (
              <Card
                key={grant.id}
                className={`cursor-pointer hover:border-blue-400 ${selectedGrant?.id === grant.id ? 'border-blue-500' : ''}`}
                onClick={() => setSelectedGrant(grant)}
              >
                <CardContent className="py-3">
                  <h3 className="font-semibold text-sm">{grant.grant_name}</h3>
                  <p className="text-xs text-gray-600">{grant.funder_name}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-700">
                    <DollarSign className="w-3 h-3" />
                    £{grant.amount.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedGrant ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedGrant.grant_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Funder</p>
                    <p className="font-semibold">{selectedGrant.funder_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-semibold">£{selectedGrant.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedGrant.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <AIWritingAssistant mode="grant" data={selectedGrant} charity={charity} subscriptionTier={charity?.subscription_tier || 'starter'} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              Select a grant to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}