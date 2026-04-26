import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { file_url, schema_type } = await req.json();

    const schemas = {
      jobs: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                job_ref: { type: "string" },
                client_name: { type: "string" },
                client_address: { type: "string" },
                client_phone: { type: "string" },
                job_type: { type: "string" },
                job_description: { type: "string" },
                date_received: { type: "string" },
                date_completed: { type: "string" },
                status: { type: "string" },
                handyperson_name: { type: "string" },
                notes: { type: "string" }
              }
            }
          }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url: file_url,
      json_schema: schemas[schema_type] || schemas.jobs
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});