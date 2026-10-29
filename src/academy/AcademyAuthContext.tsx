import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  supabase,
  isSupabaseConfigured,
  assertSupabaseConfigured,
  getTodayPKT,
  getSavedRollNo,
  setSavedRollNo,
  isBootstrappedAdminEmail,
  handleSupabaseError,
  OperationType
} from './supabase';
import { AcademyProfile, UserRole, VALIDATION_LIMITS } from './types';

interface RegisterStudentInput {
  fullName: string;
  phone: string;
  rollNo?: string;
  skill: string;
  email: string;
  password: string;
}

interface AcademyAuthContextValue {
  user: User | null;
  profile: AcademyProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerStudent: (input: RegisterStudentInput) => Promise<{ requiresEmailConfirmation: boolean }>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: (registrationDefaults?: {
    fullName?: string;
    phone?: string;
    rollNo?: string;
    skill?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AcademyAuthContext = createContext<AcademyAuthContextValue | undefined>(undefined);

function toIsoString(val: unknown): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (val instanceof Date) return val.toISOString();
  return new Date().toISOString();
}

function mapRowToProfile(
  raw: Record<string, any>,
  fallbackUid: string,
  isListedAdmin: boolean = false
): AcademyProfile {
  const uid = String(raw.id || fallbackUid);
  const rawRole = String(raw.role || 'student').toLowerCase();
  const cleanEmail = String(raw.email || '').trim().toLowerCase();
  const isLegacyStudent = cleanEmail === 'hr498412@gmail.com';
  const normalizedRole: UserRole =
    !isLegacyStudent &&
    (isBootstrappedAdminEmail(cleanEmail) ||
      (isListedAdmin && (rawRole === 'admin' || rawRole === 'super_admin')))
      ? 'admin'
      : 'student';

  const resolvedRollNo = String(raw.roll_no || getSavedRollNo(uid) || '').trim();
  if (resolvedRollNo) {
    setSavedRollNo(uid, resolvedRollNo);
  }

  return {
    id: uid,
    email: String(raw.email || ''),
    full_name: String(raw.full_name || (normalizedRole === 'admin' ? 'Academy Admin' : 'Student')),
    phone: String(raw.phone || ''),
    roll_no: resolvedRollNo || (normalizedRole === 'admin' ? 'ADMIN' : ''),
    batch: String(raw.batch || ''),
    role: normalizedRole,
    skill: String(raw.skill || (normalizedRole === 'admin' ? 'Academy Administration' : 'Graphic Designing')),
    admission_date: String(raw.admission_date || getTodayPKT()),
    is_approved: normalizedRole === 'admin' ? true : (raw.is_approved !== false && raw.approval_status !== 'rejected' && raw.approval_status !== 'blocked'),
    is_active: normalizedRole === 'admin' ? true : (raw.is_active !== false && raw.approval_status !== 'blocked'),
    created_at: toIsoString(raw.created_at),
    updated_at: toIsoString(raw.updated_at)
  };
}

export function AcademyAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AcademyProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadOrCreateProfile = useCallback(
    async (
      supaUser: User,
      meta?: {
        fullName?: string;
        phone?: string;
        rollNo?: string;
        skill?: string;
      }
    ): Promise<AcademyProfile> => {
      const uid = supaUser.id;
      const email = (supaUser.email || '').trim().toLowerCase();
      const userMeta = supaUser.user_metadata || {};

      let effectiveMeta = meta;
      if (!effectiveMeta) {
        try {
          const rawOAuthDefaults = sessionStorage.getItem('inspire_academy_oauth_defaults');
          if (rawOAuthDefaults) {
            effectiveMeta = JSON.parse(rawOAuthDefaults);
            sessionStorage.removeItem('inspire_academy_oauth_defaults');
          }
        } catch {
          // ignore storage errors
        }
      }

      if (effectiveMeta?.rollNo) {
        setSavedRollNo(uid, effectiveMeta.rollNo);
      } else if (userMeta.roll_no) {
        setSavedRollNo(uid, String(userMeta.roll_no));
      }

      const isEmailAdmin = isBootstrappedAdminEmail(email);

      let isListedAdmin = isEmailAdmin;
      if (email === 'hr498412@gmail.com') {
        isListedAdmin = false;
      } else {
        try {
          const { data: adminRow } = await supabase
            .from('admins')
            .select('uid, email, full_name, roll_no')
            .or(`uid.eq.${uid},email.eq.${email}`)
            .maybeSingle();

          if (adminRow && (!adminRow.email || isBootstrappedAdminEmail(adminRow.email))) {
            isListedAdmin = true;
            if (adminRow.uid !== uid) {
              await supabase
                .from('admins')
                .update({ uid, updated_at: new Date().toISOString() })
                .eq('email', email);
            }
          } else if (isEmailAdmin) {
            const defaultAdminName =
              email === 'theinspirebusinessacademy@gmail.com'
                ? 'Adeel Bhatti (Admin)'
                : email === 'huzaifaghori4315@gmail.com'
                ? 'Huzaifa Ghori (Admin)'
                : effectiveMeta?.fullName?.trim() || userMeta.full_name || 'Academy Admin';
            const defaultRollNo =
              email === 'theinspirebusinessacademy@gmail.com'
                ? 'ADMIN-01'
                : email === 'huzaifaghori4315@gmail.com'
                ? 'ADMIN-02'
                : 'ADMIN';

            await supabase.from('admins').upsert(
              {
                uid,
                email,
                full_name: defaultAdminName,
                roll_no: defaultRollNo,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'uid' }
            );
            isListedAdmin = true;
          }
        } catch {
          // Ignore if admins table is not yet created
        }
      }

      let existingProfile: Record<string, any> | null = null;
      try {
        const { data, error: selectError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .maybeSingle();

        if (selectError) {
          console.warn('Supabase profiles query notice:', selectError.message);
        } else {
          existingProfile = data;
        }
      } catch (err: any) {
        console.warn('Failed to query profiles table:', err?.message || err);
      }

      if (existingProfile) {
        let finalProfileData = { ...existingProfile };

        const needsAdminUpgrade =
          isListedAdmin &&
          email !== 'hr498412@gmail.com' &&
          (existingProfile.role !== 'admin' ||
            existingProfile.is_active === false ||
            existingProfile.is_approved === false);

        const needsMetadataUpdate =
          Boolean(effectiveMeta?.fullName && existingProfile.full_name === 'Inspire Student') ||
          Boolean(effectiveMeta?.phone && !existingProfile.phone) ||
          Boolean(effectiveMeta?.rollNo && !existingProfile.roll_no);

        if (needsAdminUpgrade || needsMetadataUpdate) {
          const updates: Record<string, any> = {
            updated_at: new Date().toISOString()
          };
          if (needsAdminUpgrade) {
            updates.role = 'admin';
            updates.approval_status = 'approved';
            updates.is_approved = true;
            updates.is_active = true;
          }
          if (effectiveMeta?.fullName?.trim()) updates.full_name = effectiveMeta.fullName.trim();
          if (effectiveMeta?.phone?.trim()) updates.phone = effectiveMeta.phone.trim();
          if (effectiveMeta?.rollNo?.trim()) updates.roll_no = effectiveMeta.rollNo.trim();
          if (effectiveMeta?.skill?.trim() && !isListedAdmin) updates.skill = effectiveMeta.skill.trim();

          try {
            const { data: updatedRow } = await supabase
              .from('profiles')
              .update(updates)
              .eq('id', uid)
              .select('*')
              .maybeSingle();

            if (updatedRow) {
              finalProfileData = updatedRow;
            } else {
              finalProfileData = { ...existingProfile, ...updates };
            }
          } catch {
            finalProfileData = { ...existingProfile, ...updates };
          }
        }

        return mapRowToProfile(finalProfileData, uid, isListedAdmin);
      }

      // If user is a verified admin and profile row is missing, provision/return admin profile directly
      if (isListedAdmin && email !== 'hr498412@gmail.com') {
        const defaultAdminName =
          email === 'theinspirebusinessacademy@gmail.com'
            ? 'Adeel Bhatti (Admin)'
            : email === 'huzaifaghori4315@gmail.com'
            ? 'Huzaifa Ghori (Admin)'
            : effectiveMeta?.fullName?.trim() || userMeta.full_name || userMeta.name || 'Academy Admin';
        const defaultRollNo =
          email === 'theinspirebusinessacademy@gmail.com'
            ? 'ADMIN-01'
            : email === 'huzaifaghori4315@gmail.com'
            ? 'ADMIN-02'
            : 'ADMIN';

        const adminPayload = {
          id: uid,
          email,
          full_name: defaultAdminName,
          phone: String(effectiveMeta?.phone || userMeta.phone || '').trim(),
          roll_no: defaultRollNo,
          role: 'admin' as UserRole,
          approval_status: 'approved',
          is_approved: true,
          is_active: true,
          skill: 'Academy Administration',
          admission_date: getTodayPKT(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        try {
          await supabase.from('profiles').upsert(adminPayload, { onConflict: 'id' });
        } catch {
          // ignore
        }

        return mapRowToProfile(adminPayload, uid, true);
      }

      // Create initial profile row if trigger hasn't created it yet
      const defaultName =
        effectiveMeta?.fullName?.trim() ||
        String(userMeta.full_name || userMeta.name || '').trim() ||
        (email ? email.split('@')[0] : 'Inspire Student');

      const cleanName = defaultName.slice(0, VALIDATION_LIMITS.FULL_NAME_MAX);
      const cleanPhone = String(effectiveMeta?.phone || userMeta.phone || '')
        .trim()
        .slice(0, VALIDATION_LIMITS.PHONE_MAX);
      const cleanRollNo = String(
        effectiveMeta?.rollNo ||
          userMeta.roll_no ||
          getSavedRollNo(uid) ||
          ''
      )
        .trim()
        .slice(0, 40);
      const cleanSkill = (
        isListedAdmin
          ? 'Academy Administration'
          : effectiveMeta?.skill?.trim() || String(userMeta.skill || 'Graphic Designing').trim()
      ).slice(0, VALIDATION_LIMITS.SKILL_MAX);

      const role: UserRole = isListedAdmin ? 'admin' : 'student';
      const todayPKT = getTodayPKT();
      const nowIso = new Date().toISOString();

      const insertPayload = {
        id: uid,
        email,
        full_name: cleanName.length >= 2 ? cleanName : 'Inspire Student',
        phone: cleanPhone,
        roll_no: cleanRollNo,
        role,
        approval_status: 'approved',
        is_approved: true,
        is_active: true,
        skill: cleanSkill,
        admission_date: todayPKT,
        created_at: nowIso,
        updated_at: nowIso
      };

      try {
        const { data: insertedRow } = await supabase
          .from('profiles')
          .upsert(insertPayload, { onConflict: 'id' })
          .select('*')
          .maybeSingle();

        if (insertedRow) {
          return mapRowToProfile(insertedRow, uid, isListedAdmin);
        }
      } catch (err: any) {
        console.warn('Initial profile upsert warning:', err?.message || err);
      }

      return mapRowToProfile(insertPayload, uid, isListedAdmin);
    },
    []
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    let hydrationVersion = 0;

    const hydrateProfile = async (sessionUser: User) => {
      const version = ++hydrationVersion;
      try {
        const hydrated = await loadOrCreateProfile(sessionUser);
        if (!mounted || version !== hydrationVersion) return;

        if (!hydrated.is_active) {
          setUser(null);
          setProfile(null);
          setAuthError('Your student account is currently disabled. Please contact the Academy Admin.');
          void supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
        } else {
          setUser(sessionUser);
          setProfile(hydrated);
          setAuthError(null);
        }
      } catch (err: any) {
        if (mounted && version === hydrationVersion) {
          console.error('Failed to load Supabase student profile:', err);
          setAuthError(err?.message || 'Could not load student profile.');
        }
      } finally {
        if (mounted && version === hydrationVersion) setLoading(false);
      }
    };

    const initSession = async () => {
      try {
        // Wait for Supabase to finish session initialization before registering
        // listeners; this avoids the initialization/refresh lock race.
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          // Keep this callback synchronous. Supabase auth callbacks run under an
          // internal lock; database requests are deferred until after it returns.
          if (!mounted || event === 'INITIAL_SESSION') return;

          const sessionUser = session?.user ?? null;
          if (!sessionUser || event === 'SIGNED_OUT') {
            hydrationVersion++;
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }

          setUser(sessionUser);
          if (event === 'TOKEN_REFRESHED') return;

          setLoading(true);
          window.setTimeout(() => {
            if (mounted) void hydrateProfile(sessionUser);
          }, 0);
        });
        unsubscribe = () => authListener.subscription.unsubscribe();

        const sessionUser = data.session?.user ?? null;
        if (!sessionUser) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setUser(sessionUser);
        await hydrateProfile(sessionUser);
      } catch (err: any) {
        if (mounted) {
          console.error('Failed to initialize Supabase session:', err);
          const rawMessage = err?.message || 'Could not load student profile.';
          const isSessionError = /jwt|session|refresh token/i.test(rawMessage);
          setUser(null);
          setProfile(null);
          setAuthError(
            isSessionError
              ? 'Your session has expired or is no longer valid. Please sign in again.'
              : rawMessage
          );
          if (isSessionError) {
            void supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
          }
          setLoading(false);
        }
      }
    };

    void initSession();

    return () => {
      mounted = false;
      hydrationVersion++;
      unsubscribe?.();
    };
  }, [loadOrCreateProfile]);

  const signInWithEmail = async (email: string, password: string) => {
    setAuthError(null);
    assertSupabaseConfigured();
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      const msg = error.message || 'Invalid login credentials.';
      if (msg.toLowerCase().includes('email not confirmed')) {
        const friendly =
          'Email is not confirmed in Supabase yet. Please run supabase/admin_setup.sql in your Supabase SQL Editor to auto-confirm accounts.';
        setAuthError(friendly);
        throw new Error(friendly);
      }
      if (msg.toLowerCase().includes('invalid login credentials')) {
        const isTargetAdmin = isBootstrappedAdminEmail(cleanEmail);
        const friendly = isTargetAdmin
          ? 'Invalid admin email or password. Make sure you have run supabase/admin_setup.sql in your Supabase SQL Editor so both admin accounts and passwords are synced.'
          : 'Invalid email or password. Please check your credentials and try again.';
        setAuthError(friendly);
        throw new Error(friendly);
      }
      setAuthError(msg);
      throw new Error(msg);
    }

    if (!data.user) {
      throw new Error('Authentication failed: no user returned from Supabase.');
    }

    const hydrated = await loadOrCreateProfile(data.user);
    if (!hydrated.is_active) {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      const disabledMsg = 'Your student account is currently disabled. Please contact the Academy Admin.';
      setAuthError(disabledMsg);
      throw new Error(disabledMsg);
    }

    setUser(data.user);
    setProfile(hydrated);
  };

