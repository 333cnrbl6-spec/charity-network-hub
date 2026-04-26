import React, { useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Component that filters navigation items based on user permissions
 * 
 * Usage:
 * <RoleBasedNav items={navigationItems} />
 */
export default function RoleBasedNav({ items = [] }) {
  const { canView } = usePermissions();

  // Filter navigation items based on viewable resources
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // If item has no resource requirement, always show it
      if (!item.resource) return true;
      // Check if user can view the resource
      return canView(item.resource);
    });
  }, [items, canView]);

  return filteredItems;
}