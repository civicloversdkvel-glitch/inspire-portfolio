-- ============================================================================
-- THE INSPIRE BUSINESS ACADEMY — COMPLETE SUPABASE SCHEMA, STORAGE & RLS SETUP
-- ============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard -> SQL Editor -> Click "New query"
-- 2. Paste this ENTIRE file into the SQL Editor and click "Run" (or Ctrl+Enter)
-- 3. Safe & Idempotent: Uses CREATE TABLE IF NOT EXISTS, ALTER TABLE ADD COLUMN
--    IF NOT EXISTS, and CREATE INDEX IF NOT EXISTS so existing production data
--    is never overwritten or lost.
-- ============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CORE ACADEMY TABLES & COLUMNS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT 'Inspire Student',
  father_name text DEFAULT '',
  phone text NOT NULL DEFAULT '',
  city text DEFAULT '',
  roll_no text DEFAULT '',
  batch text DEFAULT '',
  skill text NOT NULL DEFAULT 'Graphic Designing',
  avatar_path text DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'super_admin', 'student')),
  approval_status text NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'blocked')),
  is_approved boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  admission_date text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text DEFAULT 'Inspire Student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS father_name text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roll_no text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS batch text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skill text DEFAULT 'Graphic Designing';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_path text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'approved';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admission_date text DEFAULT to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD');
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE TABLE IF NOT EXISTS public.admins (
  uid uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT 'Academy Admin',
  roll_no text NOT NULL DEFAULT 'ADMIN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  duration text NOT NULL DEFAULT '2 Months',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.courses (id, title, category, duration, is_active)
VALUES
  ('graphic-designing', 'Graphic Designing', 'Creative Design', '2 Months', true),
  ('video-editing', 'Video Editing', 'Media Production', '2 Months', true),
  ('digital-marketing', 'Digital Marketing', 'Growth & Ads', '2 Months', true),
  ('ai-content', 'AI Content', 'AI & Automation', '1 Month', true),
  ('dropshipping', 'Dropshipping', 'E-Commerce', '2 Months', true),
  ('account-selling', 'Account Selling', 'Digital Commerce', '1 Month', true),
  ('ms-excel-office', 'MS Excel & Office', 'Business Productivity', '1 Month', true),
  ('youtube-automation', 'YouTube Automation', 'Creator Economy', '2 Months', true),
  ('trading-crypto', 'Trading & Crypto', 'Financial Markets', '2 Months', true)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.batches (
  id text PRIMARY KEY DEFAULT ('batch_' || (extract(epoch from now()) * 1000)::bigint::text),
  name text NOT NULL,
  skill text NOT NULL DEFAULT 'Graphic Designing',
  start_date text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id text PRIMARY KEY DEFAULT ('asg_' || (extract(epoch from now()) * 1000)::bigint::text || '_' || substr(md5(random()::text), 1, 5)),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  skill text NOT NULL DEFAULT 'Graphic Designing',
  due_date text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD'),
  is_published boolean NOT NULL DEFAULT true,
  created_by text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id text PRIMARY KEY DEFAULT ('sub_' || (extract(epoch from now()) * 1000)::bigint::text || '_' || substr(md5(random()::text), 1, 6)),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name text NOT NULL DEFAULT '',
  assignment_id text DEFAULT '',
  submission_type text NOT NULL DEFAULT 'assignment',
  portfolio_tag text NOT NULL DEFAULT 'showcase',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  skill text NOT NULL DEFAULT 'Graphic Designing',
  file_path text NOT NULL DEFAULT '',
  file_name text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT 'application/octet-stream',
  file_size bigint NOT NULL DEFAULT 0,
  project_url text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  parent_submission_id text NOT NULL DEFAULT '',
  submission_date text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD'),
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'needs_revision')),
  rating integer DEFAULT NULL,
  marks numeric NOT NULL DEFAULT -1,
  max_marks numeric NOT NULL DEFAULT 10,
  feedback text NOT NULL DEFAULT '',
  reviewed_by text NOT NULL DEFAULT '',
  reviewed_at text NOT NULL DEFAULT '',
  is_deleted boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS submission_type text DEFAULT 'assignment';
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS portfolio_tag text DEFAULT 'showcase';
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS rating integer DEFAULT NULL;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS project_url text DEFAULT '';
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS version integer DEFAULT 1;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS parent_submission_id text DEFAULT '';

