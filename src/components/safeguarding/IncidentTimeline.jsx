import React, { useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  User,
  MessageSquare,
  ArrowRight,
  Shield,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const ACTION_ICONS = {
  incident_reported: AlertTriangle,
  status_changed: ArrowRight,
  file_uploaded: FileText,
  comment_added: MessageSquare,
  investigation_started: Shield,
  file_accessed: Eye,
  investigation_note_added: FileText,
  external_referral_made: ArrowRight,
  closed: CheckCircle2,
  default: Clock,
};

const ACTION_COLORS = {
  incident_reported: 'bg-red-100 text-red-700 border-red-200',
  status_changed: 'bg-blue-100 text-blue-700 border-blue-200',
  file_uploaded: 'bg-green-100 text-green-700 border-green-200',
  comment_added: 'bg-purple-100 text-purple-700 border-purple-200',
  investigation_started: 'bg-orange-100 text-orange-700 border-orange-200',
  file_accessed: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  investigation_note_added: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  external_referral_made: 'bg-red-100 text-red-700 border-red-200',
  closed: 'bg-green-100 text-green-700 border-green-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
};

function getActionLabel(action) {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function IncidentTimeline({ incident }) {
  const timelineEntries = useMemo(() => {
    const entries = [];

    // Add initial incident report
    entries.push({
      timestamp: incident.incident_date,
      action: 'incident_reported',
      user: incident.reported_by_name,
      details: `Incident reported by ${incident.reported_by_name} (${incident.reported_by_role})`,
      priority: 'high',
    });

    // Add audit trail entries
    if (incident.audit_trail && Array.isArray(incident.audit_trail)) {
      entries.push(
        ...incident.audit_trail.map(entry => ({
          timestamp: entry.timestamp,
          action: entry.action,
          user: entry.user,
          details: entry.details,
          priority: entry.action.includes('critical') ? 'high' : 'normal',
        }))
      );
    }

    // Add AI assessment if available
    if (incident.ai_severity_classification) {
      entries.push({
        timestamp: incident.created_date,
        action: 'status_changed',
        user: 'System',
        details: `AI severity classification: ${incident.ai_severity_classification.toUpperCase()}`,
        priority: incident.ai_severity_classification === 'critical' ? 'high' : 'normal',
      });
    }

    // Sort chronologically
    return entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [incident]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Incident Timeline & Audit Trail
        </CardTitle>
        <CardDescription>
          Complete chronological record of {incident.incident_reference}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent" />

          {/* Timeline Entries */}
          <div className="space-y-6 pl-20">
            {timelineEntries.map((entry, idx) => {
              const Icon = ACTION_ICONS[entry.action] || ACTION_ICONS.default;
              const colorClass = ACTION_COLORS[entry.action] || ACTION_COLORS.default;

              return (
                <div key={idx} className="relative">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-16 top-1 w-4 h-4 rounded-full border-2 border-background ${
                      entry.priority === 'high' ? 'bg-red-600' : 'bg-primary'
                    }`}
                  />

                  {/* Entry Card */}
                  <div className={`border rounded-lg p-4 ${colorClass}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">{getActionLabel(entry.action)}</p>
                          <p className="text-xs opacity-75">
                            {format(new Date(entry.timestamp), 'PPp')}
                          </p>
                        </div>
                      </div>
                      {entry.priority === 'high' && (
                        <Badge variant="destructive" className="ml-2">
                          High Priority
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm mb-2">{entry.details}</p>

                    <div className="flex items-center gap-2 text-xs opacity-75">
                      <User className="w-3 h-3" />
                      <span>{entry.user}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Summary */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>{timelineEntries.length}</strong> events recorded • First event:{' '}
              {format(new Date(timelineEntries[0]?.timestamp), 'PPp')} • Last event:{' '}
              {format(new Date(timelineEntries[timelineEntries.length - 1]?.timestamp), 'PPp')}
            </p>
          </div>

          {/* Compliance Notice */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>📋 Audit Trail:</strong> This timeline is automatically maintained and
              immutable. All actions are logged with timestamps and user details for compliance and
              data protection requirements.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}