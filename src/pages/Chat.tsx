import { useRef, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { clearUser } from "../features/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../features/firebase";
import { useNavigate } from "react-router-dom";
import {
  Send, FileText, Brain, Sparkles, User, Bot, Copy,
  ThumbsUp, ThumbsDown, RotateCcw, ChevronDown, Plus,
  Paperclip, Search, BookOpen, Zap, MessageSquare,
  Check, Loader2, Hash} from "lucide-react";
import LiquidEther from "../components/LiquidEther";
import Sidebar from "../components/Sidebar";
import gsap from 'gsap';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  liked?: boolean | null;
}

interface Conversation {
  id: string;
  title: string;
  preview: string;
  time: string;
  messageCount: number;
}

interface SuggestedPrompt {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  prompt: string;
  color: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (date: Date) =>
  date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const mockResponses = [
  "Based on your uploaded materials, here's a concise breakdown:\n\n**Key Concepts:**\n- The central argument revolves around the interaction between variables in the system\n- Three primary mechanisms drive the observed outcomes\n- Empirical evidence supports the theoretical framework\n\n**Summary:**\nThe document establishes a foundational understanding of the topic through structured analysis. The author presents evidence systematically, building toward a comprehensive conclusion that synthesises multiple perspectives.\n\nWould you like me to generate flashcards from this content, or dive deeper into any specific section?",
  "Great question! Here's what I found in your study materials:\n\n**Direct Answer:**\nThe concept you're asking about is fundamentally linked to the core principles outlined in Chapter 3. The relationship can be understood as bidirectional — each element influences the other in a feedback loop.\n\n**Key Points to Remember:**\n1. The primary mechanism involves sequential activation\n2. Environmental factors modulate the baseline response\n3. Long-term potentiation plays a critical role\n\nThis is a high-yield topic — I'd recommend adding this to your flashcard deck. Want me to create some revision cards?",
  "I've analysed the relevant sections of your PDFs. Here's a structured explanation:\n\nThe phenomenon you're studying operates on two distinct levels — micro and macro. At the micro level, individual components interact through established pathways. At the macro level, emergent properties arise from these interactions.\n\n**Why this matters:**\nUnderstanding this distinction is crucial for exam success. Most questions test whether students can identify *which level* a given scenario operates at.\n\n**Mnemonic to help:**\nThink of it as a city: individual roads (micro) create the traffic patterns (macro) — neither explains the other fully on its own.",
];

// ─── Suggested Prompts ────────────────────────────────────────────────────────

const suggestedPrompts: SuggestedPrompt[] = [
  { icon: BookOpen,    label: "Summarise my PDF",          prompt: "Can you summarise the key points from my uploaded PDF?",           color: "#a855f7" },
  { icon: Brain,       label: "Create flashcards",         prompt: "Generate flashcards from the most important concepts in my notes.", color: "#3b82f6" },
  { icon: Search,      label: "Explain a concept",         prompt: "Explain the main concept from chapter 1 in simple terms.",         color: "#ec4899" },
  { icon: Zap,         label: "Quiz me",                   prompt: "Ask me 5 questions to test my understanding of the material.",      color: "#10b981" },
  { icon: Hash,        label: "Key terms",                 prompt: "List all the key terms and definitions from my study material.",    color: "#f59e0b" },
  { icon: FileText,    label: "Compare topics",            prompt: "Compare and contrast the two main theories discussed in my PDF.",   color: "#06b6d4" },
];

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  onLike: (id: string, val: boolean) => void;
  onCopy: (content: string) => void;
  isLatest?: boolean;
}

