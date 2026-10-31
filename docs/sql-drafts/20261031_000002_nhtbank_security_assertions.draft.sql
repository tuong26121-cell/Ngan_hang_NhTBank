-- NhTBank draft security assertions v2
-- Run ONLY in a disposable local Supabase/PostgreSQL database after applying
-- the companion draft as postgres. Never run against hosted Production.
--
-- The script rolls back all test data. It does not change hosted project state.

begin;

do $$
declare
  t text;
  p text;
  app_tables text[] := array[
    'profiles',
    'user_roles',
    'sandbox_accounts',
    'sandbox_transactions',
    'webhook_inbox',
    'idempotency_keys',
    'audit_events'
  ];
  forbidden_privileges text[] := array[
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'
  ];
  audit_id bigint;
  rejected boolean;
begin
  if current_user <> 'postgres' then
    raise exception 'Run assertions as postgres; current_user is %', current_user;
  end if;

  if not exists (
    select 1 from pg_catalog.pg_namespace n
    join pg_catalog.pg_roles r on r.oid = n.nspowner
    where n.nspname = 'private' and r.rolname = 'postgres'
  ) then
    raise exception 'FAIL: private schema owner is not postgres';
  end if;

  if has_schema_privilege('anon', 'private', 'USAGE')
     or has_schema_privilege('authenticated', 'private', 'USAGE') then
    raise exception 'FAIL: client role has USAGE on private schema';
  end if;

  foreach t in array app_tables loop
    if not exists (
      select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'private'
        and c.relname = t
        and c.relkind in ('r', 'p')
        and c.relrowsecurity
    ) then
      raise exception 'FAIL: RLS missing on private.%', t;
    end if;

    if exists (
      select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      join pg_catalog.pg_roles owner_role on owner_role.oid = c.relowner
      where n.nspname = 'private'
        and c.relname = t
        and owner_role.rolname in ('anon', 'authenticated', 'service_role')
    ) then
      raise exception 'FAIL: untrusted role owns private.%', t;
    end if;

    foreach p in array forbidden_privileges loop
      if has_table_privilege('anon', format('private.%I', t), p)
         or has_table_privilege('authenticated', format('private.%I', t), p) then
        raise exception 'FAIL: client role has % on private.%', p, t;
      end if;
    end loop;
  end loop;

  -- Verify the intended narrow server grants and absence of high-risk grants.
  if not has_table_privilege('service_role', 'private.profiles', 'SELECT')
     or not has_table_privilege('service_role', 'private.profiles', 'UPDATE')
     or has_table_privilege('service_role', 'private.profiles', 'DELETE')
     or not has_table_privilege('service_role', 'private.user_roles', 'INSERT')
     or has_table_privilege('service_role', 'private.user_roles', 'UPDATE')
     or not has_table_privilege('service_role', 'private.user_roles', 'DELETE')
     or not has_table_privilege('service_role', 'private.webhook_inbox', 'UPDATE')
     or not has_table_privilege('service_role', 'private.audit_events', 'INSERT')
     or has_table_privilege('service_role', 'private.audit_events', 'UPDATE')
     or has_table_privilege('service_role', 'private.audit_events', 'DELETE')
     or has_table_privilege('service_role', 'private.audit_events', 'TRUNCATE') then
    raise exception 'FAIL: service_role grants differ from the intended least-privilege matrix';
  end if;

  if not has_sequence_privilege('service_role', 'private.audit_events_id_seq', 'USAGE')
     or has_sequence_privilege('anon', 'private.audit_events_id_seq', 'USAGE')
     or has_sequence_privilege('authenticated', 'private.audit_events_id_seq', 'USAGE') then
    raise exception 'FAIL: audit sequence grants are incorrect';
  end if;

  -- Verify no PUBLIC EXECUTE ACL remains on private functions.
  if exists (
    select 1
    from pg_catalog.pg_proc f
    join pg_catalog.pg_namespace n on n.oid = f.pronamespace
    cross join lateral pg_catalog.aclexplode(
      coalesce(f.proacl, pg_catalog.acldefault('f', f.proowner))
    ) acl
    where n.nspname = 'private'
      and acl.grantee = 0
      and acl.privilege_type = 'EXECUTE'
  ) then
    raise exception 'FAIL: a private function is executable by PUBLIC';
  end if;

  -- No permissive client policies should exist in this server-only design.
  if exists (
    select 1
    from pg_catalog.pg_policy pol
    join pg_catalog.pg_class c on c.oid = pol.polrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'private'
      and c.relname = any(app_tables)
  ) then
    raise exception 'FAIL: unexpected RLS policy exists in private';
  end if;

  -- Exercise audit UPDATE, DELETE and TRUNCATE guards; every probe must fail
  -- with SQLSTATE 55000. The surrounding transaction is rolled back below.
  insert into private.audit_events (
    actor_type, action, entity_type, entity_id, metadata
  ) values (
    'system', 'security_assertion_probe', 'test', 'rollback-only',
    '{"test": true}'::jsonb
  ) returning id into audit_id;

  rejected := false;
  begin
    update private.audit_events set action = 'tampered' where id = audit_id;
  exception when sqlstate '55000' then
    rejected := true;
  end;
  if not rejected then
    raise exception 'FAIL: audit UPDATE was not rejected with SQLSTATE 55000';
  end if;

  rejected := false;
  begin
    delete from private.audit_events where id = audit_id;
  exception when sqlstate '55000' then
    rejected := true;
  end;
  if not rejected then
    raise exception 'FAIL: audit DELETE was not rejected with SQLSTATE 55000';
  end if;

  rejected := false;
  begin
    execute 'truncate table private.audit_events';
  exception when sqlstate '55000' then
    rejected := true;
  end;
  if not rejected then
    raise exception 'FAIL: audit TRUNCATE was not rejected with SQLSTATE 55000';
  end if;

  raise notice 'PASS: client isolation, RLS, ownership, role grants, default ACLs and audit mutation guards';
end;
$$;

rollback;
