import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Extract @mentions from text
function extractMentions(content) {
  const mentions = [];
  const mentionRegex = /@(\w+)/g;
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return [...new Set(mentions)]; // Remove duplicates
}

// Extract dashboard links
function extractLinkedData(content) {
  const linkedData = {};
  
  // Match report references like "report:2026-W16"
  const reportMatch = content.match(/report:(\S+)/);
  if (reportMatch) {
    linkedData.report_id = reportMatch[1];
  }
  
  // Match metric references like "metric:parity_score"
  const metricMatch = content.match(/metric:(\S+)/);
  if (metricMatch) {
    linkedData.metric_name = metricMatch[1];
  }
  
  return Object.keys(linkedData).length > 0 ? linkedData : null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { discussion_id, comment_content, author } = await req.json();

    if (!discussion_id || !comment_content || !author) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract mentions and linked data
    const mentions = extractMentions(comment_content);
    const linkedData = extractLinkedData(comment_content);

    // Get discussion to update mention list
    const discussion = await base44.entities.Discussion.get(discussion_id);
    const updatedMentions = [...new Set([...(discussion.mentioned_users || []), ...mentions])];

    // Update discussion with new mentions
    await base44.entities.Discussion.update(discussion_id, {
      mentioned_users: updatedMentions,
      last_activity: new Date().toISOString(),
      comment_count: (discussion.comment_count || 0) + 1
    });

    // Create comment
    const comment = await base44.entities.Comment.create({
      discussion_id,
      author,
      content: comment_content,
      mentioned_users: mentions,
      linked_data: linkedData,
      created_at: new Date().toISOString()
    });

    // Send notifications to mentioned users
    if (mentions.length > 0) {
      const notificationPromises = mentions.map(mentionedUser =>
        base44.integrations.Core.SendEmail({
          to: `${mentionedUser}@example.com`, // Adjust domain as needed
          subject: `You were mentioned in: ${discussion.title}`,
          body: `${author} mentioned you in a discussion about ${discussion.context_type}.\n\nComment: "${comment_content}"\n\nView discussion to reply.`
        }).catch(err => console.warn(`Failed to notify ${mentionedUser}:`, err))
      );
      
      await Promise.all(notificationPromises);
    }

    return Response.json({
      success: true,
      comment: {
        id: comment.id,
        author,
        content: comment_content,
        mentions,
        linked_data: linkedData,
        created_at: comment.created_at
      }
    });
  } catch (error) {
    console.error('Mention processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});