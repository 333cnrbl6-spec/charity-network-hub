import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Parse CSV content
const parseCSV = (text) => {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = lines.slice(1, 6).map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
  });
  
  return { headers, rows };
};

// Map file headers to Age UK entities and fields
const mapHeadersToEntities = (headers) => {
  const entityFieldMap = {
    Client: ['name', 'full_name', 'customer', 'email', 'phone', 'address', 'postcode', 'dob', 'date_of_birth', 'status', 'referral'],
    Job: ['job', 'job_type', 'client', 'client_name', 'volunteer', 'volunteer_name', 'scheduled', 'date', 'status', 'price', 'cost', 'duration', 'notes'],
    Volunteer: ['volunteer', 'name', 'full_name', 'email', 'phone', 'role', 'status', 'dbs', 'area', 'hours'],
    Session: ['session', 'name', 'type', 'location', 'date', 'scheduled', 'attendees', 'capacity', 'facilitator', 'status'],
    Grant: ['grant', 'name', 'funder', 'amount', 'award', 'date', 'type', 'client', 'status']
  };

  const detectedEntities = {};
  const fieldMappings = {};

  Object.entries(entityFieldMap).forEach(([entity, keywords]) => {
    const matchedFields = headers.filter(h => 
      keywords.some(kw => h.includes(kw))
    );
    
    if (matchedFields.length > 0) {
      detectedEntities[entity] = {
        confidence: Math.min(95, 60 + (matchedFields.length * 5)),
        matchedFields,
        totalFields: matchedFields.length
      };
      fieldMappings[entity] = matchedFields;
    }
  });

  return { detectedEntities, fieldMappings };
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const fileData = payload.fileData || []; // Array of { name, content }

    if (fileData.length === 0) {
      return Response.json({ error: 'No file content provided' }, { status: 400 });
    }

    const analysis = {};
    const allWarnings = [];

    for (const file of fileData) {
      let parsed = { headers: [], rows: [] };
      
      // Parse based on file type
      if (file.name.endsWith('.csv')) {
        parsed = parseCSV(file.content);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // For Excel, we'd need a library. For now, treat as CSV-like
        parsed = parseCSV(file.content);
      } else if (file.name.endsWith('.json')) {
        try {
          const jsonData = JSON.parse(file.content);
          const rows = Array.isArray(jsonData) ? jsonData : [jsonData];
          const headers = rows.length > 0 ? Object.keys(rows[0]).map(k => k.toLowerCase()) : [];
          parsed = { headers, rows: rows.slice(0, 5) };
        } catch (e) {
          allWarnings.push(`${file.name}: Invalid JSON format`);
          continue;
        }
      }

      if (parsed.headers.length === 0) {
        allWarnings.push(`${file.name}: No headers found`);
        continue;
      }

      const { detectedEntities, fieldMappings } = mapHeadersToEntities(parsed.headers);
      
      analysis[file.name] = {
        headers: parsed.headers,
        rowCount: parsed.rows.length,
        sampleData: parsed.rows,
        detectedEntities,
        fieldMappings
      };

      if (Object.keys(detectedEntities).length === 0) {
        allWarnings.push(`${file.name}: Could not detect entity types from headers`);
      }
    }

    return Response.json({ 
      success: true, 
      analysis,
      warnings: allWarnings,
      recommendations: [
        'Review the detected fields and entity mappings above',
        'Unselect any entities you don\'t want to import',
        'The system will create records based on matched fields'
      ]
    });
  } catch (error) {
    console.error('Error parsing data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});