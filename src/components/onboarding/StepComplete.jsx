import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { MODULE_DEFINITIONS } from '@/lib/ageukRoles';
import { REGIONS } from '@/lib/ageukBranches';

export default function StepComplete({ selectedBranch, selectedRole, personalInfo, selectedModules, workspaceConfig, dataChoice, dataImported }) {
  const region = selectedBranch ? REGIONS[selectedBranch.region] : null;

  const summary = [
    selectedBranch && { label: 'Branch', value: `${selectedBranch.name} (${region?.label})` },
    selectedRole && { label: 'Role', value: selectedRole.title },
    personalInfo?.full_name && { label: 'Name', value: personalInfo.full_name },
    workspaceConfig?.workspace && { label: 'Workspace', value: `${workspaceConfig.workspace} view` },
    selectedModules?.size > 0 && { label: 'Modules', value: `${selectedModules.size} enabled` },
    dataChoice && { label: 'Data', value: dataChoice === 'import' && dataImported ? 'Your data imported & mapped' : dataChoice === 'fresh' ? 'Starting fresh' : 'Demo data loaded' },
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
        <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
        <h4 className="font-bold text-green-900 text-xl">You're all set!</h4>
        <p className="text-sm text-green-800">
          Your portal is configured and ready. Everything is personalised to your role at {selectedBranch?.name || 'your branch'}.
        </p>
        {selectedRole?.portal && (
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-900 text-sm px-3 py-1.5 rounded-full">
            <ArrowRight className="w-3.5 h-3.5" />
            Heading to: <code className="font-mono text-xs">{selectedRole.portal}</code>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="border border-border rounded-lg divide-y divide-border/50">
        {summary.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between px-4 py-2.5 gap-3">
            <span className="text-xs text-muted-foreground flex-shrink-0 pt-0.5 w-20">{label}</span>
            <span className="text-sm font-medium text-right">{value}</span>
          </div>
        ))}
      </div>

      {/* Module badges */}
      {selectedModules?.size > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[...selectedModules].map(key => {
            const mod = MODULE_DEFINITIONS[key];
            return mod ? (
              <span key={key} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {mod.icon} {mod.label}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}