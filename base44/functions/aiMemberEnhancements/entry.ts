import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// AI Member enhancement capabilities
const AI_CAPABILITIES = {
  'Strategic Advisor': {
    summarize: true,
    identifyActionItems: true,
    suggestMetrics: true,
    initiateDiscussion: true
  },
  'Product Lead': {
    summarize: true,
    identifyActionItems: true,
    suggestMetrics: true,
    initiateDiscussion: true
  },
  'Market Analyst': {
    summarize: true,
    identifyActionItems: false,
    suggestMetrics: true,
    initiateDiscussion: true
  },
  'Compliance Officer': {
    summarize: true,
    identifyActionItems: true,
    suggestMetrics: false,
    initiateDiscussion: true
  }
};

// Generate summary of lengthy discussions
async function generateSummary(base44, channelName, messageCount = 5) {
  const allMessages = await base44.asServiceRole.entities.Message.list('-posted_at', messageCount);
  const channelMessages = allMessages.filter(m => m.channel_name === channelName);
  
  if (channelMessages.length === 0) return null;

  const conversationText = channelMessages
    .reverse()
    .map(m => `${m.author}: ${m.content}`)
    .join('\n');

  const prompt = `Summarize the following discussion in 2-3 key points. Be concise and actionable:

${conversationText}

Format as bullet points.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'gemini_3_flash'
  });

  return response;
}

// Identify action items from discussion
async function identifyActionItems(base44, channelName, messageCount = 5) {
  const allMessages = await base44.asServiceRole.entities.Message.list('-posted_at', messageCount);
  const channelMessages = allMessages.filter(m => m.channel_name === channelName);
  
  if (channelMessages.length === 0) return null;

  const conversationText = channelMessages
    .reverse()
    .map(m => `${m.author}: ${m.content}`)
    .join('\n');

  const prompt = `From this discussion, extract and list all action items or tasks that need to be done. Format each as:
- [OWNER]: Description (e.g., John: Update Q2 roadmap)
If no owner is mentioned, use "Unassigned".

${conversationText}`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'gemini_3_flash'
  });

  return response;
}

// Suggest relevant metrics based on conversation
async function suggestMetrics(base44, channelName, insightType = 'general') {
  const allMessages = await base44.asServiceRole.entities.Message.list('-posted_at', 5);
  const channelMessages = allMessages.filter(m => m.channel_name === channelName);
  
  if (channelMessages.length === 0) return null;

  const conversationText = channelMessages
    .reverse()
    .map(m => `${m.author}: ${m.content}`)
    .join('\n');

  const prompt = `Based on this conversation, suggest 3-4 key metrics or KPIs that should be monitored. Include how to measure them:

${conversationText}

Format as:
- Metric Name: How to measure | Current status (if known)`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: 'gemini_3_flash'
  });

  return response;
}

// Initiate new discussion on identified issues/opportunities
async function initiateProactiveDiscussion(base44, channelName, aiMember, discussionType = 'issue') {
  const allMessages = await base44.asServiceRole.entities.Message.list('-posted_at', 5);
  const channelMessages = allMessages.filter(m => m.channel_name === channelName);
  
  if (channelMessages.length === 0) return null;

  const conversationText = channelMessages
    .reverse()
    .map(m => `${m.author}: ${m.content}`)
    .join('\n');

  const discussionPrompt = discussionType === 'issue'
    ? `From this conversation, identify ONE critical issue or risk that needs immediate attention and discussion. 
       Create a brief discussion title and description that would prompt team action:
       ${conversationText}`
    : `From this conversation, identify ONE promising opportunity or improvement that the team should explore.
       Create a brief discussion title and description that would prompt strategic thinking:
       ${conversationText}`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: discussionPrompt,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        context_type: { type: 'string', enum: ['governance', 'performance', 'strategic'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] }
      }
    }
  });

  // Create discussion
  if (response && response.title) {
    const discussion = await base44.asServiceRole.entities.Discussion.create({
      title: response.title,
      context_type: response.context_type || 'strategic',
      context_id: `ai_${Date.now()}`,
      context_data: { channel: channelName, initiated_by: aiMember },
      initiator: aiMember,
      status: 'active',
      priority: response.priority || 'medium',
      comment_count: 0,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    });

    // Post notification to channel
    await base44.asServiceRole.entities.Message.create({
      channel_name: channelName,
      author: aiMember,
      content: `🚀 **New Discussion Initiated**: ${response.title}\n\n${response.description}`,
      is_ai_generated: true,
      ai_member_name: aiMember,
      posted_at: new Date().toISOString()
    });

    return discussion;
  }

  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, channel_name, ai_member } = await req.json();

    if (!action || !channel_name || !ai_member) {
      return Response.json(
        { error: 'Missing required fields: action, channel_name, ai_member' },
        { status: 400 }
      );
    }

    const capabilities = AI_CAPABILITIES[ai_member];
    if (!capabilities) {
      return Response.json({ error: 'Invalid AI member' }, { status: 400 });
    }

    let result = null;

    switch (action) {
      case 'summarize':
        if (!capabilities.summarize) {
          return Response.json({ error: `${ai_member} cannot summarize` }, { status: 400 });
        }
        result = await generateSummary(base44, channel_name);
        break;

      case 'identifyActionItems':
        if (!capabilities.identifyActionItems) {
          return Response.json({ error: `${ai_member} cannot identify action items` }, { status: 400 });
        }
        result = await identifyActionItems(base44, channel_name);
        break;

      case 'suggestMetrics':
        if (!capabilities.suggestMetrics) {
          return Response.json({ error: `${ai_member} cannot suggest metrics` }, { status: 400 });
        }
        result = await suggestMetrics(base44, channel_name);
        break;

      case 'initiateDiscussion':
        if (!capabilities.initiateDiscussion) {
          return Response.json({ error: `${ai_member} cannot initiate discussions` }, { status: 400 });
        }
        const discussionType = await req.json().then(j => j.discussion_type).catch(() => 'issue');
        result = await initiateProactiveDiscussion(base44, channel_name, ai_member, discussionType);
        break;

      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    return Response.json({ success: true, result, action, ai_member });
  } catch (error) {
    console.error('AI enhancement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});