import { createClient } from '@supabase/supabase-js';

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
  if (current && current.resetAt > now && current.count >= 5) return true;
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

export async function onRequestPost({ request, env }) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 16_384) return json({ success: false, error: 'Request is too large.' }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'Please submit a valid form.' }, 400);
  }

  const name = String(body?.name ?? '').trim().slice(0, 120);
  const phone = String(body?.phone ?? '').trim().slice(0, 30);
  const email = String(body?.email ?? '').trim().slice(0, 254);
  const course = String(body?.course ?? 'General Inquiry').trim().slice(0, 160) || 'General Inquiry';
  const message = String(body?.message ?? '').trim().slice(0, 2000);

  if (name.length < 2 || phone.length < 7) {
    return json({ success: false, error: 'Please enter your name and a valid phone number.' }, 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ success: false, error: 'Please enter a valid email address.' }, 400);
  }
  if (requestCounts.size > 5000) requestCounts.clear();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (isRateLimited(ip)) {
    return json({ success: false, error: 'Too many requests. Please try again in a few minutes.' }, 429);
  }

  const url = String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim();
  const key = String(env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
  if (!url || !key) {
    return json({
      success: false,
      error: 'Online admissions are temporarily unavailable. Please contact the academy on WhatsApp.',
    }, 503);
  }

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { error } = await supabase.from('admission_inquiries').insert({
      name,
      phone,
      email: email || null,
      course,
      message,
      status: 'new',
      source: 'website',
    });

    if (error) {
      // Avoid returning database details to public visitors.
      console.error('[Admission Inquiry] Supabase insert failed:', error.code || 'unknown_error');
      return json({
        success: false,
        error: 'We could not save your inquiry right now. Please contact the academy on WhatsApp.',
      }, 503);
    }

    return json({
      success: true,
      message: 'Thank you! Your admission inquiry has been saved. Our team will contact you shortly.',
      contactWhatsApp: 'https://wa.me/923093534289',
    }, 201);
  } catch (error) {
    console.error('[Admission Inquiry] Request failed:', error instanceof Error ? error.message : 'unknown_error');
    return json({
      success: false,
      error: 'We could not save your inquiry right now. Please contact the academy on WhatsApp.',
    }, 503);
  }
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...responseHeaders, Allow: 'POST, OPTIONS' } });
  }
  return json({ success: false, error: 'Method not allowed.' }, 405);
}
