import React from 'react';
import { cn } from '@/lib/utils';

export default function StatusLight({ 
  status = 'idle', // idle, loading, success, error
  label = '',
  size = 'sm' // sm, md, lg
}) {
  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusMap = {
    idle: 'bg-muted-foreground',
    loading: 'bg-yellow-500 animate-pulse',
    success: 'bg-green-500 animate-pulse',
    error: 'bg-destructive animate-pulse'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("rounded-full", sizeMap[size], statusMap[status])} />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}