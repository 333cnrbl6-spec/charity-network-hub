import { usePermissions } from '@/hooks/usePermissions';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Conditionally render children based on user permissions
 * Supports resource-based and action-based access control
 */
export default function PermissionGate({
  resource,
  action,
  role,
  fallback = null,
  showDeniedMessage = false,
  children,
}) {
  const { can } = usePermissions();

  const hasAccess = can({
    resource,
    action,
    role: role ? (Array.isArray(role) ? role : [role]) : undefined,
  });

  if (!hasAccess) {
    if (showDeniedMessage) {
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-start gap-3 py-6">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-destructive">Access Denied</p>
              <p className="text-sm text-muted-foreground mt-1">
                You don't have permission to view this resource.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    return fallback;
  }

  return children;
}