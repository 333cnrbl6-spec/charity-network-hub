import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { branch_id } = await req.json();

    const branchData = {
      manchester: {
        name: 'Manchester',
        clients: [
          { full_name: 'Margaret Smith', date_of_birth: '1940-05-12', address: '42 Didsbury Lane', postcode: 'M20 2LN', status: 'active', key_worker: 'John Wilson', referral_source: 'nhs' },
          { full_name: 'David Brown', date_of_birth: '1938-03-22', address: '78 Withington Road', postcode: 'M20 3ER', status: 'active', key_worker: 'Sarah Ahmed', referral_source: 'gp' },
          { full_name: 'Patricia Johnson', date_of_birth: '1945-11-08', address: '23 West Didsbury', postcode: 'M20 5LJ', status: 'active', key_worker: 'Tom Watson', referral_source: 'social-care' },
          { full_name: 'Frank Williams', date_of_birth: '1935-07-15', address: '91 Stockport Road', postcode: 'M14 6LE', status: 'active', key_worker: 'Emma Davis', referral_source: 'self-referral' },
          { full_name: 'Jennifer White', date_of_birth: '1942-09-30', address: '15 Burnage Lane', postcode: 'M19 1PG', status: 'active', key_worker: 'John Wilson', referral_source: 'community-partner' },
        ],
        volunteers: [
          { full_name: 'John Wilson', email: 'john@ageuk-manchester.org', phone: '0161-4412600', role: 'befriender', status: 'active', dbs_checked: true, dbs_expiry: '2027-06-15', date_joined: '2020-01-10', hours_contributed: 420, area: 'Didsbury' },
          { full_name: 'Sarah Ahmed', email: 'sarah@ageuk-manchester.org', phone: '0161-4412601', role: 'digital-champion', status: 'active', dbs_checked: true, dbs_expiry: '2028-03-20', date_joined: '2021-05-15', hours_contributed: 310, area: 'Withington' },
          { full_name: 'Tom Watson', email: 'tom@ageuk-manchester.org', phone: '0161-4412602', role: 'admin', status: 'active', dbs_checked: true, dbs_expiry: '2026-12-10', date_joined: '2019-11-01', hours_contributed: 520, area: 'City Centre' },
          { full_name: 'Emma Davis', email: 'emma@ageuk-manchester.org', phone: '0161-4412603', role: 'befriender', status: 'active', dbs_checked: true, dbs_expiry: '2027-09-15', date_joined: '2020-08-20', hours_contributed: 380, area: 'Burnage' },
          { full_name: 'Michael Brown', email: 'michael@ageuk-manchester.org', phone: '0161-4412604', role: 'driver', status: 'active', dbs_checked: true, dbs_expiry: '2026-04-05', date_joined: '2018-03-10', hours_contributed: 650, area: 'Stockport' },
        ],
        jobs: [
          { client_id: 'c1', client_name: 'Margaret Smith', volunteer_id: 'v1', volunteer_name: 'John Wilson', job_type: 'home-visit', status: 'completed', duration_minutes: 120 },
          { client_id: 'c2', client_name: 'David Brown', volunteer_id: 'v2', volunteer_name: 'Sarah Ahmed', job_type: 'digital-help', status: 'completed', duration_minutes: 90 },
          { client_id: 'c3', client_name: 'Patricia Johnson', volunteer_id: 'v5', volunteer_name: 'Michael Brown', job_type: 'transport', status: 'completed', duration_minutes: 150 },
          { client_id: 'c4', client_name: 'Frank Williams', volunteer_id: 'v3', volunteer_name: 'Tom Watson', job_type: 'benefits-advice', status: 'completed', duration_minutes: 110 },
          { client_id: 'c5', client_name: 'Jennifer White', volunteer_id: 'v1', volunteer_name: 'John Wilson', job_type: 'home-visit', status: 'completed', duration_minutes: 100 },
        ],
        sessions: [
          { session_name: 'Stretch and Flex', session_type: 'stretch-and-flex', location: 'Didsbury Community Centre', attendees_count: 18, max_capacity: 25, status: 'completed', facilitator: 'John Wilson' },
          { session_name: 'Digital Inclusion for Seniors', session_type: 'digital-inclusion', location: 'Manchester Library', attendees_count: 12, max_capacity: 20, status: 'completed', facilitator: 'Sarah Ahmed' },
          { session_name: 'Tea and Tinker Workshop', session_type: 'tea-and-tinker', location: 'Withington Hall', attendees_count: 22, max_capacity: 30, status: 'completed', facilitator: 'Tom Watson' },
        ],
        grants: [
          { grant_name: 'Warm Homes Fund', funder: 'Energy Trust', amount_awarded: 2500, grant_type: 'warm-homes', client_id: 'c1', client_name: 'Margaret Smith', status: 'awarded', date_awarded: '2026-02-15' },
          { grant_name: 'Housing Support Grant', funder: 'Local Council', amount_awarded: 1800, grant_type: 'housing', client_id: 'c4', client_name: 'Frank Williams', status: 'awarded', date_awarded: '2026-01-20' },
          { grant_name: 'Carers Support Fund', funder: 'Age UK', amount_awarded: 1200, grant_type: 'carers-support', client_id: 'c2', client_name: 'David Brown', status: 'awarded', date_awarded: '2026-03-10' },
        ],
      },
      bristol: {
        name: 'Bristol',
        clients: [
          { full_name: 'Helen Thompson', date_of_birth: '1939-02-14', address: '45 Clifton Avenue', postcode: 'BS8 2EX', status: 'active', key_worker: 'Lisa Green', referral_source: 'nhs' },
          { full_name: 'Robert Clarke', date_of_birth: '1936-08-25', address: '112 Redland Road', postcode: 'BS6 6SH', status: 'active', key_worker: 'Mark Jones', referral_source: 'gp' },
          { full_name: 'Susan Lewis', date_of_birth: '1943-01-11', address: '67 Bristol Lane', postcode: 'BS5 8PQ', status: 'active', key_worker: 'Lisa Green', referral_source: 'social-care' },
        ],
        volunteers: [
          { full_name: 'Lisa Green', email: 'lisa@ageuk-bristol.org', phone: '0117-3145600', role: 'befriender', status: 'active', dbs_checked: true, dbs_expiry: '2027-05-20', date_joined: '2020-06-15', hours_contributed: 380, area: 'Clifton' },
          { full_name: 'Mark Jones', email: 'mark@ageuk-bristol.org', phone: '0117-3145601', role: 'admin', status: 'active', dbs_checked: true, dbs_expiry: '2026-10-12', date_joined: '2019-02-01', hours_contributed: 510, area: 'Redland' },
        ],
        jobs: [
          { client_id: 'c1', client_name: 'Helen Thompson', volunteer_id: 'v1', volunteer_name: 'Lisa Green', job_type: 'home-visit', status: 'completed', duration_minutes: 110 },
          { client_id: 'c2', client_name: 'Robert Clarke', volunteer_id: 'v2', volunteer_name: 'Mark Jones', job_type: 'shopping-assist', status: 'completed', duration_minutes: 95 },
        ],
        sessions: [
          { session_name: 'Ageing Well Fitness', session_type: 'ageing-well', location: 'Clifton Park', attendees_count: 16, max_capacity: 25, status: 'completed', facilitator: 'Lisa Green' },
        ],
        grants: [
          { grant_name: 'Energy Support Scheme', funder: 'Government', amount_awarded: 3000, grant_type: 'energy-support', client_id: 'c1', client_name: 'Helen Thompson', status: 'awarded', date_awarded: '2026-02-28' },
        ],
      },
      london: {
        name: 'London',
        clients: [
          { full_name: 'Angela Robinson', date_of_birth: '1941-12-03', address: '89 Highgate Hill', postcode: 'N19 5NE', status: 'active', key_worker: 'Charles Price', referral_source: 'nhs' },
          { full_name: 'Peter Hall', date_of_birth: '1937-06-16', address: '234 Seven Sisters Road', postcode: 'N15 6LS', status: 'active', key_worker: 'Rachel Evans', referral_source: 'gp' },
        ],
        volunteers: [
          { full_name: 'Charles Price', email: 'charles@ageuk-london.org', phone: '020-76461234', role: 'befriender', status: 'active', dbs_checked: true, dbs_expiry: '2027-08-15', date_joined: '2021-01-20', hours_contributed: 290, area: 'Highgate' },
          { full_name: 'Rachel Evans', email: 'rachel@ageuk-london.org', phone: '020-76461235', role: 'admin', status: 'active', dbs_checked: true, dbs_expiry: '2026-11-20', date_joined: '2018-09-10', hours_contributed: 480, area: 'Wood Green' },
        ],
        jobs: [
          { client_id: 'c1', client_name: 'Angela Robinson', volunteer_id: 'v1', volunteer_name: 'Charles Price', job_type: 'home-visit', status: 'completed', duration_minutes: 130 },
          { client_id: 'c2', client_name: 'Peter Hall', volunteer_id: 'v2', volunteer_name: 'Rachel Evans', job_type: 'telephone-check', status: 'completed', duration_minutes: 45 },
        ],
        sessions: [
          { session_name: 'Scams Awareness Session', session_type: 'scams-awareness', location: 'Highgate Library', attendees_count: 20, max_capacity: 30, status: 'completed', facilitator: 'Rachel Evans' },
        ],
        grants: [
          { grant_name: 'Dementia Support Grant', funder: 'NHS London', amount_awarded: 2200, grant_type: 'dementia-support', client_id: 'c1', client_name: 'Angela Robinson', status: 'awarded', date_awarded: '2026-03-05' },
        ],
      },
    };

    const data = branchData[branch_id];
    if (!data) {
      return Response.json({ error: 'Unknown branch' }, { status: 400 });
    }

    // Create all entities
    const clientIds = {};
    const volunteerIds = {};

    // Clients
    for (const clientData of data.clients) {
      const client = await base44.entities.Client.create({
        ...clientData,
        date_registered: new Date().toISOString().split('T')[0],
      });
      clientIds[clientData.full_name] = client.id;
    }

    // Volunteers
    for (const volData of data.volunteers) {
      const volunteer = await base44.entities.Volunteer.create(volData);
      volunteerIds[volData.full_name] = volunteer.id;
    }

    // Jobs (with real client/volunteer IDs)
    for (const jobData of data.jobs) {
      const clientId = Object.values(clientIds)[Math.floor(Math.random() * Object.values(clientIds).length)];
      const volunteerId = Object.values(volunteerIds)[Math.floor(Math.random() * Object.values(volunteerIds).length)];
      await base44.entities.Job.create({
        ...jobData,
        client_id: clientId,
        volunteer_id: volunteerId,
        scheduled_date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Sessions
    for (const sessionData of data.sessions) {
      await base44.entities.Session.create({
        ...sessionData,
        scheduled_date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Grants
    for (const grantData of data.grants) {
      await base44.entities.Grant.create(grantData);
    }

    return Response.json({
      success: true,
      branch: data.name,
      created: {
        clients: data.clients.length,
        volunteers: data.volunteers.length,
        jobs: data.jobs.length,
        sessions: data.sessions.length,
        grants: data.grants.length,
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});