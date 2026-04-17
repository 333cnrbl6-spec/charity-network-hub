import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const COMPLIANCE_AREAS = [
  'dbs_checks',
  'safeguarding_training',
  'health_safety',
  'manual_handling',
  'dementia_awareness',
  'boundary_training',
  'financial_audit',
  'data_protection',
  'insurance',
  'accessibility_standards',
  'quality_standards',
  'incident_reporting'
];

const JOB_TYPES = ['home-visit', 'telephone-check', 'transport', 'shopping-assist', 'benefits-advice', 'digital-help', 'befriending', 'scams-advice', 'hospital-discharge', 'other'];
const VOLUNTEER_ROLES = ['befriender', 'driver', 'admin', 'reception', 'digital-champion', 'men-in-sheds', 'ageing-well-facilitator', 'shop', 'trustee', 'other'];
const SESSION_TYPES = ['stretch-and-flex', 'men-in-sheds', 'tea-and-tinker', 'out-in-the-city', 'digital-inclusion', 'scams-awareness', 'information-advice', 'ageing-well', 'hospital-aftercare', 'other'];
const GRANT_TYPES = ['attendance-allowance', 'pension-credit', 'warm-homes', 'energy-support', 'housing', 'carers-support', 'dementia-support', 'general', 'other'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack = 90) {
  const now = new Date();
  const past = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return past.toISOString().split('T')[0];
}

function randomFutureDate(daysAhead = 30) {
  const now = new Date();
  const future = new Date(now.getTime() + Math.random() * daysAhead * 24 * 60 * 60 * 1000);
  return future.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { branch_id, branch_name, counts } = await req.json();

    // Populate Clients
    const clientsData = [];
    for (let i = 0; i < counts.clients; i++) {
      clientsData.push({
        full_name: `Client ${i + 1} (${branch_name})`,
        date_of_birth: randomDate(36500),
        address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
        postcode: 'M1 1AD',
        phone: `0161 ${Math.random().toString().slice(2, 5)} ${Math.random().toString().slice(2, 6)}`,
        email: `client${i}@example.com`,
        status: 'active',
        date_registered: randomDate(180),
        key_worker: `Volunteer ${Math.floor(Math.random() * 5) + 1}`
      });
    }
    if (clientsData.length > 0) await base44.asServiceRole.entities.Client.bulkCreate(clientsData);

    // Populate Volunteers
    const volunteersData = [];
    for (let i = 0; i < counts.volunteers; i++) {
      volunteersData.push({
        full_name: `Volunteer ${i + 1}`,
        email: `vol${i}@example.com`,
        phone: `0161 ${Math.random().toString().slice(2, 5)} ${Math.random().toString().slice(2, 6)}`,
        role: randomItem(VOLUNTEER_ROLES),
        status: 'active',
        dbs_checked: Math.random() > 0.3,
        dbs_expiry: randomFutureDate(1095),
        date_joined: randomDate(365),
        hours_contributed: Math.floor(Math.random() * 500),
        area: 'Manchester'
      });
    }
    if (volunteersData.length > 0) await base44.asServiceRole.entities.Volunteer.bulkCreate(volunteersData);

    // Populate Jobs
    const jobsData = [];
    for (let i = 0; i < counts.jobs; i++) {
      jobsData.push({
        client_id: `client-${i % Math.max(1, counts.clients)}`,
        client_name: `Client ${(i % Math.max(1, counts.clients)) + 1} (${branch_name})`,
        volunteer_id: `volunteer-${i % Math.max(1, counts.volunteers)}`,
        volunteer_name: `Volunteer ${(i % Math.max(1, counts.volunteers)) + 1}`,
        job_type: randomItem(JOB_TYPES),
        scheduled_date: new Date(new Date().getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: randomItem(['scheduled', 'completed', 'cancelled']),
        notes: `Job for ${branch_name}`,
        duration_minutes: Math.floor(Math.random() * 180) + 30
      });
    }
    if (jobsData.length > 0) await base44.asServiceRole.entities.Job.bulkCreate(jobsData);

    // Populate Sessions
    const sessionsData = [];
    for (let i = 0; i < counts.sessions; i++) {
      sessionsData.push({
        session_name: `${randomItem(SESSION_TYPES)} Session ${i + 1}`,
        session_type: randomItem(SESSION_TYPES),
        location: `${branch_name} Community Centre`,
        scheduled_date: new Date(new Date().getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        attendees_count: Math.floor(Math.random() * 20) + 5,
        max_capacity: 30,
        status: randomItem(['scheduled', 'completed']),
        facilitator: `Facilitator ${Math.floor(Math.random() * 3) + 1}`,
        notes: `Session at ${branch_name}`
      });
    }
    if (sessionsData.length > 0) await base44.asServiceRole.entities.Session.bulkCreate(sessionsData);

    // Populate Grants
    const grantsData = [];
    for (let i = 0; i < counts.grants; i++) {
      grantsData.push({
        grant_name: `Grant ${i + 1}`,
        funder: randomItem(['Age UK', 'Local Council', 'Charity Commission', 'NHS']),
        amount_awarded: Math.floor(Math.random() * 5000) + 500,
        date_awarded: randomDate(180),
        grant_type: randomItem(GRANT_TYPES),
        client_id: `client-${i % Math.max(1, counts.clients)}`,
        client_name: `Client ${(i % Math.max(1, counts.clients)) + 1} (${branch_name})`,
        status: randomItem(['applied', 'awarded', 'rejected']),
        notes: `Grant for ${branch_name}`
      });
    }
    if (grantsData.length > 0) await base44.asServiceRole.entities.Grant.bulkCreate(grantsData);

    // Populate Compliance Records
    const complianceData = [];
    const areasToPopulate = COMPLIANCE_AREAS.slice(0, counts.complianceAreas);
    for (const area of areasToPopulate) {
      complianceData.push({
        branch_id,
        branch_name,
        compliance_area: area,
        status: randomItem(['compliant', 'at_risk', 'non_compliant', 'pending_review']),
        deadline: randomFutureDate(365),
        last_completed: Math.random() > 0.4 ? randomDate(90) : null,
        assigned_to: `Manager ${Math.floor(Math.random() * 3) + 1}`,
        notes: `${area} tracking for ${branch_name}`,
        risk_level: randomItem(['low', 'medium', 'high', 'critical'])
      });
    }
    if (complianceData.length > 0) await base44.asServiceRole.entities.ComplianceRecord.bulkCreate(complianceData);

    return Response.json({
      success: true,
      message: `Successfully populated data for ${branch_name}`,
      stats: {
        clients: clientsData.length,
        volunteers: volunteersData.length,
        jobs: jobsData.length,
        sessions: sessionsData.length,
        grants: grantsData.length,
        compliance: complianceData.length
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});