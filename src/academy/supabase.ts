import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from './types';

// =============================================================================
// 1. SUPABASE CLIENT INITIALIZATION & CONFIGURATION VERIFICATION
// =============================================================================

const envMeta = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};

const rawSupabaseUrl = String(envMeta.VITE_SUPABASE_URL || 'https://jyfcktszpzeororgdcct.supabase.co').trim();

const rawSupabaseAnonKey = String(
  envMeta.VITE_SUPABASE_ANON_KEY || envMeta.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Pavz_u0msigLIVhMfiBHDg_6HN3-Wd-'
).trim();

/**
 * Security check: Never allow a Supabase service_role or secret key in frontend code.
 */
function detectPrivilegedKey(key: string): boolean {
  if (!key) return false;
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length === 3) {
    try {
      const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson) as { role?: string };
      if (payload.role === 'service_role' || payload.role === 'supabase_admin') {
        return true;
      }
    } catch {
      // Not a standard base64 JWT
    }
  }
  return false;
}

export const isPrivilegedKeyDetected: boolean = detectPrivilegedKey(rawSupabaseAnonKey);

export const isSupabaseConfigured: boolean = Boolean(
  rawSupabaseUrl &&
    rawSupabaseAnonKey &&
    !isPrivilegedKeyDetected &&
    rawSupabaseUrl.startsWith('https://') &&
    rawSupabaseUrl.includes('.supabase.co') &&
    !rawSupabaseUrl.includes('your-project-ref') &&
    !rawSupabaseUrl.includes('placeholder-project') &&
    rawSupabaseAnonKey !== 'your-public-anon-key'
);

export function getSupabaseConfigError(): string | null {
  if (isPrivilegedKeyDetected) {
    return 'SECURITY ERROR: A privileged service_role or secret key was detected in VITE_SUPABASE_ANON_KEY. Never use a service_role key in frontend code—replace it with your public anon/publishable key.';
  }
  if (!rawSupabaseUrl || rawSupabaseUrl.includes('your-project-ref')) {
    return 'Missing VITE_SUPABASE_URL environment variable. Please set VITE_SUPABASE_URL (e.g., https://<project-ref>.supabase.co) and VITE_SUPABASE_ANON_KEY in your environment variables.';
  }
  if (!rawSupabaseUrl.startsWith('https://') || !rawSupabaseUrl.includes('.supabase.co')) {
    return 'Invalid VITE_SUPABASE_URL format. Expected https://<project-ref>.supabase.co.';
  }
  if (!rawSupabaseAnonKey || rawSupabaseAnonKey === 'your-public-anon-key') {
    return 'Missing VITE_SUPABASE_ANON_KEY environment variable. Please set your public Supabase anon/publishable key in VITE_SUPABASE_ANON_KEY.';
  }
  return null;
}

const effectiveSupabaseUrl = isSupabaseConfigured
  ? rawSupabaseUrl
  : 'https://placeholder-project.supabase.co';

const effectiveSupabaseAnonKey = isSupabaseConfigured
  ? rawSupabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder';

export const supabase: SupabaseClient = createClient(
  effectiveSupabaseUrl,
  effectiveSupabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'inspire_academy_supabase_auth'
    }
  }
);

/**
 * Creates a non-persisted Supabase client for Admin account provisioning
 * so creating a student account does not overwrite the Admin's active session.
 */
