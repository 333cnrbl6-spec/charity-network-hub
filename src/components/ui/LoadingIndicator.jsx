import React from 'react';
import { cn } from '@/lib/utils';

export default function LoadingIndicator({ 
  isLoading = false, 
  message = 'Loading...', 
  progress = null,
  className = '' 
}) {
  if (!isLoading) return null;

  return (
    <div className={cn("fixed bottom-4 right-4 bg-card border border-border rounded-lg shadow-lg p-4 min-w-80", className)}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full border-2 border-border border-t-primary animate-spin" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
          {progress !== null && (
            <div className="mt-2 w-full bg-border rounded-full h-2 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}