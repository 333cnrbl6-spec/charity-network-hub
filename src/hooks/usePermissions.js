import { useAuth } from '@/lib/AuthContext';
import { useCallback, useMemo } from 'react';

/**
 * Hook for checking user permissions
 * Supports resource-based and action-based access control
 */
export const usePermissions = () => {
  const { user } = useAuth();
  
  const userRole = useMemo(() => {
    return user?.org_role || user?.role || 'volunteer';
  }, [user]);

  /**
   * Check if user has access to a resource
   * @param {string} resource - Resource identifier (e.g., 'clients', 'safeguarding')
   * @returns {boolean}
   */
  const hasResourceAccess = useCallback((resource) => {
    const roleAccessMap = {
      volunteer: ['jobs', 'sessions', 'profile'],
      coordinator: ['clients', 'volunteers', 'jobs', 'sessions', 'referrals', 'grants', 'field-log', 'library', 'dashboard'],
      manager: ['clients', 'volunteers', 'jobs', 'sessions', 'referrals', 'grants', 'compliance', 'analytics', 'safeguarding', 'dashboard'],
      ceo: ['clients', 'volunteers', 'jobs', 'sessions', 'referrals', 'compliance', 'analytics', 'dashboard', 'branch-ceo', 'network'],
      admin: ['all'],
    };

    const allowedResources = roleAccessMap[userRole] || [];
    if (allowedResources.includes('all')) return true;
    return allowedResources.includes(resource);
  }, [userRole]);

  /**
   * Check if user can perform an action
   * @param {string} action - Action identifier (e.g., 'create_client', 'delete_job')
   * @returns {boolean}
   */
  const hasAction = useCallback((action) => {
    const roleActionMap = {
      volunteer: ['view_job', 'mark_complete', 'view_session'],
      coordinator: ['create_client', 'update_client', 'create_job', 'assign_volunteer', 'view_feedback', 'create_referral'],
      manager: ['create_client', 'update_client', 'delete_client', 'create_job', 'assign_volunteer', 'manage_compliance', 'view_analytics'],
      ceo: ['view_all', 'approve_hiring', 'manage_budget', 'view_analytics'],
      admin: ['all'],
    };

    const allowedActions = roleActionMap[userRole] || [];
    if (allowedActions.includes('all')) return true;
    return allowedActions.includes(action);
  }, [userRole]);

  /**
   * Check multiple conditions
   * @param {object} conditions - { resource?, action?, role? }
   * @returns {boolean}
   */
  const can = useCallback((conditions) => {
    if (!conditions) return false;
    
    if (conditions.role && !conditions.role.includes(userRole)) {
      return false;
    }
    
    if (conditions.resource && !hasResourceAccess(conditions.resource)) {
      return false;
    }
    
    if (conditions.action && !hasAction(conditions.action)) {
      return false;
    }
    
    return true;
  }, [userRole, hasResourceAccess, hasAction]);

  return {
    userRole,
    hasResourceAccess,
    hasAction,
    can,
  };
};