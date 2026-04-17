import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function KPICard({ title, value, icon: Icon, trend, trendLabel, className }) {
  return (
    <Card className={cn("p-6 relative overflow-hidden group hover:shadow-md transition-shadow", className)}>
      <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-primary/5 group-hover:bg-primary/8 transition-colors" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-primary" />
          </div>
        </div>
        <p className="text-3xl font-heading font-bold tracking-tight">{value}</p>
        {trend !== undefined && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={cn(
              "text-xs font-semibold px-1.5 py-0.5 rounded",
              trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}