const MessageBubble = ({ message, onLike, onCopy, isLatest }: MessageBubbleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isUser = message.role === 'user';

  useEffect(() => {
    if (ref.current && isLatest) {
      gsap.fromTo(ref.current,
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' }
      );
    }
  }, [isLatest]);

  // Parse bold markdown **text**
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <div
      ref={ref}
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center self-end mb-1 ${
        isUser
          ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-600/25'
          : 'bg-white/[0.06] border border-white/[0.1]'
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-purple-300" />
        }
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1.5 max-w-[72%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? 'bg-gradient-to-br from-purple-600/80 to-pink-600/70 text-white rounded-br-sm border border-purple-500/30'
            : 'bg-white/[0.05] border border-white/[0.08] text-gray-200 rounded-bl-sm'
        }`}>
          {isUser
            ? message.content
            : <>{renderContent(message.content)}</>
          }
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {message.sources.map((src, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-[11px] text-gray-500">
                <FileText className="w-2.5 h-2.5" />
                {src}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[11px] text-gray-600 px-1">{formatTime(message.timestamp)}</span>
          {!isUser && (
            <>
              <button
                onClick={() => onCopy(message.content)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-600 hover:text-gray-300 transition-all"
                title="Copy"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => onLike(message.id, true)}
                className={`p-1.5 rounded-lg hover:bg-white/[0.06] transition-all ${message.liked === true ? 'text-emerald-400' : 'text-gray-600 hover:text-gray-300'}`}
                title="Helpful"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onLike(message.id, false)}
                className={`p-1.5 rounded-lg hover:bg-white/[0.06] transition-all ${message.liked === false ? 'text-rose-400' : 'text-gray-600 hover:text-gray-300'}`}
                title="Not helpful"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────

const TypingIndicator = () => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center self-end mb-1">
      <Bot className="w-4 h-4 text-purple-300" />
    </div>
    <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-white/[0.05] border border-white/[0.08] flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-purple-400/60 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  </div>
);

// ─── Conversation Item ────────────────────────────────────────────────────────

interface ConvItemProps {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConvItem = ({ conv, isActive, onClick }: ConvItemProps) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group ${
      isActive
        ? 'bg-purple-500/15 border border-purple-500/25'
        : 'hover:bg-white/[0.04] border border-transparent'
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <p className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>{conv.title}</p>
      <span className="text-[10px] text-gray-600 flex-shrink-0 mt-0.5">{conv.time}</span>
    </div>
    <p className="text-[11px] text-gray-600 truncate mt-0.5">{conv.preview}</p>
  </button>
);

// ─── Chat Page ────────────────────────────────────────────────────────────────

const mockConversations: Conversation[] = [
  { id: '1', title: 'Quantum Physics Ch.5',      preview: 'Explain wave-particle duality...',   time: '2h ago',     messageCount: 8  },
  { id: '2', title: 'Biology Cellular Respiration', preview: 'What is the Krebs cycle?',         time: '5h ago',     messageCount: 14 },
  { id: '3', title: 'Modern History Essay Prep',  preview: 'Key causes of WW1...',               time: 'Yesterday',  messageCount: 6  },
  { id: '4', title: 'Calculus Derivatives',       preview: 'Chain rule examples...',             time: '2 days ago', messageCount: 11 },
  { id: '5', title: 'Economics Supply & Demand',  preview: 'Price elasticity concepts...',       time: '3 days ago', messageCount: 5  },
];

export default function ChatPage() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, isTyping]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  };

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    if (inputRef.current) inputRef.current.style.height = 'auto';

    // Simulate AI response
    await new Promise(r => setTimeout(r, 1400 + Math.random() * 800));

    const aiMsg: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
      timestamp: new Date(),
      sources: ['Biology Notes.pdf', 'Lecture Slides Ch.3.pdf'],
    };

    setIsTyping(false);
    setMessages(prev => [...prev, aiMsg]);
  }, [input, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleLike = (id: string, val: boolean) => {
    setMessages(prev => prev.map(m =>
      m.id === id ? { ...m, liked: m.liked === val ? null : val } : m
    ));
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(content.slice(0, 20));
    setTimeout(() => setCopiedId(null), 1800);
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveConv(null);
    inputRef.current?.focus();
  };

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigate("/login");
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <LiquidEther
          colors={['#ec4899', '#a855f7', '#3b82f6']}
          mouseForce={10}
          cursorSize={80}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.35}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.15}
          autoIntensity={1.2}
          takeoverDuration={0.4}
          autoResumeDelay={2500}
          autoRampDuration={1.0}
        />
      </div>
      <div className="fixed inset-0 z-[1] pointer-events-none bg-black/80" />
      <div className="fixed inset-0 z-[2] pointer-events-none bg-gradient-to-b from-black/50 via-black/10 to-black/50" />

      {/* App Sidebar */}
      <Sidebar
        activePage="AI Chat"
        user={{
          name: user.name ?? user.email ?? 'Student',
          email: user.email ?? '',
          photo: user.photo ?? null,
        }}
        onLogout={handleLogout}
        onNavigate={(route, _label) => navigate(route)}
      />

      {/* Page Layout */}
      <div className="relative z-10 flex-1 ml-72 flex overflow-hidden h-screen">

        {/* ── Conversation History Panel ── */}
        <div className={`flex-shrink-0 transition-all duration-300 flex flex-col h-full border-r border-white/[0.06] bg-black/20 backdrop-blur-sm ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
          <div className="p-4 border-b border-white/[0.06] flex-shrink-0">
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/80 to-pink-600/70 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-purple-600/20 hover:shadow-purple-600/35 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1" style={{ scrollbarWidth: 'none' }}>
            <p className="text-[10px] font-medium tracking-widest uppercase text-gray-600 px-2 pb-2">Recent</p>
            {mockConversations.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={activeConv === conv.id}
                onClick={() => setActiveConv(conv.id)}
              />
            ))}
          </div>

          {/* PDF context indicator */}
          <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-300 truncate">3 PDFs loaded</p>
                <p className="text-[10px] text-gray-600 truncate">Active context</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
            </div>
          </div>
        </div>

        {/* ── Main Chat Area ── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">

          {/* Top bar */}
          <div ref={headerRef} className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-black/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(p => !p)}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/25 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-none">AI Study Assistant</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Ready to help
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={startNewChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs text-gray-400 hover:text-gray-200 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  New chat
                </button>
              )}
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs text-gray-400 hover:text-gray-200 transition-all"
              >
                <Paperclip className="w-3 h-3" />
                Add PDF
              </button>
            </div>
          </div>

          {/* Messages / Empty state */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.2) transparent' }}
          >
            {isEmpty ? (
              /* ── Empty / Welcome State ── */
              <div className="flex flex-col items-center justify-center h-full gap-10 pb-8">
                <div className="text-center space-y-4">
                  <div className="relative mx-auto w-16 h-16">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/25 flex items-center justify-center">
                      <Bot className="w-8 h-8 text-purple-300" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Ask anything about your{' '}
                      <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                        study materials
                      </span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
                      I have access to your uploaded PDFs. Ask me to summarise, explain, quiz you, or generate flashcards.
                    </p>
                  </div>
                </div>

                {/* Suggested prompts */}
                <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {suggestedPrompts.map((sp, i) => {
                    const Icon = sp.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => sendMessage(sp.prompt)}
                        className="group relative flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.06] transition-all duration-300 text-left overflow-hidden"
                      >
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-xl"
                          style={{ background: `radial-gradient(ellipse at top left, ${sp.color}0d 0%, transparent 70%)` }}
                        />
                        <div
                          className="flex-shrink-0 p-1.5 rounded-lg mt-0.5 flex items-center justify-center"
                          style={{ background: `${sp.color}18`, color: sp.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="relative z-10">
                          <p className="text-xs font-semibold text-gray-200">{sp.label}</p>
                          <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed line-clamp-2">{sp.prompt}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ── Messages ── */
              <>
                {messages.map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    onLike={handleLike}
                    onCopy={handleCopy}
                    isLatest={i === messages.length - 1}
                  />
                ))}
                {isTyping && <TypingIndicator />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollBtn && (
            <div className="absolute bottom-28 right-8 z-20">
              <button
                onClick={() => scrollToBottom()}
                className="w-8 h-8 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all shadow-xl"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Input Bar ── */}
          <div className="flex-shrink-0 px-6 pb-6 pt-3 border-t border-white/[0.06]">

            {/* Copy toast */}
            {copiedId && (
              <div className="flex justify-center mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-xs text-emerald-400">
                  <Check className="w-3 h-3" />
                  Copied to clipboard
                </div>
              </div>
            )}

            <div className="relative max-w-4xl mx-auto">
              {/* Glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/10 to-blue-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative flex items-end gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.1] focus-within:border-purple-500/35 transition-all duration-300 backdrop-blur-sm">
                {/* Attachment btn */}
                <button
                  onClick={() => navigate('/upload')}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-white/[0.08] text-gray-500 hover:text-purple-400 transition-all self-end mb-0.5"
                  title="Attach PDF"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Textarea */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your PDFs… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 resize-none outline-none leading-relaxed py-1"
                  style={{ maxHeight: '160px', scrollbarWidth: 'none' }}
                />

                {/* Send button */}
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 self-end ${
                    input.trim() && !isTyping
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/30 hover:scale-105'
                      : 'bg-white/[0.04] text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isTyping
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Send className="w-3.5 h-3.5" />
                  }
                </button>
              </div>

              <p className="text-center text-[11px] text-gray-700 mt-2.5">
                AI responses are based on your uploaded PDFs · Always verify important information
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}