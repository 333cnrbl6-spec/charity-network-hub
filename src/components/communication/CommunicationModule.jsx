import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  Send,
  Link as LinkIcon,
  User,
  Clock,
  AlertCircle,
  ChevronDown,
  MoreVertical
} from 'lucide-react';

export default function CommunicationModule({ 
  contextType = 'health_report',
  contextId = null,
  contextData = {} 
}) {
  const queryClient = useQueryClient();
  const [expandedThread, setExpandedThread] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [showMentionHint, setShowMentionHint] = useState(false);
  const textareaRef = useRef(null);

  // Fetch discussions for this context
  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', contextType, contextId],
    queryFn: async () => {
      const allDiscussions = await base44.entities.Discussion.list('-last_activity', 50);
      return allDiscussions.filter(d => 
        d.context_type === contextType && (!contextId || d.context_id === contextId)
      );
    },
    refetchInterval: 5000, // Real-time polling
  });

  // Fetch comments for selected discussion
  const { data: comments = [] } = useQuery({
    queryKey: ['comments', expandedThread?.id],
    queryFn: async () => {
      if (!expandedThread) return [];
      const allComments = await base44.entities.Comment.list('-created_at', 100);
      return allComments.filter(c => c.discussion_id === expandedThread.id);
    },
    enabled: !!expandedThread,
    refetchInterval: 3000,
  });

  const rootComments = comments.filter(c => !c.parent_comment_id);
  
  const postCommentMutation = useMutation({
    mutationFn: async () => {
      return base44.functions.invoke('processMentionsAndNotify', {
        discussion_id: expandedThread.id,
        comment_content: commentInput,
        author: 'Current User' // Replace with actual user
      });
    },
    onSuccess: () => {
      setCommentInput('');
      queryClient.invalidateQueries({ queryKey: ['comments', expandedThread?.id] });
      queryClient.invalidateQueries({ queryKey: ['discussions', contextType, contextId] });
    }
  });

  const createDiscussionMutation = useMutation({
    mutationFn: async (title) => {
      return base44.entities.Discussion.create({
        title,
        context_type: contextType,
        context_id: contextId,
        context_data: contextData,
        initiator: 'Current User',
        status: 'active',
        priority: contextData.flagged ? 'high' : 'medium',
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      });
    },
    onSuccess: (newDiscussion) => {
      setExpandedThread(newDiscussion);
      queryClient.invalidateQueries({ queryKey: ['discussions', contextType, contextId] });
    }
  });

  const handleInputChange = (e) => {
    setCommentInput(e.target.value);
    setShowMentionHint(e.target.value.includes('@'));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-amber-50 border-amber-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Discussions List */}
      {!expandedThread ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Discussions ({discussions.length})
            </h3>
            {discussions.length === 0 && (
              <Button 
                size="sm" 
                onClick={() => createDiscussionMutation.mutate(`Discuss ${contextData.product_name || contextData.report_week || 'this finding'}`)}
              >
                Start Discussion
              </Button>
            )}
          </div>

          {discussions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No discussions yet</p>
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={() => createDiscussionMutation.mutate(`Discuss ${contextData.product_name || contextData.report_week || 'this finding'}`)}
                >
                  Start First Discussion
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {discussions.map(discussion => (
                <button
                  key={discussion.id}
                  onClick={() => setExpandedThread(discussion)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-sm ${getPriorityColor(discussion.priority)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{discussion.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Started by {discussion.initiator}
                      </p>
                      {discussion.mentioned_users?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {discussion.mentioned_users.slice(0, 3).map(user => (
                            <Badge key={user} variant="outline" className="text-xs">
                              @{user}
                            </Badge>
                          ))}
                          {discussion.mentioned_users.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{discussion.mentioned_users.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={getPriorityBadgeVariant(discussion.priority)} className="text-xs">
                        {discussion.priority}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {discussion.comment_count} comments
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Thread View
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setExpandedThread(null)}
            className="mb-2"
          >
            ← Back to discussions
          </Button>

          {/* Thread Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-base">{expandedThread.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Started by {expandedThread.initiator}
                  </p>
                </div>
                <Badge variant={getPriorityBadgeVariant(expandedThread.priority)}>
                  {expandedThread.priority}
                </Badge>
              </div>

              {/* Context Data Link */}
              {expandedThread.context_data && (
                <div className="mt-4 pt-3 border-t">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <LinkIcon className="w-3 h-3" />
                    Related to:
                  </p>
                  <div className="bg-accent p-2 rounded text-xs space-y-1">
                    {expandedThread.context_data.product_name && (
                      <p><strong>Product:</strong> {expandedThread.context_data.product_name}</p>
                    )}
                    {expandedThread.context_data.report_week && (
                      <p><strong>Report:</strong> {expandedThread.context_data.report_week}</p>
                    )}
                    {expandedThread.context_data.flagged && (
                      <p className="text-red-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Flagged for attention
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Comments Thread */}
          <div className="space-y-3">
            {rootComments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>
            ) : (
              rootComments.map(comment => (
                <CommentBubble key={comment.id} comment={comment} />
              ))
            )}
          </div>

          {/* Comment Input */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              {showMentionHint && (
                <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>Use @username to mention people. Format report links as <code className="bg-white px-1 rounded">report:ID</code></p>
                </div>
              )}

              <Textarea
                ref={textareaRef}
                value={commentInput}
                onChange={handleInputChange}
                placeholder="Share your thoughts... Use @mention or link report:ID"
                className="resize-none min-h-20"
              />

              <Button
                onClick={() => postCommentMutation.mutate()}
                disabled={!commentInput.trim() || postCommentMutation.isPending}
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                Post Comment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function CommentBubble({ comment }) {
  return (
    <Card className="border">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm">{comment.author}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleTimeString()}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>

        <p className="text-sm mb-3">{comment.content}</p>

        {/* Mentions */}
        {comment.mentioned_users?.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {comment.mentioned_users.map(user => (
              <Badge key={user} variant="outline" className="text-xs">
                @{user}
              </Badge>
            ))}
          </div>
        )}

        {/* Linked Data */}
        {comment.linked_data && (
          <div className="bg-accent p-2 rounded text-xs mt-2 space-y-1">
            {comment.linked_data.report_id && (
              <p><strong>Report:</strong> {comment.linked_data.report_id}</p>
            )}
            {comment.linked_data.metric_name && (
              <p><strong>Metric:</strong> {comment.linked_data.metric_name}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}