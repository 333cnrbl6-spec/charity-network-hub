import React from 'react';
import { Check } from 'lucide-react';

export default function ProductBrochurePDF() {
  return (
    <div className="hidden print:block w-full bg-white p-12 text-black">
      {/* Page 1 */}
      <div className="page-break h-screen flex flex-col justify-between">
        {/* Header */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-primary">Age UK Pro</h1>
            <p className="text-2xl text-gray-600">Safeguarding Management Platform</p>
          </div>

          <div className="bg-gray-100 p-8 rounded-lg space-y-3 max-w-xl">
            <h2 className="text-xl font-bold">Why Age UK Pro?</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>UK-trained AI for safeguarding risk assessment</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Statutory compliance built-in (Care Act, GDPR, SCR)</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Zero setup fees. Free onboarding.</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Real-time analytics and incident tracking</span>
              </li>
              <li className="flex gap-2">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Trusted by 150+ Age UK branches</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-gray-500 text-sm">
          <p>Age UK Pro | Safeguarding Intelligence for UK Charities</p>
          <p>www.ageukpro.org.uk | hello@ageukpro.org.uk</p>
        </div>
      </div>

      {/* Page 2 */}
      <div className="page-break mt-12 space-y-8">
        <h2 className="text-3xl font-bold border-b-4 border-primary pb-3">Pricing & Tiers</h2>

        {/* Tiers */}
        <div className="grid grid-cols-3 gap-6">
          {/* Essential */}
          <div className="border border-gray-300 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold">Essential</h3>
              <p className="text-sm text-gray-600">Small charities (up to 5 users)</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">£299</p>
              <p className="text-xs text-gray-600">/month</p>
            </div>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2"><span className="text-green-600">✓</span> Basic incident management</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Client directory</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Email alerts</li>
              <li className="flex gap-2"><span className="text-gray-400">✗</span> AI risk assessment</li>
              <li className="flex gap-2"><span className="text-gray-400">✗</span> Analytics dashboard</li>
            </ul>
          </div>

          {/* Professional */}
          <div className="border-2 border-primary rounded-lg p-6 space-y-4 bg-primary/5 relative">
            <div className="absolute -top-3 left-4 bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">
              MOST POPULAR
            </div>
            <div>
              <h3 className="text-xl font-bold">Professional</h3>
              <p className="text-sm text-gray-600">Growing charities (unlimited users)</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">£799</p>
              <p className="text-xs text-gray-600">/month</p>
            </div>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2"><span className="text-green-600">✓</span> Advanced incident mgmt</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> AI risk assessment</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Analytics dashboard</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> External notifications</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> DBS verification</li>
            </ul>
          </div>

          {/* Enterprise */}
          <div className="border border-gray-300 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold">Enterprise</h3>
              <p className="text-sm text-gray-600">Multi-site organisations</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">Custom</p>
              <p className="text-xs text-gray-600">Contact sales</p>
            </div>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2"><span className="text-green-600">✓</span> Everything in Pro</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Multi-location mgmt</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> SSO & advanced security</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Custom integrations</li>
              <li className="flex gap-2"><span className="text-green-600">✓</span> Dedicated support</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-gray-600 italic">All tiers include free onboarding, comprehensive audit trails, and role-based access control.</p>
      </div>

      {/* Page 3 */}
      <div className="page-break mt-12 space-y-8">
        <h2 className="text-3xl font-bold border-b-4 border-primary pb-3">Key Features</h2>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Safeguarding Intelligence</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>AI-powered incident risk classification (critical, high, medium, low)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Automatic statutory referral recommendations</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Real-time risk hotspot analysis by location</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Pattern detection for recurring risks</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Operational Excellence</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Integrated DBS verification & tracking</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Automated training expiry alerts</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>External agency notification generation</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Multi-role collaboration tools</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Compliance & Security</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Field-level audit trails with IP logging</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>AES-256 encryption (data in transit & at rest)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>GDPR & Data Protection Act 2018 compliant</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>UK data residency (no US cloud)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Analytics & Insights</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Real-time safeguarding dashboards</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Incident trend analysis & forecasting</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Risk severity distribution reports</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>PDF export for management & trustees</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Page 4 - Competitive Positioning */}
      <div className="page-break mt-12 space-y-6">
        <h2 className="text-3xl font-bold border-b-4 border-primary pb-3">Why Age UK Pro Leads the Market</h2>

        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-3">🧠 AI Built for UK Safeguarding</h3>
            <p className="text-sm">Unlike generic LLM competitors, our AI is trained on UK Care Act, GDPR, and Serious Case Review requirements. It understands the legal and operational context of UK charities.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-3">⚖️ Statutory Compliance, Not Bolted-On</h3>
            <p className="text-sm">Competitors offer basic reporting. We build compliance into every feature: field-level audit trails, DBS integration, referral management, and retention schedules.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-3">🚀 Fast Implementation, Real Results</h3>
            <p className="text-sm">Smart Onboarding gets you live in days, not months. Zero setup fees. Most organisations see ROI in 60 days (vs 6-12 months with competitors).</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-3">🇬🇧 UK-First Data Residency</h3>
            <p className="text-sm">All data stays in the UK. No US cloud. No GDPR grey areas. Perfect for charities managing vulnerable adult information.</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-3">💰 Better Value Than Manual Processes</h3>
            <p className="text-sm">Professional tier (£799/mo) costs less than hiring a part-time safeguarding coordinator, and delivers exponentially better risk management.</p>
          </div>
        </div>
      </div>

      {/* Back Cover */}
      <div className="page-break mt-12 h-screen flex flex-col justify-between items-center text-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-primary">Ready?</h1>
          <p className="text-lg text-gray-600 max-w-md">
            Join 150+ Age UK branches protecting vulnerable people with confidence.
          </p>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-sm"><strong>Schedule a demo:</strong> hello@ageukpro.org.uk</p>
          <p className="text-sm"><strong>Website:</strong> www.ageukpro.org.uk</p>
          <p className="text-sm"><strong>Phone:</strong> 020 XXXX XXXX</p>
        </div>

        <div className="text-gray-400 text-xs">
          <p>Age UK Pro | Safeguarding Management Platform</p>
          <p>© 2026. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}