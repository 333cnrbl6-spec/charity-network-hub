/**
 * validateClientCatchment — backend function
 *
 * Validates a client's postcode against the branch catchment definitions.
 * Can also be called in bulk to flag all out-of-catchment clients for a branch.
 *
 * POST payload options:
 *   { mode: "single", postcode: "BL9 6NJ", branch_id: "bury" }
 *   { mode: "bulk", branch_id: "bury" }   — checks all clients, returns flagged list
 *   { mode: "all_branches" }              — admin: check all clients across all branches
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Canonical postcode prefix lists per branch (mirrors lib/branchCatchments.js)
const BRANCH_CATCHMENTS = {
  bury:       { name: 'Age UK Bury',       prefixes: ['BL8','BL9','BL0','M25','M26','M45'] },
  wirral:     { name: 'Age UK Wirral',      prefixes: ['CH41','CH42','CH43','CH44','CH45','CH46','CH47','CH48','CH49','CH60','CH61','CH62','CH63','CH64'] },
  manchester: { name: 'Age UK Manchester',  prefixes: ['M1','M2','M3','M4','M8','M9','M11','M12','M13','M14','M15','M16','M18','M19','M20','M21','M22','M23','M40','M60'] },
  stockport:  { name: 'Age UK Stockport',   prefixes: ['SK1','SK2','SK3','SK4','SK5','SK6','SK7','SK8','SK12','SK14'] },
  bolton:     { name: 'Age UK Bolton',      prefixes: ['BL1','BL2','BL3','BL4','BL5','BL6','BL7'] },
  salford:    { name: 'Age UK Salford',     prefixes: ['M3','M5','M6','M7','M27','M28','M29','M30','M38','M44','M50'] },
  lancashire: { name: 'Age UK Lancashire',  prefixes: ['PR1','PR2','PR3','PR4','PR5','PR6','PR7','PR8','PR9','LA1','LA2','LA3','LA4','LA5','LA6','LA7','LA8','LA9','LA10','BB1','BB2','BB3','BB4','BB5','BB6','BB7','BB8','BB9','BB10','BB11','BB12','FY1','FY2','FY3','FY4','FY5','FY6','FY7','FY8'] },
  bristol:    { name: 'Age UK Bristol',     prefixes: ['BS1','BS2','BS3','BS4','BS5','BS6','BS7','BS8','BS9','BS10','BS11','BS13','BS14','BS15','BS16'] },
  liverpool:  { name: 'Age UK Liverpool',   prefixes: ['L1','L2','L3','L4','L5','L6','L7','L8','L9','L10','L11','L12','L13','L14','L15','L16','L17','L18','L19'] },
  sefton:     { name: 'Age UK Sefton',      prefixes: ['L20','L21','L22','L23','L29','L30','L31','PR8','PR9'] },
};

function extractOutwardCode(postcode) {
  if (!postcode) return null;
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, '');
  if (clean.length < 5) return clean;
  return clean.slice(0, clean.length - 3);
}

function checkPostcode(postcode, branchId) {
  const catchment = BRANCH_CATCHMENTS[branchId];
  if (!catchment) return { valid: null, reason: `Unknown branch: ${branchId}` };
  const outward = extractOutwardCode(postcode);
  if (!outward) return { valid: null, outward_code: null, reason: 'No postcode' };
  const match = catchment.prefixes.some(p => outward === p);
  return {
    valid: match,
    outward_code: outward,
    reason: match
      ? `${outward} ✓ within ${catchment.name}`
      : `${outward} ✗ not in ${catchment.name} (expects: ${catchment.prefixes.join(', ')})`
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await req.json();
  const { mode = 'single', postcode, branch_id } = body;

  // Single postcode check
  if (mode === 'single') {
    if (!postcode || !branch_id) {
      return Response.json({ error: 'postcode and branch_id required' }, { status: 400 });
    }
    return Response.json(checkPostcode(postcode, branch_id));
  }

  // Bulk: check all clients for a given branch
  if (mode === 'bulk') {
    if (!branch_id) return Response.json({ error: 'branch_id required' }, { status: 400 });
    const clients = await base44.asServiceRole.entities.Client.list();
    const results = clients.map(c => ({
      id: c.id,
      full_name: c.full_name,
      postcode: c.postcode,
      ...checkPostcode(c.postcode, branch_id)
    }));
    const flagged = results.filter(r => r.valid === false);
    const unknown = results.filter(r => r.valid === null);
    const valid = results.filter(r => r.valid === true);
    return Response.json({
      branch_id,
      branch_name: BRANCH_CATCHMENTS[branch_id]?.name,
      total: results.length,
      in_catchment: valid.length,
      out_of_catchment: flagged.length,
      no_postcode: unknown.length,
      flagged_clients: flagged,
      unknown_clients: unknown,
    });
  }

  // All-branches: admin overview
  if (mode === 'all_branches') {
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    const clients = await base44.asServiceRole.entities.Client.list();
    const summary = {};
    for (const [branchId, catchment] of Object.entries(BRANCH_CATCHMENTS)) {
      const branchClients = clients; // all clients — flag any with wrong postcodes
      const results = branchClients.map(c => ({
        id: c.id,
        full_name: c.full_name,
        postcode: c.postcode,
        ...checkPostcode(c.postcode, branchId)
      }));
      summary[branchId] = {
        branch_name: catchment.name,
        total_checked: results.length,
        in_catchment: results.filter(r => r.valid === true).length,
        out_of_catchment: results.filter(r => r.valid === false).length,
        no_postcode: results.filter(r => r.valid === null).length,
      };
    }
    return Response.json({ summary });
  }

  return Response.json({ error: `Unknown mode: ${mode}` }, { status: 400 });
});