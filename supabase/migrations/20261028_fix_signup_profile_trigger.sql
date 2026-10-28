-- Fix Auth signup profile creation. During the auth.users AFTER INSERT trigger,
-- auth.uid() is NULL; the profile guard must preserve the ID and role assigned by
-- the trusted handle_new_user() trigger only when a matching auth.users row exists.

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if tg_op = 'INSERT'
     and auth.uid() is null
     and exists (
       select 1
       from auth.users u
       where u.id = new.id
         and lower(coalesce(u.email, '')) = lower(coalesce(new.email, ''))
     )
  then
    new.email := lower(coalesce(new.email, ''));
    new.updated_at := now();
    return new;
  end if;

  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.id := auth.uid();
      new.email := lower(coalesce(auth.jwt()->>'email', new.email));
      new.role := 'student';
      new.is_active := true;
      new.is_approved := true;
      new.approval_status := 'approved';
      new.admission_date := coalesce(
        nullif(trim(new.admission_date), ''),
        to_char((now() at time zone 'Asia/Karachi'), 'YYYY-MM-DD')
      );
      new.created_at := now();
    elsif tg_op = 'UPDATE' then
      new.id := old.id;
      new.email := old.email;
      new.role := old.role;
      new.is_active := old.is_active;
      new.is_approved := old.is_approved;
      new.approval_status := old.approval_status;
      new.admission_date := old.admission_date;
      new.created_at := old.created_at;
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$function$;
