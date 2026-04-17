import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  Send,
  Zap,
  Users,
  TrendingUp,
  Lock,
  MessageSquare,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const CHANNELS = [
  {
    id: 'strategy',
    name: 'Strategy',
    icon: MessageCircle,
    description: 'Strategic planning & vision',
    members: ['Strategic Advisor', 'Product Lead']
  },
  {
    id: 'products',
    name: 'Products',
    icon: Zap,
    description: 'Product development & roadmap',
    members: ['Product Lead', 'Market Analyst']
  },
  {
    id: 'prospects',
    name: 'Prospects',
    icon: TrendingUp,
    description: 'Market opportunities & growth',
    members: ['Market Analyst', 'Strategic Advisor']
  },
  {
    id: 'governance',
    name: 'Governance',
    icon: Lock,
    description: 'Risk, compliance & oversight',
    members: ['Compliance Officer']
  }
];

const AI_MEMBERS = ['Strategic Advisor', 'Product Lead', 'Market Analyst', 'Compliance Officer'];

export default function MessagingHub() {
  const queryClient = useQueryClient();
  const [selectedChannel, setSelectedChannel] = useState('strategy');
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [aiResponding, setAiResponding] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages for current channel
  const { data: messages = [] } = useQuery({
    queryKey: ['channelMessages', selectedChannel],
    queryFn: async () => {
      const allMessages = await base44.entities.Message.list('-posted_at', 100);
      return allMessages.filter(m => m.channel_name === selectedChannel);
    },
    refetchInterval: 3000, // Real-time polling
  });

  // Root messages (no thread_id)
  const rootMessages = messages.filter(m => !m.thread_id);
  
  // Thread replies for selected message
  const threadReplies = selectedThread
    ? messages.filter(m => m.thread_id === selectedThread.id)
    : [];

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      return base44.entities.Message.create({
        channel_name: selectedChannel,
        author: 'You',
        content,
        thread_id: selectedThread?.id || null,
        thread_depth: selectedThread ? 1 : 0,
        is_ai_generated: false,
        posted_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['channelMessages', selectedChannel] });
    }
  });

  const generateAIResponseMutation = useMutation({
    mutationFn: async (aiMember) => {
      return base44.functions.invoke('generateAIMemberResponse', {
        channel_name: selectedChannel,
        message_content: messageInput,
        thread_id: selectedThread?.id || null,
        ai_member: aiMember
      });
    },
    onSuccess: () => {
      setMessageInput('');
      setAiResponding(false);
      queryClient.invalidateQueries({ queryKey: ['channelMessages', selectedChannel] });
    }
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    await sendMessageMutation.mutate(messageInput);
  };

  const handleAIMemberResponse = async (memberName) => {
    if (!messageInput.trim()) return;
    setAiResponding(true);
    await generateAIResponseMutation.mutate(memberName);
  };

  const currentChannel = CHANNELS.find(c => c.id === selectedChannel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Channel Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {CHANNELS.map(channel => {
              const Icon = channel.icon;
              const isActive = selectedChannel === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    setSelectedChannel(channel.id);
                    setSelectedThread(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold text-sm">#{channel.name}</span>
                  </div>
                  <p className="text-xs opacity-75">{channel.description}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* AI Members */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentChannel?.members.map(member => (
                <Badge key={member} variant="outline" className="w-full justify-start text-xs">
                  {member}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          {/* Channel Header */}
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentChannel && <currentChannel.icon className="w-5 h-5" />}
                <div>
                  <CardTitle>#{currentChannel?.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{currentChannel?.description}</p>
                </div>
              </div>
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {currentChannel?.members.length}
              </Badge>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-96">
            {selectedThread ? (
              // Thread view
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedThread(null)}
                  className="mb-4"
                >
                  ← Back to channel
                </Button>

                {/* Parent message */}
                <div className="bg-accent p-4 rounded-lg mb-4 border-l-2 border-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{selectedThread.author}</span>
                    {selectedThread.is_ai_generated && (
                      <Badge variant="outline" className="text-xs">AI</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedThread.posted_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{selectedThread.content}</p>
                </div>

                {/* Thread replies */}
                <div className="space-y-3">
                  {threadReplies.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </div>
              </div>
            ) : (
              // Root messages
              <div className="space-y-3">
                {rootMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No messages yet. Start a discussion!</p>
                  </div>
                ) : (
                  rootMessages.map(msg => (
                    <div
                      key={msg.id}
                      className="rounded-lg border p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => msg.reply_count > 0 && setSelectedThread(msg)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{msg.author}</span>
                          {msg.is_ai_generated && (
                            <Badge variant="outline" className="text-xs">AI</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.posted_at).toLocaleTimeString()}
                          </span>
                        </div>
                        {msg.reply_count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {msg.reply_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4 space-y-3">
            <Textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={selectedThread ? 'Reply in thread...' : 'Share your thoughts...'}
              className="resize-none min-h-20"
            />
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendMessageMutation.isPending}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </Button>

              {/* AI Member Quick Actions */}
              <div className="flex gap-2 flex-wrap">
                {currentChannel?.members.map(member => (
                  <Button
                    key={member}
                    onClick={() => handleAIMemberResponse(member)}
                    disabled={!messageInput.trim() || aiResponding}
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    {member.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  return (
    <div className="rounded-lg border p-3 bg-slate-50">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-sm">{message.author}</span>
        {message.is_ai_generated && (
          <Badge variant="outline" className="text-xs">AI</Badge>
        )}
        <span className="text-xs text-muted-foreground">
          {new Date(message.posted_at).toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm">{message.content}</p>
    </div>
  );
}