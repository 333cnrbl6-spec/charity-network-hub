import React from 'react';
import { User, Mail, Phone, Building2 } from 'lucide-react';

export default function StepPersonalInfo({ data, onChange, selectedBranch, selectedRole }) {
  const update = (field, value) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Tell us a bit about yourself so we can personalise your portal and connect you to your branch team.
      </p>

      {/* Context bar */}
      {(selectedBranch || selectedRole) && (
        <div className="bg-muted/40 border border-border rounded-lg p-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {selectedBranch && (
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> {selectedBranch.name}
            </span>
          )}
          {selectedRole && (
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {selectedRole.title}
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {/* Full name */}
        <div>
          <label className="text-sm font-medium mb-1 block">Full Name *</label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={data.full_name || ''}
              onChange={e => update('full_name', e.target.value)}
              placeholder="e.g. Sarah Johnson"
              className="w-full pl-9 pr-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Work email */}
        <div>
          <label className="text-sm font-medium mb-1 block">Work Email *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={data.work_email || ''}
              onChange={e => update('work_email', e.target.value)}
              placeholder="e.g. sarah.johnson@ageukbury.org.uk"
              className="w-full pl-9 pr-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium mb-1 block">Work Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={data.phone || ''}
              onChange={e => update('phone', e.target.value)}
              placeholder="e.g. 0161 705 5000"
              className="w-full pl-9 pr-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Line manager */}
        <div>
          <label className="text-sm font-medium mb-1 block">Line Manager's Name</label>
          <input
            type="text"
            value={data.line_manager || ''}
            onChange={e => update('line_manager', e.target.value)}
            placeholder="e.g. Jane Smith (Operations Manager)"
            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Start date */}
        <div>
          <label className="text-sm font-medium mb-1 block">Start Date</label>
          <input
            type="date"
            value={data.start_date || ''}
            onChange={e => update('start_date', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* How heard */}
        <div>
          <label className="text-sm font-medium mb-1 block">How did you hear about this platform?</label>
          <select
            value={data.referral_source || ''}
            onChange={e => update('referral_source', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          >
            <option value="">Select…</option>
            <option value="line_manager">My line manager</option>
            <option value="ceo">Branch CEO</option>
            <option value="national_hub">National hub / Age UK national</option>
            <option value="colleague">A colleague</option>
            <option value="email">Email communication</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}