export function createIsolatedAuthClient(): SupabaseClient {
  assertSupabaseConfigured();
  return createClient(effectiveSupabaseUrl, effectiveSupabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

export function assertSupabaseConfigured(): void {
  const configErr = getSupabaseConfigError();
  if (!isSupabaseConfigured || configErr) {
    throw new Error(
      configErr ||
        'Supabase is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables and run supabase/admin_setup.sql in the Supabase SQL Editor.'
    );
  }
}

export async function verifySupabaseConnection(): Promise<{
  connected: boolean;
  configured: boolean;
  error: string | null;
}> {
  const configErr = getSupabaseConfigError();
  if (!isSupabaseConfigured || configErr) {
    return {
      connected: false,
      configured: false,
      error: configErr || 'Supabase environment variables are not configured.'
    };
  }
  try {
    const { error } = await supabase.from('public_portfolios').select('id').limit(1);
    if (error) {
      return {
        connected: false,
        configured: true,
        error: error.message
      };
    }
    return {
      connected: true,
      configured: true,
      error: null
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      error: err?.message || 'Failed to reach Supabase instance.'
    };
  }
}

export const SUBMISSIONS_STORAGE_BUCKET = 'academy-submissions';
export const PUBLIC_PORTFOLIOS_STORAGE_BUCKET = 'public-portfolios';

// =============================================================================
// 2. AUTHORIZED ADMINISTRATOR REGISTRY
// =============================================================================

export const BOOTSTRAPPED_ADMIN_EMAILS = [
  'theinspirebusinessacademy@gmail.com',
  'huzaifaghori4315@gmail.com'
] as const;

export function isBootstrappedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  if (clean === 'hr498412@gmail.com') return false;
  return (BOOTSTRAPPED_ADMIN_EMAILS as readonly string[]).includes(clean);
}

// =============================================================================
// 3. SUPABASE ERROR HANDLER
// =============================================================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export function handleSupabaseError(
  error: unknown,
  operationType: OperationType,
  resourcePath: string
): never {
  const errObj = error as { message?: string; code?: string; details?: string; hint?: string } | null;
  const rawMessage =
    errObj?.message || (error instanceof Error ? error.message : String(error || 'Unknown Supabase error'));

  console.error(
    `[Supabase Error] op=${operationType} resource=${resourcePath} code=${errObj?.code || 'N/A'}: ${rawMessage}`
  );

  if (
    rawMessage.toLowerCase().includes('row-level security') ||
    errObj?.code === '42501'
  ) {
    throw new Error(
      `Permission denied by Supabase Row Level Security (RLS) on ${resourcePath}. Please ensure you are signed in with an authorized account and have run supabase/admin_setup.sql in your Supabase SQL Editor.`
    );
  }

  if (
    rawMessage.toLowerCase().includes('relation') &&
    rawMessage.toLowerCase().includes('does not exist')
  ) {
    throw new Error(
      `Database table (${resourcePath}) does not exist yet. Please open your Supabase SQL Editor and run supabase/admin_setup.sql.`
    );
  }

  throw new Error(rawMessage);
}

// =============================================================================
// 4. PKT (ASIA/KARACHI) DATE, STREAK & FILE VALIDATION HELPERS
// =============================================================================

export const PKT_TIMEZONE = 'Asia/Karachi';

export function getTodayPKT(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PKT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

export function formatPKTDate(isoOrDate: string | Date | null | undefined): string {
  if (!isoOrDate) return '—';
  try {
    const d =
      typeof isoOrDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)
        ? new Date(`${isoOrDate}T12:00:00+05:00`)
        : new Date(isoOrDate);
    if (isNaN(d.getTime())) return String(isoOrDate);
    return new Intl.DateTimeFormat('en-PK', {
      timeZone: PKT_TIMEZONE,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return String(isoOrDate);
  }
}

export function formatPKTDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return (
      new Intl.DateTimeFormat('en-PK', {
        timeZone: PKT_TIMEZONE,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(d) + ' PKT'
    );
  } catch {
    return String(iso);
  }
}

export function getPKTDateDaysAgo(daysAgo: number): string {
  const now = new Date();
  const target = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PKT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(target);
}

export function computePKTStreak(submissionDates: string[]): number {
  if (!submissionDates.length) return 0;
  const uniqueDates = new Set(submissionDates);
  const today = getTodayPKT();
  const yesterday = getPKTDateDaysAgo(1);

  let startOffset = 0;
  if (uniqueDates.has(today)) {
    startOffset = 0;
  } else if (uniqueDates.has(yesterday)) {
    startOffset = 1;
  } else {
    return 0;
  }

  let streak = 0;
  for (let i = startOffset; i < 365; i++) {
    const checkDate = getPKTDateDaysAgo(i);
    if (uniqueDates.has(checkDate)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
}

export function validateUploadFile(file: File | null | undefined): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Please select a file to upload.' };
  }
  if (file.size <= 0) {
    return { valid: false, error: 'Selected file is empty (0 bytes).' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds the 25 MB maximum limit.`
    };
  }

  const lowerName = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some(ext => lowerName.endsWith(ext));
  const hasAllowedMime = file.type
    ? (ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)
    : false;

  if (!hasAllowedExt && !hasAllowedMime) {
    return {
      valid: false,
      error:
        'Unsupported file type. Allowed: Images (JPG, PNG, WEBP, GIF), PDF, Word, Excel, PowerPoint, ZIP, MP4, MP3.'
    };
  }

  return { valid: true };
}

export function validateSubmissionUrl(url: string | null | undefined): { valid: boolean; error?: string } {
  const clean = (url || '').trim();
  if (!clean) return { valid: true };
  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'URL must start with https:// or http://.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL (e.g., https://drive.google.com/...).' };
  }
}

export function getSavedRollNo(userId: string): string {
  try {
    return localStorage.getItem(`inspire_academy_roll_${userId}`) || '';
  } catch {
    return '';
  }
}

export function setSavedRollNo(userId: string, rollNo: string): void {
  try {
    const clean = rollNo.trim();
    if (clean) {
      localStorage.setItem(`inspire_academy_roll_${userId}`, clean);
    } else {
      localStorage.removeItem(`inspire_academy_roll_${userId}`);
    }
  } catch {
    // ignore storage errors
  }
}
