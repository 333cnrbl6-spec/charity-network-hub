import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

    // Use AI to analyze file structure and content
    const fileAnalyses = files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    }));

    const analysisPrompt = `You are a data structure analysis expert. Analyze these files that will be imported into an Age UK database:

Files: ${JSON.stringify(fileAnalyses)}

The system has these entity types available:
- Client: full_name, date_of_birth, address, postcode, phone, email, referral_source, status, date_registered, key_worker, notes
- Volunteer: full_name, email, phone, role, status, dbs_checked, dbs_expiry, date_joined, hours_contributed, area
- Job: client_id, client_name, volunteer_id, volunteer_name, job_type, scheduled_date, status, notes, duration_minutes
- Session: session_name, session_type, location, scheduled_date, attendees_count, max_capacity, status, facilitator, notes
- Grant: grant_name, funder, amount_awarded, date_awarded, grant_type, client_id, client_name, status, notes

Without seeing the actual file contents, provide a structured analysis that includes:
1. Which entity types are likely in these files based on file names
2. Expected data structure for each entity
3. Data quality concerns to watch for
4. Confidence level (0-100) for each entity type

Return ONLY valid JSON with this structure:
{
  "entities": {
    "Client": {"count": 150, "confidence": 95, "preview": [sample record]},
    ...
  },
  "warnings": [],
  "recommendations": []
}`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          entities: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                count: { type: 'number' },
                confidence: { type: 'number' },
                preview: { type: 'array' }
              }
            }
          },
          warnings: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({ 
      success: true, 
      analysis: aiResponse 
    });
  } catch (error) {
    console.error('Error parsing data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});