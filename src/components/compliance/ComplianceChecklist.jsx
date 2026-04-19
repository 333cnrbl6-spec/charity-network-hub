import React, { useState } from 'react';
import { Shield, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useCompliance, useClients, useGrants } from '@/hooks/useEntityQueries';

const COMPLIANCE_AREAS = [
  { id: 'charity_commission', label: 'Charity Commission Reporting', category: 'regulatory' },
  { id: 'hmrc_gift_aid', label: 'HMRC & Gift Aid', category: 'financial' },
  { id: 'gdpr_data', label: 'GDPR & Data Protection', category: 'data' },
  { id: 'safeguarding', label: 'Safeguarding Policies', category: 'safety' },
  { id: 'fundraising_regulator', label: 'Fundraising Regulator Code', category: 'regulatory' },
  { id: 'dbs_checks', label: 'DBS Checks (Volunteers)', category: 'safety' },
  { id: 'financial_audit', label: 'Financial Audit Trail', category: 'financial' },
  { id: 'insurance', label: 'Insurance Coverage', category: 'operational' },
];

export default function ComplianceChecklist() {
  const [assessing, setAssessing] = useState(false);
  const [report, setReport] = useState(null);
  const { data: compliance = [] } = useCompliance();
  const { data: clients = [] } = useClients();
  const { data: grants = [] } = useGrants();

  const runComplianceAssessment = async () => {
    setAssessing(true);
    try {
      const { data } = await base44.integrations.Core.InvokeLLM({
        model: 'claude_opus_4_6',
        prompt: `You are a UK charity compliance expert. Conduct a comprehensive compliance audit for Age UK branch.

Data available:
- Compliance Records: ${JSON.stringify(compliance)}
- Clients: ${clients.length} total
- Grants: ${grants.length} applications

Assess each area against UK charity regulations:
1. Charity Commission Reporting — Annual returns, trustee duties, public benefit
2. HMRC & Gift Aid — Gift aid declarations, tax compliance, funder reporting
3. GDPR & Data Protection — Client data, consent, retention, access rights
4. Safeguarding Policies — Vulnerable adult protection, incident reporting
5. Fundraising Regulator Code — Ethical fundraising, donor protection
6. DBS Checks — Volunteer vetting, expiry tracking
7. Financial Audit Trail — Income/expenditure tracking, grant management
8. Insurance Coverage — Public liability, trustee liability, volunteer cover

For each area, determine:
- Status: compliant, review_required, non_compliant
- Risk Level: low, medium, high, critical
- Evidence: What proves compliance or non-compliance
- Action Items: Specific steps to achieve/maintain compliance
- Deadline: If action required, when by

Output structured JSON for compliance dashboard.`,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_status: { type: 'string', enum: ['compliant', 'mostly_compliant', 'at_risk', 'non_compliant'] },
            overall_risk: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            areas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  area_id: { type: 'string' },
                  area_name: { type: 'string' },
                  status: { type: 'string', enum: ['compliant', 'review_required', 'non_compliant'] },
                  risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                  evidence: { type: 'string' },
                  action_items: { type: 'array', items: { type: 'string' } },
                  deadline: { type: 'string' },
                },
                required: ['area_id', 'area_name', 'status', 'risk_level'],
              },
            },
            critical_actions: { type: 'array', items: { type: 'string' } },
            next_review_date: { type: 'string' },
          },
          required: ['overall_status', 'overall_risk', 'areas'],
        },
      });

      setReport(data);
      toast.success('Compliance assessment complete', {
        description: `Overall: ${data.overall_status} | Risk: ${data.overall_risk}`,
      });
    } catch (error) {
      console.error('Compliance assessment failed:', error);
      toast.error('Assessment failed', { description: error.message });
    } finally {
      setAssessing(false);
    }
  };

  const statusColors = {
    compliant: 'bg-green-100 text-green-800',
    mostly_compliant: 'bg-yellow-100 text-yellow-800',
    at_risk: 'bg-orange-100 text-orange-800',
    non_compliant: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Charity Compliance Checklist
        </CardTitle>
        <CardDescription>UK charity regulatory compliance assessment — Charity Commission, HMRC, GDPR, Safeguarding</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runComplianceAssessment} disabled={assessing} className="w-full">
          {assessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Running Compliance Audit...
            </>
          ) : (
            'Run Full Compliance Assessment'
          )}
        </Button>

        {report && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="border rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold">Overall Compliance Status</p>
                <Badge className={statusColors[report.overall_status]}>{report.overall_status.replace(/_/g, ' ')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <Badge className={statusColors[report.overall_risk === 'non_compliant' ? 'non_compliant' : report.overall_risk]}>
                  {report.overall_risk}
                </Badge>
              </div>
              {report.next_review_date && (
                <p className="text-xs text-muted-foreground mt-2">
                  Next Review: {new Date(report.next_review_date).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Critical Actions */}
            {report.critical_actions?.length > 0 && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="font-semibold text-red-900 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Critical Actions Required
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside text-red-800">
                  {report.critical_actions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas Breakdown */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Compliance Areas</p>
              {report.areas?.map((area) => (
                <div key={area.area_id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{area.area_name}</p>
                    <Badge className={statusColors[area.status]}>{area.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>Risk: {area.risk_level}</span>
                    {area.deadline && <span>• Due: {new Date(area.deadline).toLocaleDateString()}</span>}
                  </div>
                  {area.evidence && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Evidence:</strong> {area.evidence}
                    </p>
                  )}
                  {area.action_items?.length > 0 && (
                    <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                      {area.action_items.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Export Button */}
            <Button variant="outline" className="w-full gap-2">
              <Download className="w-4 h-4" />
              Export Compliance Report (PDF)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}