CREATE TABLE IF NOT EXISTS public.submission_files (
  id text PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  data_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submission_versions (
  id text PRIMARY KEY DEFAULT ('ver_' || (extract(epoch from now()) * 1000)::bigint::text || '_' || substr(md5(random()::text), 1, 5)),
  submission_id text NOT NULL,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  file_path text NOT NULL DEFAULT '',
  file_name text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT 'application/octet-stream',
  file_size bigint NOT NULL DEFAULT 0,
  project_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submission_marks_history (
  id text PRIMARY KEY DEFAULT ('mh_' || (extract(epoch from now()) * 1000)::bigint::text || '_' || substr(md5(random()::text), 1, 5)),
  submission_id text NOT NULL,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_marks numeric NOT NULL DEFAULT -1,
  new_marks numeric NOT NULL,
  changed_by text NOT NULL DEFAULT '',
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delete_requests (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  submission_id text NOT NULL,
  submission_title text NOT NULL DEFAULT '',
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name text NOT NULL DEFAULT '',
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note text NOT NULL DEFAULT '',
  resolved_by text NOT NULL DEFAULT '',
  resolved_at text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.public_portfolios (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  submission_id text NOT NULL,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  roll_no text NOT NULL DEFAULT '',
  skill text NOT NULL DEFAULT 'Graphic Designing',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT 'image/png',
  preview_url text NOT NULL DEFAULT '',
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_featured boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT true,
  approved_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  skill text NOT NULL DEFAULT 'Graphic Designing',
  attendance_date text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD'),
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent', 'excused')),
  note text NOT NULL DEFAULT '',
  marked_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  message text NOT NULL,
  target_skill text NOT NULL DEFAULT 'All',
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  is_published boolean NOT NULL DEFAULT true,
  created_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'system',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  roll_no text NOT NULL DEFAULT '',
  skill text NOT NULL,
  certificate_code text NOT NULL UNIQUE,
  issued_date text NOT NULL DEFAULT to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD'),
  issued_by text NOT NULL DEFAULT '',
  is_verified boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email text NOT NULL DEFAULT '',
  action text NOT NULL,
  target_resource text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. DATABASE PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (lower(email));
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_skill ON public.profiles (skill);
CREATE INDEX IF NOT EXISTS idx_assignments_published_due ON public.assignments (is_published, due_date DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.submissions (student_id, is_deleted, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.submissions (assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions (status);
CREATE INDEX IF NOT EXISTS idx_submission_files_student_id ON public.submission_files (student_id);
CREATE INDEX IF NOT EXISTS idx_submission_versions_sub_id ON public.submission_versions (submission_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_marks_history_submission_id ON public.submission_marks_history (submission_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_delete_requests_student_id ON public.delete_requests (student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delete_requests_submission_id ON public.delete_requests (submission_id, status);
CREATE INDEX IF NOT EXISTS idx_public_portfolios_public_created ON public.public_portfolios (is_public, is_featured DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_portfolios_student_id ON public.public_portfolios (student_id);
CREATE INDEX IF NOT EXISTS idx_public_portfolios_skill ON public.public_portfolios (skill);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance (student_id, attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_published_created ON public.announcements (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_student_read ON public.notifications (student_id, is_read, created_at DESC);

-- ============================================================================
-- 3. AUTHORIZE & CONFIRM EXISTING ADMIN ACCOUNTS IN SUPABASE AUTH
--    (Links users created in Supabase Authentication -> Users without
--     hard-coding any passwords or private data in SQL or code)
-- ============================================================================
DO $$
DECLARE
  r_admin RECORD;
  v_admin_name text;
  v_admin_roll text;
BEGIN
  -- Authorized Administrators (strictly the 2 verified admin accounts):
  -- 1. theinspirebusinessacademy@gmail.com
  -- 2. huzaifaghori4315@gmail.com
  -- Note: Legacy account hr498412@gmail.com is preserved as a standard user
  -- without active administrative privileges per project owner specification.
  FOR r_admin IN
    SELECT id, lower(email) AS clean_email
    FROM auth.users
    WHERE lower(email) IN (
      'theinspirebusinessacademy@gmail.com',
      'huzaifaghori4315@gmail.com'
    )
  LOOP
    v_admin_name := CASE
      WHEN r_admin.clean_email = 'theinspirebusinessacademy@gmail.com' THEN 'Adeel Bhatti (Admin)'
      WHEN r_admin.clean_email = 'huzaifaghori4315@gmail.com' THEN 'Huzaifa Ghori (Admin)'
      ELSE 'Academy Admin'
    END;

    v_admin_roll := CASE
      WHEN r_admin.clean_email = 'theinspirebusinessacademy@gmail.com' THEN 'ADMIN-01'
      WHEN r_admin.clean_email = 'huzaifaghori4315@gmail.com' THEN 'ADMIN-02'
      ELSE 'ADMIN'
    END;

    UPDATE auth.users
    SET
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      confirmation_token = COALESCE(confirmation_token, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      recovery_token = COALESCE(recovery_token, ''),
      raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', v_admin_name, 'role', 'admin'),
      updated_at = now()
    WHERE id = r_admin.id;

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    )
    SELECT
      gen_random_uuid(),
      r_admin.id,
      r_admin.id::text,
      jsonb_build_object('sub', r_admin.id::text, 'email', r_admin.clean_email, 'email_verified', true),
      'email',
      now(),
      now(),
      now()
    WHERE NOT EXISTS (
      SELECT 1 FROM auth.identities WHERE user_id = r_admin.id AND provider = 'email'
    );

    INSERT INTO public.profiles (
      id, email, full_name, phone, roll_no, skill,
      role, approval_status, is_approved, is_active,
      admission_date, created_at, updated_at
    )
    VALUES (
      r_admin.id,
      r_admin.clean_email,
      v_admin_name,
      '',
      v_admin_roll,
      'Academy Administration',
      'admin',
      'approved',
      true,
      true,
      to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD'),
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = 'admin',
      approval_status = 'approved',
      is_approved = true,
      is_active = true,
      skill = 'Academy Administration',
      updated_at = now();

    INSERT INTO public.admins (uid, email, full_name, roll_no, created_at, updated_at)
    VALUES (r_admin.id, r_admin.clean_email, v_admin_name, v_admin_roll, now(), now())
    ON CONFLICT (uid) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      roll_no = EXCLUDED.roll_no,
      updated_at = now();
  END LOOP;
END $$;

-- ============================================================================
-- 4. EMAIL CONFIRMATION & PROFILE TRIGGERS FOR NEW SIGNUPS
-- ============================================================================
-- Notice: Auto-confirmation is restricted strictly to the authorized admins
-- to avoid admin lockout. General student registrations require standard
-- email verification or administrator-controlled activation workflow.
CREATE OR REPLACE FUNCTION public.auto_confirm_admin_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(COALESCE(NEW.email, '')) IN (
    'theinspirebusinessacademy@gmail.com',
    'huzaifaghori4315@gmail.com'
  ) AND NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_admin_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_admin_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_admin_email();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Strictly determine admin role by server-side email allowlist only
  -- (Never trust client-supplied raw_user_meta_data->>'role' for privilege assignment)
  v_is_admin := lower(COALESCE(NEW.email, '')) IN (
    'theinspirebusinessacademy@gmail.com',
    'huzaifaghori4315@gmail.com'
  );

  INSERT INTO public.profiles (
    id, email, full_name, phone, roll_no, batch, skill,
    role, approval_status, is_approved, is_active,
    admission_date, created_at, updated_at
  )
  VALUES (
    NEW.id,
    lower(COALESCE(NEW.email, '')),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      CASE
        WHEN lower(NEW.email) = 'theinspirebusinessacademy@gmail.com' THEN 'Adeel Bhatti (Admin)'
        WHEN lower(NEW.email) = 'huzaifaghori4315@gmail.com' THEN 'Huzaifa Ghori (Admin)'
        ELSE split_part(COALESCE(NEW.email, 'Student'), '@', 1)
      END
    ),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'roll_no', ''),
    COALESCE(NEW.raw_user_meta_data->>'batch', ''),
    CASE
      WHEN v_is_admin THEN 'Academy Administration'
      ELSE COALESCE(NULLIF(NEW.raw_user_meta_data->>'skill', ''), 'Graphic Designing')
    END,
    CASE WHEN v_is_admin THEN 'admin' ELSE 'student' END,
    'approved',
    true,
    true,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'admission_date', ''),
      to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD')
    ),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE WHEN v_is_admin THEN 'admin' ELSE public.profiles.role END,
    approval_status = CASE WHEN v_is_admin THEN 'approved' ELSE public.profiles.approval_status END,
    is_approved = CASE WHEN v_is_admin THEN true ELSE public.profiles.is_approved END,
    is_active = CASE WHEN v_is_admin THEN true ELSE public.profiles.is_active END,
    updated_at = now();

  IF v_is_admin THEN
    INSERT INTO public.admins (uid, email, full_name, roll_no, created_at, updated_at)
    VALUES (
      NEW.id,
      lower(COALESCE(NEW.email, '')),
      COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
        CASE
          WHEN lower(NEW.email) = 'theinspirebusinessacademy@gmail.com' THEN 'Adeel Bhatti (Admin)'
          WHEN lower(NEW.email) = 'huzaifaghori4315@gmail.com' THEN 'Huzaifa Ghori (Admin)'
          ELSE 'Academy Admin'
        END
      ),
      CASE
        WHEN lower(NEW.email) = 'theinspirebusinessacademy@gmail.com' THEN 'ADMIN-01'
        WHEN lower(NEW.email) = 'huzaifaghori4315@gmail.com' THEN 'ADMIN-02'
        ELSE 'ADMIN'
      END,
      now(),
      now()
    )
    ON CONFLICT (uid) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 5. ADMIN AUTHORIZATION HELPER, PRIVILEGE ESCALATION GUARDS & SUBMISSION GUARDS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_active = true
  )
  OR EXISTS (
    SELECT 1
    FROM public.admins
    WHERE uid = auth.uid()
  )
  OR lower(COALESCE(auth.jwt()->>'email', '')) IN (
    'theinspirebusinessacademy@gmail.com',
    'huzaifaghori4315@gmail.com'
  );
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $
BEGIN
  -- The Auth AFTER INSERT trigger runs without an end-user JWT, so auth.uid()
  -- is NULL. Preserve identity/role only for the exact user being provisioned.
  IF TG_OP = 'INSERT'
     AND auth.uid() IS NULL
     AND EXISTS (
       SELECT 1
       FROM auth.users u
       WHERE u.id = NEW.id
         AND lower(COALESCE(u.email, '')) = lower(COALESCE(NEW.email, ''))
     ) THEN
    NEW.email := lower(COALESCE(NEW.email, ''));
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      -- Direct client profile inserts remain restricted to the signed-in student.
      NEW.id := auth.uid();
      NEW.email := lower(COALESCE(auth.jwt()->>'email', NEW.email));
      NEW.role := 'student';
      NEW.is_active := true;
      NEW.is_approved := false;
      NEW.approval_status := 'pending';
      NEW.admission_date := COALESCE(
        NULLIF(trim(NEW.admission_date), ''),
        to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD')
      );
      NEW.created_at := now();
    ELSIF TG_OP = 'UPDATE' THEN
      -- Non-admin users can never escalate role or alter account approval/active state
      NEW.id := OLD.id;
      NEW.email := OLD.email;
      NEW.role := OLD.role;
      NEW.is_active := OLD.is_active;
      NEW.is_approved := OLD.is_approved;
      NEW.approval_status := OLD.approval_status;
      NEW.admission_date := OLD.admission_date;
      NEW.created_at := OLD.created_at;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

CREATE OR REPLACE FUNCTION public.protect_submission_review_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assignment_max_marks numeric(6,2);
BEGIN
  IF NOT public.is_admin() THEN
    IF TG_OP = 'INSERT' THEN
      -- Safe server-controlled defaults for new student submissions
      NEW.student_id := auth.uid();
      NEW.marks := NULL;
      SELECT max_marks INTO v_assignment_max_marks
      FROM public.assignments
      WHERE id = NEW.assignment_id
      LIMIT 1;
      NEW.max_marks := COALESCE(v_assignment_max_marks, 100);
      NEW.rating := NULL;
      NEW.feedback := '';
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.is_deleted := false;
      NEW.status := 'submitted';
      NEW.version := 1;
      NEW.submitted_at := now();
      NEW.created_at := now();
    ELSIF TG_OP = 'UPDATE' THEN
      IF OLD.is_deleted = true THEN
        RAISE EXCEPTION 'Cannot update a deleted submission.';
      END IF;

      -- Students cannot modify an already reviewed/approved submission outside permitted workflow
      IF OLD.status = 'reviewed' THEN
        RAISE EXCEPTION 'Reviewed submissions cannot be directly edited by students. Resubmission is permitted only when marked needs_revision.';
      END IF;

      -- Automatically preserve previous version in submission_versions history
      INSERT INTO public.submission_versions (
        submission_id,
        student_id,
        version_number,
        file_path,
        file_name,
        file_type,
        file_size,
        project_url,
        description,
        created_at
      ) VALUES (
        OLD.id,
        OLD.student_id,
        COALESCE(OLD.version, 1),
        COALESCE(OLD.file_path, ''),
        COALESCE(OLD.file_name, 'submission'),
        COALESCE(OLD.file_type, 'application/octet-stream'),
        COALESCE(OLD.file_size, 0),
        COALESCE(OLD.project_url, ''),
        COALESCE(OLD.description, ''),
        COALESCE(OLD.updated_at, OLD.submitted_at, now())
      )
      ON CONFLICT (submission_id, version_number) DO NOTHING;

      -- Students cannot alter marks, ratings, feedback, reviewer identity, review timestamp, or deletion flags
      NEW.id := OLD.id;
      NEW.student_id := OLD.student_id;
      NEW.assignment_id := OLD.assignment_id;
      NEW.marks := OLD.marks;
      NEW.max_marks := OLD.max_marks;
      NEW.rating := OLD.rating;
      NEW.feedback := OLD.feedback;
      NEW.reviewed_by := OLD.reviewed_by;
      NEW.reviewed_at := OLD.reviewed_at;
      NEW.is_deleted := OLD.is_deleted;
      NEW.status := 'submitted';
      NEW.version := COALESCE(OLD.version, 1) + 1;
      NEW.submitted_at := now();
      NEW.created_at := OLD.created_at;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_submission_review_fields ON public.submissions;
CREATE TRIGGER trg_protect_submission_review_fields
  BEFORE INSERT OR UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.protect_submission_review_fields();

CREATE OR REPLACE FUNCTION public.admin_create_student(
  p_email text,
  p_password text,
  p_full_name text,
  p_phone text,
  p_roll_no text,
  p_skill text,
  p_admission_date text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_email text;
  v_user_id uuid;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only authorized administrators can create student accounts.';
  END IF;

  v_clean_email := lower(trim(p_email));
  IF v_clean_email = '' OR position('@' in v_clean_email) = 0 THEN
    RAISE EXCEPTION 'Please provide a valid student email address.';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = v_clean_email LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'A user with email % already exists.', v_clean_email;
  END IF;

  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_clean_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"],"role":"student"}'::jsonb,
    jsonb_build_object(
      'full_name', trim(p_full_name),
      'phone', trim(COALESCE(p_phone, '')),
      'roll_no', trim(COALESCE(p_roll_no, '')),
      'skill', trim(COALESCE(p_skill, 'Graphic Designing')),
      'admission_date', trim(COALESCE(p_admission_date, to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD'))),
      'role', 'student'
    ),
    now(),
    now(),
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_user_id::text,
    jsonb_build_object('sub', v_user_id::text, 'email', v_clean_email, 'email_verified', true),
    'email',
    now(),
    now(),
    now()
  );

  INSERT INTO public.profiles (
    id, email, full_name, phone, roll_no, skill,
    role, approval_status, is_approved, is_active,
    admission_date, created_at, updated_at
  ) VALUES (
    v_user_id,
    v_clean_email,
    trim(p_full_name),
    trim(COALESCE(p_phone, '')),
    trim(COALESCE(p_roll_no, '')),
    trim(COALESCE(p_skill, 'Graphic Designing')),
    'student',
    'approved',
    true,
    true,
    trim(COALESCE(p_admission_date, to_char((now() AT TIME ZONE 'Asia/Karachi'), 'YYYY-MM-DD'))),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    roll_no = EXCLUDED.roll_no,
    skill = EXCLUDED.skill,
    admission_date = EXCLUDED.admission_date,
    is_active = true,
    updated_at = now();

  RETURN v_user_id;
END;
$$;

-- ============================================================================
-- 6. SUPABASE STORAGE BUCKETS & STORAGE RLS POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES
  ('academy-submissions', 'academy-submissions', false, 26214400),
  ('public-portfolios', 'public-portfolios', true, 26214400)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit;

DROP POLICY IF EXISTS "storage_submissions_select" ON storage.objects;
CREATE POLICY "storage_submissions_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'academy-submissions'
    AND (
      public.is_admin()
      OR (
        auth.uid() IS NOT NULL
        AND (storage.foldername(name))[1] = auth.uid()::text
        AND (
          EXISTS (
            SELECT 1 FROM public.submissions s
            WHERE s.student_id = auth.uid()
              AND s.is_deleted = false
              AND (
                s.file_path = name
                OR s.id = split_part((storage.filename(name)), '-v', 1)
                OR s.id = split_part((storage.filename(name)), '-', 1)
              )
          )
          OR EXISTS (
            SELECT 1 FROM public.submission_files sf
            JOIN public.submissions s ON s.id = sf.id
            WHERE sf.student_id = auth.uid()
              AND s.is_deleted = false
              AND sf.file_path = name
          )
          OR EXISTS (
            SELECT 1 FROM public.submission_versions sv
            JOIN public.submissions s ON s.id = sv.submission_id
            WHERE sv.student_id = auth.uid()
              AND s.is_deleted = false
              AND sv.file_path = name
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS "storage_submissions_insert" ON storage.objects;
CREATE POLICY "storage_submissions_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'academy-submissions'
    AND (
      public.is_admin()
      OR (auth.uid() IS NOT NULL AND (storage.foldername(name))[1] = auth.uid()::text)
    )
  );

DROP POLICY IF EXISTS "storage_submissions_delete_admin" ON storage.objects;
CREATE POLICY "storage_submissions_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'academy-submissions' AND public.is_admin()
  );

DROP POLICY IF EXISTS "storage_public_portfolios_select" ON storage.objects;
CREATE POLICY "storage_public_portfolios_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-portfolios');

DROP POLICY IF EXISTS "storage_public_portfolios_write_admin" ON storage.objects;
CREATE POLICY "storage_public_portfolios_write_admin" ON storage.objects
  FOR ALL USING (bucket_id = 'public-portfolios' AND public.is_admin())
  WITH CHECK (bucket_id = 'public-portfolios' AND public.is_admin());

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES FOR ALL TABLES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_marks_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delete_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_insert_own_or_admin" ON public.profiles
  FOR INSERT WITH CHECK (
    (
      auth.uid() = id
      AND role = 'student'
      AND is_active = true
      AND is_approved = true
      AND approval_status = 'approved'
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    (
      auth.uid() = id
      AND role = 'student'
    )
    OR public.is_admin()
  );

-- Admins Policies
DROP POLICY IF EXISTS "admins_select_own_or_admin" ON public.admins;
CREATE POLICY "admins_select_own_or_admin" ON public.admins
  FOR SELECT USING (auth.uid() = uid OR public.is_admin());

DROP POLICY IF EXISTS "admins_write_admin" ON public.admins;
CREATE POLICY "admins_write_admin" ON public.admins
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Courses & Batches Policies
DROP POLICY IF EXISTS "courses_select_all" ON public.courses;
CREATE POLICY "courses_select_all" ON public.courses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "courses_write_admin" ON public.courses;
CREATE POLICY "courses_write_admin" ON public.courses
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "batches_select_all" ON public.batches;
CREATE POLICY "batches_select_all" ON public.batches
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "batches_write_admin" ON public.batches;
CREATE POLICY "batches_write_admin" ON public.batches
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Assignments Policies
DROP POLICY IF EXISTS "assignments_select_all" ON public.assignments;
CREATE POLICY "assignments_select_all" ON public.assignments
  FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "assignments_write_admin" ON public.assignments;
CREATE POLICY "assignments_write_admin" ON public.assignments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Submissions Policies
DROP POLICY IF EXISTS "submissions_select_own_or_admin" ON public.submissions;
CREATE POLICY "submissions_select_own_or_admin" ON public.submissions
  FOR SELECT USING ((auth.uid() = student_id AND is_deleted = false) OR public.is_admin());

DROP POLICY IF EXISTS "submissions_insert_own_or_admin" ON public.submissions;
CREATE POLICY "submissions_insert_own_or_admin" ON public.submissions
  FOR INSERT WITH CHECK (
    (
      auth.uid() = student_id
      AND is_deleted = false
      AND status = 'submitted'
      AND marks IS NULL
      AND rating IS NULL
      AND COALESCE(feedback, '') = ''
      AND reviewed_by IS NULL
      AND reviewed_at IS NULL
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "submissions_update_admin" ON public.submissions;
DROP POLICY IF EXISTS "submissions_update_own_or_admin" ON public.submissions;
CREATE POLICY "submissions_update_own_or_admin" ON public.submissions
  FOR UPDATE USING (
    (
      auth.uid() = student_id
      AND is_deleted = false
      AND status IN ('submitted', 'needs_revision')
    )
    OR public.is_admin()
  )
  WITH CHECK (
    (
      auth.uid() = student_id
      AND is_deleted = false
      AND status = 'submitted'
    )
    OR public.is_admin()
  );

-- Submission Files Policies
DROP POLICY IF EXISTS "submission_files_select_own_or_admin" ON public.submission_files;
CREATE POLICY "submission_files_select_own_or_admin" ON public.submission_files
  FOR SELECT USING (
    public.is_admin()
    OR (
      auth.uid() = student_id
      AND EXISTS (
        SELECT 1 FROM public.submissions s
        WHERE s.id = submission_files.id AND s.is_deleted = false
      )
    )
  );

DROP POLICY IF EXISTS "submission_files_insert_own_or_admin" ON public.submission_files;
CREATE POLICY "submission_files_insert_own_or_admin" ON public.submission_files
  FOR INSERT WITH CHECK (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "submission_files_update_own_or_admin" ON public.submission_files;
CREATE POLICY "submission_files_update_own_or_admin" ON public.submission_files
  FOR UPDATE USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "submission_files_delete_admin" ON public.submission_files;
CREATE POLICY "submission_files_delete_admin" ON public.submission_files
  FOR DELETE USING (public.is_admin());

-- Submission Versions Policies
DROP POLICY IF EXISTS "submission_versions_select_own_or_admin" ON public.submission_versions;
CREATE POLICY "submission_versions_select_own_or_admin" ON public.submission_versions
  FOR SELECT USING (
    public.is_admin()
    OR (
      auth.uid() = student_id
      AND EXISTS (
        SELECT 1 FROM public.submissions s
        WHERE s.id = submission_versions.submission_id AND s.is_deleted = false
      )
    )
  );

DROP POLICY IF EXISTS "submission_versions_insert_own_or_admin" ON public.submission_versions;
CREATE POLICY "submission_versions_insert_own_or_admin" ON public.submission_versions
  FOR INSERT WITH CHECK (auth.uid() = student_id OR public.is_admin());

-- Submission Marks History Policies
DROP POLICY IF EXISTS "marks_history_select_own_or_admin" ON public.submission_marks_history;
CREATE POLICY "marks_history_select_own_or_admin" ON public.submission_marks_history
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "marks_history_insert_admin" ON public.submission_marks_history;
CREATE POLICY "marks_history_insert_admin" ON public.submission_marks_history
  FOR INSERT WITH CHECK (public.is_admin());

-- Delete Requests Policies
DROP POLICY IF EXISTS "delete_requests_select_own_or_admin" ON public.delete_requests;
CREATE POLICY "delete_requests_select_own_or_admin" ON public.delete_requests
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "delete_requests_insert_own" ON public.delete_requests;
CREATE POLICY "delete_requests_insert_own" ON public.delete_requests
  FOR INSERT WITH CHECK (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "delete_requests_update_admin" ON public.delete_requests;
CREATE POLICY "delete_requests_update_admin" ON public.delete_requests
  FOR UPDATE USING (public.is_admin());

-- Public Portfolios Policies
DROP POLICY IF EXISTS "public_portfolios_select_public" ON public.public_portfolios;
CREATE POLICY "public_portfolios_select_public" ON public.public_portfolios
  FOR SELECT USING (is_public = true OR auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "public_portfolios_write_admin" ON public.public_portfolios;
CREATE POLICY "public_portfolios_write_admin" ON public.public_portfolios
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Attendance Policies
DROP POLICY IF EXISTS "attendance_select_own_or_admin" ON public.attendance;
CREATE POLICY "attendance_select_own_or_admin" ON public.attendance
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "attendance_write_admin" ON public.attendance;
CREATE POLICY "attendance_write_admin" ON public.attendance
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Announcements Policies
DROP POLICY IF EXISTS "announcements_select_published" ON public.announcements;
CREATE POLICY "announcements_select_published" ON public.announcements
  FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "announcements_write_admin" ON public.announcements;
CREATE POLICY "announcements_write_admin" ON public.announcements
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Notifications Policies
DROP POLICY IF EXISTS "notifications_select_own_or_admin" ON public.notifications;
CREATE POLICY "notifications_select_own_or_admin" ON public.notifications
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_update_own_or_admin" ON public.notifications;
CREATE POLICY "notifications_update_own_or_admin" ON public.notifications
  FOR UPDATE USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_insert_admin" ON public.notifications;
CREATE POLICY "notifications_insert_admin" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- Certificates Policies
DROP POLICY IF EXISTS "certificates_select_public" ON public.certificates;
CREATE POLICY "certificates_select_public" ON public.certificates
  FOR SELECT USING (is_verified = true OR auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "certificates_write_admin" ON public.certificates;
CREATE POLICY "certificates_write_admin" ON public.certificates
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Academy Settings Policies
DROP POLICY IF EXISTS "settings_select_all" ON public.academy_settings;
CREATE POLICY "settings_select_all" ON public.academy_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "settings_write_admin" ON public.academy_settings;
CREATE POLICY "settings_write_admin" ON public.academy_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Audit Logs Policies
DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_insert_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_admin" ON public.audit_logs
  FOR INSERT WITH CHECK (public.is_admin());

COMMIT;

-- ============================================================================
-- 8. VERIFICATION OUTPUT (Shows configured Admin accounts in public.profiles)
-- ============================================================================
SELECT
  p.id,
  p.email,
  p.full_name,
  p.roll_no,
  p.role,
  p.approval_status,
  p.is_active,
  u.email_confirmed_at IS NOT NULL AS email_verified
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE lower(p.email) IN (
  'theinspirebusinessacademy@gmail.com',
  'huzaifaghori4315@gmail.com'
);
