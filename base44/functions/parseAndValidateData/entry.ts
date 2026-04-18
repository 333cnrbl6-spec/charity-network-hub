import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Robust CSV parser that handles quoted fields and various delimiters
const parseCSV = (text) => {
  try {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };
    
    // Try to detect delimiter (comma, tab, semicolon)
    const firstLine = lines[0];
    const delimiters = [',', '\t', ';', '|'];
    let delimiter = ',';
    let maxCount = 0;
    
    delimiters.forEach(delim => {
      const count = (firstLine.match(new RegExp(delim, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        delimiter = delim;
      }
    });
    
    // Parse header with quoted field support
    const parseRow = (line) => {
      const fields = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.trim());
      return fields;
    };
    
    const headers = parseRow(firstLine).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
    const rows = lines.slice(1, 6).map(line => {
      const values = parseRow(line);
      return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
    }).filter(row => Object.values(row).some(v => v)); // Filter empty rows
    
    return { headers: headers.filter(h => h), rows };
  } catch (err) {
    return { headers: [], rows: [] };
  }
};

// Parse various file formats with fallbacks
const parseFile = async (content, fileName) => {
  const lowerName = fileName.toLowerCase();
  
  // Try JSON first
  if (lowerName.endsWith('.json')) {
    try {
      const data = JSON.parse(content);
      const rows = Array.isArray(data) ? data : [data];
      const headers = rows.length > 0 ? Object.keys(rows[0]).map(k => k.toLowerCase().replace(/[^a-z0-9_]/g, '_')) : [];
      return { headers: headers.filter(h => h), rows: rows.slice(0, 10) };
    } catch (e) {
      // Fall through to CSV parsing
    }
  }
  
  // Try CSV/text parsing (works for CSV, TSV, Excel exports, etc)
  if (lowerName.endsWith('.csv') || lowerName.endsWith('.tsv') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.txt')) {
    return parseCSV(content);
  }
  
  // Try CSV as fallback for unknown formats
  return parseCSV(content);
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
    const fileData = payload.fileData || [];

    if (fileData.length === 0) {
      return Response.json({ error: 'No file content provided' }, { status: 400 });
    }

    const analysis = {};
    const allWarnings = [];

    for (const file of fileData) {
      try {
        const parsed = await parseFile(file.content, file.name);

        if (parsed.headers.length === 0) {
          allWarnings.push(`${file.name}: Could not extract headers. Check file format.`);
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
          allWarnings.push(`${file.name}: No recognized fields detected. Data may still be importable.`);
        }
      } catch (parseError) {
        allWarnings.push(`${file.name}: Failed to parse (${parseError.message})`);
      }
    }

    if (Object.keys(analysis).length === 0) {
      return Response.json({ 
        error: 'Unable to parse any files. Supported: CSV, TSV, Excel, JSON, TXT', 
        warnings: allWarnings 
      }, { status: 400 });
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