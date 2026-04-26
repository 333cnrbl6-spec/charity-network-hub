import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';

/**
 * Button wrapper that enforces permission-based access
 * Can hide or disable button based on user permissions
 */
export default function PermissionButton({
  action,
  resource,
  role,
  hideIfDenied = false,
  children,
  ...buttonProps
}) {
  const { can } = usePermissions();

  const hasAccess = can({
    action,
    resource,
    role: role ? (Array.isArray(role) ? role : [role]) : undefined,
  });

  if (!hasAccess && hideIfDenied) {
    return null;
  }

  return (
    <Button
      disabled={!hasAccess}
      title={!hasAccess ? 'You do not have permission to perform this action' : undefined}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}