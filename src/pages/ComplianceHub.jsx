import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Shield, Banknote, Users, Building, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UniversalFileUpload from '@/components/compliance/UniversalFileUpload';
import ComplianceChecklist from '@/components/compliance/ComplianceChecklist';
import GiftAidEligibilityChecker from '@/components/compliance/GiftAidEligibilityChecker';
import CharityCommissionCompliance from '@/components/compliance/CharityCommissionCompliance';
import HMRCGiftAidCompliance from '@/components/compliance/HMRCGiftAidCompliance';
import SafeguardingDBSCompliance from '@/components/compliance/SafeguardingDBSCompliance';

export default function ComplianceHub() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <Shield className="w-10 h-10 text-primary" />
          Compliance Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          UK charity compliance management — Charity Commission, HMRC, GDPR, Safeguarding, Fundraising Regulator
        </p>
      </div>

      {/* Compliance Standards Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Board-Mandated Compliance Standards
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>AI Model:</strong> claude_opus_4_6 for complex compliance audits, claude_sonnet_4_6 for document processing</p>
          <p><strong>Compliance Areas:</strong> Charity Commission, HMRC/Gift Aid, GDPR, Safeguarding, Fundraising Regulator, DBS, Financial Audit, Insurance</p>
          <p><strong>Data Protection:</strong> All personal data encrypted at rest, GDPR-compliant storage</p>
          <p><strong>Audit Trail:</strong> Every action logged with timestamp + user email</p>
          <p><strong>Export Rights:</strong> One-click data export for GDPR portability</p>
        </CardContent>
      </Card>

      {/* App-Specific Compliance Modules */}
      <div className="space-y-6">
        {/* Charity Commission Annual Return */}
        <CharityCommissionCompliance />

        {/* HMRC Gift Aid Compliance */}
        <HMRCGiftAidCompliance />

        {/* Safeguarding & DBS Compliance */}
        <SafeguardingDBSCompliance />

        {/* Universal File Upload & AI Sorting */}
        <UniversalFileUpload
          onFileProcessed={({ file, analysis }) => {
            console.log('File processed:', file, analysis);
            // Auto-route logic would go here
          }}
        />

        {/* Overall Compliance Checklist */}
        <ComplianceChecklist />
      </div>

      {/* Compliance Quick Reference with Latest Regulations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            UK Charity Compliance Framework 2025/26
          </CardTitle>
          <CardDescription>Age UK-specific regulatory requirements based on latest legislation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* Column 1: Regulatory Bodies */}
            <div className="space-y-3">
              <p className="font-semibold text-primary border-b pb-2">Regulatory Bodies</p>
              <div className="flex items-start gap-2">
                <Building className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Charity Commission</p>
                  <p className="text-xs text-muted-foreground">Annual return deadline: May 31, 2026 • Public benefit reporting • Trustee duties</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">HMRC</p>
                  <p className="text-xs text-muted-foreground">Gift Aid claims (4-year window) • Finance Bill 2025/26 • Tainted donations rules</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">ICO (GDPR)</p>
                  <p className="text-xs text-muted-foreground">Data (Use and Access) Act 2025 • Charitable soft opt-in • Client data protection</p>
                </div>
              </div>
            </div>

            {/* Column 2: Safeguarding */}
            <div className="space-y-3">
              <p className="font-semibold text-primary border-b pb-2">Safeguarding Requirements</p>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">DBS Checks</p>
                  <p className="text-xs text-muted-foreground">Enhanced DBS for befrienders, drivers, facilitators • Renew every 3 years • Expiry tracking</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Vulnerable Adults</p>
                  <p className="text-xs text-muted-foreground">Written safeguarding policy • Named safeguarding lead • Incident reporting • Risk assessments</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Training</p>
                  <p className="text-xs text-muted-foreground">Safeguarding training • Manual handling • Dementia awareness • Boundary training</p>
                </div>
              </div>
            </div>

            {/* Column 3: Operational Compliance */}
            <div className="space-y-3">
              <p className="font-semibold text-primary border-b pb-2">Operational Compliance</p>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Fundraising Regulator</p>
                  <p className="text-xs text-muted-foreground">Code of Fundraising Practice (Nov 2025) • Ethical fundraising • Donor protection</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Financial Audit</p>
                  <p className="text-xs text-muted-foreground">Audit threshold: £1M+ • Independent examination: £250k-£1M • SORP 2026 updates</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Insurance</p>
                  <p className="text-xs text-muted-foreground">Public liability • Trustee liability • Volunteer cover • Professional indemnity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Deadlines */}
          <div className="mt-6 border-t pt-4">
            <p className="font-semibold text-primary mb-3">Key Compliance Deadlines 2025/26</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border rounded-lg p-3 bg-red-50 border-red-200">
                <p className="text-xs text-red-800 font-semibold mb-1">May 31, 2026</p>
                <p className="text-xs text-red-700">Charity Commission Annual Return</p>
              </div>
              <div className="border rounded-lg p-3 bg-orange-50 border-orange-200">
                <p className="text-xs text-orange-800 font-semibold mb-1">Ongoing</p>
                <p className="text-xs text-orange-700">DBS Renewals (3-year cycle)</p>
              </div>
              <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                <p className="text-xs text-blue-800 font-semibold mb-1">4-Year Window</p>
                <p className="text-xs text-blue-700">HMRC Gift Aid Back-Claims</p>
              </div>
              <div className="border rounded-lg p-3 bg-green-50 border-green-200">
                <p className="text-xs text-green-800 font-semibold mb-1">Annual</p>
                <p className="text-xs text-green-700">Safeguarding Policy Review</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}