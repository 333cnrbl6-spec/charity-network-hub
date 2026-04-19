import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { MODULE_DEFINITIONS } from '@/lib/ageukRoles';

export default function StepModuleSelect({ selectedRole, selectedModules, onToggle }) {
  // Pre-selected from role = recommended, others = optional extras
  const recommended = selectedRole?.modules || [];
  const allModuleKeys = Object.keys(MODULE_DEFINITIONS);
  const extras = allModuleKeys.filter(k => !recommended.includes(k));

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Based on your role as <strong>{selectedRole?.title || 'your role'}</strong>, we've pre-selected the modules you need. You can add extras below.
      </p>

      {/* Recommended modules */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Recommended for your role
        </p>
        <div className="space-y-1.5">
          {recommended.map(key => {
            const mod = MODULE_DEFINITIONS[key];
            if (!mod) return null;
            const active = selectedModules.has(key);
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                  active
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/30 hover:border-primary/40'
                }`}
              >
                <span className="text-lg flex-shrink-0">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{mod.label}</p>
                  <p className="text-xs text-muted-foreground">{mod.desc}</p>
                </div>
                {active
                  ? <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  : <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                }
              </button>
            );
          })}
        </div>
      </div>

      {/* Extra modules */}
      {extras.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Additional modules (optional)
          </p>
          <div className="space-y-1.5">
            {extras.map(key => {
              const mod = MODULE_DEFINITIONS[key];
              if (!mod) return null;
              const active = selectedModules.has(key);
              return (
                <button
                  key={key}
                  onClick={() => onToggle(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                    active
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 bg-muted/10 hover:border-primary/30'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{mod.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{mod.label}</p>
                    <p className="text-xs text-muted-foreground">{mod.desc}</p>
                  </div>
                  {active
                    ? <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    : <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                  }
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">Modules can be changed any time from your profile settings.</p>
    </div>
  );
}