-- Website admissions inquiry storage. Public users can submit a lead but cannot read it.
begin;

create table if not exists public.admission_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  phone text not null check (char_length(trim(phone)) between 7 and 30),
  email text check (email is null or char_length(email) <= 254),
  course text not null default 'General Inquiry' check (char_length(course) <= 160),
  message text not null default '' check (char_length(message) <= 2000),
  status text not null default 'new' check (status in ('new','contacted','enrolled','closed')),
  source text not null default 'website',
  created_at timestamptz not null default now()
);

alter table public.admission_inquiries enable row level security;

revoke all on table public.admission_inquiries from anon, authenticated;
grant insert on table public.admission_inquiries to anon, authenticated;
grant select, update on table public.admission_inquiries to authenticated;

drop policy if exists admission_inquiries_public_insert on public.admission_inquiries;
create policy admission_inquiries_public_insert
  on public.admission_inquiries
  for insert to anon, authenticated
  with check (
    char_length(trim(name)) between 2 and 120
    and char_length(trim(phone)) between 7 and 30
    and char_length(coalesce(email, '')) <= 254
    and char_length(coalesce(course, '')) <= 160
    and char_length(coalesce(message, '')) <= 2000
    and status = 'new'
    and source = 'website'
  );

drop policy if exists admission_inquiries_admin_select on public.admission_inquiries;
create policy admission_inquiries_admin_select
  on public.admission_inquiries
  for select to authenticated
  using (public.is_admin());

drop policy if exists admission_inquiries_admin_update on public.admission_inquiries;
create policy admission_inquiries_admin_update
  on public.admission_inquiries
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create index if not exists admission_inquiries_status_created_at_idx
  on public.admission_inquiries (status, created_at desc);
create index if not exists admission_inquiries_created_at_idx
  on public.admission_inquiries (created_at desc);

-- Trigger functions should only run through their installed triggers.
revoke all on function public.auto_confirm_admin_email() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.protect_profile_fields() from public, anon, authenticated;
revoke all on function public.protect_submission_review_fields() from public, anon, authenticated;

-- Admin student creation has an explicit public.is_admin() authorization check.
revoke all on function public.admin_create_student(text, text, text, text, text, text, text) from public, anon;
grant execute on function public.admin_create_student(text, text, text, text, text, text, text) to authenticated;

commit;
