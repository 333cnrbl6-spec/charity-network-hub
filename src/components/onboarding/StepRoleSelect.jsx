import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ROLE_TAXONOMY, MODULE_DEFINITIONS } from '@/lib/ageukRoles';
import { Badge } from '@/components/ui/badge';

const TIER_COLOURS = {
  national:           'bg-purple-100 text-purple-800 border-purple-200',
  national_governance:'bg-blue-100 text-blue-800 border-blue-200',
  regional:           'bg-indigo-100 text-indigo-800 border-indigo-200',
  branch_leadership:  'bg-cyan-100 text-cyan-800 border-cyan-200',
  branch_management:  'bg-teal-100 text-teal-800 border-teal-200',
  service_management: 'bg-green-100 text-green-800 border-green-200',
  coordinators:       'bg-yellow-100 text-yellow-800 border-yellow-200',
  branch_staff:       'bg-orange-100 text-orange-800 border-orange-200',
  volunteer:          'bg-rose-100 text-rose-800 border-rose-200',
};

export default function StepRoleSelect({ selectedRole, onSelect }) {
  const [search, setSearch] = useState('');
  const [expandedTier, setExpandedTier] = useState(null);

  const filtered = useMemo(() => {
    if (!search) return ROLE_TAXONOMY;
    const q = search.toLowerCase();
    return ROLE_TAXONOMY.map(tier => ({
      ...tier,
      roles: tier.roles.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      ),
    })).filter(t => t.roles.length > 0);
  }, [search]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select your specific job title. We'll configure your workspace, modules, and access level automatically.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search roles, e.g. 'befriending', 'CEO', 'social prescriber'…"
          value={search}
          onChange={e => { setSearch(e.target.value); setExpandedTier(null); }}
          className="w-full pl-9 pr-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {selectedRole && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{selectedRole.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedRole.tier_label} · {selectedRole.department}</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedRole.modules.slice(0, 4).map(m => (
              <span key={m} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                {MODULE_DEFINITIONS[m]?.icon} {MODULE_DEFINITIONS[m]?.label}
              </span>
            ))}
            {selectedRole.modules.length > 4 && (
              <span className="text-xs text-muted-foreground">+{selectedRole.modules.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
        {filtered.map(tier => {
          const isExpanded = search ? true : expandedTier === tier.tier;
          const colour = TIER_COLOURS[tier.tier] || 'bg-muted text-muted-foreground';
          return (
            <div key={tier.tier} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedTier(isExpanded ? null : tier.tier)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs border ${colour}`}>{tier.tier_label}</Badge>
                  <span className="text-xs text-muted-foreground">{tier.roles.length} role{tier.roles.length !== 1 ? 's' : ''}</span>
                </div>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </button>
              {isExpanded && (
                <div className="divide-y divide-border/50">
                  {tier.roles.map(role => {
                    const isSelected = selectedRole?.id === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => onSelect({ ...role, tier: tier.tier, tier_label: tier.tier_label, org_role: tier.org_role, portal: tier.portal })}
                        className={`w-full text-left px-3 py-2.5 transition-all ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>{role.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{role.description}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}