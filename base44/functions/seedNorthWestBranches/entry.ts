/**
 * seedNorthWestBranches
 * Seeds BranchConfig + BranchReport for all 16 North West branches
 * so they show as "online" in the National Dashboard demo.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const NW_BRANCHES = [
  { id: 'bury',              name: 'Age UK Bury',                    postcode: 'BL9',  city: 'Bury',        clients: 62,  volunteers: 27, jobs: 108, sessions: 32, grants_value: 1_850_000 },
  { id: 'manchester',        name: 'Age UK Manchester',              postcode: 'M1',   city: 'Manchester',  clients: 80,  volunteers: 35, jobs: 150, sessions: 45, grants_value: 4_200_000 },
  { id: 'stockport',         name: 'Age UK Stockport',               postcode: 'SK1',  city: 'Stockport',   clients: 58,  volunteers: 24, jobs: 102, sessions: 30, grants_value: 1_620_000 },
  { id: 'bolton',            name: 'Age UK Bolton',                  postcode: 'BL1',  city: 'Bolton',      clients: 55,  volunteers: 22, jobs:  98, sessions: 28, grants_value: 1_480_000 },
  { id: 'salford_trafford',  name: 'Age UK Salford & Trafford',      postcode: 'M41',  city: 'Salford',     clients: 64,  volunteers: 26, jobs: 112, sessions: 33, grants_value: 1_920_000 },
  { id: 'lancashire',        name: 'Age UK Lancashire',              postcode: 'PR1',  city: 'Preston',     clients: 70,  volunteers: 30, jobs: 125, sessions: 38, grants_value: 2_350_000 },
  { id: 'cheshire',          name: 'Age UK Cheshire',                postcode: 'CH1',  city: 'Chester',     clients: 52,  volunteers: 21, jobs:  92, sessions: 27, grants_value: 1_380_000 },
  { id: 'cumbria',           name: 'Age UK Cumbria',                 postcode: 'CA1',  city: 'Carlisle',    clients: 48,  volunteers: 19, jobs:  84, sessions: 24, grants_value: 1_210_000 },
  { id: 'wirral',            name: 'Age UK Wirral',                  postcode: 'CH41', city: 'Birkenhead',  clients: 59,  volunteers: 24, jobs: 104, sessions: 31, grants_value: 1_660_000 },
  { id: 'halton_warrington', name: 'Age UK Halton & Warrington',     postcode: 'WA1',  city: 'Warrington',  clients: 50,  volunteers: 20, jobs:  88, sessions: 26, grants_value: 1_310_000 },
  { id: 'st_helens',         name: 'Age UK St Helens',               postcode: 'WA10', city: 'St Helens',   clients: 46,  volunteers: 18, jobs:  82, sessions: 24, grants_value: 1_150_000 },
  { id: 'knowsley',          name: 'Age UK Knowsley',                postcode: 'L34',  city: 'Prescot',     clients: 44,  volunteers: 17, jobs:  78, sessions: 22, grants_value: 1_080_000 },
  { id: 'oldham',            name: 'Age UK Oldham',                  postcode: 'OL1',  city: 'Oldham',      clients: 53,  volunteers: 21, jobs:  94, sessions: 28, grants_value: 1_440_000 },
  { id: 'rochdale',          name: 'Age UK Rochdale',                postcode: 'OL16', city: 'Rochdale',    clients: 49,  volunteers: 19, jobs:  86, sessions: 25, grants_value: 1_260_000 },
  { id: 'tameside',          name: 'Age UK Tameside',                postcode: 'SK14', city: 'Hyde',        clients: 47,  volunteers: 18, jobs:  82, sessions: 24, grants_value: 1_190_000 },
  { id: 'wigan',             name: 'Age UK Wigan Borough',           postcode: 'WN1',  city: 'Wigan',       clients: 56,  volunteers: 23, jobs: 100, sessions: 30, grants_value: 1_560_000 },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const results = [];

    for (const branch of NW_BRANCHES) {
      // 1. Upsert BranchConfig
      const existing = await base44.asServiceRole.entities.BranchConfig.filter({ branch_id: branch.id });
      if (!existing?.length) {
        await base44.asServiceRole.entities.BranchConfig.create({
          branch_id: branch.id,
          branch_name: branch.name,
          region: 'north_west',
          postcode_area: branch.postcode,
          status: 'active',
          is_demo: true,
          onboarded: true,
          demographics: {
            population_65_plus: Math.floor(branch.clients * 120 + Math.random() * 5000),
            total_population: Math.floor(branch.clients * 800 + Math.random() * 20000),
            deprivation_index: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            data_year: 2024,
          },
        });
      }

      // 2. Create a fresh BranchReport (shows as "online" since it's < 24h old)
      const grantsValue = branch.grants_value + Math.floor(Math.random() * 200_000);
      await base44.asServiceRole.entities.BranchReport.create({
        branch_id: branch.id,
        branch_name: branch.name,
        report_period: '2026-04',
        received_at: now,
        status: 'received',
        stats: {
          total_clients: branch.clients,
          new_clients: Math.floor(branch.clients * 0.12),
          active_volunteers: branch.volunteers,
          total_jobs: branch.jobs,
          completed_jobs: Math.floor(branch.jobs * 0.62),
          total_sessions: branch.sessions,
          grants_awarded: Math.floor(branch.jobs * 0.4),
          grants_total_value: grantsValue,
        },
      });

      // 3. Create a SyncLog entry
      await base44.asServiceRole.entities.SyncLog.create({
        branch_id: branch.id,
        branch_name: branch.name,
        report_period: '2026-04',
        synced_at: now,
        status: 'success',
        records_synced: branch.clients + branch.volunteers + branch.jobs,
      });

      results.push({ branch: branch.id, status: 'seeded' });
    }

    return Response.json({
      success: true,
      branches_seeded: results.length,
      results,
    });
  } catch (error) {
    console.error('[seedNorthWestBranches]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});