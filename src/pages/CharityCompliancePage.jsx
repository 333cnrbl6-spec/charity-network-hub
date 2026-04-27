import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, XCircle, FileText, Shield, Calendar, Users, PoundSterling, Database, ExternalLink } from 'lucide-react';

const RAG_CONFIG = {
  green: { label: 'Compliant', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, iconColor: 'text-green-600', border: 'border-l-green-500' },
  amber: { label: 'Action Required', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertTriangle, iconColor: 'text-amber-600', border: 'border-l-amber-500' },
  red: { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, iconColor: 'text-red-600', border: 'border-l-red-500' }
};

function ComplianceItem({ title, description, status, detail, link, onMarkDone }) {
  const cfg = RAG_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <div className={`border-l-4 ${cfg.border} bg-white rounded-r-lg border border-l-4 p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.iconColor}`} />
          <div>
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs text-gray-600 mt-0.5">{description}</p>
            {detail && <p className="text-xs text-gray-400 mt-1">{detail}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                <ExternalLink className="w-3 h-3" /> View
              </Button>
            </a>
          )}
          {status !== 'green' && onMarkDone && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onMarkDone}>
              Mark Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CharityCompliancePage() {
  const { data: charities } = useQuery({ queryKey: ['charities'], queryFn: () => base44.entities.Charity.list() });
  const charity = charities?.[0];

  const [overrides, setOverrides] = useState({});

  const getStatus = (key, defaultStatus) => overrides[key] || defaultStatus;
  const markDone = (key) => setOverrides(prev => ({ ...prev, [key]: 'green' }));

  if (!charity) return (
    <div className="p-6 text-center text-gray-500">
      <p>No charity found. Please complete onboarding first.</p>
    </div>
  );

  const currentYear = new Date().getFullYear();
  const foundingYear = charity.created_date ? new Date(charity.created_date).getFullYear() : currentYear;
  const annualReturnDue = `31 January ${currentYear + 1}`;

  // Determine statuses based on charity data
  const hasCharityNumber = !!charity.charity_number;
  const annualReturnStatus = getStatus('annual_return', hasCharityNumber ? 'amber' : 'red');
  const giftAidStatus = getStatus('gift_aid', 'amber');
  const safeguardingStatus = getStatus('safeguarding', charity.subscription_tier === 'enterprise' ? 'green' : 'amber');
  const trusteeStatus = getStatus('trustee', hasCharityNumber ? 'green' : 'amber');
  const gdprStatus = getStatus('gdpr', 'amber');

  const items = [
    {
      key: 'annual_return',
      icon: FileText,
      title: 'Charity Commission Annual Return',
      description: `Annual return filing status for ${charity.name}`,
      status: annualReturnStatus,
      detail: `Due: ${annualReturnDue} | Registered: ${charity.charity_number || 'Not set'}`,
      link: charity.charity_number ? `https://register-of-charities.charitycommission.gov.uk/charity-search/-/charity-details/${charity.charity_number}` : null
    },
    {
      key: 'gift_aid',
      icon: PoundSterling,
      title: 'Gift Aid Claims',
      description: 'HMRC Gift Aid submission — claim 25p for every £1 donated by UK taxpayers',
      status: giftAidStatus,
      detail: 'Claims should be submitted quarterly to HMRC Charities',
      link: 'https://www.gov.uk/claim-gift-aid'
    },
    {
      key: 'safeguarding',
      icon: Shield,
      title: 'Safeguarding Policy Review',
      description: 'Annual review of safeguarding policy and procedures',
      status: safeguardingStatus,
      detail: 'Policy should be reviewed annually and signed off by trustees'
    },
    {
      key: 'trustee',
      icon: Users,
      title: 'Trustee Declaration Dates',
      description: 'Trustees must file declarations of interest annually',
      status: trusteeStatus,
      detail: 'Ensure all trustees have completed their annual declaration'
    },
    {
      key: 'gdpr',
      icon: Database,
      title: 'GDPR Data Audit Status',
      description: 'Annual review of data held, consent records and retention policy',
      status: gdprStatus,
      detail: 'UK GDPR requires charities to maintain a Record of Processing Activities (ROPA)',
      link: 'https://ico.org.uk/for-organisations/charity/'
    },
    {
      key: 'accounts',
      icon: Calendar,
      title: 'Annual Accounts Filing',
      description: 'Accounts must be filed with the Charity Commission within 10 months of financial year end',
      status: getStatus('accounts', 'amber'),
      detail: `Based on registration year ${foundingYear}`,
      link: charity.charity_number ? `https://register-of-charities.charitycommission.gov.uk/` : null
    }
  ];

  const redCount = items.filter(i => getStatus(i.key, i.status) === 'red').length;
  const amberCount = items.filter(i => getStatus(i.key, i.status) === 'amber').length;
  const greenCount = items.filter(i => getStatus(i.key, i.status) === 'green').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-gray-500 mt-1">{charity.name} — Regulatory & governance status</p>
        </div>
        <a href="https://www.charitycommission.gov.uk/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" /> Charity Commission
          </Button>
        </a>
      </div>

      {/* RAG summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-green-700">{greenCount}</p>
            <p className="text-sm text-green-600 font-medium mt-1">Compliant</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-amber-700">{amberCount}</p>
            <p className="text-sm text-amber-600 font-medium mt-1">Action Required</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-red-700">{redCount}</p>
            <p className="text-sm text-red-600 font-medium mt-1">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Compliance Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <ComplianceItem
              key={item.key}
              title={item.title}
              description={item.description}
              status={getStatus(item.key, item.status)}
              detail={item.detail}
              link={item.link}
              onMarkDone={() => markDone(item.key)}
            />
          ))}
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Disclaimer:</strong> This compliance dashboard is for guidance only. Always consult a professional adviser or the Charity Commission for definitive compliance requirements.
      </div>
    </div>
  );
}