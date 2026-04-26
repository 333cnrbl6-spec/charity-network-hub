import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Send, X, Minimize2, Sparkles } from 'lucide-react';

const VERA_AVATAR = 'https://media.base44.com/images/public/69e20cef658590cb2c64169c/9eac8d138_generated_image.png';

const INTRO_BUBBLES = [
  "👋 Hello! I'm Vera — your Age UK AI superhero!",
  "I know your role, your data, and this platform inside out ✨",
  "Ask me anything, or just click to chat with me!",
];

function IntroBubble({ text, index, onDone, total }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = setTimeout(() => setVisible(true), index * 1200);
    return () => clearTimeout(show);
  }, [index]);

  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
      }}
    >
      {visible && (
        <div className="bg-white border-2 border-primary/40 rounded-2xl rounded-br-none shadow-lg px-4 py-3 text-sm font-medium text-foreground max-w-[220px] text-right ml-auto">
          {text}
        </div>
      )}
    </div>
  );
}

function SpeechBubble({ message, onDismiss, onClick, showIntro, onIntroComplete }) {
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (!showIntro) return;
    const timer = setTimeout(() => {
      setIntroDone(true);
      if (onIntroComplete) onIntroComplete();
    }, INTRO_BUBBLES.length * 1200 + 1800);
    return () => clearTimeout(timer);
  }, [showIntro, onIntroComplete]);

  return (
    <div className="absolute bottom-[108px] right-0 w-64 flex flex-col gap-2">
      {showIntro && !introDone ? (
        <>
          {INTRO_BUBBLES.map((text, i) => (
            <IntroBubble key={i} text={text} index={i} total={INTRO_BUBBLES.length} />
          ))}
        </>
      ) : message ? (
        <div
          className="bg-white border-2 border-primary/40 rounded-2xl rounded-br-none shadow-xl p-4 cursor-pointer hover:border-primary transition-colors"
          style={{ animation: 'fadeSlideIn 0.4s ease-out' }}
          onClick={onClick}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-foreground leading-relaxed flex-1">{message}</p>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(); }}
              className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-primary mt-2 font-semibold">Tap to chat with me ✨</p>
        </div>
      ) : null}
      {/* Bubble tail dots */}
      <div className="flex justify-end gap-1 pr-5 -mt-1">
        <div className="w-2.5 h-2.5 rounded-full bg-primary/30 border border-primary/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/20 border border-primary/30 self-end mb-0.5" />
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
  const [showIntro, setShowIntro] = useState(false);
  const [lastPage, setLastPage] = useState('');
  // bounce animation state
  const [bounceCount, setBounceCount] = useState(0);
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
      return "I'm having a little trouble connecting right now — but I'm still here! 💪";
    } finally {
      setLoading(false);
    }
  }, [location.pathname]);

  // Bounce Vera every 8 seconds when idle to attract attention
  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => {
      setBounceCount(c => c + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Initial intro on first load
  useEffect(() => {
    if (!user || hasGreeted) return;
    setHasGreeted(true);
    // Show intro bubbles after 1s
    const introTimer = setTimeout(() => {
      setShowIntro(true);
    }, 1000);
    return () => clearTimeout(introTimer);
  }, [user, hasGreeted]);

  // After intro, fetch real greeting and show as thought bubble
  const handleIntroComplete = useCallback(async () => {
    setShowIntro(false);
    const reply = await askVera(null, true);
    setThoughtBubble(reply);
    setThoughtDismissed(false);
  }, [askVera]);

  // Page-change hint
  useEffect(() => {
    if (!user || !hasGreeted || location.pathname === lastPage) return;
    setLastPage(location.pathname);
    if (lastPage === '') return;
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
    setShowIntro(false);
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

  const quickPrompts = {
    '/coordinator-portal': ["What should I do first today?", "How do I add a new client?", "How do I import my records?"],
    '/clients': ["How do I add a new client?", "What info do I need for a referral?", "Can I import a client list?"],
    '/jobs': ["How do I schedule a job?", "What job types are available?", "How do I mark a job complete?"],
    '/import': ["What file types can I upload?", "Walk me through importing clients", "What happens after I import?"],
    '/volunteers': ["How do I add a volunteer?", "What is a DBS check?", "How do I track volunteer hours?"],
    '/sessions': ["How do I create a session?", "What session types exist?", "How do I record attendees?"],
    '/grants': ["What grants can clients apply for?", "How do I record a grant award?", "What is Attendance Allowance?"],
    '/safeguarding': ["How do I report a concern?", "What is the reporting procedure?", "What happens after I report?"],
  };
  const currentPrompts = quickPrompts[location.pathname] || ["What can I do on this page?", "How do I get started?", "What are today's priorities?"];

  const showBubble = !isOpen && (showIntro || (thoughtBubble && !thoughtDismissed));

  if (!user) return null;

  return (
    <>
      {/* CSS keyframes */}
      <style>{`
        @keyframes veraBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          20% { transform: translateY(-18px) scale(1.05); }
          40% { transform: translateY(-6px) scale(1.02); }
          60% { transform: translateY(-12px) scale(1.04); }
          80% { transform: translateY(-3px) scale(1.01); }
        }
        @keyframes veraFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .vera-float { animation: veraFloat 3s ease-in-out infinite; }
        .vera-bounce-${bounceCount} { animation: veraBounce 0.8s ease-in-out; }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-0">

        {/* Speech / thought bubble */}
        {showBubble && (
          <SpeechBubble
            message={thoughtBubble}
            onDismiss={() => setThoughtDismissed(true)}
            onClick={openChat}
            showIntro={showIntro}
            onIntroComplete={handleIntroComplete}
          />
        )}

        {/* Chat window */}
        {isOpen && (
          <div
            className="mb-4 w-80 md:w-96 bg-white border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: '540px', animation: 'fadeSlideIn 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="relative">
                <img src={VERA_AVATAR} alt="Vera" className="w-11 h-11 rounded-full object-cover border-2 border-white/40" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-primary-foreground font-bold text-sm">Vera ✨</p>
                <p className="text-primary-foreground/70 text-xs">Your Age UK AI superhero helper</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-primary-foreground/60 hover:text-primary-foreground transition-colors p-1">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {messages.length === 0 && !loading && (
                <div className="text-center py-6">
                  <img src={VERA_AVATAR} alt="Vera" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-primary/20" />
                  <p className="text-sm text-muted-foreground">Hi! I'm Vera — ask me anything or tap a suggestion below.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {loading && (
                <div className="flex gap-2 items-center">
                  <img src={VERA_AVATAR} alt="Vera" className="w-7 h-7 rounded-full object-cover border border-primary/20" />
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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

        {/* Floating Vera avatar — BIG */}
        <div className="relative flex flex-col items-center">
          {/* Label above */}
          {!isOpen && (
            <div
              className="mb-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap"
              style={{ animation: 'fadeSlideIn 0.5s ease-out' }}
            >
              💬 Chat with Vera!
            </div>
          )}

          {/* Pulsing rings */}
          {!isOpen && (showBubble || true) && (
            <>
              <span className="absolute inset-0 rounded-full border-4 border-primary/40 pointer-events-none"
                style={{ animation: 'ringPulse 2s ease-out infinite' }} />
              <span className="absolute inset-0 rounded-full border-4 border-primary/20 pointer-events-none"
                style={{ animation: 'ringPulse 2s ease-out 0.6s infinite' }} />
            </>
          )}

          <button
            onClick={() => isOpen ? setIsOpen(false) : openChat()}
            className={`relative w-24 h-24 rounded-full shadow-2xl overflow-hidden border-4 border-white hover:scale-110 active:scale-95 transition-transform cursor-pointer ${!isOpen ? `vera-float vera-bounce-${bounceCount}` : ''}`}
            title="Chat with Vera"
            style={{ boxShadow: '0 8px 32px rgba(120,40,180,0.35), 0 2px 8px rgba(0,0,0,0.15)' }}
          >
            <img src={VERA_AVATAR} alt="Vera" className="w-full h-full object-cover" />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
}