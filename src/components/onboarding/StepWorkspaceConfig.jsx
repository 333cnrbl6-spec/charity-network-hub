import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const WORKSPACE_OPTIONS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard View',  desc: "KPIs, today's jobs, team status and alerts at a glance", badge: 'Recommended' },
  { id: 'list',      icon: '📋', label: 'List View',       desc: 'Detailed records list with search and filters',          badge: 'Clean & simple' },
  { id: 'calendar',  icon: '🗓️', label: 'Calendar View',   desc: 'Visual schedule of all bookings and assignments',        badge: 'Plan ahead' },
  { id: 'map',       icon: '🗺️', label: 'Map View',        desc: 'Geographic view of client and job locations',            badge: 'Field-based' },
];

const NOTIFICATION_OPTIONS = [
  { id: 'all',        label: 'All notifications',          desc: 'Jobs, compliance alerts, team updates, messages' },
  { id: 'important',  label: 'Important only',             desc: 'Urgent jobs, compliance deadlines, safeguarding' },
  { id: 'minimal',    label: 'Minimal',                    desc: 'Only critical safeguarding and system alerts' },
];

export default function StepWorkspaceConfig({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: val });

  return (
    <div className="space-y-5">
      {/* Default view */}
      <div>
        <p className="text-sm font-semibold mb-2">Default workspace layout</p>
        <div className="space-y-2">
          {WORKSPACE_OPTIONS.map(opt => {
            const active = config.workspace === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => update('workspace', opt.id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition-all ${
                  active ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:border-primary/30'
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-xs hidden sm:inline-flex">{opt.badge}</Badge>
                  {active && <CheckCircle2 className="w-4 h-4 text-primary" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div>
        <p className="text-sm font-semibold mb-2">Notification preference</p>
        <div className="space-y-1.5">
          {NOTIFICATION_OPTIONS.map(opt => {
            const active = config.notifications === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => update('notifications', opt.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                  active ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'
                }`}
              >
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                {active && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">All preferences can be changed in your profile settings at any time.</p>
    </div>
  );
}