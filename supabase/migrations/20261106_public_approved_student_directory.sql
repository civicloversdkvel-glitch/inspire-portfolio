-- Expose only safe fields for currently approved students to the public verification directory.
-- Keep all other profile columns private from unauthenticated visitors.
begin;

drop policy if exists profiles_select_approved_public_directory on public.profiles;
create policy profiles_select_approved_public_directory
on public.profiles
for select
to anon
using (
  role = 'student'
  and is_active = true
  and is_approved = true
  and approval_status = 'approved'
  and lower(coalesce(email, '')) not in (
    'theinspirebusinessacademy@gmail.com',
    'huzaifaghori4315@gmail.com'
  )
  and lower(regexp_replace(coalesce(full_name, ''), '[^a-z0-9]', '', 'g')) not like '%adeelbhatti%'
);

revoke select on public.profiles from anon;
grant select (id, full_name, roll_no, skill, created_at)
on public.profiles to anon;

commit;
