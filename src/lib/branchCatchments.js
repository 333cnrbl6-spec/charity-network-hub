/**
 * Authoritative catchment definitions per Age UK branch.
 * Sources:
 *  - Age UK branch websites and charity commission records
 *  - ONS postcode district boundaries
 *  - Local authority electoral ward data
 *
 * postcode_prefixes: outward code prefixes that fall within this branch's area.
 *   A client postcode matches if it starts with any of these (case-insensitive, spaces stripped).
 *
 * electoral_wards: named wards served (informational / for display).
 *
 * local_authority: the LA(s) this branch primarily operates within.
 */
export const BRANCH_CATCHMENTS = {
  bury: {
    branch_name: 'Age UK Bury',
    local_authority: ['Bury Metropolitan Borough Council'],
    postcode_prefixes: [
      'BL8',  // Bury south, Tottington, Ramsbottom
      'BL9',  // Bury central & north (Jubilee Centre BL9 6NJ)
      'BL0',  // Ramsbottom
      'M25',  // Prestwich (within Bury MBC)
      'M26',  // Radcliffe (within Bury MBC)
      'M45',  // Whitefield (within Bury MBC)
    ],
    electoral_wards: [
      'Besses', 'Church', 'East', 'Elton', 'Holyrood', 'Moorside',
      'North Manor', 'Pilkington Park', 'Ramsbottom', 'Redvales',
      'Shuttleworth', 'Tottington', 'Unsworth', 'West'
    ],
    notes: 'Serves Bury, Ramsbottom, Tottington, Prestwich, Radcliffe and Whitefield — per ageukbury.org.uk'
  },

  wirral: {
    branch_name: 'Age UK Wirral',
    local_authority: ['Wirral Metropolitan Borough Council'],
    postcode_prefixes: [
      'CH41',  // Birkenhead, Seacombe, Tranmere, Woodside
      'CH42',  // Rock Ferry, Bebington fringe
      'CH43',  // Oxton, Prenton, Claughton
      'CH44',  // Wallasey, Seacombe
      'CH45',  // New Brighton, Wallasey
      'CH46',  // Moreton, Leasowe
      'CH47',  // Hoylake, Meols
      'CH48',  // West Kirby, Caldy
      'CH49',  // Upton, Greasby, Woodchurch
      'CH60',  // Heswall
      'CH61',  // Pensby, Thingwall
      'CH62',  // Bebington, Bromborough
      'CH63',  // Spital, Raby, Thornton Hough
      'CH64',  // Neston, Parkgate, Willaston
    ],
    electoral_wards: [
      'Bebington', 'Bidston and St James', 'Birkenhead and Tranmere',
      'Bromborough', 'Claughton', 'Greasby, Frankby and Irby',
      'Heswall', 'Hoylake and Meols', 'Leasowe and Moreton East',
      'Moreton West and Saughall Massie', 'New Brighton', 'Oxton',
      'Pensby and Thingwall', 'Prenton', 'Rock Ferry', 'Seacombe',
      'Upton', 'Wallasey', 'West Kirby and Thurstaston', 'Eastham'
    ],
    notes: 'Serves entire Wirral borough CH41–CH64 — HQ: Devonshire Resource Centre, 141 Park Road North, Birkenhead CH41 0DD'
  },

  manchester: {
    branch_name: 'Age UK Manchester',
    local_authority: ['Manchester City Council'],
    postcode_prefixes: [
      'M1','M2','M3','M4','M8','M9',
      'M11','M12','M13','M14','M15','M16','M18','M19',
      'M20','M21','M22','M23','M40','M60'
    ],
    electoral_wards: [
      'Ancoats and Beswick', 'Ardwick', 'Baguley', 'Bradford',
      'Burnage', 'Charlestown', 'Cheetham', 'Chorlton',
      'Chorlton Park', 'City Centre', 'Clayton and Openshaw',
      'Crumpsall', 'Didsbury East', 'Didsbury West', 'Fallowfield',
      'Gorton North', 'Gorton South', 'Hulme', 'Levenshulme',
      'Longsight', 'Miles Platting and Newton Heath', 'Moss Side',
      'Moston', 'Northenden', 'Old Moat', 'Rusholme',
      'Sharston', 'Whalley Range', 'Withington', 'Woodhouse Park'
    ],
    notes: 'Manchester City Council area only — not Greater Manchester boroughs'
  },

  stockport: {
    branch_name: 'Age UK Stockport',
    local_authority: ['Stockport Metropolitan Borough Council'],
    postcode_prefixes: [
      'SK1','SK2','SK3','SK4','SK5','SK6','SK7','SK8','SK12','SK14'
    ],
    electoral_wards: [
      'Bramhall North', 'Bramhall South', 'Brinnington and Central',
      'Cheadle', 'Cheadle Hulme North', 'Cheadle Hulme South',
      'Davenport and Cale Green', 'Edgeley and Cheadle Heath',
      'Heatons North', 'Heatons South', 'Heald Green',
      'Hazel Grove', 'Marple North', 'Marple South',
      'Offerton', 'Reddish North', 'Reddish South',
      'Stepping Hill', 'Werneth'
    ],
    notes: 'Stockport MBC area — based at 20 Tiviot Dale, Stockport SK1 1TA'
  },

  bolton: {
    branch_name: 'Age UK Bolton',
    local_authority: ['Bolton Metropolitan Borough Council'],
    postcode_prefixes: ['BL1','BL2','BL3','BL4','BL5','BL6','BL7'],
    electoral_wards: [
      'Bradshaw', 'Breightmet', 'Bromley Cross',
      'Crompton', 'Farnworth', 'Great Lever', 'Harper Green',
      'Heaton and Lostock', 'Horwich and Blackrod', 'Hulton',
      'Kearsley', 'Little Lever and Darcy Lever', 'Rumworth',
      'Smithills', 'Tonge with the Haulgh', 'Westhoughton North and Chew Moor',
      'Westhoughton South'
    ],
    notes: 'Bolton MBC area BL1–BL7'
  },

  salford: {
    branch_name: 'Age UK Salford',
    local_authority: ['Salford City Council'],
    postcode_prefixes: ['M3','M5','M6','M7','M27','M28','M29','M30','M38','M44','M50'],
    electoral_wards: [
      'Barton', 'Boothstown and Worsley', 'Broughton',
      'Cadishead', 'Claremont', 'Eccles', 'Irlam',
      'Kersal', 'Langworthy', 'Little Hulton', 'Ordsall',
      'Pendlebury', 'Swinton North', 'Swinton South',
      'Weaste and Seedley', 'Winton', 'Worsley'
    ],
    notes: 'Salford City Council area'
  },

  lancashire: {
    branch_name: 'Age UK Lancashire',
    local_authority: ['Lancashire County Council'],
    postcode_prefixes: [
      'PR1','PR2','PR3','PR4','PR5','PR6','PR7','PR8','PR9',
      'LA1','LA2','LA3','LA4','LA5','LA6','LA7','LA8','LA9','LA10',
      'BB1','BB2','BB3','BB4','BB5','BB6','BB7','BB8','BB9','BB10','BB11','BB12',
      'FY1','FY2','FY3','FY4','FY5','FY6','FY7','FY8'
    ],
    electoral_wards: [],
    notes: 'Lancashire county-wide — districts: Preston, Lancaster, Ribble Valley, Fylde, Blackpool, Burnley, Pendle, Rossendale, Hyndburn, Chorley, South Ribble, West Lancashire'
  },

  bristol: {
    branch_name: 'Age UK Bristol',
    local_authority: ['Bristol City Council'],
    postcode_prefixes: [
      'BS1','BS2','BS3','BS4','BS5','BS6','BS7','BS8','BS9','BS10',
      'BS11','BS13','BS14','BS15','BS16'
    ],
    electoral_wards: [
      'Avonmouth and Lawrence Weston', 'Bedminster', 'Bishopston and Ashley Down',
      'Bishopsworth', 'Brislington East', 'Brislington West',
      'Central', 'Clifton', 'Clifton Down', 'Cotham',
      'Eastville', 'Filwood', 'Frome Vale', 'Hartcliffe and Withywood',
      'Henbury and Brentry', 'Hengrove and Whitchurch Park',
      'Hillfields', 'Horfield', 'Hotwells and Harbourside',
      'Kingsweston', 'Knowle', 'Lawrence Hill', 'Lockleaze',
      'Redland', 'Southmead', 'Southville', 'Stoke Bishop',
      "Totterdown and St Anne's", 'Windmill Hill'
    ],
    notes: 'Bristol City — HQ: The Withywood Centre, Queens Road, BS13 8QA (South Bristol primary focus)'
  },

  liverpool: {
    branch_name: 'Age UK Liverpool',
    local_authority: ['Liverpool City Council'],
    postcode_prefixes: [
      'L1','L2','L3','L4','L5','L6','L7','L8','L9',
      'L10','L11','L12','L13','L14','L15','L16','L17','L18','L19'
    ],
    electoral_wards: [
      'Anfield', 'Belle Vale', 'Central', 'Childwall', 'Church',
      'Clubmoor', 'County', 'Cressington', 'Croxteth', 'Everton',
      'Fazakerley', 'Greenbank', 'Kensington and Fairfield',
      'Kirkdale', 'Knotty Ash', 'Mossley Hill', 'Norris Green',
      'Old Swan', 'Picton', 'Princes Park', 'Riverside',
      'Speke-Garston', 'Tuebrook and Stoneycroft', 'Wavertree',
      'West Derby', 'Woolton', 'Yew Tree'
    ],
    notes: 'Liverpool City Council area L1–L19'
  },

  sefton: {
    branch_name: 'Age UK Sefton',
    local_authority: ['Sefton Metropolitan Borough Council'],
    postcode_prefixes: ['L20','L21','L22','L23','L29','L30','L31','PR8','PR9'],
    electoral_wards: [
      'Bootle', 'Derby', 'Dukes', 'Ford', 'Harington',
      'Kew', 'Linacre', 'Manor', 'Meols', 'Molyneux',
      'Norwood', 'Park', 'Ravenmeols', 'Rothbury', 'St Oswald',
      'Sudell', 'Victoria', 'Waterloo'
    ],
    notes: 'Sefton borough — Southport, Formby, Maghull, Bootle, Crosby'
  },
};

