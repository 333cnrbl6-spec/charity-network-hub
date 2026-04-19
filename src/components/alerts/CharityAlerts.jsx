import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Bell, Clock, Users, Gift, Calendar, ChevronRight, X } from 'lucide-react';

export default function CharityAlerts({ compact = false }) {
  const [dismissed, setDismissed] = useState(new Set());

  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => base44.entities.Client.list() });
  const { data: volunteers = [] } = useQuery({ queryKey: ['volunteers'], queryFn: () => base44.entities.Volunteer.list() });
  const { data: jobs = [] } = useQuery({ queryKey: ['jobs'], queryFn: () => base44.entities.Job.list() });
  const { data: grants = [] } = useQuery({ queryKey: ['grants'], queryFn: () => base44.entities.Grant.list() });
  const { data: sessions = [] } = useQuery({ queryKey: ['sessions'], queryFn: () => base44.entities.Session.list() });
  const { data: compliance = [] } = useQuery({ queryKey: ['compliance'], queryFn: () => base44.entities.ComplianceRecord.list() });

  const alerts = useMemo(() => {
    const now = new Date();
    const result = [];

    // Lapsed clients (no job in 90 days)
    const recentClientIds = new Set(
      jobs.filter(j => (now - new Date(j.scheduled_date)) / (1000 * 60 * 60 * 24) < 90).map(j => j.client_id)
    );
    const lapsed = clients.filter(c => c.status === 'active' && !recentClientIds.has(c.id));
    if (lapsed.length > 0) {
      result.push({
        id: 'lapsed-clients',
        type: 'warning',
        icon: Users,
        title: `${lapsed.length} client${lapsed.length > 1 ? 's' : ''} may be lapsing`,
        desc: `No contact in 90+ days: ${lapsed.slice(0, 3).map(c => c.full_name).join(', ')}${lapsed.length > 3 ? ` +${lapsed.length - 3} more` : ''}`,
        severity: 'medium',
      });
    }

    // Grant deadlines within 30 days
    grants.filter(g => g.status === 'applied' && g.date_awarded).forEach(g => {
      const days = Math.ceil((new Date(g.date_awarded) - now) / (1000 * 60 * 60 * 24));
      if (days >= 0 && days <= 30) {
        result.push({
          id: `grant-deadline-${g.id}`,
          type: 'deadline',
          icon: Gift,
          title: `Grant deadline in ${days} day${days !== 1 ? 's' : ''}`,
          desc: `${g.grant_name}${g.funder ? ` — ${g.funder}` : ''} (£${(g.amount_awarded || 0).toLocaleString()})`,
          severity: days <= 7 ? 'high' : 'medium',
        });
      }
    });

    // Uncovered volunteer shifts (jobs scheduled with no volunteer)
    const uncovered = jobs.filter(j => j.status === 'scheduled' && !j.volunteer_id && new Date(j.scheduled_date) > now);
    if (uncovered.length > 0) {
      result.push({
        id: 'uncovered-shifts',
        type: 'warning',
        icon: Clock,
        title: `${uncovered.length} uncovered shift${uncovered.length > 1 ? 's' : ''}`,
        desc: 'Upcoming jobs have no assigned volunteer',
        severity: 'high',
      });
    }

    // Compliance non-compliant
    const nonCompliant = compliance.filter(c => c.status === 'non_compliant');
    if (nonCompliant.length > 0) {
      result.push({
        id: 'non-compliant',
        type: 'critical',
        icon: AlertCircle,
        title: `${nonCompliant.length} compliance item${nonCompliant.length > 1 ? 's' : ''} need attention`,
        desc: nonCompliant.slice(0, 2).map(c => c.compliance_area?.replace(/_/g, ' ')).join(', '),
        severity: 'critical',
      });
    }

    // DBS expiry within 60 days
    const dbsExpiring = volunteers.filter(v => {
      if (!v.dbs_expiry) return false;
      const days = Math.ceil((new Date(v.dbs_expiry) - now) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 60;
    });
    if (dbsExpiring.length > 0) {
      result.push({
        id: 'dbs-expiry',
        type: 'deadline',
        icon: Calendar,
        title: `${dbsExpiring.length} DBS check${dbsExpiring.length > 1 ? 's' : ''} expiring soon`,
        desc: dbsExpiring.slice(0, 3).map(v => v.full_name).join(', '),
        severity: 'medium',
      });
    }

    return result.filter(a => !dismissed.has(a.id));
  }, [clients, volunteers, jobs, grants, sessions, compliance, dismissed]);

  const severityConfig = {
    critical: { bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-800', icon: 'text-red-600' },
    high: { bg: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-800', icon: 'text-orange-600' },
    medium: { bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', icon: 'text-yellow-600' },
  };

  if (alerts.length === 0) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4 text-amber-500" />
        <Badge className="bg-red-100 text-red-800">{alerts.length} alert{alerts.length > 1 ? 's' : ''}</Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="w-4 h-4 text-amber-500" />
          Alerts & Reminders
          <Badge className="bg-red-100 text-red-800 ml-1">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map(alert => {
          const cfg = severityConfig[alert.severity];
          return (
            <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg}`}>
              <alert.icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.icon}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <Badge className={`${cfg.badge} text-xs`}>{alert.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.desc}</p>
              </div>
              <button onClick={() => setDismissed(prev => new Set([...prev, alert.id]))} className="shrink-0 p-1 hover:bg-black/10 rounded">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}