import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Basic file pattern analysis without AI
const analyzeFilePatterns = (files) => {
  const entities = {};
  const warnings = [];

  // Map file names to likely entity types
  const entityKeywords = {
    Client: ['client', 'user', 'customer', 'person', 'contact'],
    Volunteer: ['volunteer', 'staff', 'member', 'team'],
    Job: ['job', 'task', 'appointment', 'visit', 'task'],
    Session: ['session', 'activity', 'group', 'event'],
    Grant: ['grant', 'funding', 'award', 'benefit']
  };

  files.forEach(file => {
    const nameLower = file.name.toLowerCase();
    
    Object.entries(entityKeywords).forEach(([entity, keywords]) => {
      if (keywords.some(kw => nameLower.includes(kw))) {
        if (!entities[entity]) {
          entities[entity] = { 
            confidence: 70, 
            detected: true, 
            fileName: file.name 
          };
        }
      }
    });
  });

  // Add warnings
  if (files.length === 0) {
    warnings.push('No files detected');
  }
  
  files.forEach(f => {
    if (f.size > 50 * 1024 * 1024) {
      warnings.push(`File ${f.name} is larger than 50MB and may take longer to process`);
    }
  });

  return { entities, warnings };
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const files = payload.files || [];

    if (files.length === 0) {
      return Response.json({ error: 'No files provided' }, { status: 400 });
    }

    // Perform basic pattern analysis without using AI credits
    const analysis = analyzeFilePatterns(files);

    return Response.json({ 
      success: true, 
      analysis: {
        entities: analysis.entities,
        warnings: analysis.warnings,
        recommendations: [
          'Review the detected entities below',
          'Select which data you want to import',
          'The system will map your file columns to database fields'
        ]
      }
    });
  } catch (error) {
    console.error('Error parsing data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});