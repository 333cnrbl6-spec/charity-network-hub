import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingDown, Calendar, Users, FileText, Bell } from 'lucide-react';

const ALERT_ICONS = {
  donor_lapsed: TrendingDown,
  grant_deadline: Calendar,
  campaign_milestone: Bell,
  volunteer_uncovered: Users,
  filing_deadline: FileText
};

const SEVERITY_COLORS = {
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-yellow-50 border-yellow-200',
  critical: 'bg-red-50 border-red-200'
};

const SEVERITY_BADGE = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800'
};

export default function AlertsDashboard({ alerts = [], donors = [], grants = [], volunteers = [], charityData }) {
  // Generate dynamic alerts
  const dynamicAlerts = useMemo(() => {
    const generated = [];

    // Lapsed donors (no donation in 6 months)
    donors.forEach(donor => {
      if (donor.status === 'lapsed') {
        generated.push({
          id: `lapsed-${donor.id}`,
          alert_type: 'donor_lapsed',
          title: `Donor "${donor.name}" may be inactive`,
          description: `No donation since ${new Date(donor.last_donation_date).toLocaleDateString()}. Consider re-engagement.`,
          severity: 'warning',
          related_id: donor.id
        });
      }
    });

    // Grant deadlines (30 days or less)
    grants.forEach(grant => {
      if (grant.status !== 'awarded' && grant.status !== 'rejected') {
        const deadline = new Date(grant.deadline);
        const daysUntil = (deadline - new Date()) / (1000 * 60 * 60 * 24);
        if (daysUntil > 0 && daysUntil <= 30) {
          generated.push({
            id: `deadline-${grant.id}`,
            alert_type: 'grant_deadline',
            title: `Grant deadline: "${grant.grant_name}"`,
            description: `Deadline in ${Math.ceil(daysUntil)} day${Math.ceil(daysUntil) > 1 ? 's' : ''}`,
            severity: daysUntil <= 7 ? 'critical' : 'warning',
            related_id: grant.id
          });
        }
      }
    });

    // Volunteer shortages
    const availableVolunteers = volunteers.filter(v => v.availability === 'available').length;
    if (availableVolunteers < 3) {
      generated.push({
        id: 'volunteer-shortage',
        alert_type: 'volunteer_uncovered',
        title: 'Low volunteer availability',
        description: `Only ${availableVolunteers} volunteer(s) currently available`,
        severity: 'warning',
        related_id: null
      });
    }

    return generated;
  }, [donors, grants, volunteers]);

  const allAlerts = [...alerts, ...dynamicAlerts].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alerts & Notifications
          </CardTitle>
          <Badge variant="secondary">{allAlerts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {allAlerts.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No alerts. Everything is going great! 🎉</p>
        ) : (
          <div className="space-y-3">
            {allAlerts.map(alert => {
              const Icon = ALERT_ICONS[alert.alert_type] || AlertCircle;
              return (
                <div key={alert.id} className={`border rounded-lg p-4 ${SEVERITY_COLORS[alert.severity]}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <Badge className={SEVERITY_BADGE[alert.severity]}>{alert.severity}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{alert.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}