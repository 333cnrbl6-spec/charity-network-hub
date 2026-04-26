import { useAuth } from '@/lib/AuthContext';
import { canViewResource, canPerformAction, getViewableResources, getAvailableActions } from '@/lib/permissions';

/**
 * Hook to check permissions based on current user role
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const userRole = user?.org_role || user?.role || 'volunteer';

  return {
    user,
    userRole,
    /**
     * Check if user can view a specific resource
     */
    canView: (resource) => canViewResource(userRole, resource),
    /**
     * Check if user can perform a specific action
     */
    canPerform: (action) => canPerformAction(userRole, action),
    /**
     * Get all viewable resources for user
     */
    viewableResources: getViewableResources(userRole),
    /**
     * Get all available actions for user
     */
    availableActions: getAvailableActions(userRole),
  };
};