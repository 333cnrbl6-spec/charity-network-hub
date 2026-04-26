import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import ImpactAnalyticsDashboard from '@/components/charity/ImpactAnalyticsDashboard';
import AlertsDashboard from '@/components/charity/AlertsDashboard';
import SubscriptionPaywall from '@/components/charity/SubscriptionPaywall';

export default function CharityDashboard() {
  const [charityId, setCharityId] = useState(null);

  const { data: charities, isLoading: charLoading } = useQuery({
    queryKey: ['charities'],
    queryFn: () => base44.entities.Charity.list()
  });

  const { data: donations } = useQuery({
    queryKey: ['donations', charityId],
    queryFn: () => charityId ? base44.entities.Donation.filter({ charity_id: charityId }) : [],
    enabled: !!charityId
  });

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns', charityId],
    queryFn: () => charityId ? base44.entities.Campaign.filter({ charity_id: charityId }) : [],
    enabled: !!charityId
  });

  const { data: volunteers } = useQuery({
    queryKey: ['volunteers', charityId],
    queryFn: () => charityId ? base44.entities.Volunteer.filter({ charity_id: charityId }) : [],
    enabled: !!charityId
  });

  const { data: grants } = useQuery({
    queryKey: ['grants', charityId],
    queryFn: () => charityId ? base44.entities.Grant.filter({ charity_id: charityId }) : [],
    enabled: !!charityId
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts', charityId],
    queryFn: () => charityId ? base44.entities.Alert.filter({ charity_id: charityId }) : [],
    enabled: !!charityId
  });

  const charity = charities?.[0];
  const currentCharityId = charityId || charity?.id;

  if (charLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!charity) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Welcome to CharityHub</h1>
          <p className="text-gray-600 mb-6">Set up your first charity to get started</p>
          <Button onClick={() => window.location.href = '/onboarding'} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Create Charity
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{charity.name}</h1>
          <p className="text-gray-600">{charity.cause_area}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Subscription Tier</p>
          <p className="text-lg font-semibold capitalize">{charity.subscription_tier}</p>
        </div>
      </div>

      <AlertsDashboard alerts={alerts || []} donors={donations || []} grants={grants || []} volunteers={volunteers || []} charityData={charity} />

      <ImpactAnalyticsDashboard charityData={charity} donations={donations || []} campaigns={campaigns || []} volunteers={volunteers || []} grants={grants || []} />

      {charity.subscription_tier === 'starter' && (
        <div className="mt-8">
          <SubscriptionPaywall currentTier={charity.subscription_tier} />
        </div>
      )}
    </div>
  );
}