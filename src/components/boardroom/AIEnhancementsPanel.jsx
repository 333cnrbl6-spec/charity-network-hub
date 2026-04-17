import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Zap,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function AIEnhancementsPanel({ channelName, aiMembers }) {
  const [expandedMember, setExpandedMember] = useState(null);
  const [results, setResults] = useState({});
  const queryClient = useQueryClient();

  const enhancementMutation = useMutation({
    mutationFn: async ({ action, ai_member }) => {
      const response = await base44.functions.invoke('aiMemberEnhancements', {
        action,
        channel_name: channelName,
        ai_member
      });
      return response;
    },
    onSuccess: (data, { action, ai_member }) => {
      const key = `${ai_member}_${action}`;
      setResults(prev => ({
        ...prev,
        [key]: data.result
      }));
      toast.success(`${ai_member} completed: ${action}`);
      queryClient.invalidateQueries({ queryKey: ['channelMessages', channelName] });
    },
    onError: (error) => {
      toast.error('Enhancement failed: ' + error.message);
    }
  });

  const handleAction = (action, member) => {
    enhancementMutation.mutate({ action, ai_member: member });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'summarize':
        return <MessageSquare className="w-4 h-4" />;
      case 'identifyActionItems':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'suggestMetrics':
        return <Zap className="w-4 h-4" />;
      case 'initiateDiscussion':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const actionLabels = {
    summarize: 'Summarize Discussion',
    identifyActionItems: 'Flag Action Items',
    suggestMetrics: 'Suggest Metrics',
    initiateDiscussion: 'New Discussion'
  };

  const resultKey = (member, action) => `${member}_${action}`;
  const hasResult = (member, action) => resultKey(member, action) in results;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Enhancements
        </CardTitle>
        <CardDescription>Proactive analysis and insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {aiMembers.map(member => (
          <div key={member} className="border rounded-lg overflow-hidden">
            {/* Member Header */}
            <button
              onClick={() => setExpandedMember(expandedMember === member ? null : member)}
              className="w-full p-3 bg-accent/50 hover:bg-accent transition-colors flex items-center justify-between"
            >
              <span className="font-medium text-sm">{member}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedMember === member ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Actions */}
            {expandedMember === member && (
              <div className="p-3 border-t space-y-2 bg-background">
                {Object.entries(actionLabels).map(([action, label]) => {
                  const isLoading = enhancementMutation.isPending &&
                    enhancementMutation.variables?.ai_member === member &&
                    enhancementMutation.variables?.action === action;
                  const hasRes = hasResult(member, action);

                  return (
                    <Button
                      key={action}
                      onClick={() => handleAction(action, member)}
                      disabled={isLoading}
                      variant={hasRes ? 'secondary' : 'outline'}
                      size="sm"
                      className="w-full justify-start gap-2 text-xs"
                    >
                      {getActionIcon(action)}
                      {label}
                      {hasRes && <Badge variant="default" className="ml-auto text-xs">Done</Badge>}
                      {isLoading && <span className="ml-auto text-xs">Loading...</span>}
                    </Button>
                  );
                })}

                {/* Result Display */}
                {Object.entries(results)
                  .filter(([key]) => key.startsWith(member))
                  .map(([key, result]) => {
                    const action = key.split('_').pop();
                    return (
                      <div key={key} className="mt-3 p-2 bg-primary/5 rounded border border-primary/20 text-xs max-h-32 overflow-y-auto">
                        <p className="font-semibold mb-1">Result:</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">{result}</p>
                        {action === 'identifyActionItems' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 w-full text-xs"
                            onClick={() => {
                              base44.functions.invoke('createTasksFromActionItems', {
                                action_items_text: result,
                                channel_name: channelName,
                                ai_member: member
                              });
                              toast.success('Tasks created from action items');
                            }}
                          >
                            Create Tasks
                          </Button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}