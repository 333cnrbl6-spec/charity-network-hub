import { useAuth } from '@/lib/AuthContext';
import { canViewField, canEditField } from '@/lib/permissionConfig';

/**
 * Hook to check field-level permissions for entities
 */
export const useFieldPermissions = (entityName) => {
  const { user } = useAuth();
  const userRole = user?.org_role || user?.role || 'volunteer';

  return {
    userRole,
    /**
     * Check if user can view a specific field
     */
    canViewField: (field) => canViewField(entityName, field, userRole),
    /**
     * Check if user can edit a specific field
     */
    canEditField: (field) => canEditField(entityName, field, userRole),
    /**
     * Filter object to only include viewable fields
     */
    filterViewableFields: (data) => {
      if (!data || typeof data !== 'object') return data;
      return Object.keys(data).reduce((acc, field) => {
        if (canViewField(entityName, field, userRole)) {
          acc[field] = data[field];
        }
        return acc;
      }, {});
    },
  };
};