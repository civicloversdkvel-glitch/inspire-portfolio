import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  ArrowLeft,
  Loader2,
  Brain,
  Sparkles,
  Zap,
  BookOpen,
  Keyboard,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useSafeBack } from '../lib/utils';
import { coursesContent } from '../data/coursesContent';
import { learningContent } from '../data/learningContent';
import { shortcutsData } from '../data/shortcutsData';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  modelUsed?: string;
  thinkingMode?: boolean;
}

export function Chatbot() {
  const goBack = useSafeBack('/home');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Assalam-o-Alaikum! I am your AI Academic Advisor for The Inspire Business Academy. I can assist you with your course topics, freelancing client communication pitches, payment safety rules, and software shortcuts. How can I help you excel today?",
      sender: 'bot',
      timestamp: new Date(),
      modelUsed: 'academy-knowledge-base',
      thinkingMode: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useThinking, setUseThinking] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Offline context extractor for grounding
  const extractOfflineContext = (query: string): string => {
    const q = query.toLowerCase();
    const snippets: string[] = [];

    // Check shortcuts
    const matchedShortcuts = shortcutsData.filter(
      (s) => s.description.toLowerCase().includes(q) || s.keys.toLowerCase().includes(q)
    );
    if (matchedShortcuts.length > 0) {
      snippets.push(
        `Shortcuts: ${matchedShortcuts.slice(0, 3).map((s) => `${s.keys}: ${s.description}`).join('; ')}`
      );
    }

    // Check courses
    for (const c of coursesContent) {
      if (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        snippets.push(`Course: ${c.title} - ${c.description}`);
      }
      for (const ch of c.chapters) {
        for (const t of ch.topics) {
          if (t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q)) {
            snippets.push(`${c.title} > ${t.title}: ${t.content.slice(0, 200)}...`);
            break;
          }
        }
      }
    }

    // Check learning guides
    for (const sec of learningContent) {
      for (const sub of sec.content) {
        if (sub.subtitle.toLowerCase().includes(q) || sub.text.toLowerCase().includes(q)) {
          snippets.push(`${sec.title} > ${sub.subtitle}: ${sub.text.slice(0, 200)}...`);
          break;
        }
      }
    }

    return snippets.slice(0, 3).join('\n---\n');
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setIsTyping(true);

    const offlineCtx = extractOfflineContext(userMsg.text);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          offlineContext: offlineCtx,
          useThinking,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: data.reply || "I'm here to help with all Academy matters.",
          sender: 'bot',
          timestamp: new Date(),
          modelUsed: data.model || 'academy-knowledge-base',
          thinkingMode: Boolean(data.thinkingEnabled),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn('[Chatbot] Server API connection note:', err);
    }

    // Fallback response if server API is momentarily unreachable
    setTimeout(() => {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `### Inspire Business Academy Knowledge Response
Regarding **"${userMsg.text}"**:
${offlineCtx ? `\n${offlineCtx}\n` : ''}
- For personal guidance from Director Adeel Bhatti, WhatsApp directly at **03093534289**.
- Remember the core rule: **Roz Kaam = Roz Paisa!** Consistency in outreach brings steady income.`,
        sender: 'bot',
        timestamp: new Date(),
        modelUsed: 'offline-grounded-kb',
        thinkingMode: false,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setIsTyping(false);
    }, 450);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, lIdx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={lIdx} className="font-extrabold text-sm sm:text-base text-blue-900 mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={lIdx} className="ml-4 list-disc text-xs sm:text-sm my-0.5 leading-relaxed">
            {line.replace('- ', '')}
          </li>
        );
      }
      return (
        <p key={lIdx} className="text-xs sm:text-sm my-1 leading-relaxed whitespace-pre-wrap">
          {line}
        </p>
      );
    });
  };

  const samplePrompts = [
    'How should I approach a client on Facebook for logo design?',
    'What are the payment protection rules for freelancing?',
    'What are the top 5 shortcuts for Photoshop?',
    'Explain the YouTube monetization requirements.',
  ];

  return (
    <ScreenWrapper className="bg-slate-50 flex flex-col pb-0 max-w-5xl mx-auto w-full">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white pt-6 pb-5 px-4 sm:px-6 rounded-b-3xl shadow-md z-10 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goBack}
              className="p-2 -ml-1 hover:bg-white/10 rounded-full transition-colors text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center shadow-md shrink-0">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold">Academic AI Advisor</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Ready
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Academic guidance for courses, assignments & digital skills
              </p>
            </div>
          </div>

          {/* Thinking Mode Switch */}
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/20 self-start sm:self-auto">
            <Brain size={16} className={useThinking ? 'text-amber-400 animate-pulse' : 'text-slate-400'} />
            <span className="text-xs font-semibold text-slate-200">High Thinking Mode:</span>
            <button
              type="button"
              onClick={() => setUseThinking(!useThinking)}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-extrabold transition-colors ${
                useThinking ? 'bg-amber-400 text-blue-950' : 'bg-white/20 text-slate-300'
              }`}
            >
              {useThinking ? 'HIGH' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-[50vh] p-4 sm:p-6 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[90%] sm:max-w-[80%] gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-900 text-white'
                    : 'bg-amber-400 text-blue-950'
                }`}
              >
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                className={`p-4 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-900 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {msg.thinkingMode && msg.sender === 'bot' && (
                  <div className="mb-2 pb-2 border-b border-slate-100 flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider">
                    <Brain size={12} className="text-indigo-600" />
                    <span>Detailed response mode enabled</span>
                  </div>
                )}
                {formatText(msg.text)}
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex max-w-[80%] gap-3 flex-row items-center">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs font-medium text-slate-600">
                <Loader2 size={15} className="animate-spin text-blue-700" />
                <span>
                  {useThinking
                    ? 'Preparing a detailed academic answer...'
                    : 'Consulting Inspire Academy knowledge base...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-slate-200 bg-white/70 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">Suggestions:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium shrink-0 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 p-3 sm:p-4 z-20">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about freelancing, client pitches, course lessons, or shortcuts..."
            className="flex-1 bg-slate-100 border-none rounded-xl py-3 px-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            disabled={isTyping}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="px-4 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            <Send size={15} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );
}
