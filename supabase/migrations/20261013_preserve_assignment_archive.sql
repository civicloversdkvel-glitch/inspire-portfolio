-- ============================================================================
-- MIGRATION: FAIL-CLOSED STORAGE ACCESS RESTRICTION FOR ARCHIVED SUBMISSIONS
-- ============================================================================
-- Description:
-- 1. Updates `storage.objects` SELECT policy (`storage_submissions_select`) so that
--    an ordinary student is permitted access to a private assignment object ONLY
--    when the database can positively verify (via EXISTS) that the object belongs
--    to that student's ACTIVE, non-archived submission (`s.is_deleted = false`) or
--    an authorized version of that active submission.
-- 2. Eliminates negative-check fail-open risks (such as orphaned or unmatched objects).
-- 3. Updates `public.submission_files` and `public.submission_versions` SELECT policies
--    so that non-admin students cannot access file rows belonging to archived submissions.
-- 4. Guarantees administrators retain full access to all historical and archived
--    submissions and files for audit, evaluation, and instant restoration.
-- 5. Idempotent & non-destructive: Does not drop tables, alter schemas, or delete
--    any storage objects or existing records.
-- ============================================================================

BEGIN;

-- 1. Update storage.objects SELECT policy on private academy-submissions bucket
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

-- 2. Update public.submission_files SELECT policy to protect archived submissions
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

-- 3. Update public.submission_versions SELECT policy to protect archived versions
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

-- 4. Confirm public.submissions SELECT policy (hides archived submissions from students)
DROP POLICY IF EXISTS "submissions_select_own_or_admin" ON public.submissions;
CREATE POLICY "submissions_select_own_or_admin" ON public.submissions
  FOR SELECT USING ((auth.uid() = student_id AND is_deleted = false) OR public.is_admin());

-- 5. Confirm public.public_portfolios SELECT policy (hides archived/unapproved from visitors)
DROP POLICY IF EXISTS "public_portfolios_select_public" ON public.public_portfolios;
CREATE POLICY "public_portfolios_select_public" ON public.public_portfolios
  FOR SELECT USING (is_public = true OR auth.uid() = student_id OR public.is_admin());

COMMIT;
