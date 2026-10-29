-- New self-registrations are pending until academy staff verify the roll number.
-- The existing admin allowlist remains the only way to auto-provision admin accounts.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_is_admin boolean;
  v_initial_status text;
  v_initial_approved boolean;
  v_initial_active boolean;
begin
  v_is_admin := lower(coalesce(new.email, '')) in (
    'theinspirebusinessacademy@gmail.com',
    'huzaifaghori4315@gmail.com'
  );
  v_initial_status := case when v_is_admin then 'approved' else 'pending' end;
  v_initial_approved := v_is_admin;
  v_initial_active := v_is_admin;

  insert into public.profiles (
    id, email, full_name, phone, roll_no, batch, skill,
    role, approval_status, is_approved, is_active,
    admission_date, created_at, updated_at
  )
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''),
      case
        when lower(new.email) = 'theinspirebusinessacademy@gmail.com' then 'Adeel Bhatti (Admin)'
        when lower(new.email) = 'huzaifaghori4315@gmail.com' then 'Huzaifa Ghori (Admin)'
        else split_part(coalesce(new.email, 'Student'), '@', 1)
      end),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'roll_no', ''),
    coalesce(new.raw_user_meta_data->>'batch', ''),
    case when v_is_admin then 'Academy Administration'
      else coalesce(nullif(new.raw_user_meta_data->>'skill', ''), 'Graphic Designing') end,
    case when v_is_admin then 'admin' else 'student' end,
    v_initial_status,
    v_initial_approved,
    v_initial_active,
    coalesce(nullif(new.raw_user_meta_data->>'admission_date', ''),
      to_char((now() at time zone 'Asia/Karachi'), 'YYYY-MM-DD')),
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    role = case when v_is_admin then 'admin' else public.profiles.role end,
    approval_status = case when v_is_admin then 'approved' else public.profiles.approval_status end,
    is_approved = case when v_is_admin then true else public.profiles.is_approved end,
    is_active = case when v_is_admin then true else public.profiles.is_active end,
    updated_at = now();

  if v_is_admin then
    insert into public.admins (uid, email, full_name, roll_no, created_at, updated_at)
    values (
      new.id,
      lower(coalesce(new.email, '')),
      coalesce(nullif(new.raw_user_meta_data->>'full_name', ''),
        case
          when lower(new.email) = 'theinspirebusinessacademy@gmail.com' then 'Adeel Bhatti (Admin)'
          when lower(new.email) = 'huzaifaghori4315@gmail.com' then 'Huzaifa Ghori (Admin)'
          else 'Academy Admin'
        end),
      case
        when lower(new.email) = 'theinspirebusinessacademy@gmail.com' then 'ADMIN-01'
        when lower(new.email) = 'huzaifaghori4315@gmail.com' then 'ADMIN-02'
        else 'ADMIN'
      end,
      now(),
      now()
    )
    on conflict (uid) do update set email = excluded.email, updated_at = now();
  end if;
  return new;
end;
$function$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;
