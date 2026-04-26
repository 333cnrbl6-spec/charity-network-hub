import React from 'react';
import { AlertCircle } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Wrapper component that gates content based on user permissions
 * 
 * Usage:
 * <PermissionGate resource="clients">
 *   <ClientsList />
 * </PermissionGate>
 * 
 * Or with actions:
 * <PermissionGate action="create_job">
 *   <CreateJobButton />
 * </PermissionGate>
 */
export default function PermissionGate({
  children,
  resource,
  action,
  fallback = null,
  showDeniedMessage = true,
}) {
  const { canView, canPerform } = usePermissions();

  // Check permission based on resource or action
  const hasPermission = resource ? canView(resource) : action ? canPerform(action) : true;

  if (!hasPermission) {
    if (fallback) {
      return fallback;
    }

    if (!showDeniedMessage) {
      return null;
    }

    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center gap-3 py-4">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Access Denied</p>
            <p className="text-xs text-muted-foreground">
              You don't have permission to {resource ? `view ${resource}` : `perform this action`}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return children;
}