import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Centralized location configs with real ONS demographics + Age UK service mapping
// This should sync with lib/locationData.js
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
    branch_name: 'Age UK Salford & Trafford',
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
      { service_name: 'Memory Loss Advice Service', service_type: 'benefits-advice', delivery_method: 'Dedicated support', target_group: 'Dementia sufferers & carers', capacity: 60 },
      { service_name: 'Digital Skills Training', service_type: 'digital-help', delivery_method: 'Group & individual', target_group: 'Ages 60+', capacity: 55 },
      { service_name: 'Community Transport', service_type: 'transport', delivery_method: 'Flexible minibus', target_group: 'General public 60+', capacity: 190 },
      { service_name: 'Support & Shopping Service', service_type: 'shopping-assist', delivery_method: 'Volunteer-led', target_group: 'Housebound clients', capacity: 80 }
    ],
    staff_roles: [
      { role: 'Operations Lead', typical_count: 1, responsibilities: 'Operations, quality, partnerships' },
      { role: 'Service Coordinator', typical_count: 2, responsibilities: 'Client care, volunteer management' },
      { role: 'Administrative Support', typical_count: 1, responsibilities: 'Admin, data, communications' }
    ],
    typical_sessions: [
      { session_name: 'Memory Café', session_type: 'ageing-well', frequency: 'Fortnightly', typical_attendance: 20, location: 'Salford Library' },
      { session_name: 'Social & Craft Group', session_type: 'ageing-well', frequency: 'Weekly', typical_attendance: 26, location: 'Eccles Community Centre' },
      { session_name: 'Health & Wellness Sessions', session_type: 'stretch-and-flex', frequency: 'Twice weekly', typical_attendance: 30, location: 'Salford Leisure Centre' }
    ],
    sample_clients_count: 190,
    is_demo: true,
    onboarded: false
  },
  bolton: {
    branch_id: 'bolton',
    branch_name: 'Age UK Bolton',
    region: 'north_west',
    location_type: 'urban',
    postcode_area: 'BL1-BL7',
    catchment_area: 'Bolton town centre and surrounding wards',
    demographics: {
      population_65_plus: 64500,
      population_85_plus: 9200,
      total_population: 286627,
      deprivation_index: '23.5 (above average deprivation)',
      life_expectancy: 77.9,
      carers_percentage: 9.1,
      data_year: 2023
    },
    services: [
      { service_name: 'Dementia Support Programme', service_type: 'ageing-well', delivery_method: 'Dedicated support & activities', target_group: 'Dementia sufferers & carers', capacity: 85 },
      { service_name: 'Handyperson Service', service_type: 'home-visit', delivery_method: 'Small repairs & maintenance', target_group: 'Homeowners 60+', capacity: 120 },
      { service_name: 'Community Café', service_type: 'ageing-well', delivery_method: 'Social gathering space', target_group: 'Older adults & carers', capacity: 150 },
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'Regular visits & calls', target_group: 'Isolated seniors', capacity: 100 },
      { service_name: 'Benefits & Grants Advice', service_type: 'benefits-advice', delivery_method: 'Appointments & drop-in', target_group: 'Low-income pensioners', capacity: 70 }
    ],
    staff_roles: [
      { role: 'Service Manager', typical_count: 1, responsibilities: 'Branch management, partnerships' },
      { role: 'Service Coordinator', typical_count: 2, responsibilities: 'Client services, volunteer management' },
      { role: 'Handyperson Supervisor', typical_count: 1, responsibilities: 'Repairs scheduling, quality assurance' },
      { role: 'Admin Assistant', typical_count: 1, responsibilities: 'Reception, bookings, records' }
    ],
    typical_sessions: [
      { session_name: 'Dementia Café', session_type: 'ageing-well', frequency: 'Weekly', typical_attendance: 18, location: 'Bolton Community Centre' },
      { session_name: 'Craft Sessions', session_type: 'ageing-well', frequency: 'Twice weekly', typical_attendance: 25, location: 'Age UK Centre' },
      { session_name: 'Gentle Exercise', session_type: 'stretch-and-flex', frequency: 'Twice weekly', typical_attendance: 28, location: 'Bolton Leisure Centre' },
      { session_name: 'Handyperson Info Sessions', session_type: 'ageing-well', frequency: 'Monthly', typical_attendance: 20, location: 'Community Venues' }
    ],
    sample_clients_count: 240,
    is_demo: true,
    onboarded: false
  },
  lancashire: {
    branch_id: 'lancashire',
    branch_name: 'Age UK Lancashire',
    region: 'north_west',
    location_type: 'rural',
    postcode_area: 'PR1-PR9, LA1-LA10',
    catchment_area: 'Across Lancashire county including Preston, Lancaster, Ribble Valley',
    demographics: {
      population_65_plus: 142000,
      population_85_plus: 18500,
      total_population: 748203,
      deprivation_index: '19.2 (moderate deprivation)',
      life_expectancy: 78.8,
      carers_percentage: 8.7,
      data_year: 2023
    },
    services: [
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'In-home visits & calls', target_group: 'Isolated older adults', capacity: 180 },
      { service_name: 'Community Transport', service_type: 'transport', delivery_method: 'Minibus across county', target_group: 'Seniors across Lancashire', capacity: 300 },
      { service_name: 'Digital Inclusion', service_type: 'digital-help', delivery_method: 'Group sessions & 1-to-1', target_group: 'Ages 60+', capacity: 90 },
      { service_name: 'Shopping & Errand Assistance', service_type: 'shopping-assist', delivery_method: 'Volunteer-supported', target_group: 'Homebound & disabled', capacity: 140 },
      { service_name: 'Advice & Support Services', service_type: 'benefits-advice', delivery_method: 'Multi-location clinics', target_group: 'All eligible older adults', capacity: 110 }
    ],
    staff_roles: [
      { role: 'County Manager', typical_count: 1, responsibilities: 'Strategic leadership, partnerships' },
      { role: 'Regional Coordinator', typical_count: 3, responsibilities: 'Area coordination, service delivery' },
      { role: 'Transport Manager', typical_count: 1, responsibilities: 'Fleet management, driver support' },
      { role: 'Administrative Team', typical_count: 2, responsibilities: 'Admin support, communications' }
    ],
    typical_sessions: [
      { session_name: 'Digital Cafés', session_type: 'digital-inclusion', frequency: 'Weekly (multiple locations)', typical_attendance: 16, location: 'Various community centres' },
      { session_name: 'Stretch & Flex Classes', session_type: 'stretch-and-flex', frequency: 'Twice weekly', typical_attendance: 32, location: 'Across county venues' },
      { session_name: 'Information & Advice Sessions', session_type: 'information-advice', frequency: 'Weekly', typical_attendance: 24, location: 'Community hubs' },
      { session_name: 'Social Outings', session_type: 'ageing-well', frequency: 'Monthly', typical_attendance: 35, location: 'Various attractions' }
    ],
    sample_clients_count: 350,
    is_demo: true,
    onboarded: false
  },
  wirral: {
    branch_id: 'wirral',
    branch_name: 'Age UK Wirral',
    region: 'north_west',
    location_type: 'suburban',
    postcode_area: 'CH41-CH64',
    catchment_area: 'Wirral borough including West Kirby, Bebington, Wallasey',
    demographics: {
      population_65_plus: 58700,
      population_85_plus: 8100,
      total_population: 327943,
      deprivation_index: '17.8 (moderate deprivation)',
      life_expectancy: 79.8,
      carers_percentage: 8.4,
      data_year: 2023
    },
    services: [
      { service_name: 'Charity Shops Network', service_type: 'ageing-well', delivery_method: 'Multiple locations', target_group: 'General public & volunteers', capacity: 200 },
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'Regular visits & calls', target_group: 'Isolated seniors', capacity: 110 },
      { service_name: 'Community Transport', service_type: 'transport', delivery_method: 'Minibus service', target_group: 'Mobility-limited', capacity: 160 },
      { service_name: 'Digital Support', service_type: 'digital-help', delivery_method: 'Group & individual training', target_group: 'Ages 60+', capacity: 65 },
      { service_name: 'Benefits & Grants Advice', service_type: 'benefits-advice', delivery_method: 'Drop-in & appointments', target_group: 'Low-income pensioners', capacity: 75 }
    ],
    staff_roles: [
      { role: 'Branch Manager', typical_count: 1, responsibilities: 'Branch leadership, charity shops oversight' },
      { role: 'Service Coordinator', typical_count: 2, responsibilities: 'Client services, volunteer management' },
      { role: 'Shops Manager', typical_count: 1, responsibilities: 'Charity shop operations' },
      { role: 'Admin Support', typical_count: 1, responsibilities: 'Administration, communications' }
    ],
    typical_sessions: [
      { session_name: 'Charity Shop Volunteer Sessions', session_type: 'ageing-well', frequency: 'Daily', typical_attendance: 40, location: 'Various shop locations' },
      { session_name: 'Digital Café', session_type: 'digital-inclusion', frequency: 'Weekly', typical_attendance: 18, location: 'Wirral Community Centre' },
      { session_name: 'Social Groups', session_type: 'ageing-well', frequency: 'Twice weekly', typical_attendance: 28, location: 'Community venues' },
      { session_name: 'Gentle Movement', session_type: 'stretch-and-flex', frequency: 'Weekly', typical_attendance: 24, location: 'Various leisure centres' }
    ],
    sample_clients_count: 210,
    is_demo: true,
    onboarded: false
  },
  sefton: {
    branch_id: 'sefton',
    branch_name: 'Age UK Sefton',
    region: 'north_west',
    location_type: 'suburban',
    postcode_area: 'L29-L37',
    catchment_area: 'Sefton borough including Southport, Formby, Crosby',
    demographics: {
      population_65_plus: 54300,
      population_85_plus: 7400,
      total_population: 281298,
      deprivation_index: '18.5 (moderate deprivation)',
      life_expectancy: 79.3,
      carers_percentage: 8.3,
      data_year: 2023
    },
    services: [
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'Regular visits & calls', target_group: 'Isolated older adults', capacity: 105 },
      { service_name: 'Charity Shops', service_type: 'ageing-well', delivery_method: 'Community shops', target_group: 'General public & volunteers', capacity: 80 },
      { service_name: 'Community Minibus', service_type: 'transport', delivery_method: 'Scheduled routes', target_group: 'Seniors & disabled', capacity: 140 },
      { service_name: 'Digital Inclusion Programme', service_type: 'digital-help', delivery_method: 'Group sessions', target_group: 'Ages 60+', capacity: 55 },
      { service_name: 'Support & Information Service', service_type: 'benefits-advice', delivery_method: 'Clinics & appointments', target_group: 'Eligible seniors', capacity: 70 }
    ],
    staff_roles: [
      { role: 'Service Manager', typical_count: 1, responsibilities: 'Strategic leadership, operations' },
      { role: 'Service Coordinator', typical_count: 2, responsibilities: 'Client care, volunteer support' },
      { role: 'Charity Shop Coordinator', typical_count: 1, responsibilities: 'Shop operations, volunteer management' },
      { role: 'Admin Officer', typical_count: 1, responsibilities: 'Administration, communications' }
    ],
    typical_sessions: [
      { session_name: 'Charity Shop Volunteering', session_type: 'ageing-well', frequency: 'Daily', typical_attendance: 25, location: 'Shop locations' },
      { session_name: 'Tech Support Sessions', session_type: 'digital-inclusion', frequency: 'Weekly', typical_attendance: 15, location: 'Sefton Library' },
      { session_name: 'Wellbeing Groups', session_type: 'ageing-well', frequency: 'Twice weekly', typical_attendance: 22, location: 'Community centres' },
      { session_name: 'Exercise & Movement', session_type: 'stretch-and-flex', frequency: 'Weekly', typical_attendance: 26, location: 'Leisure venues' }
    ],
    sample_clients_count: 195,
    is_demo: true,
    onboarded: false
  },
  liverpool: {
    branch_id: 'liverpool',
    branch_name: 'Age UK Liverpool',
    region: 'north_west',
    location_type: 'urban',
    postcode_area: 'L1-L19',
    catchment_area: 'Liverpool city centre and surrounding areas',
    demographics: {
      population_65_plus: 82600,
      population_85_plus: 11400,
      total_population: 481785,
      deprivation_index: '31.2 (high deprivation)',
      life_expectancy: 76.8,
      carers_percentage: 10.5,
      data_year: 2023
    },
    services: [
      { service_name: 'Befriending Service', service_type: 'befriending', delivery_method: 'In-home visits & calls', target_group: 'Isolated seniors', capacity: 140 },
      { service_name: 'Community Support Services', service_type: 'ageing-well', delivery_method: 'Multi-service hubs', target_group: 'All older adults', capacity: 200 },
      { service_name: 'City Transport Service', service_type: 'transport', delivery_method: 'Minibus network', target_group: 'Seniors across city', capacity: 250 },
      { service_name: 'Digital Skills Programme', service_type: 'digital-help', delivery_method: 'Group & 1-to-1 sessions', target_group: 'Ages 60+', capacity: 85 },
      { service_name: 'Benefits & Grants Advisory', service_type: 'benefits-advice', delivery_method: 'Drop-in & appointments', target_group: 'Low-income pensioners', capacity: 100 }
    ],
    staff_roles: [
      { role: 'City Operations Manager', typical_count: 1, responsibilities: 'Strategic management, partnerships' },
      { role: 'Service Leads', typical_count: 3, responsibilities: 'Service delivery, team management' },
      { role: 'Transport Coordinator', typical_count: 1, responsibilities: 'Fleet & driver management' },
      { role: 'Administrative Team', typical_count: 2, responsibilities: 'Admin support, communications' }
    ],
    typical_sessions: [
      { session_name: 'Digital Cafés', session_type: 'digital-inclusion', frequency: 'Weekly (multiple hubs)', typical_attendance: 20, location: 'Community centres' },
      { session_name: 'Social Groups & Clubs', session_type: 'ageing-well', frequency: 'Twice weekly', typical_attendance: 30, location: 'Various venues' },
      { session_name: 'Exercise Classes', session_type: 'stretch-and-flex', frequency: 'Twice weekly', typical_attendance: 35, location: 'Leisure centres' },
      { session_name: 'Information & Support Sessions', session_type: 'information-advice', frequency: 'Weekly', typical_attendance: 25, location: 'Hub locations' }
    ],
    sample_clients_count: 320,
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