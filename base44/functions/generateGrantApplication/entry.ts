import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { grantId } = await req.json();
    
    // Fetch grant and charity
    const grant = await base44.entities.Grant.filter({ id: grantId });
    const grantData = grant[0];
    
    if (!grantData) {
      return Response.json({ error: 'Grant not found' }, { status: 404 });
    }

    const charity = await base44.entities.Charity.filter({ id: grantData.charity_id });
    const charityData = charity[0];

    // Generate AI application
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an experienced UK charity fundraising professional. Write a compelling grant application for:
Charity: ${charityData.name} (${charityData.charity_number})
Grant: ${grantData.grant_name} from ${grantData.funder_name}
Amount: £${grantData.amount}
Project: ${grantData.project_title} - ${grantData.project_description}
Beneficiaries: ${grantData.beneficiaries}
Outcomes: ${grantData.outcomes}

Write in sections: Executive Summary, Need Statement, Project Description, Outcomes & Impact, Organisation Background, Budget Justification.`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          need_statement: { type: "string" },
          project_description: { type: "string" },
          outcomes_impact: { type: "string" },
          organisation_background: { type: "string" },
          budget_justification: { type: "string" }
        }
      }
    });

    // Save draft to grant
    await base44.entities.Grant.update(grantId, {
      ai_draft_application: response
    });

    return Response.json({ draft: response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});