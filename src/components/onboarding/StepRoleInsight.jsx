import React from 'react';
import { CheckCircle2, Target, Zap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MODULE_DEFINITIONS } from '@/lib/ageukRoles';

const TIER_COLOURS = {
  national:           'bg-purple-100 text-purple-800',
  national_governance:'bg-blue-100 text-blue-800',
  regional:           'bg-indigo-100 text-indigo-800',
  branch_leadership:  'bg-cyan-100 text-cyan-800',
  branch_management:  'bg-teal-100 text-teal-800',
  service_management: 'bg-green-100 text-green-800',
  coordinators:       'bg-yellow-100 text-yellow-800',
  branch_staff:       'bg-orange-100 text-orange-800',
  volunteer:          'bg-rose-100 text-rose-800',
};

export default function StepRoleInsight({ selectedRole, selectedBranch }) {
  if (!selectedRole) return null;
  const colour = TIER_COLOURS[selectedRole.tier] || 'bg-muted text-muted-foreground';

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className={`text-xs ${colour}`}>{selectedRole.tier_label}</Badge>
              <Badge variant="outline" className="text-xs">{selectedBranch?.name || 'Your Branch'}</Badge>
            </div>
            <h4 className="font-bold text-base">{selectedRole.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{selectedRole.description}</p>
          </div>
        </div>

        {/* Key tasks */}
        {selectedRole.key_tasks?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your key responsibilities</p>
            </div>
            <ul className="space-y-1.5">
              {selectedRole.key_tasks.map(task => (
                <li key={task} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modules preview */}
      {selectedRole.modules?.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Modules we'll activate for you
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedRole.modules.map(key => {
              const mod = MODULE_DEFINITIONS[key];
              if (!mod) return null;
              return (
                <span key={key} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {mod.icon} {mod.label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Portal preview */}
      <div className="flex items-start gap-2.5 bg-muted/40 rounded-lg p-3">
        <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Your portal</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            After onboarding you'll land on <code className="bg-muted px-1 rounded">{selectedRole.portal}</code> — a workspace built specifically for your role and level of access.
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        All of this is based on real Age UK job descriptions. Your portal is pre-configured for your day-to-day work.
      </p>
    </div>
  );
}