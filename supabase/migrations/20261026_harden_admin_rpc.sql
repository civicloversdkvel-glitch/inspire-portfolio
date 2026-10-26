-- Keep SECURITY DEFINER implementation details outside the exposed public schema.
begin;

create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
      and is_active = true
  )
  or exists (
    select 1 from public.admins
    where uid = auth.uid()
  )
  or lower(coalesce(auth.jwt()->>'email', '')) in (
    'theinspirebusinessacademy@gmail.com',
    'huzaifaghori4315@gmail.com'
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to anon, authenticated, service_role;
grant execute on function private.is_admin() to anon, authenticated, service_role;

create or replace function public.is_admin()
returns boolean
language sql
security invoker
set search_path = public
stable
as $$
  select private.is_admin();
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

do $
begin
  if to_regprocedure('private.admin_create_student(text,text,text,text,text,text,text)') is null then
    alter function public.admin_create_student(text, text, text, text, text, text, text) set schema private;
  end if;
end;
$;
revoke all on function private.admin_create_student(text, text, text, text, text, text, text) from public, anon;
grant execute on function private.admin_create_student(text, text, text, text, text, text, text) to authenticated;

create or replace function public.admin_create_student(
  p_email text,
  p_password text,
  p_full_name text,
  p_phone text,
  p_roll_no text,
  p_skill text,
  p_admission_date text
)
returns uuid
language sql
security invoker
set search_path = public
as $$
  select private.admin_create_student(
    p_email, p_password, p_full_name, p_phone, p_roll_no, p_skill, p_admission_date
  );
$$;
revoke all on function public.admin_create_student(text, text, text, text, text, text, text) from public, anon;
grant execute on function public.admin_create_student(text, text, text, text, text, text, text) to authenticated;

commit;