  const registerStudent = async (input: RegisterStudentInput) => {
    setAuthError(null);
    assertSupabaseConfigured();

    const cleanName = input.fullName.trim();
    const cleanPhone = input.phone.trim();
    const cleanEmail = input.email.trim().toLowerCase();
    const cleanRoll = (input.rollNo || '').trim();

    if (cleanName.length < VALIDATION_LIMITS.FULL_NAME_MIN) {
      throw new Error('Please enter your full name (at least 2 characters).');
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (cleanRoll.length < 3) {
      throw new Error('Enter the student roll number issued by the academy.');
    }
    if (input.password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    // Student registration creates a student account; the database keeps new accounts pending until academy staff approve them.
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: input.password,
      options: {
        data: {
          full_name: cleanName,
          phone: cleanPhone,
          roll_no: cleanRoll,
          skill: input.skill,
          admission_date: getTodayPKT(),
          role: 'student'
        }
      }
    });

    if (error) {
      setAuthError(error.message || 'Registration failed.');
      throw new Error(error.message || 'Registration failed.');
    }

    if (!data.user) {
      throw new Error('Could not create user account.');
    }

    // With email confirmation enabled, Supabase correctly returns no session.
    // The database trigger creates a pending student profile; portal access starts after academy approval.
    if (!data.session) {
      return { requiresEmailConfirmation: true };
    }

    const activeUser = data.session.user || data.user;
    const hydrated = await loadOrCreateProfile(activeUser, {
      fullName: cleanName,
      phone: cleanPhone,
      rollNo: cleanRoll,
      skill: input.skill
    });

    setUser(activeUser);
    setProfile(hydrated);
    return { requiresEmailConfirmation: false };
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    assertSupabaseConfigured();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      const msg = 'Please enter a valid email address to receive a password reset link.';
      setAuthError(msg);
      throw new Error(msg);
    }

