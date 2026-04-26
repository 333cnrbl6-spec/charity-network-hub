import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SubscriptionPaywall from '@/components/charity/SubscriptionPaywall';

export default function Pricing() {
  const { data: charities } = useQuery({
    queryKey: ['charities'],
    queryFn: () => base44.entities.Charity.list()
  });

  const charity = charities?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <SubscriptionPaywall currentTier={charity?.subscription_tier || 'starter'} />
      </div>
    </div>
  );
}