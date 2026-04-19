import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Shared KPI card used across Dashboard, CharityAnalytics, ImpactDashboard, etc.
 */
export default function KPICard({ icon: IconComp, label, value, sub, color = 'text-primary' }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          {IconComp && (
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <IconComp className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}