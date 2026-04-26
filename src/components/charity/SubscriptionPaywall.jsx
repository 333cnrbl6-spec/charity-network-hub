import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';

const PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    period: '/month',
    features: [
      '1 campaign',
      '50 donor profiles',
      'Basic reporting',
      'Email support'
    ],
    disabled_features: ['AI grant assistant', 'PDF reports', 'Team seats (5+)', 'Priority support']
  },
  professional: {
    name: 'Professional',
    price: 79,
    period: '/month',
    features: [
      'Unlimited campaigns',
      'Unlimited donors',
      '✨ AI grant assistant',
      '📄 PDF reports',
      'Up to 5 team seats',
      'Priority support'
    ],
    disabled_features: ['Advanced analytics']
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    period: '/month',
    features: [
      'Everything in Professional',
      '∞ Unlimited team seats',
      '📊 Advanced analytics',
      '🔐 SSO & compliance',
      '24/7 dedicated support',
      'Custom integrations'
    ],
    disabled_features: []
  }
};

export default function SubscriptionPaywall({ currentTier = 'starter', onUpgrade }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan) => {
    setLoading(true);
    try {
      // In a real app, redirect to Stripe
      window.location.href = `/stripe/checkout?plan=${plan}`;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
        <p className="text-gray-600">Choose the plan that fits your charity's needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(PLANS).map(([key, plan]) => {
          const isCurrent = currentTier === key;
          return (
            <Card key={key} className={`flex flex-col ${isCurrent ? 'border-blue-500 border-2' : ''} ${key === 'professional' ? 'ring-2 ring-blue-500 relative' : ''}`}>
              {key === 'professional' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Popular</div>}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">£{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.disabled_features.length > 0 && (
                    <>
                      <div className="border-t pt-3">
                        <p className="text-xs text-gray-500 font-semibold mb-2">Upgrade to unlock</p>
                        {plan.disabled_features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-2 opacity-50">
                            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => handleUpgrade(key)}
                  disabled={isCurrent || loading}
                  className={`w-full ${isCurrent ? 'bg-gray-200 text-gray-800' : key === 'professional' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={isCurrent ? 'outline' : 'default'}
                >
                  {isCurrent ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Free trial:</strong> All plans include 14 days free access. No credit card required.
        </p>
      </div>
    </div>
  );
}