import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, AlertTriangle, Shield, FileText } from 'lucide-react';
import IncidentTimeline from '@/components/safeguarding/IncidentTimeline';
import ReferralLetterGenerator from '@/components/safeguarding/ReferralLetterGenerator';
import ReferralStatusTracker from '@/components/safeguarding/ReferralStatusTracker';
import KnowledgeBaseDocs from '@/components/knowledge-base/KnowledgeBaseDocs';
import PeerReviewSubmission from '@/components/peer-review/PeerReviewSubmission';
import AuditLogViewer from '@/components/safeguarding/AuditLogViewer';
import { format } from 'date-fns';

export default function IncidentDetail() {
  const { incidentId } = useParams();
  const navigate = useNavigate();
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const { data: incident, isLoading } = useQuery({
    queryKey: ['safeguarding-incident', incidentId],
    queryFn: () => base44.entities.SafeguardingIncident.read(incidentId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-6">
        <p className="text-red-600">Incident not found</p>
        <Button onClick={() => navigate('/safeguarding')} className="mt-4">
          Back to Safeguarding Hub
        </Button>
      </div>
    );
  }

  const severityColor = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const statusColor = {
    reported: 'bg-blue-100 text-blue-800',
    under_review: 'bg-orange-100 text-orange-800',
    investigating: 'bg-purple-100 text-purple-800',
    external_referral_made: 'bg-red-100 text-red-800',
    closed: 'bg-green-100 text-green-800',
    escalated_to_authorities: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/safeguarding')}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Safeguarding Hub
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{incident.incident_reference}</h1>
            <p className="text-muted-foreground mt-1">
              {incident.incident_type.replace(/_/g, ' ')} •{' '}
              {format(new Date(incident.incident_date), 'PPP')}
            </p>
          </div>
          <div className="flex gap-2">
            {(incident.ai_severity_classification === 'critical' ||
              incident.ai_severity_classification === 'high') && (
              <Button
                onClick={() => setShowReferralModal(true)}
                className="bg-red-600 hover:bg-red-700 gap-2"
              >
                <FileText className="w-4 h-4" />
                Generate Referral
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status & Severity Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Severity Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={severityColor[incident.ai_severity_classification]}>
              {incident.ai_severity_classification?.toUpperCase()}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Risk Score: {incident.ai_risk_assessment?.risk_score || 'N/A'}/100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={statusColor[incident.status]}>
              {incident.status?.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Confidentiality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{incident.confidentiality_level}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Statutory Referral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={incident.ai_risk_assessment?.statutory_referral_required ? 'destructive' : 'outline'}>
              {incident.ai_risk_assessment?.statutory_referral_required ? 'Required' : 'Not Required'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Critical Risk Alert */}
      {(incident.ai_severity_classification === 'critical' ||
        incident.vulnerable_adult_details?.immediate_danger) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              ⚠️ Critical/High-Risk Incident
            </CardTitle>
          </CardHeader>
          <CardContent className="text-red-900">
            <p className="text-sm">
              This incident has been classified as requiring immediate action. Ensure all
              recommended actions are completed and statutory referrals are made without delay.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Incident Details */}
        <div className="col-span-2 space-y-6">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Location</p>
                <p className="text-sm">{incident.incident_location}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{incident.incident_description}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Actions Taken By Reporter
                </p>
                <p className="text-sm">{incident.actions_taken || 'None documented'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Vulnerable Adult Details */}
          {incident.vulnerable_adult_details && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vulnerable Adult Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Name</p>
                    <p className="text-sm">{incident.vulnerable_adult_details.name || 'Not disclosed'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Age</p>
                    <p className="text-sm">
                      {incident.vulnerable_adult_details.age || 'Not disclosed'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Immediate Danger
                    </p>
                    <Badge
                      className={
                        incident.vulnerable_adult_details.immediate_danger
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {incident.vulnerable_adult_details.immediate_danger ? 'YES' : 'No'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Capacity Concerns
                    </p>
                    <Badge
                      className={
                        incident.vulnerable_adult_details.capacity_concerns
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {incident.vulnerable_adult_details.capacity_concerns ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Assessment */}
          {incident.ai_risk_assessment && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Risk Score</p>
                    <p className="text-lg font-bold">
                      {incident.ai_risk_assessment.risk_score}/100
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Immediate Risk
                    </p>
                    <Badge
                      className={
                        incident.ai_risk_assessment.immediate_risk
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {incident.ai_risk_assessment.immediate_risk ? 'YES' : 'No'}
                    </Badge>
                  </div>
                </div>

                {incident.ai_risk_assessment.risk_factors?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Risk Factors</p>
                    <div className="space-y-1">
                      {incident.ai_risk_assessment.risk_factors.map((factor, idx) => (
                        <p key={idx} className="text-sm">
                          • {factor}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {incident.ai_risk_assessment.recommended_actions?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Recommended Actions
                    </p>
                    <div className="space-y-1">
                      {incident.ai_risk_assessment.recommended_actions.map((action, idx) => (
                        <p key={idx} className="text-sm">
                          • {action}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Referral Status Tracker */}
          <ReferralStatusTracker incident={incident} />

          {/* Timeline */}
          <IncidentTimeline incident={incident} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reported By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{incident.reported_by_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{incident.reported_by}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <Badge variant="outline">{incident.reported_by_role}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Lead */}
          {incident.safeguarding_lead_assigned && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Safeguarding Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{incident.safeguarding_lead_assigned}</p>
              </CardContent>
            </Card>
          )}

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="text-muted-foreground">Retention Until</p>
                <p className="font-medium">
                  {format(new Date(incident.data_retention_date), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Confidentiality</p>
                <p className="font-medium capitalize">{incident.confidentiality_level}</p>
              </div>
            </CardContent>
          </Card>

          {/* External Referrals */}
          {incident.external_referrals && incident.external_referrals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">External Referrals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {incident.external_referrals.map((referral, idx) => (
                  <div key={idx} className="border-t pt-3 last:border-t-0 last:pt-0">
                    <p className="text-xs font-medium">{referral.agency}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(referral.referral_date), 'PP')}
                    </p>
                    {referral.reference_number && (
                      <p className="text-xs mt-1">Ref: {referral.reference_number}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Knowledge Base Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📚 Guidance & Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <KnowledgeBaseDocs relevantTo="incident_management" compact={true} />
            </CardContent>
          </Card>
          </div>
          </div>

          {/* Peer Review Section - Only show if not closed */}
          {incident.status !== 'closed' && (
            <PeerReviewSubmission incident={incident} onSubmitSuccess={() => window.location.reload()} />
          )}

          {/* External Notifications */}
          <ExternalNotificationSender incident={incident} onNotificationSent={() => window.location.reload()} />

          {/* Audit Log Viewer */}
          <AuditLogViewer auditTrail={incident.audit_trail} />

          {/* Referral Modal */}
       {showReferralModal && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <ReferralLetterGenerator
               incident={incident}
               onClose={() => setShowReferralModal(false)}
             />
           </div>
         </div>
       )}
     </div>
   );
}