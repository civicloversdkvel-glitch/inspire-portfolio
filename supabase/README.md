# Inspire Business Academy — Supabase Database & Security Guide

This directory contains the canonical PostgreSQL schema, Row Level Security (RLS) policies, triggers, and storage configurations for the Inspire Business Academy application.

---

## 1. File Roles & Reconciled Structure

| File | Purpose | Usage |
|---|---|---|
| `supabase/schema.sql` | **Canonical Reference Schema** | Primary version-controlled definition of all PostgreSQL tables, indexes, triggers, storage buckets, and RLS policies. |
| `supabase/admin_setup.sql` | **SQL Editor Execution Script** | Turnkey, self-contained SQL script ready to be pasted directly into the Supabase Dashboard SQL Editor to provision or update the project. |

Both files are kept strictly in sync and are completely idempotent (using `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and `DROP POLICY IF EXISTS`). Existing live data in production is never truncated or overwritten.

---

## 2. Authorized Administrator Accounts

The application is officially configured for **2 authorized academy administrators**:

1. **`theinspirebusinessacademy@gmail.com`** (Adeel Bhatti / `ADMIN-01`)
2. **`huzaifaghori4315@gmail.com`** (Huzaifa Ghori / `ADMIN-02`)

### Legacy Account Status (`hr498412@gmail.com`):
Per the project owner's mandate to maintain strictly two administrators, the legacy account `hr498412@gmail.com` is preserved in the database without deletion to protect historical data, but does **not** possess active administrative privileges in RLS policies, trigger checks (`is_admin()`), or the frontend admin portal.

---

## 3. Database Security & Privilege Controls

### A. Non-Admin Role Escalation Protection (`protect_profile_fields`)
- Triggers on `BEFORE INSERT OR UPDATE ON public.profiles`.
- Non-admin users are strictly forced to `role = 'student'`, `is_active = true`, `is_approved = true`, `approval_status = 'approved'`.
- On `UPDATE`, non-admin users cannot alter `role`, `is_active`, `is_approved`, `approval_status`, `admission_date`, `created_at`, `email`, or `id`.
- Backed by RLS `WITH CHECK ((auth.uid() = id AND role = 'student') OR public.is_admin())`.

### B. Assignment Grading & Review Protection (`protect_submission_review_fields`)
- Triggers on `BEFORE INSERT OR UPDATE ON public.submissions`.
- On `INSERT`: non-admins cannot set `marks`, `rating`, `feedback`, `reviewed_by`, `reviewed_at`, or `is_deleted`. Fields are forced to `NULL`/safe server defaults (`status = 'submitted'`, `is_deleted = false`).
- On `UPDATE`:
  - Students cannot update deleted submissions (`is_deleted = true`).
  - Students cannot update submissions that have already been reviewed (`status = 'reviewed'`). Resubmissions are allowed only when an assignment is unreviewed (`status = 'submitted'`) or marked `status = 'needs_revision'`.
  - The previous submission version is **automatically snapshot and archived** into `public.submission_versions` before updating.
  - Grading fields (`marks`, `rating`, `max_marks`, `feedback`, `reviewed_by`, `reviewed_at`, `is_deleted`) are strictly preserved from the previous record.
  - Backed by RLS `WITH CHECK ((auth.uid() = student_id AND is_deleted = false AND status = 'submitted') OR public.is_admin())`.

### C. Storage Security
- `academy-submissions`: Private bucket (`public = false`). Files only accessible by the student who uploaded them or authorized administrators. Max file size: 25 MB.
- `public-portfolios`: Public read bucket (`public = true`). Only authorized administrators can write/publish portfolio media.

---

## 4. Setup Instructions (Supabase Dashboard)

1. Open your **Supabase Dashboard** (`https://supabase.com/dashboard/project/<your-project-ref>`).
2. Navigate to **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Paste the entire content of `supabase/admin_setup.sql`.
5. Click **Run** (or press `Ctrl+Enter`).
6. Check the query output: the results grid will display the configured administrator accounts in `public.profiles`.
