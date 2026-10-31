-- NhTBank draft security assertions
-- Run only against a disposable local Supabase/PostgreSQL environment AFTER
-- reviewing and applying the companion draft there. Never run on Production.

do $$
declare
  t text;
  app_tables text[] := array[
    'profiles',
    'user_roles',
    'sandbox_accounts',
    'sandbox_transactions',
    'webhook_inbox',
    'idempotency_keys',
    'audit_events'
  ];
begin
  if has_schema_privilege('anon', 'private', 'USAGE') then
    raise exception 'FAIL: anon has USAGE on private schema';
  end if;

  if has_schema_privilege('authenticated', 'private', 'USAGE') then
    raise exception 'FAIL: authenticated has USAGE on private schema';
  end if;

  foreach t in array app_tables loop
    if not exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'private'
        and c.relname = t
        and c.relrowsecurity
    ) then
      raise exception 'FAIL: RLS is not enabled on private.%', t;
    end if;

    if has_table_privilege('anon', format('private.%I', t), 'SELECT')
       or has_table_privilege('anon', format('private.%I', t), 'INSERT')
       or has_table_privilege('anon', format('private.%I', t), 'UPDATE')
       or has_table_privilege('anon', format('private.%I', t), 'DELETE') then
      raise exception 'FAIL: anon has table privileges on private.%', t;
    end if;

    if has_table_privilege('authenticated', format('private.%I', t), 'SELECT')
       or has_table_privilege('authenticated', format('private.%I', t), 'INSERT')
       or has_table_privilege('authenticated', format('private.%I', t), 'UPDATE')
       or has_table_privilege('authenticated', format('private.%I', t), 'DELETE') then
      raise exception 'FAIL: authenticated has table privileges on private.%', t;
    end if;
  end loop;

  if not has_table_privilege('service_role', 'private.profiles', 'SELECT')
     or not has_table_privilege('service_role', 'private.webhook_inbox', 'INSERT')
     or not has_table_privilege('service_role', 'private.audit_events', 'INSERT') then
    raise exception 'FAIL: expected backend service_role grants are missing';
  end if;

  raise notice 'PASS: schema isolation, no client table grants, RLS, and server grants';
end;
$$;

-- Expected result: UPDATE/DELETE against audit_events raises SQLSTATE 55000.
-- Validate this separately in a rollback-only test with a disposable test row.
