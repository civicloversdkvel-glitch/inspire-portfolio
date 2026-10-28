const responseHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders });
}

const requestCounts = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const current = requestCounts.get(ip);
  if (current && current.resetAt > now && current.count >= 20) return true;
  if (!current || current.resetAt <= now) {
    requestCounts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  } else {
    current.count += 1;
  }
  if (requestCounts.size > 5000) {
    for (const [key, value] of requestCounts) {
      if (value.resetAt <= now) requestCounts.delete(key);
    }
  }
  return false;
}

const SYSTEM_INSTRUCTION = `You are the academic assistant for The Inspire Business Academy in Sadiqabad, Punjab, Pakistan. Help students with course topics, assignments, study habits, digital skills, freelancing basics, and safe professional client communication. Be accurate, practical, respectful, and concise. Do not invent fees, schedules, admissions dates, grades, or academy policies; recommend contacting the academy to confirm details. Do not ask for passwords, authentication codes, or sensitive personal information. If a question is outside the available context, clearly say so.`;

function localAnswer(query, offlineContext = '') {
  const q = query.toLowerCase();
  if (q.includes('fee') || q.includes('admission') || q.includes('timing') || q.includes('dakhla')) {
    return `### Admissions & Academy Information

**The Inspire Business Academy — Sadiqabad**
- **Location:** Near Shimla Point, beside NGS School Mehrabad, Sadiqabad, Punjab, Pakistan
- **Contact:** [WhatsApp 0309 3534289](https://wa.me/923093534289)

For current fees, batch timings, and admission availability, please contact the academy directly or submit the website inquiry form so the team can confirm the latest information.`;
  }
  if (q.includes('payment') || q.includes('advance') || q.includes('easypaisa') || q.includes('jazzcash')) {
    return `### Safe Freelancing Payments

1. Agree on the scope, delivery date, and price in writing before beginning.
2. Use a reasonable advance payment for new clients and confirm the payment has actually arrived.
3. Share previews or watermarked drafts when appropriate; do not share passwords or sensitive account details.
4. Keep receipts and use a trusted payment provider. Never send money to unlock a promised payment.`;
  }
  if (offlineContext && offlineContext.length > 20) {
    return `### Academy Learning Support

Based on the available course material:

${offlineContext}

For details that are not covered here, contact the academy at [WhatsApp 0309 3534289](https://wa.me/923093534289).`;
  }
  return `### Inspire Business Academy Learning Support

I can help you understand course concepts, plan assignments, practise digital skills, improve your portfolio, and learn safe freelancing habits.

**A useful next step:** tell me your course, the assignment instructions, and the part you find difficult. I will break it into manageable steps.

For academy-specific fees or schedules, contact [WhatsApp 0309 3534289](https://wa.me/923093534289).`;
}

export async function onRequestPost({ request, env }) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 100_000) return json({ error: 'Request is too large.' }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Please send a valid message.' }, 400);
  }

  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 6000) : '';
  if (!message) return json({ error: 'Message is required.' }, 400);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (isRateLimited(ip)) {
    return json({
      reply: localAnswer(message, String(body?.offlineContext || '').slice(0, 4000)),
      mode: 'offline_knowledge',
      model: 'inspire-academy-kb',
      thinkingEnabled: false,
      note: 'Please try the AI assistant again later.',
    }, 200);
  }

  const offlineContext = typeof body?.offlineContext === 'string' ? body.offlineContext.slice(0, 4000) : '';
  const apiKey = String(env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return json({
      reply: localAnswer(message, offlineContext),
      mode: 'offline_knowledge',
      model: 'inspire-academy-kb',
      thinkingEnabled: false,
      note: 'Academy knowledge-base mode is active. Configure GEMINI_API_KEY as an encrypted Cloudflare secret to enable Gemini.',
    });
  }

  const history = Array.isArray(body?.history)
    ? body.history.slice(-8).map((item) => ({
        role: item?.sender === 'user' ? 'user' : 'model',
        parts: [{ text: String(item?.text || '').slice(0, 6000) }],
      })).filter((item) => item.parts[0].text.length > 0)
    : [];
  history.push({ role: 'user', parts: [{ text: `${offlineContext ? `Relevant academy material:\n${offlineContext}\n\n` : ''}${message}` }] });

  const model = String(env.GEMINI_MODEL || 'gemini-3.8-flash').trim().replace(/^models\//, '');
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: history,
        generationConfig: {
          temperature: 0.4,
          thinkingConfig: { thinkingLevel: body?.useThinking === false ? 'LOW' : 'HIGH' },
        },
      }),
    });

    if (!response.ok) {
      console.error('[Academy Chat] Gemini API returned HTTP', response.status);
      return json({
        reply: localAnswer(message, offlineContext),
        mode: 'offline_knowledge',
        model: 'inspire-academy-kb',
        thinkingEnabled: false,
        note: 'AI is temporarily unavailable; the academy knowledge base is active.',
      });
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const reply = parts
      .filter((part) => typeof part?.text === 'string' && part.thought !== true)
      .map((part) => part.text)
      .join('\n')
      .trim();

    if (!reply) throw new Error('Gemini returned an empty response.');
    return json({
      reply,
      mode: 'ai',
      model,
      thinkingEnabled: body?.useThinking !== false,
    });
  } catch (error) {
    console.error('[Academy Chat] Request failed:', error instanceof Error ? error.message : 'unknown_error');
    return json({
      reply: localAnswer(message, offlineContext),
      mode: 'offline_knowledge',
      model: 'inspire-academy-kb',
      thinkingEnabled: false,
      note: 'AI is temporarily unavailable; the academy knowledge base is active.',
    });
  }
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...responseHeaders, Allow: 'POST, OPTIONS' } });
  }
  return json({ error: 'Method not allowed.' }, 405);
}
