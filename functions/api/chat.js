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

const SYSTEM_INSTRUCTION = `Tum Inspire Business Academy ke friendly, helpful aur intelligent AI Advisor ho. Tumhara default jawab Roman Urdu mein hona chahiye: Urdu ko English/Roman letters mein likho, Urdu script ya Hindi mein nahi. Lehja natural, warm, respectful aur conversational rakho—jaise ek helpful dost ya mentor samjhata hai. User agar English ya kisi aur language mein jawab specifically maange to usi language mein jawab do.

SIRF academy ke sawalon tak mehdood mat raho. User kisi bhi reasonable topic par sawal kare—general knowledge, science, technology, computers, AI, education, maths, writing, business, freelancing, career, creativity, daily life, ya kisi random topic par—to apni best knowledge ke mutabiq seedha, useful aur relevant jawab do. Be-wajah yeh mat kaho ke sawal academy se related nahi. Agar sawal broad ho to useful jawab do aur zarurat par ek chhota follow-up sawal poochho. Mushkil cheez ko simple alfaaz aur examples se samjhao.

Jawab user ke sawal ke mutabiq rakho: simple sawal ka concise jawab, aur detail maangi jaye to step-by-step tafseel. Roman Urdu ko natural rakho; technical terms, product names, code aur zaroori English terms ko original form mein rehne do. Baghair zarurat headings ya lambi lists mat banao.

Academy ke hawale se madad karte waqt course topics, assignments, study habits, digital skills, freelancing aur safe client communication mein guide karo. Academy ki fees, timings, admission dates, grades, ya official policies khud se invent mat karo. Agar verified academy context available na ho to saaf batao ke is detail ko academy se confirm karna hoga. User ke diye hue course material ko tabhi use karo jab woh sawal se relevant ho; irrelevant context ko jawab mein zabardasti shamil mat karo.

Current events ya aisi information jisme latest updates zaroori hon, us mein apni limitation clear rakho aur guess ko fact bana kar pesh mat karo. Ghalti ya uncertainty ho to honestly batao. Passwords, OTPs, authentication codes ya sensitive personal information kabhi mat maango. Safe aur responsible guidance do.`;

function localAnswer(query, offlineContext = '') {
  if (offlineContext && offlineContext.length > 20) {
    return `Aapke sawal se related academy learning material yeh mila hai:

${offlineContext}

Agar aap chaho to apna exact sawal ya jis point mein confusion hai woh bhej do—main Roman Urdu mein asaan alfaaz mein samjha dunga.`;
  }

  return `Maazrat, is waqt AI Advisor ka main model temporarily available nahi hai, is liye main aapke sawal ka reliable jawab generate nahi kar pa raha.

Aap thori dair baad dobara try karein. Main koshish karunga ke aapko Roman Urdu mein friendly aur useful jawab doon.`;
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

  const offlineContext = typeof body?.offlineContext === 'string' ? body.offlineContext.slice(0, 4000) : '';
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (isRateLimited(ip)) {
    return json({
      reply: localAnswer(message, offlineContext),
      mode: 'offline_knowledge',
      model: 'inspire-academy-kb',
      thinkingEnabled: false,
      note: 'Please try the AI assistant again later.',
    });
  }

  if (!env.AI || typeof env.AI.run !== 'function') {
    return json({
      reply: localAnswer(message, offlineContext),
      mode: 'offline_knowledge',
      model: 'inspire-academy-kb',
      thinkingEnabled: false,
      note: 'Cloudflare Workers AI binding is not configured yet.',
    });
  }

  const history = Array.isArray(body?.history)
    ? body.history.slice(-8).map((item) => ({
        role: item?.sender === 'user' ? 'user' : 'assistant',
        content: String(item?.text || '').slice(0, 3000),
      })).filter((item) => item.content.length > 0)
    : [];

  const userContent = offlineContext
    ? `Optional academy learning context (sirf tab use karo jab student ke sawal se relevant ho; unrelated ho to ignore karo):
${offlineContext}

Student ka sawal:
${message}`
    : message;
  history.push({ role: 'user', content: userContent });

  const model = String(env.AI_MODEL || '@cf/zai-org/glm-4.7-flash').trim();
  try {
    const result = await env.AI.run(model, {
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...history,
      ],
      max_tokens: body?.useThinking === false ? 1024 : 2048,
      temperature: 0.65,
    });

    const reply = typeof result?.response === 'string'
      ? result.response.trim()
      : typeof result?.choices?.[0]?.message?.content === 'string'
        ? result.choices[0].message.content.trim()
        : '';

    if (!reply) throw new Error('Workers AI returned an empty response.');

    return json({
      reply,
      mode: 'ai',
      model,
      thinkingEnabled: body?.useThinking !== false,
    });
  } catch (error) {
    console.error('[Academy Chat] Workers AI request failed:', error instanceof Error ? error.message : 'unknown_error');
    return json({
      reply: localAnswer(message, offlineContext),
      mode: 'offline_knowledge',
      model: 'inspire-academy-kb',
      thinkingEnabled: false,
      note: 'Cloudflare AI is temporarily unavailable.',
    });
  }
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...responseHeaders, Allow: 'POST, OPTIONS' } });
  }
  return json({ error: 'Method not allowed.' }, 405);
}