/**
 * Normalise a UK postcode to just the outward (district) code.
 * e.g. "BL9 6NJ" → "BL9",  "CH41 0DD" → "CH41", "M25 1AA" → "M25"
 */
export function extractOutwardCode(postcode) {
  if (!postcode) return null;
  const clean = postcode.trim().toUpperCase().replace(/\s+/g, '');
  // UK outward codes are the portion before the last 3 chars (inward code NAA)
  if (clean.length < 5) return clean; // too short — return as-is
  return clean.slice(0, clean.length - 3);
}

/**
 * Check whether a postcode falls within a branch's catchment.
 * Returns { valid: bool, outward_code: string, branch_id: string, reason: string }
 */
export function isPostcodeInCatchment(postcode, branchId) {
  const catchment = BRANCH_CATCHMENTS[branchId];
  if (!catchment) {
    return { valid: null, reason: `No catchment data for branch "${branchId}"` };
  }

  const outward = extractOutwardCode(postcode);
  if (!outward) {
    return { valid: null, outward_code: null, reason: 'No postcode provided' };
  }

  const match = catchment.postcode_prefixes.some(
    prefix => outward === prefix.toUpperCase()
  );

  return {
    valid: match,
    outward_code: outward,
    branch_id: branchId,
    branch_name: catchment.branch_name,
    reason: match
      ? `Postcode ${outward} is within ${catchment.branch_name} catchment`
      : `Postcode ${outward} is NOT within ${catchment.branch_name} catchment (${catchment.postcode_prefixes.join(', ')})`
  };
}

/**
 * Given a postcode, find which branch(es) it belongs to across all catchments.
 */
export function findBranchesForPostcode(postcode) {
  const outward = extractOutwardCode(postcode);
  if (!outward) return [];
  return Object.entries(BRANCH_CATCHMENTS)
    .filter(([, c]) => c.postcode_prefixes.some(p => outward === p.toUpperCase()))
    .map(([id, c]) => ({ branch_id: id, branch_name: c.branch_name }));
}