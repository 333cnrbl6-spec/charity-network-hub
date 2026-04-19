/**
 * Age UK Organisational Hierarchy Configuration
 *
 * Based on the real Age UK federation structure:
 *  - National (Age UK national body) governs brand & strategy
 *  - Local branches are independent charities operating under Brand Partner Agreements
 *  - Each branch: Trustee Board → CEO → Operations Manager → Service Managers → Coordinators → Staff/Volunteers
 */

export const ORG_ROLES = {
  national_director:              'National Director',
  national_governance:            'National Governance / Trustee',
  area_manager:                   'Area Manager',
  branch_ceo:                     'Branch CEO / Chief Officer',
  branch_operations_manager:      'Branch Operations Manager',
  branch_service_manager:         'Branch Service Manager',
  branch_department_coordinator:  'Department Coordinator',
  branch_staff:                   'Branch Staff',
  volunteer:                      'Volunteer',
};

export const ORG_ROLE_HIERARCHY = [
  'national_director',
  'national_governance',
  'area_manager',
  'branch_ceo',
  'branch_operations_manager',
  'branch_service_manager',
  'branch_department_coordinator',
  'branch_staff',
  'volunteer',
];

/**
 * Determine which portal/page to route the user to on login
 * based on their org_role.
 */
export function getDefaultPortalPath(user) {
  if (!user) return '/';

  const orgRole = user.org_role;

  // National-level staff: full hub dashboard
  if (orgRole === 'national_director' || orgRole === 'national_governance') {
    return '/';
  }

  // Area managers: regional overview (if they have a region assigned)
  if (orgRole === 'area_manager') {
    return '/network';
  }

  // Branch CEO: sees their branch dashboard
  if (orgRole === 'branch_ceo') {
    return user.branch_id ? `/branch/${user.branch_id}` : '/dashboard';
  }

  // Operations/Service manager: branch-scoped operations
  if (orgRole === 'branch_operations_manager' || orgRole === 'branch_service_manager') {
    return '/branch-ops';
  }

  // Department coordinator (e.g. Sue Bradley - Handyperson Coordinator)
  if (orgRole === 'branch_department_coordinator') {
    return '/coordinator-portal';
  }

  // Staff / volunteer
  if (orgRole === 'branch_staff' || orgRole === 'volunteer') {
    return '/staff-portal';
  }

  // No org_role set yet → send to smart onboarding
  if (!orgRole) {
    return '/onboard';
  }

  // Fallback for old-style 'user' role (non-admin)
  return '/onboard';
}

/**
 * Returns true if the user can access hub-level (national/admin) pages
 */
export function canAccessHub(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return ['national_director', 'national_governance'].includes(user.org_role);
}

/**
 * Returns true if the user can see cross-branch regional data
 */
export function canAccessRegional(user) {
  if (!user) return false;
  return canAccessHub(user) || user.org_role === 'area_manager';
}

/**
 * Returns true if user can access branch management pages for their branch
 */
export function canAccessBranchManagement(user) {
  if (!user) return false;
  return canAccessHub(user) || canAccessRegional(user) ||
    ['branch_ceo', 'branch_operations_manager'].includes(user.org_role);
}

/**
 * Friendly description of what each org role can see and do
 */
export const ORG_ROLE_DESCRIPTIONS = {
  national_director: 'Full access: all branches, national reports, governance, expansion tools.',
  national_governance: 'Read-only access to national KPIs, compliance dashboards, and strategic reports.',
  area_manager: 'Cross-branch visibility for your region: performance, compliance, sync status.',
  branch_ceo: 'Your branch dashboard, all departments, financials, compliance, and staff.',
  branch_operations_manager: 'Branch operations: services, staff scheduling, compliance, and contracts.',
  branch_service_manager: 'Your service area: appointments, team, sessions, client records.',
  branch_department_coordinator: 'Your department: bookings, team supervision, client contacts, reporting.',
  branch_staff: 'Your assigned jobs and client contacts for the day.',
  volunteer: 'Your volunteer schedule and assigned visits.',
};