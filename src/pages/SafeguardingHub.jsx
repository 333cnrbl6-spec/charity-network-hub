import React from 'react';
import { Shield, AlertTriangle, Bell, FileText, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SafeguardingIncidentForm from '@/components/safeguarding/SafeguardingIncidentForm';
import SafeguardingAlertsDashboard from '@/components/safeguarding/SafeguardingAlertsDashboard';
import DBSVerificationTool from '@/components/safeguarding/DBSVerificationTool';

export default function SafeguardingHub() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
          <Shield className="w-10 h-10 text-primary" />
          Safeguarding Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          Secure incident reporting, AI-powered severity classification, and real-time management alerts
        </p>
      </div>

      {/* Compliance Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Safeguarding Compliance Framework
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>Legislation:</strong> Care Act 2014 • HM Government Working Together to Safeguard Adults • Data Protection Act 2018</p>
          <p><strong>Six Safeguarding Principles:</strong> Empowerment • Prevention • Proportionality • Protection • Partnership • Accountability</p>
          <p><strong>AI Model:</strong> claude_opus_4_6 for severity classification and risk assessment</p>
          <p><strong>Data Retention:</strong> 6 years from incident date (GDPR-compliant secure storage)</p>
          <p><strong>Audit Trail:</strong> Every action logged with timestamp and user details</p>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Reporting Form */}
        <SafeguardingIncidentForm />

        {/* Alerts Dashboard */}
        <SafeguardingAlertsDashboard />
      </div>

      {/* DBS Verification Tool */}
      <DBSVerificationTool />

      {/* Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Response Times
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <p><strong>Critical:</strong> Immediate (call 999 if emergency)</p>
            <p><strong>High:</strong> Within 1 hour (safeguarding lead)</p>
            <p><strong>Medium:</strong> Within 24 hours</p>
            <p><strong>Low:</strong> Within 72 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Statutory Referrals
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <p>• Adult Social Care</p>
            <p>• Police (if crime suspected)</p>
            <p>• LADO (allegations against staff)</p>
            <p>• CQC (notifiable incidents)</p>
            <p>• Prevent (radicalisation concerns)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Record Keeping
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <p>• Factual, contemporaneous notes</p>
            <p>• Signed and dated by reporter</p>
            <p>• Stored securely (6 years)</p>
            <p>• GDPR-compliant access controls</p>
            <p>• Audit trail for all changes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}