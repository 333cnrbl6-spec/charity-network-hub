import React, { useState } from 'react';
import { Banknote, FileText, CheckCircle2, AlertCircle, Loader2, Calendar, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useGrants, useClients } from '@/hooks/useEntityQueries';

export default function HMRCGiftAidCompliance() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  const { data: grants = [] } = useGrants();
  const { data: clients = [] } = useClients();

  const runGiftAidComplianceCheck = async () => {
    setChecking(true);
    try {
      const { data } = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are an HMRC Gift Aid specialist. Conduct comprehensive Gift Aid compliance check for Age UK.

Grants/Donations Data:
${JSON.stringify(grants)}

Clients (Donors):
${JSON.stringify(clients)}

Assess against HMRC 2025/26 Gift Aid rules:

**Eligibility Criteria:**
1. Donor must be UK taxpayer (income tax/capital gains tax paid ≥ Gift Aid claimed)
2. Valid Gift Aid declaration on file (signed, dated, includes donor details)
3. Donation is genuine gift (no benefit received, or benefit within limits: ≤25% of donation if <£100, ≤£25 if ≥£100)
4. Minimum donation threshold (£1 recommended for cost-effectiveness)
5. Not from company payroll giving (different scheme)

**Compliance Requirements:**
- Declaration validity: Must include donor name, address, confirmation of UK tax status, charity name
- Record keeping: 6 years from end of accounting period
- Claim window: 4 years from end of accounting period
- Tainted donations rules (Finance Bill 2025-26): Donations linked to tax avoidance schemes

**Calculate for each grant:**
- Eligible amount
- Gift Aid value (25% of gross donation = donation × 0.25)
- Missing/invalid declarations
- Compliance flags (non-UK donor, insufficient tax, benefit received, tainted donation risk)

**Output structured JSON with:**
- Summary statistics
- Per-grant breakdown
- Declaration gaps
- Action plan for compliance
- HMRC claim form readiness`,
        response_json_schema: {
          type: 'object',
          properties: {
            total_donations: { type: 'number' },
            eligible_donations: { type: 'number' },
            eligible_amount: { type: 'number' },
            potential_gift_aid: { type: 'number' },
            ineligible_amount: { type: 'number' },
            missing_declarations: { type: 'number' },
            invalid_declarations: { type: 'number' },
            tainted_donation_risk: { type: 'number' },
            grants: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  grant_id: { type: 'string' },
                  grant_name: { type: 'string' },
                  donor_name: { type: 'string' },
                  amount: { type: 'number' },
                  gift_aid_eligible: { type: 'boolean' },
                  gift_aid_value: { type: 'number' },
                  declaration_status: { type: 'string', enum: ['valid', 'missing', 'invalid', 'expired'] },
                  compliance_flags: { type: 'array', items: { type: 'string' } },
                  hmrc_claim_ready: { type: 'boolean' },
                },
                required: ['grant_id', 'grant_name', 'amount', 'gift_aid_eligible', 'declaration_status'],
              },
            },
            declaration_gaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  donor_name: { type: 'string' },
                  amount_at_risk: { type: 'number' },
                  action_required: { type: 'string' },
                  deadline: { type: 'string' },
                },
                required: ['donor_name', 'amount_at_risk', 'action_required'],
              },
            },
            hmrc_claim_readiness: {
              type: 'object',
              properties: {
                ch1_claim_form_ready: { type: 'boolean' },
                total_claim_amount: { type: 'number' },
                accounting_period: { type: 'string' },
                missing_records: { type: 'array', items: { type: 'string' } },
              },
            },
            recommendations: { type: 'array', items: { type: 'string' } },
            finance_bill_2025_impact: { type: 'string' },
          },
          required: ['total_donations', 'eligible_donations', 'potential_gift_aid'],
        },
      });

      setResults(data);
      toast.success('HMRC Gift Aid compliance check complete', {
        description: `£${data.potential_gift_aid.toLocaleString()} potential Gift Aid • ${data.missing_declarations} declarations missing`,
      });
    } catch (error) {
      console.error('Gift Aid check failed:', error);
      toast.error('Check failed', { description: error.message });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="w-5 h-5 text-green-600" />
          HMRC Gift Aid Compliance
        </CardTitle>
        <CardDescription>
          HMRC-compliant Gift Aid assessment — Finance Bill 2025/26 rules, tainted donations, declaration validity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runGiftAidComplianceCheck} disabled={checking} className="w-full">
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Running HMRC Compliance Check...
            </>
          ) : (
            'Run Full Gift Aid Compliance Assessment'
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Donations</p>
                <p className="text-2xl font-bold">{results.total_donations}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Eligible</p>
                <p className="text-2xl font-bold text-green-600">{results.eligible_donations}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Gift Aid Value</p>
                <p className="text-2xl font-bold text-green-600">£{results.potential_gift_aid.toLocaleString()}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Missing Declarations</p>
                <p className="text-2xl font-bold text-orange-600">{results.missing_declarations}</p>
              </div>
            </div>

            {/* HMRC Claim Readiness */}
            {results.hmrc_claim_readiness && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-blue-900 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    HMRC Claim Form (CH1) Readiness
                  </p>
                  <Badge variant={results.hmrc_claim_readiness.ch1_claim_form_ready ? 'default' : 'destructive'}>
                    {results.hmrc_claim_readiness.ch1_claim_form_ready ? 'Ready to File' : 'Not Ready'}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Claim Amount</p>
                    <p className="font-bold text-green-600">£{results.hmrc_claim_readiness.total_claim_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Accounting Period</p>
                    <p className="font-semibold">{results.hmrc_claim_readiness.accounting_period || 'Not set'}</p>
                  </div>
                </div>
                {results.hmrc_claim_readiness.missing_records?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-red-800 font-semibold mb-1">Missing Records:</p>
                    <ul className="text-xs space-y-1 list-disc list-inside text-red-700">
                      {results.hmrc_claim_readiness.missing_records.map((record, idx) => (
                        <li key={idx}>{record}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Declaration Gaps */}
            {results.declaration_gaps?.length > 0 && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <p className="font-semibold text-orange-900 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Declaration Gaps — Action Required
                </p>
                <div className="space-y-2">
                  {results.declaration_gaps.map((gap, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium">{gap.donor_name} — £{gap.amount_at_risk.toLocaleString()} at risk</p>
                      <p className="text-xs text-orange-800">{gap.action_required}</p>
                      {gap.deadline && (
                        <p className="text-xs text-orange-700 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          Deadline: {new Date(gap.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {results.recommendations?.length > 0 && (
              <div className="border rounded-lg p-4 bg-green-50">
                <p className="font-semibold text-green-900 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  HMRC Compliance Recommendations
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside text-green-800">
                  {results.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Finance Bill 2025 Impact */}
            {results.finance_bill_2025_impact && (
              <div className="border rounded-lg p-3 text-sm bg-purple-50">
                <p className="font-semibold text-purple-900 mb-1">Finance Bill 2025/26 Impact</p>
                <p className="text-purple-800">{results.finance_bill_2025_impact}</p>
              </div>
            )}

            {/* Export Button */}
            <Button variant="outline" className="w-full gap-2">
              <Download className="w-4 h-4" />
              Export HMRC Gift Aid Report (CH1 Form Data)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}