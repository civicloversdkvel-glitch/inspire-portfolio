-- Improve RLS policy evaluation and avoid overlapping read/write policies.
-- The ALL policies being split below are admin/staff management policies whose
-- tables already have dedicated SELECT policies. INSERT/UPDATE/DELETE access is
-- preserved; SELECT is left to the existing table-specific read policies.
-- Wrapping auth.uid() in a scalar SELECT lets PostgreSQL evaluate it once per
-- statement rather than once per candidate row.

begin;

do $$
declare
  p record;
  v_using text;
  v_check text;
  v_roles text;
  v_stmt text;
begin
  for p in
    select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (
        cmd = 'ALL'
        or coalesce(qual, '') like '%auth.uid()%'
        or coalesce(with_check, '') like '%auth.uid()%'
      )
    order by tablename, policyname
  loop
    v_using := p.qual;
    v_check := p.with_check;

    if v_using is not null then
      v_using := regexp_replace(v_using, 'auth\.uid\(\)', '(select auth.uid())', 'g');
    end if;
    if v_check is not null then
      v_check := regexp_replace(v_check, 'auth\.uid\(\)', '(select auth.uid())', 'g');
    end if;

    v_roles := array_to_string(p.roles, ', ');
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);

    if p.cmd = 'ALL' then
      v_check := coalesce(v_check, v_using, 'true');

      execute format(
        'create policy %I on %I.%I as %s for insert to %s with check (%s)',
        p.policyname || '__for_insert', p.schemaname, p.tablename,
        p.permissive, v_roles, v_check
      );
      execute format(
        'create policy %I on %I.%I as %s for update to %s using (%s) with check (%s)',
        p.policyname || '__for_update', p.schemaname, p.tablename,
        p.permissive, v_roles, coalesce(v_using, 'true'), v_check
      );
      execute format(
        'create policy %I on %I.%I as %s for delete to %s using (%s)',
        p.policyname || '__for_delete', p.schemaname, p.tablename,
        p.permissive, v_roles, coalesce(v_using, 'true')
      );
    else
      v_stmt := format(
        'create policy %I on %I.%I as %s for %s to %s',
        p.policyname, p.schemaname, p.tablename,
        p.permissive, p.cmd, v_roles
      );
      if v_using is not null then
        v_stmt := v_stmt || format(' using (%s)', v_using);
      end if;
      if v_check is not null then
        v_stmt := v_stmt || format(' with check (%s)', v_check);
      end if;
      execute v_stmt;
    end if;
  end loop;
end;
$$;

commit;
