import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DemoDataWipeConfirm({ onConfirm, onSkip }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900 text-sm">Demo data is currently in your system</p>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            Your portal was pre-loaded with sample clients, volunteers, jobs, sessions and grants so you could explore it. 
            Before importing your real data, we need to clear all of this demo data — otherwise your real records will mix with fake ones.
          </p>
        </div>
      </div>

      <div className="border border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold">What will be deleted:</p>
        <ul className="space-y-2">
          {[
            { icon: '👴', label: 'Sample service users / clients' },
            { icon: '🔨', label: 'Sample volunteers & handypeople' },
            { icon: '📅', label: 'Sample jobs & appointments' },
            { icon: '🎯', label: 'Sample group sessions' },
            { icon: '💰', label: 'Sample grants & benefits' },
          ].map(({ icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{icon}</span> {label}
            </li>
          ))}
        </ul>
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={e => setConfirmed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-red-600 cursor-pointer"
        />
        <span className="text-sm text-foreground leading-snug">
          I understand this will permanently delete all demo data and cannot be undone. I'm ready to import my real data.
        </span>
      </label>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onSkip}
          className="flex-1"
        >
          Keep demo data for now
        </Button>
        <Button
          disabled={!confirmed}
          onClick={onConfirm}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Clear demo data & continue
        </Button>
      </div>
    </div>
  );
}