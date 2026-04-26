import React from 'react';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Button wrapper that disables/hides based on action permissions
 * 
 * Usage:
 * <PermissionButton action="create_job" onClick={handleCreate}>
 *   Create Job
 * </PermissionButton>
 */
export default function PermissionButton({
  action,
  children,
  hideIfDenied = false,
  ...props
}) {
  const { canPerform } = usePermissions();
  const hasPermission = action ? canPerform(action) : true;

  if (hideIfDenied && !hasPermission) {
    return null;
  }

  return (
    <Button
      {...props}
      disabled={!hasPermission || props.disabled}
      title={!hasPermission ? `You don't have permission to perform this action` : props.title}
    >
      {children}
    </Button>
  );
}