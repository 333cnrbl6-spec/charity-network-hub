import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Users, TrendingUp, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MarketingLanding() {
  const features = [
    { icon: Users, title: 'Volunteer Management', desc: 'Track, schedule & engage volunteers effortlessly' },
    { icon: TrendingUp, title: 'Impact Analytics', desc: 'Real-time dashboards showing community outcomes' },
    { icon: Shield, title: 'Enterprise Security', desc: 'GDPR, safeguarding, compliance built-in' },
    { icon: Zap, title: 'AI-Powered Reports', desc: 'Auto-generate grant applications and insights' }
  ];

  const testimonials = [
    {
      quote: 'CharityHub transformed how we manage 200+ volunteers across 5 branches.',
      author: 'Sarah Mitchell',
      role: 'CEO, Age UK Bury'
    },
    {
      quote: 'Cut admin time by 60%. Our team now focuses on impact, not paperwork.',
      author: 'James Wilson',
      role: 'Operations Manager, Manchester Hub'
    },
    {
      quote: 'The safeguarding tools gave us confidence we\'re compliant and protected.',
      author: 'Emma Thompson',
      role: 'Governance Lead, Bristol Branch'
    }
  ];

  const pricing = [
    { tier: 'Starter', price: '£99', users: 3, features: ['Basic volunteer tracking', 'Monthly reports', 'Email support'] },
    { tier: 'Professional', price: '£299', users: 10, features: ['Everything in Starter', 'AI grant writing', 'Advanced analytics', 'Priority support'] },
    { tier: 'Enterprise', price: 'Custom', users: 'Unlimited', features: ['White-label solution', 'Custom integrations', 'Dedicated manager', 'SLA guarantee'] }
  ];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">Volunteer & Charity Management Reimagined</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Enterprise-grade platform for Age UK and charities. Manage volunteers, track impact, ensure compliance—all in one place.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/charity-onboarding">
              <Button size="lg" className="gap-2">Start Free Trial <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">View Pricing</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-6">No credit card required. 30-day free trial.</p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">Trusted by Leading Charities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 bg-background rounded-xl border">
                <f.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">What Charities Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 bg-card border rounded-xl">
                <p className="mb-4 italic">"{t.quote}"</p>
                <p className="font-semibold">{t.author}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-card/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p, i) => (
              <div key={i} className={`p-8 border rounded-xl ${i === 1 ? 'ring-2 ring-primary bg-background' : 'bg-card'}`}>
                <h3 className="text-2xl font-bold mb-2">{p.tier}</h3>
                <p className="text-3xl font-bold mb-1">{p.price}<span className="text-sm text-muted-foreground">/month</span></p>
                <p className="text-sm text-muted-foreground mb-6">Up to {p.users} users</p>
                <ul className="space-y-3 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/charity-onboarding">
                  <Button className="w-full">{i === 2 ? 'Contact Sales' : 'Get Started'}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Charity?</h2>
          <p className="text-lg mb-8 opacity-90">Join 50+ branches managing 10,000+ volunteers with CharityHub.</p>
          <Link to="/charity-onboarding">
            <Button size="lg" variant="secondary">Start Your Free Trial</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4">CharityHub</h4>
            <p className="text-sm text-muted-foreground">Enterprise volunteer management for charities.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
              <li><Link to="/help" className="hover:text-foreground">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-foreground">Terms</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
              <li><Link to="/status" className="hover:text-foreground">Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-muted-foreground">support@charityhub.org</p>
          </div>
        </div>
      </footer>
    </div>
  );
}