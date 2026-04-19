import React, { useState } from 'react';
import { Users, Shield, AlertCircle, CheckCircle2, Loader2, FileText, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useVolunteers, useClients, useCompliance } from '@/hooks/useEntityQueries';

const DBS_CHECK_VALIDITY_YEARS = 3;

export default function SafeguardingDBSCompliance() {
  const [assessing, setAssessing] = useState(false);
  const [report, setReport] = useState(null);
  const { data: volunteers = [] } = useVolunteers();
  const { data: clients = [] } = useClients();
  const { data: compliance = [] } = useCompliance();

  const calculateDBSStatus = () => {
    const today = new Date();
    const volunteersWithDBS = volunteers.filter(v => v.dbs_checked);
    const volunteersWithoutDBS = volunteers.filter(v => !v.dbs_checked);
    
    // Check DBS expiry
    const expiredDBS = volunteersWithDBS.filter(v => {
      if (!v.dbs_expiry) return false;
      return new Date(v.dbs_expiry) < today;
    });
    
    const expiringSoon = volunteersWithDBS.filter(v => {
      if (!v.dbs_expiry) return false;
      const expiryDate = new Date(v.dbs_expiry);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return expiryDate < threeMonthsFromNow && expiryDate >= today;
    });
    
    const rolesRequiringDBS = ['befriender', 'driver', 'digital-champion', 'men-in-sheds', 'ageing-well-facilitator'];
    const highRiskVolunteers = volunteers.filter(v => 
      rolesRequiringDBS.includes(v.role) && v.status === 'active'
    );
    
    const highRiskWithoutDBS = highRiskVolunteers.filter(v => !v.dbs_checked);
    
    return {
      totalVolunteers: volunteers.length,
      volunteersWithDBS: volunteersWithDBS.length,
      volunteersWithoutDBS: volunteersWithoutDBS.length,
      expiredDBS: expiredDBS.length,
      expiringSoon: expiringSoon.length,
      highRiskVolunteers: highRiskVolunteers.length,
      highRiskWithoutDBS: highRiskVolunteers.filter(v => !v.dbs_checked).length,
      compliancePercentage: volunteers.length > 0 ? (volunteersWithDBS.length / volunteers.length) * 100 : 0,
      highRiskCompliancePercentage: highRiskVolunteers.length > 0 
        ? ((highRiskVolunteers.length - highRiskWithoutDBS.length) / highRiskVolunteers.length) * 100 
        : 100,
    };
  };

  const runSafeguardingAssessment = async () => {
    setAssessing(true);
    try {
      const dbsStatus = calculateDBSStatus();
      
      const { data } = await base44.integrations.Core.InvokeLLM({
        model: 'claude_opus_4_6',
        prompt: `You are a UK charity safeguarding expert. Conduct comprehensive safeguarding and DBS compliance assessment for Age UK.

Volunteer Data:
${JSON.stringify(volunteers)}

Client Data (vulnerable adults):
${JSON.stringify(clients)}

Current DBS Status:
${JSON.stringify(dbsStatus)}

Compliance Records:
${JSON.stringify(compliance)}

Assess against UK safeguarding requirements 2025/26:

**DBS Check Requirements:**
- Enhanced DBS: Volunteers with direct contact with vulnerable adults (befrienders, drivers, activity facilitators)
- Standard DBS: Trustees with direct contact
- Update Service: Check if volunteers are subscribed for continuous DBS updates
- Validity: DBS checks should be renewed every 3 years (best practice)

**Safeguarding Policy Requirements:**
1. Written safeguarding policy (reviewed annually)
2. Named safeguarding lead/trustee
3. Incident reporting procedures
4. DBS record-keeping (6 years)
5. Training records (all volunteers)
6. Risk assessments for activities

**Vulnerable Adult Protection:**
- Client consent forms
- Data protection (GDPR) compliance
- Incident logging
- Risk assessments for home visits, transport, activities

**Identify:**
- High-risk volunteers without DBS (immediate action required)
- Expired/expiring DBS checks (renewal needed)
- Missing safeguarding training
- Policy gaps
- Incident reporting gaps

Output structured JSON with action plan.`,
        response_json_schema: {
          type: 'object',
          properties: {
            overall_safeguarding_status: { type: 'string', enum: ['compliant', 'mostly_compliant', 'at_risk', 'non_compliant'] },
            overall_risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            dbs_compliance: {
              type: 'object',
              properties: {
                total_volunteers: { type: 'number' },
                dbs_checked: { type: 'number' },
                compliance_percentage: { type: 'number' },
                high_risk_roles_without_dbs: { type: 'number' },
                expired_dbs: { type: 'number' },
                expiring_within_3_months: { type: 'number' },
              },
            },
            volunteers_requiring_immediate_dbs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  volunteer_name: { type: 'string' },
                  role: { type: 'string' },
                  risk_level: { type: 'string', enum: ['critical', 'high', 'medium'] },
                  reason: { type: 'string' },
                  action_required: { type: 'string' },
                  deadline: { type: 'string' },
                },
                required: ['volunteer_name', 'role', 'risk_level', 'reason'],
              },
            },
            safeguarding_policy_status: {
              type: 'object',
              properties: {
                policy_exists: { type: 'boolean' },
                policy_reviewed_date: { type: 'string' },
                named_safeguarding_lead: { type: 'boolean' },
                incident_reporting_process: { type: 'boolean' },
                training_records_complete: { type: 'boolean' },
              },
            },
            critical_actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                  deadline: { type: 'string' },
                  responsible_role: { type: 'string' },
                  legal_requirement: { type: 'boolean' },
                },
                required: ['action', 'priority'],
              },
            },
            training_gaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  training_type: { type: 'string' },
                  volunteers_missing: { type: 'number' },
                  compliance_requirement: { type: 'string' },
                },
                required: ['training_type', 'volunteers_missing'],
              },
            },
            recommendations: { type: 'array', items: { type: 'string' } },
          },
          required: ['overall_safeguarding_status', 'overall_risk_level', 'dbs_compliance'],
        },
      });

      setReport(data);
      toast.success('Safeguarding assessment complete', {
        description: `Status: ${data.overall_safeguarding_status} | Risk: ${data.overall_risk_level}`,
      });
    } catch (error) {
      console.error('Safeguarding assessment failed:', error);
      toast.error('Assessment failed', { description: error.message });
    } finally {
      setAssessing(false);
    }
  };

  const dbsStatus = calculateDBSStatus();
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
          Safeguarding & DBS Compliance
        </CardTitle>
        <CardDescription>
          Vulnerable adult protection, DBS checks, safeguarding policies — UK charity safeguarding requirements 2025/26
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* DBS Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Volunteers</p>
            <p className="text-2xl font-bold">{dbsStatus.totalVolunteers}</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">DBS Checked</p>
            <p className="text-2xl font-bold text-green-600">{dbsStatus.volunteersWithDBS}</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">High-Risk Without DBS</p>
            <p className="text-2xl font-bold text-red-600">{dbsStatus.highRiskWithoutDBS}</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Expiring Soon</p>
            <p className="text-2xl font-bold text-orange-600">{dbsStatus.expiringSoon}</p>
          </div>
        </div>

        {/* Compliance Progress */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Overall DBS Compliance</p>
            <p className="text-sm font-bold">{dbsStatus.compliancePercentage.toFixed(0)}%</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                dbsStatus.compliancePercentage >= 90 ? 'bg-green-600' :
                dbsStatus.compliancePercentage >= 70 ? 'bg-yellow-600' :
                'bg-red-600'
              }`}
              style={{ width: `${dbsStatus.compliancePercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {dbsStatus.volunteersWithDBS} of {dbsStatus.totalVolunteers} volunteers have valid DBS checks
          </p>
        </div>

        {/* High-Risk Alert */}
        {dbsStatus.highRiskWithoutDBS > 0 && (
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <p className="font-semibold text-red-900 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Critical: High-Risk Volunteers Without DBS
            </p>
            <p className="text-sm text-red-800 mt-1">
              {dbsStatus.highRiskWithoutDBS} volunteer(s) in high-risk roles (befriender, driver, facilitator) lack DBS checks
            </p>
            <p className="text-xs text-red-700 mt-2">
              These volunteers should not have direct contact with vulnerable adults until DBS checks are completed
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button onClick={runSafeguardingAssessment} disabled={assessing} className="w-full">
          {assessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Running Safeguarding Assessment...
            </>
          ) : (
            'Run Full Safeguarding & DBS Compliance Assessment'
          )}
        </Button>

        {/* Assessment Results */}
        {report && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="border rounded-lg p-4 bg-primary/5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Safeguarding Status</p>
                <Badge className={statusColors[report.overall_safeguarding_status]}>
                  {report.overall_safeguarding_status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <Badge className={
                  report.overall_risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                  report.overall_risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                  report.overall_risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
                  {report.overall_risk_level}
                </Badge>
              </div>
            </div>

            {/* Volunteers Requiring Immediate DBS */}
            {report.volunteers_requiring_immediate_dbs?.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Volunteers Requiring Immediate DBS</p>
                <div className="space-y-2">
                  {report.volunteers_requiring_immediate_dbs.map((v, idx) => (
                    <div key={idx} className="border rounded-lg p-3 flex items-start gap-3">
                      <Badge className={
                        v.risk_level === 'critical' ? 'bg-red-100 text-red-800' :
                        v.risk_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {v.risk_level}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{v.volunteer_name} — {v.role}</p>
                        <p className="text-xs text-muted-foreground">{v.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">{v.action_required}</p>
                        {v.deadline && (
                          <p className="text-xs text-orange-700 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            Deadline: {new Date(v.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Critical Actions */}
            {report.critical_actions?.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Critical Actions</p>
                <div className="space-y-2">
                  {report.critical_actions.map((action, idx) => (
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
                          {action.legal_requirement && (
                            <span className="text-red-600 font-semibold"> • Legal Requirement</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations?.length > 0 && (
              <div className="border rounded-lg p-4 bg-green-50">
                <p className="font-semibold text-green-900 text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Safeguarding Recommendations
                </p>
                <ul className="text-xs space-y-1 list-disc list-inside text-green-800">
                  {report.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}