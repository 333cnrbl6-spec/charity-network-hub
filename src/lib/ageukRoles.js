/**
 * Age UK Complete Role Taxonomy
 *
 * Based on research across:
 *  - Age UK national job descriptions (CEO, Head of Ops, Operations Manager JDs)
 *  - Age UK local branch job postings (befriending, social prescribing, I&A, digital)
 *  - Real Age UK federation structure documentation
 *  - CharityJob listings for Age UK roles 2024
 *
 * Grouped by ORG_ROLE tier → department → specific job titles
 */

export const ROLE_TAXONOMY = [
  // ──────────────────────────────────────────────────────────────────────────
  // TIER 1: NATIONAL (Age UK national body)
  // ──────────────────────────────────────────────────────────────────────────
  {
    tier: 'national',
    tier_label: 'National Body',
    org_role: 'national_director',
    portal: '/',
    roles: [
      {
        id: 'national_ceo',
        title: 'National Chief Executive',
        department: 'executive',
        description: 'Leads the national Age UK charity. Responsible for strategy, national partnerships, and brand governance across all 115 local branches.',
        key_tasks: ['National strategy', 'Brand Partner Agreement oversight', 'Trustee board liaison', 'Policy and lobbying', 'National partnerships'],
        modules: ['network_overview', 'governance', 'analytics', 'boardroom', 'expansion'],
      },
      {
        id: 'national_director_services',
        title: 'National Director of Services',
        department: 'services',
        description: 'Oversees national service delivery standards and quality assurance across the network.',
        key_tasks: ['Service standards', 'Quality frameworks', 'Branch performance', 'Innovation programmes'],
        modules: ['network_overview', 'analytics', 'compliance', 'boardroom'],
      },
      {
        id: 'national_director_finance',
        title: 'National Director of Finance',
        department: 'finance',
        description: 'Manages financial strategy, audit, budgeting, and commercial operations nationally.',
        key_tasks: ['Consolidated accounts', 'Branch subscription billing', 'Audit', 'Financial risk', 'Commercial income'],
        modules: ['subscriptions', 'network_overview', 'analytics', 'boardroom'],
      },
      {
        id: 'national_fundraising_director',
        title: 'Director of Fundraising',
        department: 'fundraising',
        description: 'Leads national income generation through trusts, foundations, corporate partnerships and legacy giving.',
        key_tasks: ['Grant strategy', 'Major donors', 'Corporate partnerships', 'Legacy income', 'Campaign fundraising'],
        modules: ['analytics', 'boardroom', 'network_overview'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 2: NATIONAL GOVERNANCE
  // ──────────────────────────────────────────────────────────────────────────
  {
    tier: 'national_governance',
    tier_label: 'Board of Trustees',
    org_role: 'national_governance',
    portal: '/governance-portal',
    roles: [
      {
        id: 'trustee_chair',
        title: 'Chair of Trustees',
        department: 'governance',
        description: 'Leads the trustee board, ensures effective governance, and supports the CEO.',
        key_tasks: ['Board meetings', 'Strategic direction', 'CEO performance review', 'Annual report', 'Charity Commission returns'],
        modules: ['governance', 'boardroom', 'analytics'],
      },
      {
        id: 'trustee_finance',
        title: 'Trustee — Finance & Audit',
        department: 'governance',
        description: 'Finance sub-committee chair. Oversees accounts, audit, and financial risk.',
        key_tasks: ['Finance sub-committee', 'Annual accounts approval', 'Audit oversight', 'Budget review'],
        modules: ['governance', 'boardroom'],
      },
      {
        id: 'trustee_safeguarding',
        title: 'Trustee — Safeguarding Lead',
        department: 'governance',
        description: 'Designated safeguarding trustee. Reviews incidents, policies, and DBS compliance.',
        key_tasks: ['Safeguarding policy', 'Incident review', 'DBS compliance', 'Training standards'],
        modules: ['governance', 'compliance', 'boardroom'],
      },
      {
        id: 'trustee_general',
        title: 'Trustee (General Board Member)',
        department: 'governance',
        description: 'Board member providing independent oversight, scrutiny, and strategic guidance.',
        key_tasks: ['Board meetings', 'Strategic scrutiny', 'Charity governance', 'Stakeholder representation'],
        modules: ['governance', 'boardroom'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 3: AREA / REGIONAL
  // ──────────────────────────────────────────────────────────────────────────
  {
    tier: 'regional',
    tier_label: 'Regional / Area Management',
    org_role: 'area_manager',
    portal: '/network',
    roles: [
      {
        id: 'area_manager',
        title: 'Area Manager',
        department: 'operations',
        description: 'Oversees a group of Age UK local branches in a geographic area. Supports CEOs, monitors performance, and manages escalations.',
        key_tasks: ['Branch performance monitoring', 'CEO support', 'Compliance escalation', 'Regional reporting', 'Partnership development'],
        modules: ['network_overview', 'compliance', 'analytics', 'regional_reporting'],
      },
      {
        id: 'regional_lead',
        title: 'Regional Lead / Development Officer',
        department: 'development',
        description: 'Supports new branch onboarding, network expansion, and quality improvement across a region.',
        key_tasks: ['New branch setup', 'Onboarding support', 'Quality improvement', 'Training delivery'],
        modules: ['network_overview', 'expansion', 'compliance'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 4: BRANCH CEO / CHIEF OFFICER
  // ──────────────────────────────────────────────────────────────────────────
  {
    tier: 'branch_leadership',
    tier_label: 'Branch Leadership',
    org_role: 'branch_ceo',
    portal: '/branch-ceo',
    roles: [
      {
        id: 'branch_ceo',
        title: 'Chief Executive Officer (Branch)',
        department: 'executive',
        description: 'Leads the local Age UK branch. Responsible to the trustee board for all operations, finance, compliance, and service delivery.',
        key_tasks: ['Strategic plan delivery', 'Trustee board reporting', 'Income generation', 'Staff leadership', 'Commissioner relations', 'Brand Partner Agreement compliance', 'Annual accounts'],
        modules: ['branch_dashboard', 'compliance', 'finance', 'staff_management', 'grants', 'hub_reporting'],
      },
      {
        id: 'deputy_ceo',
        title: 'Deputy CEO / Head of Operations',
        department: 'operations',
        description: 'Deputies for the CEO and leads day-to-day operational management across all service departments.',
        key_tasks: ['Deputise for CEO', 'Service management', 'Staff supervision', 'Contract performance', 'Operational planning'],
        modules: ['branch_dashboard', 'compliance', 'staff_management', 'hub_reporting'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 5: OPERATIONS / SERVICE MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────
  {
    tier: 'branch_management',
    tier_label: 'Branch Operations & Service Management',
    org_role: 'branch_operations_manager',
    portal: '/branch-ops',
    roles: [
      {
        id: 'operations_manager',
        title: 'Operations Manager',
        department: 'operations',
        description: 'Manages all service delivery operations, contracts, staff scheduling, and compliance across the branch.',
        key_tasks: ['Contract performance', 'Staff scheduling', 'Budget monitoring', 'Commissioner reporting', 'Quality standards', 'Health & safety'],
        modules: ['clients', 'volunteers', 'jobs', 'sessions', 'compliance', 'finance', 'staff_management'],
      },
      {
        id: 'finance_manager',
        title: 'Finance Manager / Finance & Business Manager',
        department: 'finance',
        description: 'Manages branch finances, payroll, accounts, budgets, and funder financial returns.',
        key_tasks: ['Management accounts', 'Payroll', 'Budget monitoring', 'Funder reporting', 'Annual accounts prep', 'Audit liaison'],
        modules: ['finance', 'grants', 'analytics'],
      },
      {
        id: 'hr_manager',
        title: 'HR Manager / People Manager',
        department: 'hr',
        description: 'Manages recruitment, employee relations, DBS checks, training, and volunteer management policy.',
        key_tasks: ['Recruitment', 'DBS management', 'Training compliance', 'Appraisals', 'ER cases', 'Volunteer policy'],
        modules: ['staff_management', 'volunteers', 'compliance', 'dbs_tracker'],
      },
      {
        id: 'communications_manager',
        title: 'Communications & Engagement Lead',
        department: 'communications',
        description: 'Manages marketing, PR, social media, events and community engagement for the branch.',
        key_tasks: ['Social media', 'Press releases', 'Annual report', 'Events', 'Stakeholder communications', 'Website'],
        modules: ['impact', 'analytics', 'clients'],
      },
      {
        id: 'fundraising_manager',
        title: 'Fundraising Manager / Development Lead',
        department: 'fundraising',
        description: 'Generates income through trusts, grants, community events, and corporate partners.',
        key_tasks: ['Grant applications', 'Trust fundraising', 'Community fundraising', 'Corporate partnerships', 'Donor management', 'Events fundraising'],
        modules: ['grants', 'analytics', 'clients', 'impact'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 6: SERVICE MANAGERS
  // ──────────────────────────────────────────────────────────────────────────
  {
    tier: 'service_management',
    tier_label: 'Service Management',
    org_role: 'branch_service_manager',
    portal: '/branch-ops',
    roles: [
      {
        id: 'handyperson_service_manager',
        title: 'Handyperson Service Manager',
        department: 'handyperson',
        description: 'Manages the handyperson service contract, team of tradespeople, and quality standards.',
        key_tasks: ['Handyperson team management', 'Contract KPIs', 'Health & safety compliance', 'Customer complaints', 'Financial recording'],
        modules: ['jobs', 'clients', 'volunteers', 'compliance', 'finance'],
      },
      {
        id: 'wellbeing_manager',
        title: 'Wellbeing & Social Activities Manager',
        department: 'wellbeing',
        description: 'Manages day centres, befriending programmes, and social activity sessions.',
        key_tasks: ['Session planning', 'Venue management', 'Volunteer coordination', 'Attendance tracking', 'Funder outcomes reporting'],
        modules: ['sessions', 'clients', 'volunteers', 'impact'],
      },
      {
        id: 'ia_manager',
        title: 'Information & Advice Service Manager',
        department: 'information_advice',
        description: 'Leads the I&A service ensuring delivery of welfare benefits advice, housing, and social care information.',
        key_tasks: ['Case management', 'Benefits calculations', 'Case recording', 'Quality standards (AQS)', 'Staff supervision', 'Funder reporting'],
        modules: ['clients', 'grants', 'compliance', 'analytics'],
      },
      {
        id: 'care_navigator_manager',
        title: 'Care Navigation & Social Prescribing Manager',
        department: 'care_navigation',
        description: 'Manages social prescribing link workers and care navigator staff working with NHS partners.',
        key_tasks: ['GP practice partnerships', 'Referral pathways', 'Outcomes reporting', 'NHS contract monitoring', 'Staff supervision'],
        modules: ['clients', 'jobs', 'compliance', 'analytics'],
      },
      {
        id: 'volunteer_manager',
        title: 'Volunteer Manager',
        department: 'volunteering',
        description: 'Recruits, trains, and manages the volunteer workforce across all service areas.',
        key_tasks: ['Volunteer recruitment', 'DBS checks', 'Training delivery', 'Volunteer records', 'Recognition & retention', 'Befriending matching'],
        modules: ['volunteers', 'clients', 'compliance', 'dbs_tracker'],
      },
      {
        id: 'digital_inclusion_manager',
        title: 'Digital Inclusion Manager',
        department: 'digital',
        description: 'Manages digital literacy programmes and IT training for older people.',
        key_tasks: ['IT training sessions', 'Device lending scheme', 'Volunteer digital champion management', 'Partnership with telecoms', 'Funder reporting'],
        modules: ['sessions', 'clients', 'volunteers', 'impact'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 7: DEPARTMENT COORDINATORS
  // ──────────────────────────────────────────────────────────────────────────
  {
    tier: 'coordinators',
    tier_label: 'Department Coordinators',
    org_role: 'branch_department_coordinator',
    portal: '/coordinator-portal',
    roles: [
      {
        id: 'handyperson_coordinator',
        title: 'Handyperson Coordinator',
        department: 'handyperson',
        description: 'Books appointments, supervises handypeople, manages scheduling and customer communications for the handyperson service.',
        key_tasks: ['Appointment booking', 'Team scheduling', 'Customer liaison', 'Job records', 'Compliance paperwork', 'Volunteer handyperson support'],
        modules: ['jobs', 'clients', 'volunteers', 'sessions'],
        is_sue_bradley_role: true,
      },
      {
        id: 'befriending_coordinator',
        title: 'Befriending Coordinator',
        department: 'befriending',
        description: 'Matches volunteers with isolated older people, coordinates regular visits and telephone check-ins.',
        key_tasks: ['Volunteer-client matching', 'Visit scheduling', 'Outcome recording', 'Safeguarding monitoring', 'Volunteer support', 'Referral management'],
        modules: ['clients', 'volunteers', 'jobs', 'sessions'],
      },
      {
        id: 'day_centre_coordinator',
        title: 'Day Centre / Activities Coordinator',
        department: 'wellbeing',
        description: 'Plans and delivers weekly social sessions, clubs and activities for older people.',
        key_tasks: ['Session planning', 'Booking & registers', 'Catering coordination', 'Volunteer briefing', 'Attendance recording', 'Transport coordination'],
        modules: ['sessions', 'clients', 'volunteers', 'jobs'],
      },
      {
        id: 'transport_coordinator',
        title: 'Transport Coordinator',
        department: 'transport',
        description: 'Coordinates volunteer and community transport for older people — medical appointments, shopping, social trips.',
        key_tasks: ['Journey bookings', 'Driver scheduling', 'Vehicle maintenance records', 'DBS compliance for drivers', 'Route planning'],
        modules: ['jobs', 'volunteers', 'clients'],
      },
      {
        id: 'digital_champion_coordinator',
        title: 'Digital Inclusion / IT Champion Coordinator',
        department: 'digital',
        description: 'Coordinates digital skills sessions, manages device lending and volunteer digital champions.',
        key_tasks: ['Session coordination', 'Device inventory', 'Digital champion matching', 'One-to-one support booking', 'Outcome tracking'],
        modules: ['sessions', 'clients', 'volunteers'],
      },
      {
        id: 'hospital_discharge_coordinator',
        title: 'Home from Hospital Coordinator',
        department: 'hospital_discharge',
        description: 'Supports older people returning home from hospital — practical help, shopping, welfare checks.',
        key_tasks: ['Hospital referral intake', 'Support scheduling', 'Volunteer matching', 'Recovery outcome tracking', 'NHS liaison'],
        modules: ['clients', 'jobs', 'volunteers'],
      },
      {
        id: 'shopping_coordinator',
        title: 'Shopping & Practical Help Coordinator',
        department: 'shopping',
        description: 'Coordinates grocery delivery, escorted shopping and practical errands for older people.',
        key_tasks: ['Shopping request intake', 'Volunteer matching', 'Delivery scheduling', 'Outcome recording'],
        modules: ['jobs', 'clients', 'volunteers'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 8: BRANCH STAFF / PRACTITIONERS
  // ──────────────────────────────────────────────────────────────────────────
  {
    tier: 'branch_staff',
    tier_label: 'Branch Staff & Practitioners',
    org_role: 'branch_staff',
    portal: '/staff-portal',
    roles: [
      {
        id: 'benefits_advisor',
        title: 'Benefits Advisor / Welfare Rights Advisor',
        department: 'information_advice',
        description: 'Provides specialist welfare benefits advice, helps clients claim entitlements (Attendance Allowance, Pension Credit, etc.).',
        key_tasks: ['Benefits calculations', 'Welfare rights advice', 'Form completion support', 'Appeals support', 'Case recording', 'Means test calculations'],
        modules: ['clients', 'grants'],
      },
      {
        id: 'ia_worker',
        title: 'Information & Advice Worker',
        department: 'information_advice',
        description: 'Provides free, impartial information and advice on a wide range of issues including housing, care, health, and money.',
        key_tasks: ['Initial enquiry assessment', 'Advice delivery', 'Signposting & referral', 'Case recording', 'Home visits'],
        modules: ['clients', 'grants'],
      },
      {
        id: 'social_prescriber',
        title: 'Social Prescribing Link Worker',
        department: 'care_navigation',
        description: 'Receives referrals from GPs, assesses non-medical needs and connects older people with community support.',
        key_tasks: ['GP referral intake', 'Holistic needs assessment', 'Community linking', 'Outcome tracking', 'NHS reporting'],
        modules: ['clients', 'jobs'],
      },
      {
        id: 'care_navigator',
        title: 'Care Navigator',
        department: 'care_navigation',
        description: 'Helps older people navigate health and social care systems, organises support packages.',
        key_tasks: ['Care coordination', 'Hospital liaison', 'Support planning', 'Carer support', 'Case management'],
        modules: ['clients', 'jobs'],
      },
      {
        id: 'handyperson_worker',
        title: 'Handyperson',
        department: 'handyperson',
        description: 'Carries out small practical jobs in older people\'s homes — safety checks, minor repairs, adaptations.',
        key_tasks: ['Job completion', 'Safety assessments', 'Equipment installation', 'Customer care', 'Job record completion'],
        modules: ['jobs'],
      },
      {
        id: 'befriender_worker',
        title: 'Befriending Worker / Befriending Support Officer',
        department: 'befriending',
        description: 'Supports volunteer befrienders, records visit outcomes, and manages referrals.',
        key_tasks: ['Volunteer support', 'Visit recording', 'Safeguarding monitoring', 'Referral processing'],
        modules: ['clients', 'volunteers', 'jobs'],
      },
      {
        id: 'digital_champion',
        title: 'Digital Champion / IT Trainer',
        department: 'digital',
        description: 'Delivers one-to-one and group digital skills support for older people.',
        key_tasks: ['IT training sessions', 'Device setup help', 'Online safety coaching', 'Attendance recording'],
        modules: ['sessions', 'clients'],
      },
      {
        id: 'admin_officer',
        title: 'Administrative Officer / Receptionist',
        department: 'admin',
        description: 'Front-of-house admin, telephone, filing, appointment booking, and general office support.',
        key_tasks: ['Telephone reception', 'Appointment booking', 'Filing & records', 'Data entry', 'Stationery & supplies'],
        modules: ['clients', 'jobs', 'sessions'],
      },
      {
        id: 'fundraising_officer',
        title: 'Fundraising Officer / Community Fundraiser',
        department: 'fundraising',
        description: 'Supports income generation through community events, challenge events, and grant applications.',
        key_tasks: ['Community events', 'Challenge event coordination', 'Grant research', 'Donor thank you comms', 'JustGiving & online campaigns'],
        modules: ['grants', 'analytics'],
      },
      {
        id: 'health_wellbeing_worker',
        title: 'Health & Wellbeing Worker',
        department: 'wellbeing',
        description: 'Delivers exercise classes, falls prevention sessions, and wellbeing activities.',
        key_tasks: ['Session delivery', 'Attendance tracking', 'Health outcome recording', 'Volunteer support', 'GP partnership working'],
        modules: ['sessions', 'clients'],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TIER 9: VOLUNTEERS
  // ──────────────────────────────────────────────────────────────────────────
  {
    tier: 'volunteer',
    tier_label: 'Volunteers',
    org_role: 'volunteer',
    portal: '/staff-portal',
    roles: [
      {
        id: 'volunteer_befriender',
        title: 'Volunteer Befriender',
        department: 'befriending',
        description: 'Provides regular companionship visits or telephone calls to isolated older people.',
        key_tasks: ['Weekly visits or calls', 'Recording visit notes', 'Reporting concerns'],
        modules: ['jobs'],
      },
      {
        id: 'volunteer_driver',
        title: 'Volunteer Driver',
        department: 'transport',
        description: 'Provides door-to-door transport for older people to medical appointments and social activities.',
        key_tasks: ['Journey completion', 'Mileage recording', 'DBS compliance'],
        modules: ['jobs'],
      },
      {
        id: 'volunteer_handyperson',
        title: 'Volunteer Handyperson',
        department: 'handyperson',
        description: 'Assists with small practical jobs such as smoke alarm fitting, minor repairs under supervision.',
        key_tasks: ['Job completion', 'Safety checks', 'Job record completion'],
        modules: ['jobs'],
      },
      {
        id: 'volunteer_digital_champion',
        title: 'Volunteer Digital Champion',
        department: 'digital',
        description: 'Helps older people learn to use computers, smartphones, and the internet.',
        key_tasks: ['IT training delivery', 'One-to-one support', 'Device setup'],
        modules: ['sessions'],
      },
      {
        id: 'volunteer_trustee',
        title: 'Volunteer Trustee',
        department: 'governance',
        description: 'Serves on the local branch trustee board, providing governance oversight and strategic guidance.',
        key_tasks: ['Board meetings', 'Strategic oversight', 'Charity governance'],
        modules: [],
      },
    ],
  },
];

/**
 * Flat list of ALL roles for dropdowns / searching
 */
export const ALL_ROLES_FLAT = ROLE_TAXONOMY.flatMap(tier =>
  tier.roles.map(r => ({
    ...r,
    tier: tier.tier,
    tier_label: tier.tier_label,
    org_role: tier.org_role,
    portal: tier.portal,
  }))
);

/**
 * Get role details by role id
 */
export function getRoleById(id) {
  return ALL_ROLES_FLAT.find(r => r.id === id);
}

/**
 * Get tiers for display
 */
export function getTierForRole(roleId) {
  return ROLE_TAXONOMY.find(t => t.roles.some(r => r.id === roleId));
}

/**
 * Module display config — what each module means as a selectable option
 */
export const MODULE_DEFINITIONS = {
  clients:           { icon: '👥', label: 'Client Management',         desc: 'Client records, referrals, case notes' },
  volunteers:        { icon: '🤝', label: 'Volunteer Management',      desc: 'Volunteer records, DBS, hours' },
  jobs:              { icon: '📋', label: 'Jobs & Appointments',       desc: 'Scheduling, job tracking, outcomes' },
  sessions:          { icon: '🗓️', label: 'Sessions & Activities',     desc: 'Group sessions, attendance, bookings' },
  grants:            { icon: '💰', label: 'Grants & Benefits',         desc: 'Grant tracking, welfare benefits, funding' },
  compliance:        { icon: '✅', label: 'Compliance & Safety',       desc: 'DBS, training records, H&S, policies' },
  analytics:         { icon: '📊', label: 'Analytics & Reports',       desc: 'Performance data, trends, impact metrics' },
  impact:            { icon: '🌟', label: 'Impact Dashboard',          desc: 'Outcomes, SROI, commissioner reports' },
  finance:           { icon: '💳', label: 'Finance & Budgets',         desc: 'Budget tracking, income, expenditure' },
  staff_management:  { icon: '👔', label: 'Staff Management',          desc: 'Staff records, appraisals, supervision' },
  dbs_tracker:       { icon: '🔐', label: 'DBS Tracker',               desc: 'DBS check records, expiry alerts' },
  hub_reporting:     { icon: '🔗', label: 'Hub Reporting',             desc: 'Aggregate reports synced to national hub' },
  governance:        { icon: '⚖️', label: 'Governance',                desc: 'Board papers, trustee duties, risk register' },
  boardroom:         { icon: '🏛️', label: 'Boardroom',                 desc: 'AI-assisted board briefings and reports' },
  network_overview:  { icon: '🌐', label: 'Network Overview',          desc: 'Cross-branch metrics, connectivity status' },
  expansion:         { icon: '🗺️', label: 'Network Expansion',         desc: 'New branch onboarding, regional growth' },
  regional_reporting:{ icon: '📍', label: 'Regional Reporting',        desc: 'Area-level performance summaries' },
  branch_dashboard:  { icon: '🏢', label: 'Branch Dashboard',          desc: 'Full branch KPI view' },
};