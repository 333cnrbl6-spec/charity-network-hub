/**
 * populateBranchData — Universal branch provisioning orchestrator
 *
 * Called automatically during SmartOnboarding when a subscriber selects
 * a branch that has not yet been provisioned in the hub.
 *
 * • If branch_id === 'bristol': delegates to the high-fidelity Bristol seeder
 * • All other branches: generates realistic scaled demo data in-function
 *
 * Accepts: { branch_id, branch_name }
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ── Full national postcode map (mirrors ageukBranches.js) ─────────────────
const BRANCH_POSTCODES = {
  bury: 'BL9', manchester: 'M1', stockport: 'SK1', bolton: 'BL1',
  salford_trafford: 'M41', lancashire: 'PR1', cheshire: 'CH1', cumbria: 'CA1',
  wirral: 'CH41', halton_warrington: 'WA1', st_helens: 'WA10', knowsley: 'L34',
  oldham: 'OL1', rochdale: 'OL16', tameside: 'SK14', wigan: 'WN1',
  newcastle: 'NE1', sunderland: 'SR1', gateshead: 'NE8', county_durham: 'DH1',
  teesside: 'TS1', northumberland: 'NE46',
  leeds: 'LS1', sheffield: 'S1', bradford: 'BD1', calderdale: 'HX1',
  hull: 'HU1', east_riding: 'HU17', york: 'YO1', north_yorkshire: 'HG1',
  barnsley: 'S70', rotherham: 'S60',
  leicester: 'LE1', nottingham: 'NG1', derby: 'DE1', lincolnshire: 'LN1',
  northamptonshire: 'NN1',
  birmingham: 'B1', coventry_warwick: 'CV1', wolverhampton: 'WV1',
  sandwell: 'B69', dudley: 'DY1', walsall: 'WS1', staffordshire: 'ST1',
  shropshire: 'SY1', hereford_worcester: 'WR1',
  norfolk: 'NR1', suffolk: 'IP1', cambridgeshire: 'CB1', hertfordshire: 'AL1',
  bedfordshire: 'MK40', essex_south: 'SS1', essex_north: 'CO1',
  camden_islington: 'NW1', islington: 'N1', east_london: 'E1',
  westminster: 'W1', lambeth_southwark: 'SE1', lewisham: 'SE6',
  bromley: 'BR1', croydon: 'CR0', richmond: 'TW9', wandsworth: 'SW18',
  haringey: 'N15', hackney: 'E8',
  kent: 'ME14', sussex: 'BN1', west_sussex: 'RH10', surrey: 'GU1',
  oxfordshire: 'OX1', berkshire: 'RG1', buckinghamshire: 'HP20',
  hampshire: 'SO14', isle_of_wight: 'PO30',
  bristol: 'BS1', somerset: 'TA1', bath_nes: 'BA1', wiltshire: 'SN1',
  dorset: 'BH1', devon: 'EX1', cornwall: 'TR1', gloucestershire: 'GL1',
  cardiff: 'CF10', swansea: 'SA1', north_wales: 'LL30', mid_wales: 'SY16',
};

// ── Scale per region (city-size heuristic) ────────────────────────────────
const REGION_SCALES = {
  london:           { clients: 90, volunteers: 38, jobs: 160, sessions: 48, grants: 70 },
  north_west:       { clients: 55, volunteers: 24, jobs: 100, sessions: 30, grants: 42 },
  west_midlands:    { clients: 60, volunteers: 26, jobs: 110, sessions: 33, grants: 45 },
  yorkshire:        { clients: 52, volunteers: 22, jobs:  95, sessions: 28, grants: 40 },
  south_east:       { clients: 50, volunteers: 21, jobs:  90, sessions: 27, grants: 38 },
  south_west:       { clients: 48, volunteers: 20, jobs:  85, sessions: 26, grants: 36 },
  east_midlands:    { clients: 46, volunteers: 19, jobs:  82, sessions: 24, grants: 34 },
  east:             { clients: 44, volunteers: 18, jobs:  78, sessions: 23, grants: 32 },
  north_east:       { clients: 42, volunteers: 17, jobs:  75, sessions: 22, grants: 30 },
  wales:            { clients: 38, volunteers: 15, jobs:  68, sessions: 20, grants: 28 },
  scotland:         { clients: 40, volunteers: 16, jobs:  72, sessions: 21, grants: 29 },
  northern_ireland: { clients: 35, volunteers: 14, jobs:  62, sessions: 18, grants: 25 },
};

// ── Branch-specific overrides for key large branches ─────────────────────
const BRANCH_OVERRIDES = {
  manchester: { clients: 80, volunteers: 35, jobs: 150, sessions: 45, grants: 65 },
  birmingham: { clients: 85, volunteers: 36, jobs: 155, sessions: 46, grants: 68 },
  leeds:      { clients: 72, volunteers: 30, jobs: 130, sessions: 38, grants: 55 },
  liverpool:  { clients: 75, volunteers: 32, jobs: 140, sessions: 40, grants: 60 },
  sheffield:  { clients: 65, volunteers: 27, jobs: 115, sessions: 34, grants: 48 },
};

const JOB_TYPES = ['home-visit', 'telephone-check', 'transport', 'shopping-assist', 'benefits-advice', 'digital-help', 'befriending', 'scams-advice', 'hospital-discharge', 'other'];
const VOLUNTEER_ROLES = ['befriender', 'driver', 'admin', 'reception', 'digital-champion', 'men-in-sheds', 'ageing-well-facilitator', 'shop', 'trustee', 'other'];
const SESSION_TYPES = ['stretch-and-flex', 'men-in-sheds', 'tea-and-tinker', 'out-in-the-city', 'digital-inclusion', 'scams-awareness', 'information-advice', 'ageing-well', 'hospital-aftercare', 'other'];
const GRANT_TYPES = ['attendance-allowance', 'pension-credit', 'warm-homes', 'energy-support', 'housing', 'carers-support', 'dementia-support', 'general', 'other'];
const REFERRAL_SOURCES = ['self-referral', 'nhs', 'social-care', 'family', 'gp', 'community-partner', 'other'];
const COMPLIANCE_AREAS = ['dbs_checks', 'safeguarding_training', 'health_safety', 'manual_handling', 'dementia_awareness', 'boundary_training', 'financial_audit', 'data_protection', 'insurance', 'accessibility_standards', 'quality_standards', 'incident_reporting'];
const FUNDING_BODIES = ['National Lottery Community Fund', 'Age UK', 'Local Authority', 'NHS England', 'Comic Relief', 'Joseph Rowntree Foundation', 'DWP', 'BNSSG ICB'];
const FIRST_NAMES = ['Joan', 'Margaret', 'Patricia', 'Barbara', 'Jennifer', 'Linda', 'Susan', 'David', 'Michael', 'Robert', 'James', 'Richard', 'John', 'Paul', 'Peter', 'Andrew', 'Christine', 'Elizabeth', 'Dorothy', 'Kathleen'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Taylor', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Walker', 'White', 'Thompson', 'Hughes', 'Robinson'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randName() { return `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`; }
function randDate(daysBack = 365) {
  return new Date(Date.now() - Math.random() * daysBack * 864e5).toISOString().split('T')[0];
}
function randFuture(daysAhead = 90) {
  return new Date(Date.now() + Math.random() * daysAhead * 864e5).toISOString().split('T')[0];
}
function randBirth() {
  const age = Math.floor(Math.random() * 30) + 65;
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  d.setDate(Math.floor(Math.random() * 28) + 1);
  return d.toISOString().split('T')[0];
}
function slug(str) { return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { branch_id, branch_name, branch_region } = body;

    if (!branch_id || !branch_name) {
      return Response.json({ error: 'Missing branch_id or branch_name' }, { status: 400 });
    }

    // ── Route Bristol to its high-fidelity seeder ─────────────────────────
    if (branch_id === 'bristol') {
      const res = await base44.asServiceRole.functions.invoke('populateBristolBranch', {
        branch_id, branch_name
      });
      return Response.json(res.data || { success: true, source: 'bristol_seeder' });
    }

    // ── Generic seeder for any other branch ───────────────────────────────
    const postcode = BRANCH_POSTCODES[branch_id] || branch_id.toUpperCase().slice(0, 3);
    const region = branch_region || 'north_west';
    const counts = BRANCH_OVERRIDES[branch_id] || REGION_SCALES[region] || REGION_SCALES['north_west'];

    // Clients
    const clientNames = [];
    const clientsData = [];
    for (let i = 0; i < counts.clients; i++) {
      const name = randName();
      clientNames.push(name);
      clientsData.push({
        full_name: name,
        date_of_birth: randBirth(),
        address: `${Math.floor(Math.random() * 200) + 1} ${rand(['High Street', 'Mill Road', 'Park Lane', 'Church Road', 'Victoria Road'])}`,
        postcode: `${postcode} ${Math.floor(Math.random() * 9) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        phone: `07${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900000) + 100000}`,
        referral_source: rand(REFERRAL_SOURCES),
        status: rand(['active', 'active', 'active', 'inactive']),
        date_registered: randDate(730),
        key_worker: randName(),
        notes: `Registered with ${branch_name}.`,
      });
    }
    if (clientsData.length) await base44.asServiceRole.entities.Client.bulkCreate(clientsData);

    // Volunteers
    const volunteerNames = [];
    const volunteersData = [];
    for (let i = 0; i < counts.volunteers; i++) {
      const name = randName();
      volunteerNames.push(name);
      volunteersData.push({
        full_name: name,
        email: `${slug(name)}@volunteer.${slug(branch_name)}.org.uk`,
        phone: `07${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 900000) + 100000}`,
        role: rand(VOLUNTEER_ROLES),
        status: rand(['active', 'active', 'active', 'inactive']),
        dbs_checked: Math.random() > 0.2,
        dbs_expiry: randFuture(1095),
        date_joined: randDate(730),
        hours_contributed: Math.floor(Math.random() * 1200) + 50,
        area: branch_name,
      });
    }
    if (volunteersData.length) await base44.asServiceRole.entities.Volunteer.bulkCreate(volunteersData);

    // Jobs (no fake IDs — use names as the client/volunteer reference)
    const jobsData = [];
    for (let i = 0; i < counts.jobs; i++) {
      jobsData.push({
        client_id: `pending-${i}`,
        client_name: clientNames[i % clientNames.length],
        volunteer_id: `pending-${i}`,
        volunteer_name: volunteerNames[i % volunteerNames.length],
        job_type: rand(JOB_TYPES),
        scheduled_date: new Date(Date.now() + (Math.random() - 0.3) * 60 * 864e5).toISOString(),
        status: rand(['scheduled', 'scheduled', 'completed', 'completed', 'completed', 'cancelled']),
        notes: `Support arranged at ${branch_name}.`,
        duration_minutes: Math.floor(Math.random() * 120) + 30,
      });
    }
    if (jobsData.length) await base44.asServiceRole.entities.Job.bulkCreate(jobsData);

    // Sessions
    const sessionLocations = [`${branch_name} Community Centre`, `${branch_name} Library`, 'Local Church Hall', 'Leisure Centre'];
    const sessionsData = [];
    for (let i = 0; i < counts.sessions; i++) {
      const t = rand(SESSION_TYPES);
      sessionsData.push({
        session_name: `${t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} — Weekly`,
        session_type: t,
        location: rand(sessionLocations),
        scheduled_date: new Date(Date.now() + (Math.random() * 90 * 864e5)).toISOString().split('T')[0],
        attendees_count: Math.floor(Math.random() * 22) + 8,
        max_capacity: 35,
        status: rand(['scheduled', 'scheduled', 'completed']),
        facilitator: randName(),
        notes: `Regular session at ${branch_name}.`,
      });
    }
    if (sessionsData.length) await base44.asServiceRole.entities.Session.bulkCreate(sessionsData);

    // Grants
    const grantsData = [];
    for (let i = 0; i < counts.grants; i++) {
      grantsData.push({
        grant_name: `${rand(['Pension Credit', 'Attendance Allowance', 'Warm Homes', 'Community Grant', 'Carer Support'])} — ${branch_name}`,
        funder: rand(FUNDING_BODIES),
        amount_awarded: Math.floor(Math.random() * 70000) + 3000,
        date_awarded: randDate(365),
        grant_type: rand(GRANT_TYPES),
        client_id: `pending-${i}`,
        client_name: clientNames[i % clientNames.length],
        status: rand(['awarded', 'awarded', 'awarded', 'applied']),
        notes: `Grant for ${branch_name} client.`,
      });
    }
    if (grantsData.length) await base44.asServiceRole.entities.Grant.bulkCreate(grantsData);

    // Compliance
    const complianceData = COMPLIANCE_AREAS.map(area => ({
      branch_id,
      branch_name,
      compliance_area: area,
      status: rand(['compliant', 'compliant', 'at_risk', 'pending_review']),
      deadline: randFuture(365),
      last_completed: randDate(180),
      assigned_to: randName(),
      notes: `${area.replace(/_/g, ' ')} — ${branch_name}`,
      risk_level: rand(['low', 'low', 'medium', 'high']),
    }));
    if (complianceData.length) await base44.asServiceRole.entities.ComplianceRecord.bulkCreate(complianceData);

    return Response.json({
      success: true,
      message: `Successfully provisioned ${branch_name}`,
      stats: {
        clients: clientsData.length,
        volunteers: volunteersData.length,
        jobs: jobsData.length,
        sessions: sessionsData.length,
        grants: grantsData.length,
        compliance: complianceData.length,
      },
    });
  } catch (error) {
    console.error('[populateBranchData]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});