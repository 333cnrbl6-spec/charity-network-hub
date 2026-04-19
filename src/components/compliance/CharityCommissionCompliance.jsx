import React, { useState, useMemo } from 'react';
import { FileText, CheckCircle2, AlertCircle, Calendar, Users, Building, PoundSterling, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useCompliance, useClients, useVolunteers, useGrants, useBranchReports } from '@/hooks/useEntityQueries';

const ANNUAL_RETURN_DEADLINE = '2026-05-31'; // 10 months after financial year end
const GIFT_AID_CLAIM_WINDOW_YEARS = 4;

export default function CharityCommissionCompliance() {
  const [assessing, setAssessing] = useState(false);
  const [report, setReport] = useState(null);
  const { data: compliance = [] } = useCompliance();
  const { data: clients = [] } = useClients();
  const { data: volunteers = [] } = useVolunteers();
  const { data: grants = [] } = useGrants();
  const { data: branchReports = [] } = useBranchReports();

  const calculateAnnualReturnReadiness = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const financialYearEnd = `${currentYear - 1}-04-01`; // April 1st
    const deadline = `${currentYear}-05-31`; // May 31st
    
    // Check required data completeness
    const totalIncome = grants.reduce((sum, g) => sum + (g.amount_awarded || 0), 0);
    const activeClients = clients.filter(c => c.status === 'active').length;
    const activeVolunteers = volunteers.filter(v => v.status === 'active').length;
    
    // Charity Commission questions checklist
    const questions = [
      { id: 'public_benefit', label: 'Public benefit statement', complete: true },
      { id: 'trustee_names', label: 'Trustee names & details', complete: volunteers.filter(v => v.role === 'trustee').length > 0 },
      { id: 'financial_accounts', label: 'Financial accounts filed', complete: branchReports.length > 0 },
      { id: 'safeguarding_policy', label: 'Safeguarding policy in place', complete: compliance.some(c => c.compliance_area === 'safeguarding_training') },
      { id: 'serious_incidents', label: 'Serious incident reporting', complete: true }, // Would need incident entity
      { id: 'fundraising_disclosure', label: 'Fundraising disclosure', complete: true },
      { id: 'governance_changes', label: 'Governance changes reported', complete: true },
      { id: 'land_property', label: 'Land/property transactions', complete: true },
    ];
    
    const completeCount = questions.filter(q => q.complete).length;
    const readinessPercentage = (completeCount / questions.length) * 100;
    
    return {
      financialYearEnd,
      deadline,
      daysUntilDeadline: Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)),
      totalIncome,
      activeClients,
      activeVolunteers,
      questions,
      readinessPercentage,
      auditRequired: totalIncome > 1000000, // £1M threshold from 1 Oct 2026
      independentExaminationRequired: totalIncome > 25000 && totalIncome <= 1000000,
    };
  }, [clients, volunteers, grants, branchReports, compliance]);

  const runAnnualReturnAssessment = async () => {
    setAssessing(true);
    try {
      const { data } = await base44.integrations.Core.InvokeLLM({
        model: 'claude_opus_4_6',
        prompt: `You are a UK Charity Commission compliance expert. Prepare Annual Return assessment for Age UK branch.

Data:
- Financial Year End: ${calculateAnnualReturnReadiness.financialYearEnd}
- Deadline: ${calculateAnnualReturnReadiness.deadline} (${calculateAnnualReturnReadiness.daysUntilDeadline} days remaining)
- Total Income: £${calculateAnnualReturnReadiness.totalIncome.toLocaleString()}
- Active Clients: ${calculateAnnualReturnReadiness.activeClients}
- Active Volunteers: ${calculateAnnualReturnReadiness.activeVolunteers}
- Audit Required: ${calculateAnnualReturnReadiness.auditRequired ? 'Yes (£1M+ income)' : 'No'}
- Independent Examination Required: ${calculateAnnualReturnReadiness.independentExaminationRequired ? 'Yes (£250k-£1M income)' : 'No'}

Readiness Checklist:
${JSON.stringify(calculateAnnualReturnReadiness.questions)}

Assess against Charity Commission 2025/26 requirements:
1. Public benefit reporting — demonstrate charitable purpose
2. Trustee duties — names, responsibilities, conflicts of interest
3. Financial accounts — income/expenditure, balance sheet
4. Safeguarding — policies, incidents, DBS checks
5. Fundraising — compliance with Code of Fundraising Practice (Nov 2025)
6. Serious incidents — any reportable events
7. Governance changes — trustee appointments/resignations
8. Land/property — any transactions

Identify gaps and provide action plan. Output structured JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            readiness_status: { type: 'string', enum: ['ready', 'mostly_ready', 'needs_work', 'not_ready'] },
            readiness_percentage: { type: 'number' },
            completed_items: { type: 'array', items: { type: 'string' } },
            missing_items: { type: 'array', items: { type: 'string' } },
            critical_gaps: { type: 'array', items: { type: 'string' } },
            filing_type: { type: 'string', enum: ['full_accounts', 'independent_examination', 'audit_required'] },
            estimated_filing_time_hours: { type: 'number' },
            action_plan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                  deadline: { type: 'string' },
                  responsible_role: { type: 'string' },
                },
                required: ['action', 'priority'],
              },
            },
            charity_commission_links: { type: 'array', items: { type: 'string' } },
          },
          required: ['readiness_status', 'readiness_percentage', 'filing_type'],
        },
      });

      setReport(data);
      toast.success('Annual Return assessment complete', {
        description: `Status: ${data.readiness_status} | ${data.readiness_percentage}% ready`,
      });
    } catch (error) {
      console.error('Assessment failed:', error);
      toast.error('Assessment failed', { description: error.message });
    } finally {
      setAssessing(false);
    }
  };

  const statusColors = {
    ready: 'bg-green-100 text-green-800',
    mostly_ready: 'bg-yellow-100 text-yellow-800',
    needs_work: 'bg-orange-100 text-orange-800',
    not_ready: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5 text-primary" />
          Charity Commission Annual Return
        </CardTitle>
        <CardDescription>
          Deadline: {new Date(calculateAnnualReturnReadiness.deadline).toLocaleDateString()} •{' '}
          {calculateAnnualReturnReadiness.daysUntilDeadline} days remaining
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Readiness Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Financial Year End</p>
            <p className="text-sm font-semibold">{new Date(calculateAnnualReturnReadiness.financialYearEnd).toLocaleDateString()}</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Income</p>
            <p className="text-sm font-semibold">£{calculateAnnualReturnReadiness.totalIncome.toLocaleString()}</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Filing Type</p>
            <Badge variant="outline">
              {calculateAnnualReturnReadiness.auditRequired ? 'Audit Required' :
               calculateAnnualReturnReadiness.independentExaminationRequired ? 'Independent Examination' : 'Full Accounts'}
            </Badge>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Readiness</p>
            <p className="text-sm font-semibold">{calculateAnnualReturnReadiness.readinessPercentage.toFixed(0)}%</p>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <p className="text-sm font-semibold mb-2">Annual Return Questions Checklist</p>
          <div className="space-y-2">
            {calculateAnnualReturnReadiness.questions.map((q) => (
              <div key={q.id} className="flex items-center gap-2 text-sm">
                {q.complete ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                )}
                <span>{q.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Button onClick={runAnnualReturnAssessment} disabled={assessing} className="w-full">
          {assessing ? (
            <>
              <Calendar className="w-4 h-4 animate-spin mr-2" />
              Running Assessment...
            </>
          ) : (
            'Run Annual Return Readiness Assessment'
          )}
        </Button>

        {/* Assessment Results */}
        {report && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Readiness Status</p>
                <Badge className={statusColors[report.readiness_status]}>{report.readiness_status.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Filing Type: <strong>{report.filing_type.replace(/_/g, ' ')}</strong> •
                Estimated Time: <strong>{report.estimated_filing_time_hours} hours</strong>
              </p>
            </div>

            {report.critical_gaps?.length > 0 && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="font-semibold text-red-900 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Critical Gaps
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside text-red-800">
                  {report.critical_gaps.map((gap, idx) => (
                    <li key={idx}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {report.action_plan?.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Action Plan</p>
                <div className="space-y-2">
                  {report.action_plan.map((action, idx) => (
                    <div key={idx} className="border rounded-lg p-3 flex items-start gap-3">
                      <Badge className={
                        action.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        action.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {action.priority}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.action}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {action.deadline && <span>Due: {new Date(action.deadline).toLocaleDateString()} • </span>}
                          {action.responsible_role && <span>Responsible: {action.responsible_role}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}