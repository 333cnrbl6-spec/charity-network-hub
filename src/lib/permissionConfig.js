/**
 * Navigation config with permission gates
 * Each nav item can have a 'resource' field that gates visibility
 */
export const navConfig = {
  volunteer: [
    { label: 'My Jobs', path: '/jobs', resource: 'jobs', icon: 'Briefcase' },
    { label: 'Sessions', path: '/sessions', resource: 'sessions', icon: 'Calendar' },
    { label: 'Profile', path: '/profile', resource: 'profile', icon: 'User' },
  ],
  coordinator: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutGrid' },
    { label: 'Clients', path: '/clients', resource: 'clients', icon: 'Users' },
    { label: 'Volunteers', path: '/volunteers', resource: 'volunteers', icon: 'Users2' },
    { label: 'Jobs', path: '/jobs', resource: 'jobs', icon: 'Briefcase' },
    { label: 'Referrals', path: '/referrals', resource: 'referrals', icon: 'Share2' },
    { label: 'Sessions', path: '/sessions', resource: 'sessions', icon: 'Calendar' },
    { label: 'Grants', path: '/grants', resource: 'grants', icon: 'Gift' },
    { label: 'Field Log', path: '/field-log', resource: 'field-log', icon: 'Map' },
    { label: 'Asset Library', path: '/library', resource: 'library', icon: 'Library' },
  ],
  manager: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutGrid' },
    { label: 'Clients', path: '/clients', resource: 'clients', icon: 'Users' },
    { label: 'Volunteers', path: '/volunteers', resource: 'volunteers', icon: 'Users2' },
    { label: 'Jobs', path: '/jobs', resource: 'jobs', icon: 'Briefcase' },
    { label: 'Referrals', path: '/referrals', resource: 'referrals', icon: 'Share2' },
    { label: 'Compliance', path: '/compliance', resource: 'compliance', icon: 'CheckCircle' },
    { label: 'Analytics', path: '/analytics', resource: 'analytics', icon: 'BarChart3' },
    { label: 'Safeguarding', path: '/safeguarding', resource: 'safeguarding', icon: 'AlertTriangle' },
  ],
  ceo: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutGrid' },
    { label: 'Branch Overview', path: '/branch-ceo', icon: 'Building' },
    { label: 'Network', path: '/network', icon: 'Globe' },
    { label: 'Clients', path: '/clients', resource: 'clients', icon: 'Users' },
    { label: 'Volunteers', path: '/volunteers', resource: 'volunteers', icon: 'Users2' },
    { label: 'Compliance', path: '/compliance', resource: 'compliance', icon: 'CheckCircle' },
    { label: 'Analytics', path: '/analytics', resource: 'analytics', icon: 'BarChart3' },
  ],
  admin: [
    { label: 'National Dashboard', path: '/', icon: 'Globe' },
    { label: 'Platform Admin', path: '/platform-admin', icon: 'Settings' },
    { label: 'Tenants', path: '/my-organisation', icon: 'Building2' },
    { label: 'Network', path: '/network', icon: 'Network' },
  ],
};

/**
 * Entity-level field permissions
 * Restricts which fields users can see/edit on specific entities
 */
export const fieldPermissions = {
  Client: {
    volunteer: {
      view: ['full_name', 'phone', 'email', 'address'],
      edit: [],
    },
    coordinator: {
      view: ['full_name', 'phone', 'email', 'address', 'postcode', 'date_of_birth', 'key_worker', 'notes'],
      edit: ['full_name', 'phone', 'email', 'address', 'postcode', 'notes'],
    },
    manager: {
      view: ['all'],
      edit: ['all'],
    },
    ceo: {
      view: ['all'],
      edit: ['all'],
    },
    admin: {
      view: ['all'],
      edit: ['all'],
    },
  },
  SafeguardingIncident: {
    volunteer: {
      view: [],
      edit: [],
    },
    coordinator: {
      view: ['incident_reference', 'incident_date', 'incident_type', 'status'],
      edit: [],
    },
    manager: {
      view: ['all'],
      edit: ['investigation_notes', 'status', 'outcome'],
    },
    ceo: {
      view: ['all'],
      edit: ['all'],
    },
    admin: {
      view: ['all'],
      edit: ['all'],
    },
  },
};

/**
 * Check if a user can view a specific field
 */
export const canViewField = (entity, field, userRole) => {
  const entityPerms = fieldPermissions[entity]?.[userRole];
  if (!entityPerms) return false;
  
  if (entityPerms.view.includes('all')) return true;
  return entityPerms.view.includes(field);
};

/**
 * Check if a user can edit a specific field
 */
export const canEditField = (entity, field, userRole) => {
  const entityPerms = fieldPermissions[entity]?.[userRole];
  if (!entityPerms) return false;
  
  if (entityPerms.edit.includes('all')) return true;
  return entityPerms.edit.includes(field);
};