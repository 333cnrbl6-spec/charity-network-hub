/**
 * Age UK National Branch Network
 * ~115 local Age UK charities across England, Wales, Scotland & NI
 * Organised by region with postcode areas for auto-placement
 */

export const REGIONS = {
  north_west:       { label: 'North West England',      colour: '#7c3aed' },
  north_east:       { label: 'North East England',       colour: '#2563eb' },
  yorkshire:        { label: 'Yorkshire & Humber',       colour: '#0891b2' },
  east_midlands:    { label: 'East Midlands',            colour: '#059669' },
  west_midlands:    { label: 'West Midlands',            colour: '#16a34a' },
  east:             { label: 'East of England',          colour: '#ca8a04' },
  london:           { label: 'London',                   colour: '#dc2626' },
  south_east:       { label: 'South East England',       colour: '#ea580c' },
  south_west:       { label: 'South West England',       colour: '#9333ea' },
  wales:            { label: 'Wales',                    colour: '#15803d' },
  scotland:         { label: 'Scotland',                 colour: '#1d4ed8' },
  northern_ireland: { label: 'Northern Ireland',         colour: '#b45309' },
};

export const AGE_UK_BRANCHES = [
  // ── NORTH WEST ───────────────────────────────────────────────────────────
  { id: 'bury',               name: 'Age UK Bury',                       region: 'north_west', postcode: 'BL9',  city: 'Bury' },
  { id: 'manchester',         name: 'Age UK Manchester',                 region: 'north_west', postcode: 'M1',   city: 'Manchester' },
  { id: 'stockport',          name: 'Age UK Stockport',                  region: 'north_west', postcode: 'SK1',  city: 'Stockport' },
  { id: 'bolton',             name: 'Age UK Bolton',                     region: 'north_west', postcode: 'BL1',  city: 'Bolton' },
  { id: 'salford_trafford',   name: 'Age UK Salford & Trafford',         region: 'north_west', postcode: 'M41',  city: 'Salford / Trafford' },
  { id: 'lancashire',         name: 'Age UK Lancashire',                 region: 'north_west', postcode: 'PR1',  city: 'Preston' },
  { id: 'cheshire',           name: 'Age UK Cheshire',                   region: 'north_west', postcode: 'CH1',  city: 'Chester' },
  { id: 'cumbria',            name: 'Age UK Cumbria',                    region: 'north_west', postcode: 'CA1',  city: 'Carlisle' },
  { id: 'wirral',             name: 'Age UK Wirral',                     region: 'north_west', postcode: 'CH41', city: 'Birkenhead' },
  { id: 'halton_warrington',  name: 'Age UK Halton & Warrington',        region: 'north_west', postcode: 'WA1',  city: 'Warrington' },
  { id: 'st_helens',          name: 'Age UK St Helens',                  region: 'north_west', postcode: 'WA10', city: 'St Helens' },
  { id: 'knowsley',           name: 'Age UK Knowsley',                   region: 'north_west', postcode: 'L34',  city: 'Prescot' },
  { id: 'oldham',             name: 'Age UK Oldham',                     region: 'north_west', postcode: 'OL1',  city: 'Oldham' },
  { id: 'rochdale',           name: 'Age UK Rochdale',                   region: 'north_west', postcode: 'OL16', city: 'Rochdale' },
  { id: 'tameside',           name: 'Age UK Tameside',                   region: 'north_west', postcode: 'SK14', city: 'Hyde' },
  { id: 'wigan',              name: 'Age UK Wigan Borough',              region: 'north_west', postcode: 'WN1',  city: 'Wigan' },
  // ── NORTH EAST ───────────────────────────────────────────────────────────
  { id: 'newcastle',          name: 'Age UK Newcastle',                  region: 'north_east', postcode: 'NE1',  city: 'Newcastle upon Tyne' },
  { id: 'sunderland',         name: 'Age UK Sunderland',                 region: 'north_east', postcode: 'SR1',  city: 'Sunderland' },
  { id: 'gateshead',          name: 'Age UK Gateshead',                  region: 'north_east', postcode: 'NE8',  city: 'Gateshead' },
  { id: 'county_durham',      name: 'Age UK County Durham',              region: 'north_east', postcode: 'DH1',  city: 'Durham' },
  { id: 'teesside',           name: 'Age UK Teesside',                   region: 'north_east', postcode: 'TS1',  city: 'Middlesbrough' },
  { id: 'northumberland',     name: 'Age UK Northumberland',             region: 'north_east', postcode: 'NE46', city: 'Hexham' },
  // ── YORKSHIRE & HUMBER ───────────────────────────────────────────────────
  { id: 'leeds',              name: 'Age UK Leeds',                      region: 'yorkshire',  postcode: 'LS1',  city: 'Leeds' },
  { id: 'sheffield',          name: 'Age UK Sheffield',                  region: 'yorkshire',  postcode: 'S1',   city: 'Sheffield' },
  { id: 'bradford',           name: 'Age UK Bradford & District',        region: 'yorkshire',  postcode: 'BD1',  city: 'Bradford' },
  { id: 'calderdale',         name: 'Age UK Calderdale & Kirklees',      region: 'yorkshire',  postcode: 'HX1',  city: 'Halifax' },
  { id: 'hull',               name: 'Age UK Hull',                       region: 'yorkshire',  postcode: 'HU1',  city: 'Kingston upon Hull' },
  { id: 'east_riding',        name: 'Age UK East Riding',                region: 'yorkshire',  postcode: 'HU17', city: 'Beverley' },
  { id: 'york',               name: 'Age UK York',                       region: 'yorkshire',  postcode: 'YO1',  city: 'York' },
  { id: 'north_yorkshire',    name: 'Age UK North Yorkshire',            region: 'yorkshire',  postcode: 'HG1',  city: 'Harrogate' },
  { id: 'barnsley',           name: 'Age UK Barnsley',                   region: 'yorkshire',  postcode: 'S70',  city: 'Barnsley' },
  { id: 'rotherham',          name: 'Age UK Rotherham',                  region: 'yorkshire',  postcode: 'S60',  city: 'Rotherham' },
  // ── EAST MIDLANDS ────────────────────────────────────────────────────────
  { id: 'leicester',          name: 'Age UK Leicester Shire & Rutland',  region: 'east_midlands', postcode: 'LE1',  city: 'Leicester' },
  { id: 'nottingham',         name: 'Age UK Notts',                      region: 'east_midlands', postcode: 'NG1',  city: 'Nottingham' },
  { id: 'derby',              name: 'Age UK Derby & Derbyshire',         region: 'east_midlands', postcode: 'DE1',  city: 'Derby' },
  { id: 'lincolnshire',       name: 'Age UK Lincolnshire',               region: 'east_midlands', postcode: 'LN1',  city: 'Lincoln' },
  { id: 'northamptonshire',   name: 'Age UK Northamptonshire',           region: 'east_midlands', postcode: 'NN1',  city: 'Northampton' },
  // ── WEST MIDLANDS ────────────────────────────────────────────────────────
  { id: 'birmingham',         name: 'Age UK Birmingham',                 region: 'west_midlands', postcode: 'B1',   city: 'Birmingham' },
  { id: 'coventry_warwick',   name: 'Age UK Coventry & Warwickshire',    region: 'west_midlands', postcode: 'CV1',  city: 'Coventry' },
  { id: 'wolverhampton',      name: 'Age UK Wolverhampton',              region: 'west_midlands', postcode: 'WV1',  city: 'Wolverhampton' },
  { id: 'sandwell',           name: 'Age UK Sandwell',                   region: 'west_midlands', postcode: 'B69',  city: 'Oldbury' },
  { id: 'dudley',             name: 'Age UK Dudley',                     region: 'west_midlands', postcode: 'DY1',  city: 'Dudley' },
  { id: 'walsall',            name: 'Age UK Walsall',                    region: 'west_midlands', postcode: 'WS1',  city: 'Walsall' },
  { id: 'staffordshire',      name: 'Age UK Staffordshire',              region: 'west_midlands', postcode: 'ST1',  city: 'Hanley' },
  { id: 'shropshire',         name: 'Age UK Shropshire, Telford & Wrekin', region: 'west_midlands', postcode: 'SY1', city: 'Shrewsbury' },
  { id: 'hereford_worcester', name: 'Age UK Herefordshire & Worcestershire', region: 'west_midlands', postcode: 'WR1', city: 'Worcester' },
  // ── EAST OF ENGLAND ──────────────────────────────────────────────────────
  { id: 'norfolk',            name: 'Age UK Norfolk',                    region: 'east',       postcode: 'NR1',  city: 'Norwich' },
  { id: 'suffolk',            name: 'Age UK Suffolk',                    region: 'east',       postcode: 'IP1',  city: 'Ipswich' },
  { id: 'cambridgeshire',     name: 'Age UK Cambridgeshire & Peterborough', region: 'east',  postcode: 'CB1',  city: 'Cambridge' },
  { id: 'hertfordshire',      name: 'Age UK Hertfordshire',              region: 'east',       postcode: 'AL1',  city: 'St Albans' },
  { id: 'bedfordshire',       name: 'Age UK Bedfordshire',               region: 'east',       postcode: 'MK40', city: 'Bedford' },
  { id: 'essex_south',        name: 'Age UK South Essex',                region: 'east',       postcode: 'SS1',  city: 'Southend-on-Sea' },
  { id: 'essex_north',        name: 'Age UK North Essex',                region: 'east',       postcode: 'CO1',  city: 'Colchester' },
  // ── LONDON ───────────────────────────────────────────────────────────────
  { id: 'camden_islington',   name: 'Age UK Camden',                     region: 'london',     postcode: 'NW1',  city: 'Camden' },
  { id: 'islington',          name: 'Age UK Islington',                  region: 'london',     postcode: 'N1',   city: 'Islington' },
  { id: 'east_london',        name: 'Age UK East London',                region: 'london',     postcode: 'E1',   city: 'Tower Hamlets' },
  { id: 'westminster',        name: 'Age UK Westminster',                region: 'london',     postcode: 'W1',   city: 'Westminster' },
  { id: 'lambeth_southwark',  name: 'Age UK Lewisham & Southwark',       region: 'london',     postcode: 'SE1',  city: 'Southwark' },
  { id: 'lewisham',           name: 'Age UK Lewisham',                   region: 'london',     postcode: 'SE6',  city: 'Lewisham' },
  { id: 'bromley',            name: 'Age UK Bromley',                    region: 'london',     postcode: 'BR1',  city: 'Bromley' },
  { id: 'croydon',            name: 'Age UK Croydon',                    region: 'london',     postcode: 'CR0',  city: 'Croydon' },
  { id: 'richmond',           name: 'Age UK Richmond',                   region: 'london',     postcode: 'TW9',  city: 'Richmond' },
  { id: 'wandsworth',         name: 'Age UK Wandsworth',                 region: 'london',     postcode: 'SW18', city: 'Wandsworth' },
  { id: 'haringey',           name: 'Age UK Haringey',                   region: 'london',     postcode: 'N15',  city: 'Tottenham' },
  { id: 'hackney',            name: 'Age UK Hackney',                    region: 'london',     postcode: 'E8',   city: 'Hackney' },
  // ── SOUTH EAST ───────────────────────────────────────────────────────────
  { id: 'kent',               name: 'Age UK Kent',                       region: 'south_east', postcode: 'ME14', city: 'Maidstone' },
  { id: 'sussex',             name: 'Age UK East Sussex',                region: 'south_east', postcode: 'BN1',  city: 'Brighton' },
  { id: 'west_sussex',        name: 'Age UK West Sussex',                region: 'south_east', postcode: 'RH10', city: 'Crawley' },
  { id: 'surrey',             name: 'Age UK Surrey',                     region: 'south_east', postcode: 'GU1',  city: 'Guildford' },
  { id: 'oxfordshire',        name: 'Age UK Oxfordshire',                region: 'south_east', postcode: 'OX1',  city: 'Oxford' },
  { id: 'berkshire',          name: 'Age UK Berkshire',                  region: 'south_east', postcode: 'RG1',  city: 'Reading' },
  { id: 'buckinghamshire',    name: 'Age UK Buckinghamshire',            region: 'south_east', postcode: 'HP20', city: 'Aylesbury' },
  { id: 'hampshire',          name: 'Age UK Hampshire',                  region: 'south_east', postcode: 'SO14', city: 'Southampton' },
  { id: 'isle_of_wight',      name: 'Age UK Isle of Wight',              region: 'south_east', postcode: 'PO30', city: 'Newport' },
  // ── SOUTH WEST ───────────────────────────────────────────────────────────
  { id: 'bristol',            name: 'Age UK Bristol',                    region: 'south_west', postcode: 'BS1',  city: 'Bristol' },
  { id: 'somerset',           name: 'Age UK Somerset',                   region: 'south_west', postcode: 'TA1',  city: 'Taunton' },
  { id: 'bath_nes',           name: 'Age UK Bath & North East Somerset', region: 'south_west', postcode: 'BA1',  city: 'Bath' },
  { id: 'wiltshire',          name: 'Age UK Wiltshire',                  region: 'south_west', postcode: 'SN1',  city: 'Swindon' },
  { id: 'dorset',             name: 'Age UK Dorset',                     region: 'south_west', postcode: 'BH1',  city: 'Bournemouth' },
  { id: 'devon',              name: 'Age UK Devon',                      region: 'south_west', postcode: 'EX1',  city: 'Exeter' },
  { id: 'cornwall',           name: 'Age UK Cornwall & Isles of Scilly', region: 'south_west', postcode: 'TR1',  city: 'Truro' },
  { id: 'gloucestershire',    name: 'Age UK Gloucestershire',            region: 'south_west', postcode: 'GL1',  city: 'Gloucester' },
  // ── WALES ────────────────────────────────────────────────────────────────
  { id: 'cardiff',            name: 'Age Cymru Gwent',                   region: 'wales',      postcode: 'CF10', city: 'Cardiff' },
  { id: 'swansea',            name: 'Age Cymru Swansea Bay',             region: 'wales',      postcode: 'SA1',  city: 'Swansea' },
  { id: 'north_wales',        name: 'Age Cymru North Wales',             region: 'wales',      postcode: 'LL30', city: 'Llandudno' },
  { id: 'mid_wales',          name: 'Age Cymru Mid Wales',               region: 'wales',      postcode: 'SY16', city: 'Newtown' },
];

/**
 * Find branch and auto-place in region from postcode prefix
 */
export function findBranchByPostcode(postcodePrefix) {
  const upper = postcodePrefix.toUpperCase().replace(/\s/g, '');
  return AGE_UK_BRANCHES.find(b => b.postcode.startsWith(upper.slice(0, 2)));
}

export function getBranchesByRegion(regionId) {
  return AGE_UK_BRANCHES.filter(b => b.region === regionId);
}

export function getBranchById(id) {
  return AGE_UK_BRANCHES.find(b => b.id === id);
}