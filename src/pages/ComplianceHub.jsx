import React from 'react';
import { FileText, CheckCircle2, AlertCircle, Shield, Banknote, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UniversalFileUpload from './UniversalFileUpload';
import ComplianceChecklist from './ComplianceChecklist';
import GiftAidEligibilityChecker from './GiftAidEligibilityChecker';

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

      {/* Main Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload & AI Sorting */}
        <UniversalFileUpload
          onFileProcessed={({ file, analysis }) => {
            console.log('File processed:', file, analysis);
            // Auto-route logic would go here
          }}
        />

        {/* Compliance Checklist */}
        <ComplianceChecklist />
      </div>

      {/* Gift Aid Checker - Full Width */}
      <GiftAidEligibilityChecker />

      {/* Compliance Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Domain-Specific Compliance Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Charity Commission</p>
                  <p className="text-xs text-muted-foreground">Annual returns, trustee duties, public benefit reporting</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Banknote className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">HMRC & Gift Aid</p>
                  <p className="text-xs text-muted-foreground">Gift aid declarations, tax compliance, funder reporting</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">GDPR & Data Protection</p>
                  <p className="text-xs text-muted-foreground">Client data, consent, retention policies, access rights</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Safeguarding</p>
                  <p className="text-xs text-muted-foreground">Vulnerable adult protection, incident reporting, DBS checks</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Fundraising Regulator</p>
                  <p className="text-xs text-muted-foreground">Ethical fundraising, donor protection, code adherence</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Financial Audit</p>
                  <p className="text-xs text-muted-foreground">Income/expenditure tracking, grant management, audit trail</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}