// Fine-grained permission definitions by role
export const PERMISSIONS = {
  // Volunteer permissions
  volunteer: {
    view: ['jobs', 'sessions', 'profile'],
    actions: ['apply_for_job', 'view_my_jobs', 'submit_feedback', 'update_availability'],
  },
  // Coordinator permissions
  coordinator: {
    view: ['clients', 'volunteers', 'jobs', 'sessions', 'grants', 'referrals', 'field-log', 'library'],
    actions: [
      'create_job',
      'assign_volunteer',
      'update_client',
      'create_referral',
      'view_analytics',
      'manage_assets',
      'export_data',
    ],
  },
  // Manager permissions
  manager: {
    view: ['clients', 'volunteers', 'jobs', 'sessions', 'grants', 'compliance', 'analytics', 'referrals', 'field-log', 'library', 'safeguarding'],
    actions: [
      'create_job',
      'assign_volunteer',
      'update_client',
      'create_referral',
      'view_analytics',
      'manage_assets',
      'export_data',
      'manage_compliance',
      'view_incidents',
      'generate_reports',
    ],
  },
  // Branch CEO permissions
  ceo: {
    view: ['all'],
    actions: [
      'create_job',
      'assign_volunteer',
      'update_client',
      'create_referral',
      'view_analytics',
      'manage_assets',
      'export_data',
      'manage_compliance',
      'view_incidents',
      'generate_reports',
      'manage_users',
      'approve_changes',
    ],
  },
  // Platform admin (full access)
  admin: {
    view: ['all'],
    actions: ['all'],
  },
};

/**
 * Check if a user role has permission to view a resource
 */
export const canViewResource = (userRole, resource) => {
  const rolePerms = PERMISSIONS[userRole] || PERMISSIONS.volunteer;
  if (rolePerms.view.includes('all')) return true;
  return rolePerms.view.includes(resource);
};

/**
 * Check if a user role can perform an action
 */
export const canPerformAction = (userRole, action) => {
  const rolePerms = PERMISSIONS[userRole] || PERMISSIONS.volunteer;
  if (rolePerms.actions.includes('all')) return true;
  return rolePerms.actions.includes(action);
};

/**
 * Get all viewable resources for a user role
 */
export const getViewableResources = (userRole) => {
  const rolePerms = PERMISSIONS[userRole] || PERMISSIONS.volunteer;
  if (rolePerms.view.includes('all')) {
    return Object.keys(PERMISSIONS[userRole].view);
  }
  return rolePerms.view;
};

/**
 * Get all available actions for a user role
 */
export const getAvailableActions = (userRole) => {
  const rolePerms = PERMISSIONS[userRole] || PERMISSIONS.volunteer;
  if (rolePerms.actions.includes('all')) {
    return Object.values(PERMISSIONS).flatMap(p => p.actions);
  }
  return rolePerms.actions;
};