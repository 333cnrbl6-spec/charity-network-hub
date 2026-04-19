import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Download, Zap, Shield, Users, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import ProductBrochurePDF from '@/components/pricing/ProductBrochurePDF';

const PRICING_TIERS = [
  {
    id: 'essential',
    name: 'Essential',
    price: '£299',
    period: '/month',
    description: 'Perfect for small charities',
    users: '5 users',
    features: [
      { name: 'Up to 5 team members', included: true },
      { name: 'Basic incident management', included: true },
      { name: 'Client & volunteer directory', included: true },
      { name: 'Email alerts & notifications', included: true },
      { name: 'Role-based access control', included: true },
      { name: 'Basic audit trails', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced AI risk assessment', included: false },
      { name: 'External agency integrations', included: false },
      { name: 'Custom workflows & automation', included: false },
      { name: 'Analytics dashboard', included: false },
      { name: 'Priority support (24/48hr)', included: false },
      { name: 'DBS verification tools', included: false },
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '£799',
    period: '/month',
    description: 'Most popular for growing charities',
    users: 'Unlimited',
    popular: true,
    features: [
      { name: 'Unlimited team members', included: true },
      { name: 'Advanced incident management', included: true },
      { name: 'Client & volunteer directory', included: true },
      { name: 'AI-powered severity classification', included: true },
      { name: 'Risk assessment & recommendations', included: true },
      { name: 'External agency notifications', included: true },
      { name: 'Comprehensive audit trails', included: true },
      { name: 'Advanced analytics dashboard', included: true },
      { name: 'Phone & email support', included: true },
      { name: 'Custom workflows & automation', included: true },
      { name: 'DBS verification integration', included: true },
      { name: 'Priority support (4-8hr)', included: false },
      { name: 'Dedicated account manager', included: false },
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'quote',
    description: 'For large multi-site organisations',
    users: 'Unlimited',
    features: [
      { name: 'Everything in Professional', included: true },
      { name: 'Multi-location management', included: true },
      { name: 'SSO & advanced security', included: true },
      { name: 'Custom integrations (Police, NHS)', included: true },
      { name: 'White-label options', included: true },
      { name: 'Dedicated account manager', included: true },
      { name: 'Priority support (1hr SLA)', included: true },
      { name: 'Custom reporting & compliance', included: true },
      { name: 'On-premise deployment option', included: true },
      { name: 'Unlimited API access', included: true },
      { name: 'Custom training & onboarding', included: true },
      { name: 'Advanced DBS verification', included: true },
    ]
  }
];

const COMPETITOR_COMPARISON = [
  {
    feature: 'AI Risk Assessment',
    ageukpro: 'Proprietary UK safeguarding-trained model',
    competitor1: 'Generic LLM only',
    competitor2: 'Manual only',
    competitor3: 'Generic LLM only',
  },
  {
    feature: 'Incident Management',
    ageukpro: 'Full statutory compliance',
    competitor1: 'Basic',
    competitor2: 'Complex setup',
    competitor3: 'Limited',
  },
  {
    feature: 'Real-time Alerts',
    ageukpro: 'Multi-channel (email, SMS, push)',
    competitor1: 'Email only',
    competitor2: 'Email only',
    competitor3: 'None',
  },
  {
    feature: 'Audit Trail',
    ageukpro: 'Field-level tracking with IP logging',
    competitor1: 'Basic logging',
    competitor2: 'None',
    competitor3: 'Basic logging',
  },
  {
    feature: 'DBS Verification',
    ageukpro: 'Integrated & automated',
    competitor1: 'Manual process',
    competitor2: 'N/A',
    competitor3: 'Manual process',
  },
  {
    feature: 'External Agency Notifications',
    ageukpro: 'Automated PDF generation',
    competitor1: 'Manual',
    competitor2: 'Manual',
    competitor3: 'N/A',
  },
  {
    feature: 'Analytics & Trends',
    ageukpro: 'Real-time with risk heatmaps',
    competitor1: 'Basic reports',
    competitor2: 'None',
    competitor3: 'Basic reports',
  },
  {
    feature: 'Training Module Integration',
    ageukpro: 'Built-in with expiry alerts',
    competitor1: 'Manual tracking',
    competitor2: 'N/A',
    competitor3: 'Manual tracking',
  },
  {
    feature: 'UK Data Residency',
    ageukpro: '100% UK-based infrastructure',
    competitor1: 'Mixed',
    competitor2: 'Cloud (US)',
    competitor3: 'Mixed',
  },
  {
    feature: 'Setup Cost',
    ageukpro: '£0 - Free onboarding',
    competitor1: '£2,000-5,000',
    competitor2: '£3,000-8,000',
    competitor3: '£1,500-3,000',
  },
];

const STANDOUT_FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Intelligence',
    desc: 'UK-trained safeguarding model automatically classifies risk, identifies patterns, and recommends actions in seconds.'
  },
  {
    icon: Shield,
    title: 'Statutory Compliance Built-In',
    desc: 'Meets Care Act, GDPR, Serious Case Review (SCR) requirements. Audit trails, DBS verification, and referral management all included.'
  },
  {
    icon: Users,
    title: 'Multi-Role Collaboration',
    desc: 'Purpose-built for Safeguarding Leads, managers, frontline staff, and trustees. Each role sees exactly what they need.'
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Analytics',
    desc: 'Spot trends, hotspots, and recurring risks instantly. Heatmaps show which locations and demographics need attention.'
  },
  {
    icon: Clock,
    title: 'Zero Setup Complexity',
    desc: 'Free onboarding. We guide your team through Smart Onboarding. Most orgs live within days, not months.'
  },
  {
    icon: BarChart3,
    title: 'Competitive Pricing',
    desc: 'No hidden setup fees. Professional tier costs less than manual processes & external consultants. ROI in 60 days.'
  }
];

export default function PricingComparison() {
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <>
      <ProductBrochurePDF />
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero */}
        <div className="text-center space-y-3 mb-12">
          <h1 className="text-4xl font-bold">Transparent Pricing for Safeguarding Excellence</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. No bloated features. Just the tools you need to protect vulnerable people and stay compliant.
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_TIERS.map((tier) => (
            <Card 
              key={tier.id}
              className={`relative flex flex-col transition-all ${
                tier.popular 
                  ? 'border-primary shadow-xl scale-105 bg-primary/5' 
                  : 'hover:shadow-lg'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-bold">{tier.price}</div>
                  <div className="text-xs text-muted-foreground">{tier.period}</div>
                  <Badge variant="outline" className="mt-2">{tier.users}</Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                  Get Started
                </Button>

                <div className="space-y-3 pt-4 border-t">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-foreground' : 'text-muted-foreground'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Standout Features */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Why We're Different</h2>
            <p className="text-muted-foreground mt-2">Purpose-built for UK safeguarding, not a generic platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STANDOUT_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Competitor Comparison */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Direct Feature Comparison</h2>
            <p className="text-muted-foreground mt-2">How we stack up against alternatives</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Feature</th>
                  <th className="text-center px-4 py-3 font-semibold text-primary">Age UK Pro</th>
                  <th className="text-center px-4 py-3 font-semibold">Competitor A</th>
                  <th className="text-center px-4 py-3 font-semibold">Competitor B</th>
                  <th className="text-center px-4 py-3 font-semibold">Competitor C</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {COMPETITOR_COMPARISON.map((row, idx) => (
                  <tr key={idx} className="hover:bg-secondary/10">
                    <td className="text-left px-4 py-3 font-medium">{row.feature}</td>
                    <td className="text-center px-4 py-3 text-primary font-semibold">{row.ageukpro}</td>
                    <td className="text-center px-4 py-3 text-muted-foreground">{row.competitor1}</td>
                    <td className="text-center px-4 py-3 text-muted-foreground">{row.competitor2}</td>
                    <td className="text-center px-4 py-3 text-muted-foreground">{row.competitor3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA & Print */}
        <div className="bg-primary/10 rounded-lg p-8 text-center space-y-4 border border-primary/20">
          <h3 className="text-2xl font-bold">Ready to Strengthen Your Safeguarding?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Schedule a demo, download our product guide, or start a free trial. No credit card required.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button size="lg">Schedule Demo</Button>
            <Button size="lg" variant="outline" onClick={handlePrintPDF} className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}