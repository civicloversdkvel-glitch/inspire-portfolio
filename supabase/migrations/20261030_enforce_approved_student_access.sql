-- Only approved, active academy students may access student submission records and upload files.
begin;

create or replace function private.is_approved_student()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
      and p.is_active = true
      and p.is_approved = true
      and p.approval_status = 'approved'
  );
$$;
revoke all on function private.is_approved_student() from public;
grant usage on schema private to anon, authenticated, service_role;
grant execute on function private.is_approved_student() to anon, authenticated, service_role;

drop policy if exists submissions_insert_own_or_admin on public.submissions;
create policy submissions_insert_own_or_admin on public.submissions
for insert to authenticated
with check (
  (auth.uid() = student_id and private.is_approved_student()
   and is_deleted = false and status = 'submitted'
   and marks is null and rating is null and coalesce(feedback, '') = ''
   and reviewed_by is null and reviewed_at is null)
  or is_admin()
);

drop policy if exists submissions_select_own_or_admin on public.submissions;
create policy submissions_select_own_or_admin on public.submissions
for select to authenticated
using (
  (auth.uid() = student_id and private.is_approved_student() and is_deleted = false)
  or is_admin()
);

drop policy if exists submissions_update_own_or_admin on public.submissions;
create policy submissions_update_own_or_admin on public.submissions
for update to authenticated
using (
  (auth.uid() = student_id and private.is_approved_student() and is_deleted = false
   and status = any(array['submitted'::text, 'needs_revision'::text]))
  or is_admin()
)
with check (
  (auth.uid() = student_id and private.is_approved_student() and is_deleted = false and status = 'submitted')
  or is_admin()
);

drop policy if exists storage_submissions_insert on storage.objects;
create policy storage_submissions_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'academy-submissions'
  and (is_admin() or (private.is_approved_student() and (storage.foldername(name))[1] = auth.uid()::text))
);

drop policy if exists students_upload_assignment_files on storage.objects;
create policy students_upload_assignment_files on storage.objects
for insert to authenticated
with check (
  bucket_id = 'assignment-files'
  and (storage.foldername(name))[1] = auth.uid()::text
  and private.is_approved_student()
);

drop policy if exists students_update_own_assignment_files on storage.objects;
create policy students_update_own_assignment_files on storage.objects
for update to authenticated
using (
  bucket_id = 'assignment-files'
  and (storage.foldername(name))[1] = auth.uid()::text
  and private.is_approved_student()
)
with check (
  bucket_id = 'assignment-files'
  and (storage.foldername(name))[1] = auth.uid()::text
  and private.is_approved_student()
);

drop policy if exists students_delete_own_assignment_files on storage.objects;
create policy students_delete_own_assignment_files on storage.objects
for delete to authenticated
using (
  bucket_id = 'assignment-files'
  and (storage.foldername(name))[1] = auth.uid()::text
  and private.is_approved_student()
);

commit;
