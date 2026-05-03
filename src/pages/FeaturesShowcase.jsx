import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart3, FileText, Lock, Zap, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeaturesShowcase() {
  const features = [
    {
      icon: Users,
      title: 'Volunteer Management & Registration',
      description: 'Public volunteer signup with skills, availability, and DBS document uploads. Approval workflows with automated lead notifications.',
      highlights: ['Public signup portal', 'Skills database', 'DBS tracking', 'Approval dashboard']
    },
    {
      icon: BarChart3,
      title: 'Real-Time Impact Analytics',
      description: 'Live dashboards tracking volunteer hours, beneficiaries supported, grant funding, and community outcomes. Public shareable impact reports.',
      highlights: ['Live metrics', 'Public impact dashboard', 'PDF exports', 'Donor insights']
    },
    {
      icon: FileText,
      title: 'AI Grant & Report Writing',
      description: 'Auto-generate grant applications, impact reports, and thank-you letters in minutes. Templates powered by LLM.',
      highlights: ['Grant writing AI', 'Impact reports', 'Letter generation', 'One-click PDF']
    },
    {
      icon: Lock,
      title: 'Advanced Safeguarding Suite',
      description: 'Complete incident tracking, DBS expiry monitoring, automated 48-hour follow-up reminders, and audit trails.',
      highlights: ['Incident dashboard', 'DBS automation', '48-hr reminders', 'Audit logs']
    },
    {
      icon: Zap,
      title: 'Smart Volunteer Matching',
      description: 'AI engine automatically matches volunteers to jobs based on skills, location, and availability. Scoring algorithm with top 5 recommendations.',
      highlights: ['AI matching', 'Skills-based', 'Location aware', 'Availability scoring']
    },
    {
      icon: Globe,
      title: 'Multi-Branch Network Sync',
      description: 'Manage unlimited branches, sync data across regions, coordinate resources, and get network-wide intelligence.',
      highlights: ['Regional hubs', 'Real-time sync', 'Network reports', 'Coordinator portal']
    }
  ];

  const benefits = [
    { stat: '60%', label: 'Admin time saved' },
    { stat: '10x', label: 'Faster reporting' },
    { stat: '99.9%', label: 'Uptime SLA' },
    { stat: '24hr', label: 'Support response' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold mb-6">Powerful Features Built for Charities</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">Everything you need to manage volunteers, track impact, and ensure compliance in one unified platform.</p>
      </section>

      {/* Benefits Stats */}
      <section className="max-w-6xl mx-auto px-6 mb-20 grid grid-cols-2 md:grid-cols-4 gap-6">
        {benefits.map((b, i) => (
          <Card key={i} className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary mb-2">{b.stat}</div>
              <p className="text-muted-foreground">{b.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 mb-20">
        {features.map((f, i) => (
          <Card key={i} className="hover:shadow-lg transition">
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <f.icon className="w-8 h-8 text-primary" />
                <CardTitle>{f.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{f.description}</p>
              <ul className="grid grid-cols-2 gap-2">
                {f.highlights.map((h, j) => (
                  <li key={j} className="text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    {h}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Feature Comparison */}
      <section className="bg-card/50 py-20 mb-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center">CharityHub vs Traditional Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-destructive">❌ Spreadsheets & Email</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Scattered data across multiple files</li>
                <li>Version control chaos</li>
                <li>No real-time visibility</li>
                <li>Manual report generation</li>
                <li>Compliance risks</li>
                <li>Limited analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-green-600">✓ CharityHub</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Centralized volunteer & client database</li>
                <li>Public volunteer registration portal</li>
                <li>AI-powered job matching (skills + location)</li>
                <li>Automated DBS & training monitoring</li>
                <li>Safeguarding incident tracking & alerts</li>
                <li>Real-time impact metrics & public dashboards</li>
                <li>AI grant writing & report generation</li>
                <li>48-hour follow-up automation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="max-w-6xl mx-auto px-6 mb-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Security & Compliance</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold mb-2">SOC 2 Certified</div>
              <p className="text-sm text-muted-foreground">Independent security audit & compliance verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold mb-2">GDPR Compliant</div>
              <p className="text-sm text-muted-foreground">Full data protection & privacy regulations met</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold mb-2">DBS Integration</div>
              <p className="text-sm text-muted-foreground">Built-in safeguarding & verification tools</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
          <p className="mb-8 opacity-90">Start your free 30-day trial and experience the difference CharityHub can make.</p>
          <div className="flex justify-center gap-4">
            <Link to="/charity-onboarding">
              <Button size="lg" variant="secondary" className="gap-2">Get Started Free <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/20">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}