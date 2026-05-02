import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Heart, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Header */}
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">CharityHub</div>
          <div className="flex gap-4">
            <Link to="/help">
              <Button variant="ghost">Help</Button>
            </Link>
            <Link to="/terms">
              <Button variant="ghost">Terms</Button>
            </Link>
            <Link to="/charity-setup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Charity Management Made Simple</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Manage donors, grants, compliance, and impact. All in one intuitive platform built for non-profits.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/charity-setup">
            <Button size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">View Demo</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Heart,
              title: 'Donor Management',
              description: 'Track donations, segment donors, send thank you letters automatically'
            },
            {
              icon: Zap,
              title: 'Grant Tracking',
              description: 'Never miss a deadline. AI-powered grant applications with impact tracking'
            },
            {
              icon: Shield,
              title: 'Compliance Ready',
              description: 'Built-in compliance checklists, audit logs, and data protection'
            }
          ].map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="w-8 h-8 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Starter',
              price: '£49',
              description: 'For small charities',
              features: ['Up to 500 donors', 'Basic reports', 'Email support']
            },
            {
              name: 'Professional',
              price: '£149',
              description: 'For growing charities',
              features: ['Unlimited donors', 'Advanced analytics', 'API access', 'Priority support'],
              highlighted: true
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              description: 'Custom solutions',
              features: ['Custom integration', 'Dedicated support', 'White-label option']
            }
          ].map((plan) => (
            <Card key={plan.name} className={plan.highlighted ? 'border-primary border-2' : ''}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="text-3xl font-bold mt-4">{plan.price}<span className="text-lg text-muted-foreground">/mo</span></p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/charity-setup" className="w-full">
                  <Button variant={plan.highlighted ? 'default' : 'outline'} className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Join 100+ charities using CharityHub</h2>
          <p className="mb-8 text-lg opacity-90">Start your free trial. No credit card required.</p>
          <Link to="/charity-setup">
            <Button size="lg" variant="secondary">Get Started Now</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 CharityHub. Empowering non-profits worldwide.</p>
        </div>
      </footer>
    </div>
  );
}