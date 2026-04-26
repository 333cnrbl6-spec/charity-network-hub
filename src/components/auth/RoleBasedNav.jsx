import { usePermissions } from '@/hooks/usePermissions';
import { useMemo } from 'react';

/**
 * Filter navigation items based on user role
 * Hides menu items the user doesn't have access to
 */
export default function RoleBasedNav({ items, renderItem }) {
  const { hasResourceAccess } = usePermissions();

  const visibleItems = useMemo(() => {
    return items.filter(item => {
      // If item has no resource requirement, always show it
      if (!item.resource) return true;
      // Otherwise, check if user has access to the resource
      return hasResourceAccess(item.resource);
    });
  }, [items, hasResourceAccess]);

  return (
    <>
      {visibleItems.map((item, idx) => (
        <div key={idx}>
          {renderItem(item)}
        </div>
      ))}
    </>
  );
}