/**
 * populateBristolBranch
 * Orchestrates fully-researched Age UK Bristol branch provisioning.
 * Delegates to smaller specialised seed functions to stay within memory limits.
 * 
 * Sources: Companies House 02984207, Charity Commission 1042548,
 * ageuk.org.uk/bristol, ONS Census 2021, Bristol City Council ward data.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const BRANCH_ID = 'bristol';
const BRANCH_NAME = 'Age UK Bristol';

const BRANCH_CONFIG = {
  branch_id: BRANCH_ID,
  branch_name: BRANCH_NAME,
  api_key: `key_bristol_${Math.random().toString(36).substr(2, 16)}`,
  status: 'active',
  last_sync_date: new Date().toISOString(),
  last_sync_result: 'success',
};

const LOCATION_CONFIG = {
  branch_id: BRANCH_ID,
  branch_name: BRANCH_NAME,
  region: 'south_west',
  location_type: 'urban',
  postcode_area: 'BS13',
  catchment_area: 'Bristol City (all 34 wards): primary BS13, BS3, BS4, BS14, BS5, BS2, BS10; secondary BS7, BS8, BS9, BS16',
  demographics: {
    population_65_plus: 72000,
    population_85_plus: 12400,
    total_population: 472000,
    deprivation_index: 'IMD 2019 — Hartcliffe decile 1-2 (most deprived 20%). City average decile 4.',
    life_expectancy: 81.4,
    carers_percentage: 9.2,
    data_year: 2021
  },
  services: [
    { service_name: 'Information & Advice', service_type: 'benefits-advice', delivery_method: 'In-person (Withywood Centre) + phone 0117 929 7537', target_group: 'Age 55+, Bristol residents', capacity: 300 },
    { service_name: 'New Beginnings Day Centre', service_type: 'session', delivery_method: '4 days/week, transport available', target_group: 'Age 65+, South Bristol', capacity: 20 },
    { service_name: 'Friends Ageing Better (FAB)', service_type: 'session', delivery_method: 'Café, walks, activities, membership', target_group: 'Age 50+, citywide', capacity: 200 },
    { service_name: 'Going Home from Hospital', service_type: 'home-visit', delivery_method: 'Link Workers at BRI and Southmead Hospital', target_group: 'Older hospital patients', capacity: 100 },
    { service_name: 'Telephone Befriending', service_type: 'telephone-check', delivery_method: 'Weekly telephone calls by volunteers', target_group: 'Isolated older people, 60+', capacity: 80 },
    { service_name: 'Falls Prevention', service_type: 'session', delivery_method: 'Group exercise, evidence-based', target_group: 'Age 65+ at falls risk', capacity: 30 },
    { service_name: 'Tea & Technology (Digital Inclusion)', service_type: 'digital-help', delivery_method: 'Group and 1:1 sessions', target_group: 'Age 55+, digitally excluded', capacity: 14 },
    { service_name: 'Bristol Support Hub', service_type: 'other', delivery_method: 'Helpline across 40+ partner orgs', target_group: 'All older Bristol residents', capacity: 500 },
  ],
  staff_roles: [
    { role: 'Chief Executive', typical_count: 1, responsibilities: 'Kay Libby. Strategic and operational leadership.' },
    { role: 'Interim Chief Operations Officer', typical_count: 1, responsibilities: 'Carly Urbanski. Operations, HR, premises, hospital service.' },
    { role: 'Advice and Support Manager', typical_count: 1, responsibilities: 'Ben Sansum. I&A service lead, caseworkers.' },
    { role: 'Active Ageing Bristol Manager', typical_count: 1, responsibilities: 'Karen Lloyd. Day Centre, FAB, falls prevention.' },
    { role: 'I&A Caseworkers', typical_count: 4, responsibilities: 'Welfare benefits, housing, health, care.' },
    { role: 'Day Centre Support Workers', typical_count: 3, responsibilities: 'New Beginnings daily sessions.' },
    { role: 'Hospital Link Workers', typical_count: 2, responsibilities: 'BRI and Southmead outreach.' },
    { role: 'Volunteers', typical_count: 90, responsibilities: 'Befrienders, drivers, digital champions, admin.' },
  ],
  typical_sessions: [
    { session_name: 'New Beginnings Day Centre', session_type: 'ageing-well', frequency: '4 days/week Mon-Thu', typical_attendance: 15, location: 'The Withywood Centre, Queens Road, BS13 8QA' },
    { session_name: 'FAB Café', session_type: 'session', frequency: 'Monday mornings weekly', typical_attendance: 22, location: 'The Withywood Centre, Queens Road, BS13 8QA' },
    { session_name: 'I&A Drop-In', session_type: 'information-advice', frequency: 'Tue and Thu mornings', typical_attendance: 9, location: 'The Withywood Centre, Queens Road, BS13 8QA' },
    { session_name: 'Hospital Link — BRI', session_type: 'hospital-aftercare', frequency: 'Daily Mon-Fri', typical_attendance: 5, location: 'Bristol Royal Infirmary BS2 8HW' },
    { session_name: 'Hospital Link — Southmead', session_type: 'hospital-aftercare', frequency: 'Daily Mon-Fri', typical_attendance: 4, location: 'Southmead Hospital BS10 5NB' },
    { session_name: 'Falls Prevention Exercise', session_type: 'stretch-and-flex', frequency: 'Weekly Monday afternoon', typical_attendance: 15, location: 'The Withywood Centre, Queens Road, BS13 8QA' },
    { session_name: 'Tea & Technology', session_type: 'digital-inclusion', frequency: 'First Monday of month', typical_attendance: 10, location: 'The Withywood Centre, Queens Road, BS13 8QA' },
  ],
  sample_clients_count: 50,
  is_demo: false,
  onboarded: true
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const origin = new URL(req.url).origin;

    // Auth: allow service-role calls (from other functions) or admin users
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    // If called from another function (no user context), proceed with service role
    // If called directly by a user, require admin
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── 1. Upsert BranchConfig ────────────────────────────────────────────
    const configs = await svc.entities.BranchConfig.list();
    const existing = configs.find(b => b.branch_id === BRANCH_ID);
    if (existing) {
      await svc.entities.BranchConfig.update(existing.id, {
        branch_name: BRANCH_NAME, status: 'active',
        last_sync_date: new Date().toISOString(), last_sync_result: 'success',
        hub_api_url: `${origin}/api/sync`,
      });
    } else {
      await svc.entities.BranchConfig.create({ ...BRANCH_CONFIG, hub_api_url: `${origin}/api/sync` });
    }

    // ── 2. Upsert LocationConfig ──────────────────────────────────────────
    const locs = await svc.entities.LocationConfig.list();
    const existingLoc = locs.find(l => l.branch_id === BRANCH_ID);
    if (existingLoc) {
      await svc.entities.LocationConfig.update(existingLoc.id, LOCATION_CONFIG);
    } else {
      await svc.entities.LocationConfig.create(LOCATION_CONFIG);
    }

    // ── 3. Clear existing branch records via dedicated clear function ─────
    await svc.functions.invoke('clearBristolData', {});

    // ── 4. Seed in batches via sub-functions ──────────────────────────────
    const [clientRes, volRes, sessionRes, grantRes, compRes] = await Promise.all([
      svc.functions.invoke('seedBristolClients', {}),
      svc.functions.invoke('seedBristolVolunteers', {}),
      svc.functions.invoke('seedBristolSessions', {}),
      svc.functions.invoke('seedBristolGrants', {}),
      svc.functions.invoke('seedBristolCompliance', {}),
    ]);

    // ── 5. Seed jobs using returned client/volunteer IDs ──────────────────
    await svc.functions.invoke('seedBristolJobs', {
      clientData: clientRes?.data?.clients || [],
      volunteerData: volRes?.data?.volunteers || [],
    });

    // ── 6. Branch report ──────────────────────────────────────────────────
    await svc.entities.BranchReport.create({
      branch_id: BRANCH_ID,
      branch_name: BRANCH_NAME,
      report_period: '2025-04',
      received_at: new Date().toISOString(),
      stats: {
        total_clients: clientRes?.data?.count || 50,
        new_clients: 8,
        active_volunteers: volRes?.data?.count || 15,
        total_jobs: 13,
        completed_jobs: 3,
        total_sessions: sessionRes?.data?.count || 13,
        grants_awarded: grantRes?.data?.count || 12,
        grants_total_value: 54350,
      },
      status: 'received'
    });

    return Response.json({
      success: true,
      branch: BRANCH_NAME,
      legal: {
        charity_number: '1042548',
        company_number: '02984207',
        registered_address: 'The Withywood Centre, Queens Road, Bristol BS13 8QA',
        phone: '0117 929 7537',
        email: 'admin@ageukbristol.org.uk',
        ceo: 'Kay Libby',
        coo: 'Carly Urbanski (Interim)',
        advice_manager: 'Ben Sansum',
        active_ageing_manager: 'Karen Lloyd',
        incorporated: '28 October 1994',
        sic: '88100',
      },
      summary: {
        clients: clientRes?.data?.count,
        volunteers: volRes?.data?.count,
        sessions: sessionRes?.data?.count,
        grants: grantRes?.data?.count,
        compliance: compRes?.data?.count,
        jobs: 13,
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});