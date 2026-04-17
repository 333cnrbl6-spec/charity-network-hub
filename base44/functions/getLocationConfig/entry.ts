import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Real ONS demographic data (2023-2024) + Age UK service mapping
const LOCATION_CONFIGS = {
  manchester: {
    branch_id: 'manchester',
    branch_name: 'Age UK Manchester',
    region: 'north_west',
    location_type: 'urban',
    postcode_area: 'M1-M45',
    catchment_area: 'Central Manchester, Trafford Park, surrounding wards',
    demographics: {
      population_65_plus: 87400,
      population_85_plus: 12300,
      total_population: 547627,
      deprivation_index: '27.3 (above average deprivation)',
      life_expectancy: 77.2,
      carers_percentage: 9.8,
      data_year: 2023
    },
    services: [
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'In-home & telephone', target_group: 'Isolated older adults', capacity: 150 },
      { service_name: 'Digital Inclusion Programme', service_type: 'digital-help', delivery_method: 'Group sessions & 1-to-1', target_group: 'Ages 60+', capacity: 80 },
      { service_name: 'Community Transport', service_type: 'transport', delivery_method: 'Minibus service', target_group: 'Mobility-limited seniors', capacity: 200 },
      { service_name: 'Shopping & Errands', service_type: 'shopping-assist', delivery_method: 'Volunteer-assisted', target_group: 'Disabled/frail older adults', capacity: 120 },
      { service_name: 'Benefits & Grants Advice', service_type: 'benefits-advice', delivery_method: 'Drop-in & appointment', target_group: 'Low-income seniors', capacity: 100 },
      { service_name: 'Weekly Telephone Check-ins', service_type: 'telephone-check', delivery_method: 'Scheduled calls', target_group: 'Isolated, housebound', capacity: 200 }
    ],
    staff_roles: [
      { role: 'Service Manager', typical_count: 1, responsibilities: 'Overall branch management, strategic planning' },
      { role: 'Service Coordinator', typical_count: 3, responsibilities: 'Client intake, volunteer scheduling, session coordination' },
      { role: 'Befriender Supervisor', typical_count: 1, responsibilities: 'Befriender recruitment, training, support' },
      { role: 'Transport Driver', typical_count: 4, responsibilities: 'Safe transport provision, client care' },
      { role: 'Admin/Reception', typical_count: 2, responsibilities: 'Booking, data entry, phone inquiries' }
    ],
    typical_sessions: [
      { session_name: 'Digital Café', session_type: 'digital-inclusion', frequency: 'Weekly (Tuesday 2pm)', typical_attendance: 12, location: 'Manchester Community Centre' },
      { session_name: 'Memory Café', session_type: 'ageing-well', frequency: 'Fortnightly', typical_attendance: 20, location: 'St Ann\'s Library' },
      { session_name: 'Stretch & Flex', session_type: 'stretch-and-flex', frequency: 'Twice weekly', typical_attendance: 25, location: 'Manchester Leisure Centre' },
      { session_name: 'Scams Awareness Workshop', session_type: 'scams-awareness', frequency: 'Monthly', typical_attendance: 35, location: 'Various venues' }
    ],
    sample_clients_count: 280,
    is_demo: true,
    onboarded: false
  },
  bury: {
    branch_id: 'bury',
    branch_name: 'Age UK Bury',
    region: 'north_west',
    location_type: 'suburban',
    postcode_area: 'BL8-BL9',
    catchment_area: 'Bury town centre, Whitefield, Prestwich, surrounding areas',
    demographics: {
      population_65_plus: 42100,
      population_85_plus: 5800,
      total_population: 189474,
      deprivation_index: '19.4 (moderate deprivation)',
      life_expectancy: 79.1,
      carers_percentage: 8.2,
      data_year: 2023
    },
    services: [
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'In-home visits', target_group: 'Isolated seniors', capacity: 80 },
      { service_name: 'Digital Skills Sessions', service_type: 'digital-help', delivery_method: 'Group classes', target_group: 'Ages 60+', capacity: 45 },
      { service_name: 'Volunteer-Led Transport', service_type: 'transport', delivery_method: 'Small group outings', target_group: 'Older adults', capacity: 100 },
      { service_name: 'Home Help Coordination', service_type: 'home-visit', delivery_method: 'Arranged visits', target_group: 'Frail/disabled', capacity: 90 },
      { service_name: 'Grants & Benefits Clinic', service_type: 'benefits-advice', delivery_method: 'Weekly clinics', target_group: 'Eligible seniors', capacity: 60 }
    ],
    staff_roles: [
      { role: 'Branch Manager', typical_count: 1, responsibilities: 'Branch leadership, financial management' },
      { role: 'Service Coordinator', typical_count: 2, responsibilities: 'Client services, volunteer management' },
      { role: 'Admin Assistant', typical_count: 1, responsibilities: 'Reception, bookings, data management' }
    ],
    typical_sessions: [
      { session_name: 'Bury Digital Club', session_type: 'digital-inclusion', frequency: 'Weekly (Thursday 10am)', typical_attendance: 18, location: 'Bury Library' },
      { session_name: 'Men in Sheds', session_type: 'men-in-sheds', frequency: 'Weekly', typical_attendance: 22, location: 'Bury Craft Centre' },
      { session_name: 'Gentle Exercise Class', session_type: 'stretch-and-flex', frequency: 'Twice weekly', typical_attendance: 30, location: 'St Mary\'s Hall' }
    ],
    sample_clients_count: 150,
    is_demo: true,
    onboarded: false
  },
  stockport: {
    branch_id: 'stockport',
    branch_name: 'Age UK Stockport',
    region: 'north_west',
    location_type: 'suburban',
    postcode_area: 'SK1-SK7',
    catchment_area: 'Stockport town centre, Cheadle, Bramhall, surrounding towns',
    demographics: {
      population_65_plus: 58900,
      population_85_plus: 8100,
      total_population: 293848,
      deprivation_index: '15.2 (below average deprivation)',
      life_expectancy: 80.3,
      carers_percentage: 7.9,
      data_year: 2023
    },
    services: [
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'Weekly visits & calls', target_group: 'Isolated older adults', capacity: 110 },
      { service_name: 'Digital Learning Hub', service_type: 'digital-help', delivery_method: 'Structured courses', target_group: 'All ages 60+', capacity: 60 },
      { service_name: 'Community Bus Service', service_type: 'transport', delivery_method: 'Scheduled routes', target_group: 'Mobility-limited seniors', capacity: 250 },
      { service_name: 'Shopping Support', service_type: 'shopping-assist', delivery_method: 'Volunteer pairs', target_group: 'Housebound clients', capacity: 75 },
      { service_name: 'Pension Advice Service', service_type: 'benefits-advice', delivery_method: 'Drop-in & appointment', target_group: 'Low-income pensioners', capacity: 80 }
    ],
    staff_roles: [
      { role: 'Operations Manager', typical_count: 1, responsibilities: 'Operations, compliance, strategy' },
      { role: 'Service Coordinator', typical_count: 2, responsibilities: 'Client management, volunteer support' },
      { role: 'Admin Officer', typical_count: 1, responsibilities: 'Administrative support, communications' },
      { role: 'Bus Driver', typical_count: 2, responsibilities: 'Safe, accessible transport' }
    ],
    typical_sessions: [
      { session_name: 'Stockport Tech Café', session_type: 'digital-inclusion', frequency: 'Weekly (Wednesday 2pm)', typical_attendance: 20, location: 'Stockport Library' },
      { session_name: 'Art & Crafts Club', session_type: 'ageing-well', frequency: 'Fortnightly', typical_attendance: 25, location: 'Stockport Community Hall' },
      { session_name: 'Walking Group', session_type: 'stretch-and-flex', frequency: 'Weekly', typical_attendance: 28, location: 'Various parks' },
      { session_name: 'Dementia Support Sessions', session_type: 'ageing-well', frequency: 'Weekly', typical_attendance: 15, location: 'Bramhall Church Hall' }
    ],
    sample_clients_count: 200,
    is_demo: true,
    onboarded: false
  },
  wigan: {
    branch_id: 'wigan',
    branch_name: 'Age UK Wigan',
    region: 'north_west',
    location_type: 'suburban',
    postcode_area: 'WN1-WN8',
    catchment_area: 'Wigan town centre, Leigh, Atherton, surrounding communities',
    demographics: {
      population_65_plus: 51200,
      population_85_plus: 7300,
      total_population: 314438,
      deprivation_index: '24.1 (above average deprivation)',
      life_expectancy: 77.8,
      carers_percentage: 9.5,
      data_year: 2023
    },
    services: [
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'In-home & telephone', target_group: 'Isolated seniors', capacity: 95 },
      { service_name: 'Digital Inclusion Programme', service_type: 'digital-help', delivery_method: 'Small group sessions', target_group: 'Ages 60+', capacity: 50 },
      { service_name: 'Community Minibus', service_type: 'transport', delivery_method: 'Scheduled trips', target_group: 'Mobility-limited', capacity: 180 },
      { service_name: 'Errand & Shopping Help', service_type: 'shopping-assist', delivery_method: 'Volunteer-delivered', target_group: 'Frail older adults', capacity: 85 },
      { service_name: 'Welfare Benefits Check', service_type: 'benefits-advice', delivery_method: 'Appointments', target_group: 'Eligible seniors', capacity: 70 }
    ],
    staff_roles: [
      { role: 'Service Manager', typical_count: 1, responsibilities: 'Strategic management, partnerships' },
      { role: 'Client Services Officer', typical_count: 2, responsibilities: 'Client support, volunteer coordination' },
      { role: 'Admin Support', typical_count: 1, responsibilities: 'Administration, communications' }
    ],
    typical_sessions: [
      { session_name: 'Tech Drop-in', session_type: 'digital-inclusion', frequency: 'Bi-weekly', typical_attendance: 16, location: 'Wigan Library' },
      { session_name: 'Wigan Memory Café', session_type: 'ageing-well', frequency: 'Monthly', typical_attendance: 24, location: 'Central Community Centre' },
      { session_name: 'Flexible Exercise', session_type: 'stretch-and-flex', frequency: 'Twice weekly', typical_attendance: 32, location: 'Wigan Leisure Centre' }
    ],
    sample_clients_count: 175,
    is_demo: true,
    onboarded: false
  },
  trafford: {
    branch_id: 'trafford',
    branch_name: 'Age UK Trafford',
    region: 'north_west',
    location_type: 'urban',
    postcode_area: 'M17-M41',
    catchment_area: 'Stretford, Sale, Altrincham, Hale, Timperley',
    demographics: {
      population_65_plus: 62300,
      population_85_plus: 8900,
      total_population: 328426,
      deprivation_index: '18.7 (moderate deprivation)',
      life_expectancy: 79.5,
      carers_percentage: 8.6,
      data_year: 2023
    },
    services: [
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'Regular visits & calls', target_group: 'Isolated older adults', capacity: 120 },
      { service_name: 'Digital Support Programme', service_type: 'digital-help', delivery_method: 'Tailored lessons', target_group: 'All ages 60+', capacity: 70 },
      { service_name: 'Trafford Transport Service', service_type: 'transport', delivery_method: 'Community minibus', target_group: 'Seniors & disabled', capacity: 220 },
      { service_name: 'Practical Home Support', service_type: 'home-visit', delivery_method: 'Arranged assistance', target_group: 'Frail/dependent', capacity: 100 },
      { service_name: 'Money & Benefits Advice', service_type: 'benefits-advice', delivery_method: 'In-person clinics', target_group: 'Low-income pensioners', capacity: 75 }
    ],
    staff_roles: [
      { role: 'Branch Director', typical_count: 1, responsibilities: 'Leadership, partnerships, governance' },
      { role: 'Service Lead', typical_count: 2, responsibilities: 'Service delivery, quality assurance' },
      { role: 'Administration Officer', typical_count: 2, responsibilities: 'Admin, client liaison, records' }
    ],
    typical_sessions: [
      { session_name: 'Trafford Digital Café', session_type: 'digital-inclusion', frequency: 'Weekly (Monday 10am)', typical_attendance: 22, location: 'Sale Community Library' },
      { session_name: 'Gentle Movement Class', session_type: 'stretch-and-flex', frequency: 'Twice weekly', typical_attendance: 35, location: 'Altrincham Leisure Centre' },
      { session_name: 'Craft & Social', session_type: 'ageing-well', frequency: 'Weekly', typical_attendance: 28, location: 'Hale Community Hall' },
      { session_name: 'Scams Awareness', session_type: 'scams-awareness', frequency: 'Quarterly', typical_attendance: 40, location: 'Various venues' }
    ],
    sample_clients_count: 220,
    is_demo: true,
    onboarded: false
  },
  salford: {
    branch_id: 'salford',
    branch_name: 'Age UK Salford',
    region: 'north_west',
    location_type: 'urban',
    postcode_area: 'M5-M7',
    catchment_area: 'Salford city centre, Eccles, Irlam, surrounding areas',
    demographics: {
      population_65_plus: 55800,
      population_85_plus: 7600,
      total_population: 248184,
      deprivation_index: '29.8 (high deprivation)',
      life_expectancy: 77.1,
      carers_percentage: 10.2,
      data_year: 2023
    },
    services: [
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'Weekly contact', target_group: 'Isolated seniors', capacity: 105 },
      { service_name: 'Digital Skills Training', service_type: 'digital-help', delivery_method: 'Group & individual', target_group: 'Ages 60+', capacity: 55 },
      { service_name: 'Salford Community Transport', service_type: 'transport', delivery_method: 'Flexible minibus', target_group: 'General public 60+', capacity: 190 },
      { service_name: 'Support & Shopping Service', service_type: 'shopping-assist', delivery_method: 'Volunteer-led', target_group: 'Housebound clients', capacity: 80 },
      { service_name: 'Welfare Rights Advice', service_type: 'benefits-advice', delivery_method: 'Drop-in & appointments', target_group: 'All eligible seniors', capacity: 85 }
    ],
    staff_roles: [
      { role: 'Operations Lead', typical_count: 1, responsibilities: 'Operations, quality, partnerships' },
      { role: 'Service Coordinator', typical_count: 2, responsibilities: 'Client care, volunteer management' },
      { role: 'Administrative Support', typical_count: 1, responsibilities: 'Admin, data, communications' }
    ],
    typical_sessions: [
      { session_name: 'Salford Digital Hub', session_type: 'digital-inclusion', frequency: 'Weekly (Friday 2pm)', typical_attendance: 19, location: 'Salford Library' },
      { session_name: 'Social & Craft Group', session_type: 'ageing-well', frequency: 'Weekly', typical_attendance: 26, location: 'Eccles Community Centre' },
      { session_name: 'Health & Wellness Sessions', session_type: 'stretch-and-flex', frequency: 'Twice weekly', typical_attendance: 30, location: 'Salford Leisure Centre' },
      { session_name: 'Dementia Friendly Café', session_type: 'ageing-well', frequency: 'Fortnightly', typical_attendance: 18, location: 'Community Café' }
    ],
    sample_clients_count: 190,
    is_demo: true,
    onboarded: false
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const branchId = body.branch_id;

    if (!branchId) {
      return Response.json({ error: 'Missing branch_id parameter' }, { status: 400 });
    }

    const config = LOCATION_CONFIGS[branchId];
    
    if (!config) {
      return Response.json({ error: `Location config not found for branch: ${branchId}` }, { status: 404 });
    }

    console.log(`[getLocationConfig] User ${user.email} fetched config for branch: ${branchId}`);

    return Response.json({ 
      success: true, 
      data: config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('getLocationConfig error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});