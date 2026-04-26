import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { donationId } = await req.json();
    
    const donations = await base44.entities.Donation.filter({ id: donationId });
    const donation = donations[0];
    
    if (!donation) {
      return Response.json({ error: 'Donation not found' }, { status: 404 });
    }

    const charities = await base44.entities.Charity.filter({ id: donation.charity_id });
    const charity = charities[0];

    const letter = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a warm, professional thank you letter from ${charity.name} charity to ${donation.donor_name} for their generous donation of £${donation.amount}. 
The letter should:
- Express heartfelt gratitude
- Explain how the money will be used
- Include the charity's mission (${charity.description})
- Be personal but professional
- Suggest future engagement opportunities
- End with a call to action for ongoing support`,
      response_json_schema: {
        type: "object",
        properties: {
          letter: { type: "string" }
        }
      }
    });

    // Save letter to donation
    await base44.entities.Donation.update(donationId, {
      ai_thank_you_letter: letter.letter,
      thank_you_sent: true
    });

    return Response.json({ letter: letter.letter });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});