    const isAdminReset =
      window.location.hash.includes('/admin') || window.location.pathname.includes('/admin');
    const redirectUrl = `${window.location.origin}/#${isAdminReset ? '/admin/login' : '/student-login'}`;
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl
    });

    if (error) {
      setAuthError(error.message || 'Failed to send password reset email.');
      throw new Error(error.message || 'Failed to send password reset email.');
    }
  };

  const signInWithGoogle = async (registrationDefaults?: {
    fullName?: string;
    phone?: string;
    rollNo?: string;
    skill?: string;
  }) => {
    setAuthError(null);
    assertSupabaseConfigured();

    if (registrationDefaults) {
      try {
        sessionStorage.setItem(
          'inspire_academy_oauth_defaults',
          JSON.stringify(registrationDefaults)
        );
      } catch {
        // ignore storage errors
      }
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href
      }
    });

    if (error) {
      setAuthError(error.message || 'Google sign-in failed.');
      throw new Error(error.message || 'Google sign-in failed.');
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setAuthError(null);
  };

  const refreshProfile = async () => {
    if (!user || !isSupabaseConfigured) return;
    const hydrated = await loadOrCreateProfile(user);
    setProfile(hydrated);
  };

  return (
    <AcademyAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authError,
        signInWithEmail,
        registerStudent,
        resetPassword,
        signInWithGoogle,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AcademyAuthContext.Provider>
  );
}

export function useAcademyAuth(): AcademyAuthContextValue {
  const ctx = useContext(AcademyAuthContext);
  if (!ctx) {
    throw new Error('useAcademyAuth must be used inside <AcademyAuthProvider>');
  }
  return ctx;
}
