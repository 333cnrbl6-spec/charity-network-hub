import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const [billing, setBilling] = useState('monthly');

  const plans = [
    {
      name: 'Starter',
      monthlyPrice: 99,
      yearlyPrice: 990,
      description: 'Perfect for small branches',
      users: 3,
      features: [
        { name: 'Volunteer registration & profiles', included: true },
        { name: 'DBS expiry monitoring', included: true },
        { name: 'Basic impact dashboard', included: true },
        { name: 'Email support', included: true },
        { name: 'Smart job matching', included: false },
        { name: 'Advanced safeguarding', included: false },
        { name: 'AI grant writing', included: false },
        { name: 'Multi-region network', included: false }
      ]
    },
    {
      name: 'Professional',
      monthlyPrice: 299,
      yearlyPrice: 2990,
      description: 'For growing charities',
      users: 10,
      popular: true,
      features: [
        { name: 'Everything in Starter', included: true },
        { name: 'Smart volunteer-to-job matching AI', included: true },
        { name: 'Advanced safeguarding incidents & alerts', included: true },
        { name: 'Automated 48-hour follow-up reminders', included: true },
        { name: 'AI grant writing & report generation', included: true },
        { name: 'Priority support', included: true },
        { name: 'Public impact dashboard & PDF exports', included: true },
        { name: 'Custom integrations', included: false }
      ]
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      yearlyPrice: null,
      description: 'For large networks',
      users: 'Unlimited',
      features: [
        { name: 'Everything in Professional', included: true },
        { name: 'Multi-region network sync & coordination', included: true },
        { name: 'White-label & custom branding', included: true },
        { name: 'Custom OAuth integrations', included: true },
        { name: 'Dedicated account manager', included: true },
        { name: '99.9% SLA guarantee', included: true },
        { name: 'Advanced API & webhooks', included: true },
        { name: 'Custom training & onboarding', included: true }
      ]
    }
  ];

  const faqs = [
    {
      q: 'Can I cancel anytime?',
      a: 'Yes, monthly plans cancel anytime. Annual plans get prorated refunds.'
    },
    {
      q: 'Do you offer discounts for nonprofits?',
      a: '10% discount for registered charities. Contact sales for details.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'Credit cards, bank transfers, and invoicing for Enterprise customers.'
    },
    {
      q: 'Is there a setup fee?',
      a: 'No setup fees. Free onboarding included for all plans.'
    },
    {
      q: 'Can I add more users mid-plan?',
      a: 'Yes, add/remove users anytime. Prorated monthly.'
    },
    {
      q: 'What about data security?',
      a: 'SOC 2 certified, GDPR compliant, encrypted data at rest & in transit.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground mb-8">Choose the plan that fits your charity's needs.</p>
        
        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-lg transition ${billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-4 py-2 rounded-lg transition ${billing === 'yearly' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          >
            Annual <span className="text-xs ml-1 bg-green-100 text-green-800 px-2 py-1 rounded">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan, i) => (
          <Card key={i} className={plan.popular ? 'ring-2 ring-primary shadow-lg' : ''}>
            <CardHeader>
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit">
                  Most Popular
                </div>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                {plan.monthlyPrice ? (
                  <>
                    <div className="text-4xl font-bold">
                      £{billing === 'monthly' ? plan.monthlyPrice : Math.floor(plan.yearlyPrice / 12)}
                    </div>
                    <p className="text-sm text-muted-foreground">/month {billing === 'yearly' && 'billed annually'}</p>
                  </>
                ) : (
                  <div className="text-2xl font-bold">Custom Pricing</div>
                )}
              </div>

              <div className="text-sm">
                <p className="font-semibold">Up to {plan.users} users</p>
              </div>

              <Link to="/charity-onboarding" className="w-full">
                <Button className="w-full">{plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}</Button>
              </Link>

              <ul className="space-y-3">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={f.included ? '' : 'text-muted-foreground'}>{f.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-6 mb-20">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary text-primary-foreground py-12 mb-0">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="mb-6 opacity-90">Start your 30-day free trial today. No credit card required.</p>
          <Link to="/charity-onboarding">
            <Button size="lg" variant="secondary">Start Free Trial</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}