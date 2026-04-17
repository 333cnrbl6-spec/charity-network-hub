import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const locationConfigs = [
      {
        branch_id: 'manchester',
        branch_name: 'Manchester',
        region: 'north_west',
        location_type: 'urban',
        postcode_area: 'M1',
        catchment_area: 'Manchester City Centre',
        demographics: {
          population_65_plus: 45000,
          population_85_plus: 8000,
          total_population: 550000,
          deprivation_index: 'Deprived',
          life_expectancy: 78.5,
          carers_percentage: 8.2,
          data_year: 2024
        },
        services: [
          { service_name: 'Befriending', service_type: 'befriending', delivery_method: 'In-person', target_group: 'Over 65', capacity: 50 },
          { service_name: 'Transport', service_type: 'transport', delivery_method: 'Door-to-door', target_group: 'Over 75', capacity: 30 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' },
          { role: 'Befriender Coordinator', typical_count: 2, responsibilities: 'Volunteer management' }
        ],
        typical_sessions: [
          { session_name: 'Stretch & Flex', session_type: 'stretch-and-flex', frequency: 'Weekly', typical_attendance: 12, location: 'Community Hall' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      },
      {
        branch_id: 'bury',
        branch_name: 'Bury',
        region: 'north_west',
        location_type: 'suburban',
        postcode_area: 'BL9',
        catchment_area: 'Bury Metropolitan Borough',
        demographics: {
          population_65_plus: 35000,
          population_85_plus: 6000,
          total_population: 380000,
          deprivation_index: 'Moderate',
          life_expectancy: 79.2,
          carers_percentage: 8.5,
          data_year: 2024
        },
        services: [
          { service_name: 'Befriending', service_type: 'befriending', delivery_method: 'In-person', target_group: 'Over 65', capacity: 50 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' }
        ],
        typical_sessions: [
          { session_name: 'Men in Sheds', session_type: 'men-in-sheds', frequency: 'Bi-weekly', typical_attendance: 15, location: 'Shed Workshop' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      },
      {
        branch_id: 'stockport',
        branch_name: 'Stockport',
        region: 'north_west',
        location_type: 'suburban',
        postcode_area: 'SK2',
        catchment_area: 'Stockport Metropolitan Borough',
        demographics: {
          population_65_plus: 40000,
          population_85_plus: 7000,
          total_population: 450000,
          deprivation_index: 'Moderate',
          life_expectancy: 79.5,
          carers_percentage: 8.1,
          data_year: 2024
        },
        services: [
          { service_name: 'Digital Help', service_type: 'digital-help', delivery_method: 'In-person', target_group: 'Over 60', capacity: 40 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' }
        ],
        typical_sessions: [
          { session_name: 'Digital Inclusion', session_type: 'digital-inclusion', frequency: 'Weekly', typical_attendance: 10, location: 'Library' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      },
      {
        branch_id: 'wigan',
        branch_name: 'Wigan',
        region: 'north_west',
        location_type: 'suburban',
        postcode_area: 'WN1',
        catchment_area: 'Wigan Metropolitan Borough',
        demographics: {
          population_65_plus: 32000,
          population_85_plus: 5500,
          total_population: 370000,
          deprivation_index: 'Deprived',
          life_expectancy: 78.8,
          carers_percentage: 8.3,
          data_year: 2024
        },
        services: [
          { service_name: 'Befriending', service_type: 'befriending', delivery_method: 'In-person', target_group: 'Over 65', capacity: 40 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' }
        ],
        typical_sessions: [
          { session_name: 'Tea and Tinker', session_type: 'tea-and-tinker', frequency: 'Bi-weekly', typical_attendance: 8, location: 'Community Centre' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      },
      {
        branch_id: 'trafford',
        branch_name: 'Trafford',
        region: 'north_west',
        location_type: 'suburban',
        postcode_area: 'M32',
        catchment_area: 'Trafford Metropolitan Borough',
        demographics: {
          population_65_plus: 38000,
          population_85_plus: 6800,
          total_population: 440000,
          deprivation_index: 'Moderate',
          life_expectancy: 79.3,
          carers_percentage: 8.0,
          data_year: 2024
        },
        services: [
          { service_name: 'Transport', service_type: 'transport', delivery_method: 'Door-to-door', target_group: 'Over 75', capacity: 35 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' }
        ],
        typical_sessions: [
          { session_name: 'Out in the City', session_type: 'out-in-the-city', frequency: 'Monthly', typical_attendance: 20, location: 'Various' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      },
      {
        branch_id: 'salford',
        branch_name: 'Salford',
        region: 'north_west',
        location_type: 'urban',
        postcode_area: 'M5',
        catchment_area: 'Salford City Council',
        demographics: {
          population_65_plus: 33000,
          population_85_plus: 5800,
          total_population: 380000,
          deprivation_index: 'Deprived',
          life_expectancy: 78.7,
          carers_percentage: 8.4,
          data_year: 2024
        },
        services: [
          { service_name: 'Benefits Advice', service_type: 'benefits-advice', delivery_method: 'In-person', target_group: 'Over 60', capacity: 25 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' }
        ],
        typical_sessions: [
          { session_name: 'Information & Advice', session_type: 'information-advice', frequency: 'Weekly', typical_attendance: 15, location: 'Office' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      },
      {
        branch_id: 'bolton',
        branch_name: 'Bolton',
        region: 'north_west',
        location_type: 'suburban',
        postcode_area: 'BL1',
        catchment_area: 'Bolton Metropolitan Borough',
        demographics: {
          population_65_plus: 36000,
          population_85_plus: 6200,
          total_population: 410000,
          deprivation_index: 'Deprived',
          life_expectancy: 78.6,
          carers_percentage: 8.6,
          data_year: 2024
        },
        services: [
          { service_name: 'Befriending', service_type: 'befriending', delivery_method: 'In-person', target_group: 'Over 65', capacity: 45 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' }
        ],
        typical_sessions: [
          { session_name: 'Ageing Well', session_type: 'ageing-well', frequency: 'Weekly', typical_attendance: 18, location: 'Health Centre' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      },
      {
        branch_id: 'lancashire',
        branch_name: 'Lancashire',
        region: 'north_west',
        location_type: 'rural',
        postcode_area: 'PR1',
        catchment_area: 'Lancashire County',
        demographics: {
          population_65_plus: 42000,
          population_85_plus: 7200,
          total_population: 480000,
          deprivation_index: 'Moderate',
          life_expectancy: 79.4,
          carers_percentage: 8.2,
          data_year: 2024
        },
        services: [
          { service_name: 'Transport', service_type: 'transport', delivery_method: 'Door-to-door', target_group: 'Over 75', capacity: 20 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' }
        ],
        typical_sessions: [
          { session_name: 'Stretch & Flex', session_type: 'stretch-and-flex', frequency: 'Weekly', typical_attendance: 10, location: 'Village Hall' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      },
      {
        branch_id: 'wirral',
        branch_name: 'Wirral',
        region: 'north_west',
        location_type: 'suburban',
        postcode_area: 'CH41',
        catchment_area: 'Wirral Metropolitan Borough',
        demographics: {
          population_65_plus: 37000,
          population_85_plus: 6500,
          total_population: 430000,
          deprivation_index: 'Moderate',
          life_expectancy: 79.1,
          carers_percentage: 8.1,
          data_year: 2024
        },
        services: [
          { service_name: 'Befriending', service_type: 'befriending', delivery_method: 'In-person', target_group: 'Over 65', capacity: 40 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' }
        ],
        typical_sessions: [
          { session_name: 'Dementia Awareness', session_type: 'scams-awareness', frequency: 'Monthly', typical_attendance: 12, location: 'Office' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      },
      {
        branch_id: 'sefton',
        branch_name: 'Sefton',
        region: 'north_west',
        location_type: 'suburban',
        postcode_area: 'L37',
        catchment_area: 'Sefton Metropolitan Borough',
        demographics: {
          population_65_plus: 34000,
          population_85_plus: 5900,
          total_population: 390000,
          deprivation_index: 'Moderate',
          life_expectancy: 79.0,
          carers_percentage: 8.2,
          data_year: 2024
        },
        services: [
          { service_name: 'Shopping Assistance', service_type: 'shopping-assist', delivery_method: 'In-person', target_group: 'Over 70', capacity: 30 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' }
        ],
        typical_sessions: [
          { session_name: 'Digital Inclusion', session_type: 'digital-inclusion', frequency: 'Bi-weekly', typical_attendance: 8, location: 'Library' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      },
      {
        branch_id: 'liverpool',
        branch_name: 'Liverpool',
        region: 'north_west',
        location_type: 'urban',
        postcode_area: 'L1',
        catchment_area: 'Liverpool City Centre',
        demographics: {
          population_65_plus: 43000,
          population_85_plus: 7800,
          total_population: 520000,
          deprivation_index: 'Deprived',
          life_expectancy: 78.4,
          carers_percentage: 8.5,
          data_year: 2024
        },
        services: [
          { service_name: 'Befriending', service_type: 'befriending', delivery_method: 'In-person', target_group: 'Over 65', capacity: 50 }
        ],
        staff_roles: [
          { role: 'Manager', typical_count: 1, responsibilities: 'Branch operations' }
        ],
        typical_sessions: [
          { session_name: 'Hospital Aftercare', session_type: 'hospital-aftercare', frequency: 'Weekly', typical_attendance: 14, location: 'Hospital' }
        ],
        sample_clients_count: 10,
        is_demo: true,
        onboarded: false
      }
    ];

    // Use service role to bypass auth issues and bulk create
    const created = await base44.asServiceRole.entities.LocationConfig.bulkCreate(locationConfigs);

    console.log(`[bootstrapBranchConfigs] Created ${created.length}/${locationConfigs.length} location configs`);

    return Response.json({
      success: true,
      created_count: created.length,
      total: locationConfigs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[bootstrapBranchConfigs] Error:', error.message);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});