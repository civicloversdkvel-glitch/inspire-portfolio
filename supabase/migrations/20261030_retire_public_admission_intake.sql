-- Public admission intake is retired. Keep existing inquiry rows for historical records.
begin;
drop policy if exists admission_inquiries_public_insert on public.admission_inquiries;
revoke insert on table public.admission_inquiries from anon, authenticated;
comment on table public.admission_inquiries is 'Legacy admission inquiries retained for historical records; public intake is retired and no new submissions are permitted.';
commit;
