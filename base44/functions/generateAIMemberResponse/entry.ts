import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AI_MEMBERS = {
  'Strategic Advisor': {
    role: 'Strategic planning and alignment expert',
    style: 'analytical, forward-thinking, data-driven'
  },
  'Product Lead': {
    role: 'Product development and market readiness expert',
    style: 'practical, focused on delivery, customer-centric'
  },
  'Market Analyst': {
    role: 'Market trends, competition, and opportunity analyst',
    style: 'insightful, trend-aware, growth-focused'
  },
  'Compliance Officer': {
    role: 'Governance, risk, and compliance expert',
    style: 'thorough, cautious, detail-oriented'
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_name, message_content, thread_id, ai_member } = await req.json();

    if (!channel_name || !message_content || !ai_member) {
      return Response.json(
        { error: 'Missing required fields: channel_name, message_content, ai_member' },
        { status: 400 }
      );
    }

    const memberInfo = AI_MEMBERS[ai_member];
    if (!memberInfo) {
      return Response.json(
        { error: `Unknown AI member: ${ai_member}` },
        { status: 400 }
      );
    }

    // Generate AI response using LLM
    const llmPrompt = `You are the "${ai_member}" - ${memberInfo.role}. Your communication style is ${memberInfo.style}.

Channel: #${channel_name}
${thread_id ? `[Replying in thread to a message]` : '[Root message in channel]'}

User message: "${message_content}"

Generate a concise, insightful response (2-3 sentences) that:
1. Adds value to the discussion
2. Reflects your expertise and style
3. Is ready for immediate posting to the channel`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: llmPrompt,
      model: 'gemini_3_flash'
    });

    // Save AI-generated message
    const aiMessage = await base44.entities.Message.create({
      channel_name,
      author: ai_member,
      content: response,
      thread_id: thread_id || null,
      thread_depth: thread_id ? 1 : 0,
      is_ai_generated: true,
      ai_member_name: ai_member,
      posted_at: new Date().toISOString()
    });

    // Update reply count on parent if this is a thread reply
    if (thread_id) {
      const parentMessage = await base44.entities.Message.get(thread_id);
      await base44.entities.Message.update(thread_id, {
        reply_count: (parentMessage.reply_count || 0) + 1
      });
    }

    return Response.json({
      success: true,
      message: {
        id: aiMessage.id,
        author: ai_member,
        content: response,
        is_ai_generated: true,
        posted_at: aiMessage.posted_at
      }
    });
  } catch (error) {
    console.error('AI member response error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});