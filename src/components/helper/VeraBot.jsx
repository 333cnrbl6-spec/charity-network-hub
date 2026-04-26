import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Send, X, ChevronDown, Sparkles, Minimize2 } from 'lucide-react';

const VERA_AVATAR = 'https://media.base44.com/images/public/69e20cef658590cb2c64169c/9eac8d138_generated_image.png';

// Thought bubble that appears above vera when minimised
function ThoughtBubble({ message, onDismiss, onClick }) {
  return (
    <div className="absolute bottom-[88px] right-0 w-72 animate-in slide-in-from-bottom-2 duration-300">
      {/* Bubble */}
      <div
        className="bg-white border-2 border-primary/30 rounded-2xl rounded-br-sm shadow-xl p-4 cursor-pointer hover:border-primary/60 transition-colors"
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-foreground leading-relaxed flex-1">{message}</p>
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-primary mt-2 font-medium">Click to chat with Vera ✨</p>
      </div>
      {/* Bubble tail */}
      <div className="flex justify-end pr-8">
        <div className="flex gap-1 items-end">
          <div className="w-2 h-2 rounded-full bg-primary/20 border border-primary/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/20 border border-primary/30 mb-0.5" />
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ role, content }) {
  return (
    <div className={`flex gap-2 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {role === 'assistant' && (
        <img src={VERA_AVATAR} alt="Vera" className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5 border border-primary/20" />
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          role === 'user'
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export default function VeraBot() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thoughtBubble, setThoughtBubble] = useState(null);
  const [thoughtDismissed, setThoughtDismissed] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [lastPage, setLastPage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  const askVera = useCallback(async (message, isGreeting = false) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('helperBot', {
        message,
        page: location.pathname,
        context: isGreeting ? 'initial_greeting' : undefined,
      });
      return response.data?.reply || "I'm here to help! What would you like to know?";
    } catch {
      return "I'm having a little trouble connecting right now — but I'm still here! Try refreshing if this persists. 💪";
    } finally {
      setLoading(false);
    }
  }, [location.pathname]);

  // Initial greeting on first load
  useEffect(() => {
    if (!user || hasGreeted) return;
    setHasGreeted(true);
    const timer = setTimeout(async () => {
      const reply = await askVera(null, true);
      setThoughtBubble(reply);
      setThoughtDismissed(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [user, hasGreeted, askVera]);

  // Page-change hint (after initial greeting)
  useEffect(() => {
    if (!user || !hasGreeted || location.pathname === lastPage) return;
    setLastPage(location.pathname);
    if (lastPage === '') return; // skip on mount

    const timer = setTimeout(async () => {
      const reply = await askVera(`I just navigated to ${location.pathname}. Give me a very short (1-2 sentence) page-specific tip for what I can do here.`);
      if (!isOpen) {
        setThoughtBubble(reply);
        setThoughtDismissed(false);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [location.pathname]); // eslint-disable-line

  const openChat = async () => {
    setIsOpen(true);
    setThoughtBubble(null);
    if (messages.length === 0) {
      const greeting = thoughtBubble || await askVera(null, true);
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    const reply = await askVera(text);
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Quick prompts based on current page
  const quickPrompts = {
    '/coordinator-portal': ["What should I do first today?", "How do I add a new client?", "How do I import my records?"],
    '/clients': ["How do I add a new client?", "What info do I need for a referral?", "Can I import a client list?"],
    '/jobs': ["How do I schedule a job?", "What job types are available?", "How do I mark a job complete?"],
    '/import': ["What file types can I upload?", "Walk me through importing clients", "What happens after I import?"],
    '/volunteers': ["How do I add a volunteer?", "What is a DBS check?", "How do I track volunteer hours?"],
    '/sessions': ["How do I create a session?", "What session types exist?", "How do I record attendees?"],
    '/grants': ["What grants can clients apply for?", "How do I record a grant award?", "What is Attendance Allowance?"],
    '/safeguarding': ["How do I report a safeguarding concern?", "What is the procedure for reporting?", "What happens after I report?"],
  };
  const currentPrompts = quickPrompts[location.pathname] || ["What can I do on this page?", "How do I get started?", "What are today's priorities?"];

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-0">

      {/* Thought bubble (minimised state) */}
      {!isOpen && thoughtBubble && !thoughtDismissed && (
        <ThoughtBubble
          message={thoughtBubble}
          onDismiss={() => setThoughtDismissed(true)}
          onClick={openChat}
        />
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="mb-3 w-80 md:w-96 bg-white border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300" style={{ height: '520px' }}>
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <img src={VERA_AVATAR} alt="Vera" className="w-10 h-10 rounded-full object-cover border-2 border-white/40" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-primary-foreground font-semibold text-sm">Vera ✨</p>
              <p className="text-primary-foreground/70 text-xs">Your Age UK AI helper</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {messages.length === 0 && !loading && (
              <div className="text-center py-8">
                <img src={VERA_AVATAR} alt="Vera" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary/20" />
                <p className="text-sm text-muted-foreground">Hi! I'm Vera, your Age UK superhero helper.<br/>Ask me anything or tap a suggestion below.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <img src={VERA_AVATAR} alt="Vera" className="w-7 h-7 rounded-full object-cover border border-primary/20" />
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-3 py-2 border-t bg-background flex gap-1.5 overflow-x-auto flex-shrink-0">
            {currentPrompts.map(p => (
              <button
                key={p}
                onClick={async () => {
                  if (loading) return;
                  setMessages(prev => [...prev, { role: 'user', content: p }]);
                  const reply = await askVera(p);
                  setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
                }}
                className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1.5 whitespace-nowrap hover:bg-primary/20 transition-colors flex-shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1 bg-background flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Vera anything..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="bg-primary text-primary-foreground rounded-xl p-2 hover:bg-primary/90 transition-colors disabled:opacity-40 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating avatar button */}
      <button
        onClick={() => isOpen ? setIsOpen(false) : openChat()}
        className="relative w-16 h-16 rounded-full shadow-2xl overflow-hidden border-4 border-white hover:scale-105 transition-transform group"
        title="Chat with Vera"
      >
        <img src={VERA_AVATAR} alt="Vera" className="w-full h-full object-cover" />
        {!isOpen && (
          <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/0 transition-colors" />
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
        )}
        {/* Pulsing ring when thought bubble is showing */}
        {!isOpen && thoughtBubble && !thoughtDismissed && (
          <span className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-30 pointer-events-none" />
        )}
      </button>
    </div>
  );
}