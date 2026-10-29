import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '100kb' }));

// Admission inquiries use the public/publishable key. RLS permits INSERT only;
// this endpoint never needs a Supabase service-role key.
// Initialize Google GenAI on the server if key is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('[Server] Google GenAI initialized with server-side API key');
  } catch (err) {
    console.error('[Server] Failed to initialize Google GenAI:', err);
  }
}

// Academy System Knowledge Base Prompt
const ACADEMY_SYSTEM_INSTRUCTION = `You are the Official Academic AI Mentor for The Inspire Business Academy.
Location: Near Shimla Point, Beside NGS School Mehrabad, Sadiqabad, Punjab, Pakistan.
Founder & Academy Director: Adeel Bhatti (WhatsApp / Contact: 03093534289).
Motto: "Learn • Earn • Grow".

Core Focus:
Empowering Pakistani youth and global students with practical digital earning skills, client outreach on Upwork/Fiverr/Facebook/LinkedIn, order closing, service delivery, and ethical online business.

The Academy offers 10 core mastery programs:
1. Computer Course (Hardware, OS installation, system management, typing, and 30 essential shortcuts).
2. MS Office Course (Word formatting, CV/Certificate creation, PowerPoint animation/slide deck design, Excel formulas SUM/IF/VLOOKUP and finance sheets).
3. Graphic Design (Photoshop photo retouching, background removal, layer masks, typography, social media banners, YouTube thumbnails).
4. CapCut Video Editing (Storytelling, 9:16 reels, auto captions, green screen, sound design, color grading, client workflows).
5. AI Tools Mastery (Generative AI, Midjourney/DALL-E prompt engineering, document conversion, ElevenLabs text-to-speech, Gamma presentations).
6. YouTube Automation (Faceless channels, high-CPM niche selection, fair use compliance, SEO metadata, Monetization & YPP roadmap).
7. App Dev with Gemini (Frontend architectures, Google AI Studio, database & auth, Android deployment).
8. Facebook Mastery (Meta Business Suite, organic group outreach, Reels virality, Marketplace selling, monetization).
9. Local Dropshipping (Markaz app product sourcing, profit margin calculations, social media customer orders, zero-inventory e-commerce).
10. Organic Digital Marketing (Zero budget growth, copywriting hooks, lead magnets, SEO, client closing).

Rule on Client Communication:
Always recommend professional, respectful communication, having a sample portfolio ready, and securing 50% advance or full advance before delivering final files.
Answer clearly in professional English or friendly Roman-Urdu if the user inquires in Urdu.
Always be polite, encouraging, structured, and action-oriented.`;

// Intelligent Offline Fallback Generator
function generateLocalAcademyAnswer(query: string, offlineContext?: string): string {
  const q = query.toLowerCase();
  
  if (q.includes('fee') || q.includes('admission') || q.includes('admission date') || q.includes('timing') || q.includes('dakhla')) {
    return `### Admission & Enrollment Information
**The Inspire Business Academy (Sadiqabad)** welcomes new students for practical batch training!
- **Location:** Near Shimla Point, Beside NGS School Mehrabad, Sadiqabad
- **Director:** Adeel Bhatti
- **Direct WhatsApp:** [03093534289](https://wa.me/923093534289)
- **How to Enroll:** You can submit the online application directly through the **Apply Now** page or contact us on WhatsApp for fee concession and current batch schedule.`;
  }

  if (q.includes('shortcut') || q.includes('key')) {
    return `### Essential Keyboard Shortcuts
Here are some of the most essential shortcuts taught at Inspire Business Academy:
- **Ctrl + C / Ctrl + V:** Copy / Paste
- **Win + Shift + S:** Open Windows Snipping Tool for quick screenshots
- **Ctrl + Z / Ctrl + Y:** Undo / Redo
- **Alt + Tab:** Switch between open applications
- **Ctrl + Shift + Esc:** Open Windows Task Manager
- **Ctrl + T / Ctrl + W:** Open new tab / Close current tab in Chrome
Visit the **Shortcut Vault** in the portal for 133 organized keyboard shortcuts!`;
  }

  if (q.includes('payment') || q.includes('advance') || q.includes('easypaisa') || q.includes('jazzcash')) {
    return `### Academy Payment & Deal Closing Rules
1. **Rule #1:** Never deliver full source work without payment verification.
2. **First Choice:** Request Full Advance payment.
3. **If Client has Trust Issues:** Take 50% Advance deposit before starting, and the remaining 50% upon showing watermarked/sample preview.
4. **Local Payment Channels:** Easypaisa, JazzCash, Meezan Bank Transfer.
5. **International Clients:** Binance (USDT), Payoneer, or Wise.`;
  }

  if (offlineContext && offlineContext.length > 30) {
    return `${offlineContext}\n\n*Have more questions? Ask me about any course topic or contact Adeel Bhatti at 03093534289!*`;
  }

  return `### Inspire Business Academy AI Advisor
Thank you for your question regarding **"${query}"**!
Inspire Business Academy is dedicated to practical hands-on training in Sadiqabad:
- **Freelancing & Outreach:** Send 30-40 targeted outreach messages daily to secure consistent client leads.
- **Portfolio Samples:** Always keep 4-5 high quality demo samples ready in your Client Showcase.
- **Support:** Call or WhatsApp Director Adeel Bhatti at **03093534289** or explore our interactive Course modules!`;
}

// API: AI Assistant with Gemini 4 Argon High Thinking Mode
app.post('/api/chat', async (req, res) => {
  const { message, history = [], offlineContext = '', useThinking = true } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // If server has Gemini API client initialized, run gemini-4-argon with ThinkingLevel.HIGH
  if (aiClient) {
    try {
      // Per instructions: "You MUST add thinking mode to the app where relevant to handle users' most complex queries. You MUST use the gemini-4-argon model and set thinkingLevel to ThinkingLevel.HIGH. Do not set maxOutputTokens."
      const response = await aiClient.models.generateContent({
        model: 'gemini-4-argon',
        contents: [
          ...history.slice(-8).map((h: { sender: string; text: string }) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          {
            role: 'user',
            parts: [
              {
                text: `${offlineContext ? `[Reference Knowledge]:\n${offlineContext}\n\n` : ''}${message}`,
              },
            ],
          },
        ],
        config: {
          systemInstruction: ACADEMY_SYSTEM_INSTRUCTION,
          ...(useThinking
            ? {
                thinkingConfig: {
                  thinkingLevel: ThinkingLevel.HIGH,
                },
              }
            : {}),
        },
      });

      const reply = response.text || '';
      if (reply) {
        res.json({
          reply,
          mode: 'ai',
          model: 'gemini-4-argon',
          thinkingEnabled: true,
        });
        return;
      }
    } catch (apiError: any) {
      console.warn('[Server] Gemini API call fallback triggered:', apiError?.message || apiError);
    }
  }

  // Graceful offline knowledge-base fallback
  const fallbackReply = generateLocalAcademyAnswer(message, offlineContext);
  res.json({
    reply: fallbackReply,
    mode: 'offline_knowledge',
    model: 'inspire-academy-kb',
    thinkingEnabled: false,
    note: 'Server-side knowledge base response active.',
  });
});

// Production or Vite development middleware integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In dev: mount vite.middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[The Inspire Business Academy] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
});
