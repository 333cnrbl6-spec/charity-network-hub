import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await req.json();
    
    const campaigns = await base44.entities.Campaign.filter({ id: campaignId });
    const campaign = campaigns[0];
    
    if (!campaign) {
      return Response.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const charities = await base44.entities.Charity.filter({ id: campaign.charity_id });
    const charity = charities[0];

    const description = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a compelling, engaging campaign description for fundraising. The charity is:
Charity: ${charity.name}
Mission: ${charity.description}
Campaign Title: ${campaign.title}
Goal: Raise £${campaign.goal_amount}
Cause Area: ${charity.cause_area}

Create a description that:
- Captures emotional appeal and urgency
- Explains what the funds will achieve
- Uses storytelling to inspire donors
- Is 150-200 words
- Includes a clear call-to-action`,
      response_json_schema: {
        type: "object",
        properties: {
          description: { type: "string" }
        }
      }
    });

    // Update campaign
    await base44.entities.Campaign.update(campaignId, {
      description: description.description
    });

    return Response.json({ description: description.description });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});