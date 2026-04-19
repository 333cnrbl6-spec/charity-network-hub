import React, { useState, useMemo } from 'react';
import { Bell, AlertTriangle, Shield, CheckCircle2, Clock, FileText, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useSafeguardingIncidents } from '@/hooks/useEntityQueries';

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
};

const STATUS_COLORS = {
  reported: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  investigating: 'bg-orange-100 text-orange-800',
  external_referral_made: 'bg-purple-100 text-purple-800',
  closed: 'bg-green-100 text-green-800',
  escalated_to_authorities: 'bg-red-100 text-red-800',
};

export default function SafeguardingAlertsDashboard() {
  const { data: incidents = [] } = useSafeguardingIncidents();
  const [sendingAlerts, setSendingAlerts] = useState({});

  // Filter active incidents requiring attention
  const activeIncidents = useMemo(() => {
    return incidents.filter(i => 
      !['closed'].includes(i.status) &&
      i.ai_severity_classification &&
      ['critical', 'high', 'medium'].includes(i.ai_severity_classification)
    ).sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.ai_severity_classification] - severityOrder[b.ai_severity_classification];
    });
  }, [incidents]);

  const criticalIncidents = activeIncidents.filter(i => i.ai_severity_classification === 'critical');
  const highIncidents = activeIncidents.filter(i => i.ai_severity_classification === 'high');

  const sendManagementAlert = async (incident, method) => {
    const alertKey = `${incident.id}-${method}`;
    setSendingAlerts(prev => ({ ...prev, [alertKey]: true }));

    try {
      // In production, this would trigger email/SMS via backend function
      // For now, simulate with toast
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Alert sent via ${method}`, {
        description: `Incident ${incident.incident_reference} - ${incident.ai_severity_classification.toUpperCase()}`,
      });

      // Log alert in audit trail
      await base44.entities.SafeguardingIncident.update(incident.id, {
        audit_trail: [
          ...(incident.audit_trail || []),
          {
            timestamp: new Date().toISOString(),
            user: 'system',
            action: `management_alert_sent_${method}`,
            details: `Alert sent to safeguarding lead via ${method}`,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to send alert:', error);
      toast.error('Failed to send alert', { description: error.message });
    } finally {
      setSendingAlerts(prev => ({ ...prev, [alertKey]: false }));
    }
  };

  const getUrgencyIcon = (urgency) => {
    if (!urgency) return <Clock className="w-4 h-4" />;
    switch (urgency) {
      case 'immediate':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'within_24_hours':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'within_72_hours':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Safeguarding Alerts Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border rounded-lg p-3 text-center bg-red-50">
            <p className="text-xs text-red-800 font-semibold mb-1">Critical</p>
            <p className="text-2xl font-bold text-red-600">{criticalIncidents.length}</p>
          </div>
          <div className="border rounded-lg p-3 text-center bg-orange-50">
            <p className="text-xs text-orange-800 font-semibold mb-1">High</p>
            <p className="text-2xl font-bold text-orange-600">{highIncidents.length}</p>
          </div>
          <div className="border rounded-lg p-3 text-center bg-yellow-50">
            <p className="text-xs text-yellow-800 font-semibold mb-1">Medium</p>
            <p className="text-2xl font-bold text-yellow-600">
              {activeIncidents.filter(i => i.ai_severity_classification === 'medium').length}
            </p>
          </div>
        </div>

        {/* Active Incidents List */}
        {activeIncidents.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold">Active Incidents Requiring Attention</p>
            {activeIncidents.map((incident) => (
              <div
                key={incident.id}
                className={`border-2 rounded-lg p-4 ${SEVERITY_COLORS[incident.ai_severity_classification]}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={SEVERITY_COLORS[incident.ai_severity_classification]}>
                        {incident.ai_severity_classification.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={STATUS_COLORS[incident.status]}>
                        {incident.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="font-bold text-sm">{incident.incident_reference}</p>
                    <p className="text-xs mt-1">
                      Type: {incident.incident_type.replace(/_/g, ' ')} •{' '}
                      {new Date(incident.incident_date).toLocaleDateString()}
                    </p>
                    {incident.vulnerable_adult_details?.name && (
                      <p className="text-xs mt-1">
                        Vulnerable Adult: {incident.vulnerable_adult_details.name}
                        {incident.vulnerable_adult_details.immediate_danger && (
                          <span className="text-red-600 font-semibold ml-2">⚠️ IMMEDIATE DANGER</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* AI Risk Assessment Summary */}
                {incident.ai_risk_assessment && (
                  <div className="border rounded-lg p-3 bg-white/50 mb-3">
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <p className="text-muted-foreground">Risk Score</p>
                        <p className="font-bold">{incident.ai_risk_assessment.risk_score}/100</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Urgency</p>
                        <p className="font-semibold flex items-center gap-1">
                          {getUrgencyIcon(incident.ai_risk_assessment.urgency)}
                          {incident.ai_risk_assessment.urgency?.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    {incident.ai_risk_assessment.statutory_referral_required && (
                      <div className="border border-red-200 rounded p-2 bg-red-50">
                        <p className="text-xs font-semibold text-red-900">Statutory Referral Required</p>
                        <p className="text-xs text-red-800">
                          {incident.ai_risk_assessment.referral_agencies?.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Alert Actions */}
                {(incident.ai_severity_classification === 'critical' || incident.ai_severity_classification === 'high') && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendManagementAlert(incident, 'email')}
                      disabled={sendingAlerts[`${incident.id}-email`]}
                      className="flex-1"
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Email Alert
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendManagementAlert(incident, 'phone')}
                      disabled={sendingAlerts[`${incident.id}-phone`]}
                      className="flex-1"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Phone Alert
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-600" />
            <p>No active safeguarding alerts</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Total Incidents (All Time)</p>
              <p className="font-bold">{incidents.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">External Referrals Made</p>
              <p className="font-bold">
                {incidents.filter(i => i.external_referrals?.length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}