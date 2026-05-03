import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Heart, Zap, Shield, Users, FileText, TrendingUp, Lock, Lightbulb, BarChart3, Mail, Briefcase, Target, Smile, AlertCircle, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function PublicLandingPage() {
  const navigate = useNavigate();
  const [demoPath, setDemoPath] = useState(null);

  const startDemoPath = (path) => {
    setDemoPath(path);
    // Store demo mode in sessionStorage so pages know to show demo data
    sessionStorage.setItem('demoMode', 'true');
    sessionStorage.setItem('demoPath', path);
    navigate(`/${path}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary/5 to-secondary/5">
      {/* Header */}
      <nav className="border-b bg-white/5 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CharityHub</div>
          <div className="flex gap-4">
            <Link to="/help">
              <Button variant="ghost">Help</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link to="/charity-setup">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="space-y-6 mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-200 via-primary to-secondary bg-clip-text text-transparent">
            Empower Your Charity With Purpose-Built Tools
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Manage volunteers, track impact, automate compliance, and grow donor relationships. Everything a modern charity needs—in one beautiful platform.
          </p>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/charity-setup">
            <Button size="lg" className="gap-2 px-8">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => startDemoPath('dashboard')}
            className="gap-2 px-8"
          >
            <Play className="w-4 h-4" /> Interactive Demo
          </Button>
        </div>
      </section>

      {/* Core Features - Interactive Demo */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Comprehensive Charity Management</h2>
        <p className="text-center text-slate-300 mb-16 text-lg">Everything you need to run your charity effectively. Click any feature to explore a live demo.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: 'Volunteer Management',
              description: 'Schedule volunteers, track hours, manage availability, and recognize contributions',
              demo: 'volunteers',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              icon: Heart,
              title: 'Donor & Supporter Hub',
              description: 'Manage relationships, track giving patterns, automate thank you letters',
              demo: 'donors',
              color: 'from-red-500 to-pink-500'
            },
            {
              icon: Target,
              title: 'Client Management',
              description: 'Track client needs, outcomes, and impact metrics in one place',
              demo: 'clients',
              color: 'from-purple-500 to-pink-500'
            },
            {
              icon: Briefcase,
              title: 'Grant Management',
              description: 'AI-powered grant writing, deadline tracking, and funding pipeline',
              demo: 'grants',
              color: 'from-green-500 to-emerald-500'
            },
            {
              icon: TrendingUp,
              title: 'Impact Analytics',
              description: 'Visualize your impact, track KPIs, generate compelling reports',
              demo: 'impact',
              color: 'from-orange-500 to-red-500'
            },
            {
              icon: Shield,
              title: 'Compliance & Safety',
              description: 'DBS tracking, safeguarding incidents, audit logs, and compliance checklists',
              demo: 'safeguarding',
              color: 'from-amber-500 to-orange-500'
            },
            {
              icon: Mail,
              title: 'Communications',
              description: 'Email campaigns, automated workflows, bulk messaging to segments',
              demo: 'communications',
              color: 'from-indigo-500 to-blue-500'
            },
            {
              icon: BarChart3,
              title: 'Reporting Center',
              description: 'Custom reports, stakeholder dashboards, scheduled exports',
              demo: 'reporting',
              color: 'from-cyan-500 to-blue-500'
            },
            {
              icon: Lightbulb,
              title: 'AI Assistant',
              description: 'Generate thank you letters, grant applications, and strategic insights',
              demo: 'ai',
              color: 'from-yellow-500 to-orange-500'
            }
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title}
                className="group cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all bg-slate-900/50 border-slate-700 hover:bg-slate-800"
                onClick={() => startDemoPath(feature.demo)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-2.5 mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Try Demo <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-primary/20 to-secondary/20 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: '500+', label: 'Active Charities' },
              { number: '50K+', label: 'Volunteers Managed' },
              { number: '£10M+', label: 'Grants Processed' },
              { number: '99.9%', label: 'Uptime' }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">{stat.number}</p>
                <p className="text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Transparent, Flexible Pricing</h2>
        <p className="text-center text-slate-300 mb-12 text-lg">Choose the plan that fits your charity. All plans include a 30-day free trial—no credit card required.</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'Starter',
              price: '£49',
              period: '/month',
              description: 'Perfect for small teams',
              features: [
                'Up to 1 charity',
                'Up to 5 team members',
                'Volunteer management',
                'Basic reporting',
                'Email support',
                'Community access'
              ],
              cta: 'Start Trial'
            },
            {
              name: 'Professional',
              price: '£149',
              period: '/month',
              description: 'For growing charities',
              features: [
                'Up to 5 charities',
                'Unlimited team members',
                'All Starter features',
                'Advanced analytics',
                'AI grant writing',
                'Compliance hub',
                'Priority email & chat support',
                'Custom reports'
              ],
              highlighted: true,
              cta: 'Start Trial'
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: 'pricing',
              description: 'For complex needs',
              features: [
                'Unlimited everything',
                'White-label option',
                'API access',
                'Custom integrations',
                'Dedicated account manager',
                'Advanced security',
                'SLA guarantee',
                'Training & onboarding'
              ],
              cta: 'Contact Sales'
            }
          ].map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative transition-all ${
                plan.highlighted 
                  ? 'border-2 border-primary shadow-2xl scale-105 bg-gradient-to-br from-slate-800 to-slate-900' 
                  : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-6">
                  <p className="text-4xl font-bold">{plan.price}</p>
                  <p className="text-sm text-slate-400">{plan.period}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/charity-setup" className="w-full">
                  <Button 
                    variant={plan.highlighted ? 'default' : 'outline'} 
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose CharityHub */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Why Charities Trust CharityHub</h2>
        <div className="grid md:grid-cols-2 gap-12">
          {[
            {
              icon: Lock,
              title: 'Enterprise-Grade Security',
              description: 'SOC 2 Type II certified, GDPR compliant, end-to-end encryption. Your data is protected with bank-level security.'
            },
            {
              icon: Smile,
              title: 'Built by Charity Experts',
              description: 'Created with input from 100+ charities. We understand your unique challenges and workflows.'
            },
            {
              icon: TrendingUp,
              title: 'Proven Impact',
              description: '500+ charities increased volunteer retention by 35% and grant success rate by 2x on average.'
            },
            {
              icon: AlertCircle,
              title: 'Always-On Support',
              description: 'Dedicated support team, comprehensive knowledge base, video tutorials, and community forum.'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex gap-4">
                <Icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-300">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-24 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-5xl font-bold">Ready to Transform Your Charity?</h2>
          <p className="text-xl opacity-90">Join 500+ charities already using CharityHub to increase impact, save time, and grow sustainably.</p>
          <div className="flex gap-4 justify-center pt-4">
            <Link to="/charity-setup">
              <Button size="lg" variant="secondary" className="gap-2 px-8">
                Start Free Trial (30 Days) <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => startDemoPath('dashboard')}
              className="gap-2 px-8 bg-white/10 hover:bg-white/20 border-white/30"
            >
              <Play className="w-4 h-4" /> See Interactive Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold text-lg mb-4">CharityHub</p>
              <p className="text-slate-400 text-sm">Empowering charities with modern technology.</p>
            </div>
            <div>
              <p className="font-semibold mb-4">Product</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/features" className="hover:text-primary">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link to="/help" className="hover:text-primary">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Company</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Legal</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/terms" className="hover:text-primary">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-primary">Privacy</Link></li>
                <li><Link to="/status" className="hover:text-primary">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2026 CharityHub. All rights reserved. Built for charities, by charity advocates.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}