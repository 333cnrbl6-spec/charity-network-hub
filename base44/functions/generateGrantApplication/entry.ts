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

    // CHECK CREDITS FIRST
    const charityCredits = await base44.asServiceRole.entities.CharityCredits.filter(
      { charity_id: grantData.charity_id }
    );
    
    if (!charityCredits || charityCredits.length === 0) {
      return Response.json(
        { error: 'No credit account found. Please contact support.' },
        { status: 404 }
      );
    }

    const credits = charityCredits[0];
    const operation_cost = 75; // ai_grant_writing costs 75 credits
    
    if (credits.credits_available < operation_cost) {
      return Response.json({
        error: 'Insufficient credits',
        required_credits: operation_cost,
        available_credits: credits.credits_available,
        message: `This operation requires ${operation_cost} credits. You have ${credits.credits_available} available.`
      }, { status: 402 });
    }

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

    // DEBIT CREDITS
    await base44.asServiceRole.entities.CharityCredits.update(credits.id, {
      credits_available: credits.credits_available - operation_cost,
      credits_used_month: credits.credits_used_month + operation_cost
    });

    // Log consumption
    await base44.asServiceRole.entities.CreditConsumption.create({
      charity_id: grantData.charity_id,
      user_email: user.email,
      operation_type: 'ai_grant_writing',
      credits_consumed: operation_cost,
      charity_tier: credits.subscription_tier,
      timestamp: new Date().toISOString(),
      status: 'success',
      metadata: { grant_id: grantId, grant_name: grantData.grant_name }
    });

    return Response.json({
      draft: response,
      credits_consumed: operation_cost,
      credits_remaining: credits.credits_available - operation_cost
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});