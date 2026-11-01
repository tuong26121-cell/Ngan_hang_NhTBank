-- NhTBank draft security assertions v3
-- Run ONLY in a disposable local Supabase/PostgreSQL database after applying
-- the companion draft as postgres. Never run against hosted Production.
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
  all_table_privileges text[] := array[
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE',
    'REFERENCES', 'TRIGGER', 'MAINTAIN'
  ];
  expected_service_privileges text[];
  audit_id bigint;
  purged_count integer;
  rejected boolean;
  table_name text;
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

  if exists (
    select 1
    from pg_catalog.pg_namespace n
    cross join lateral pg_catalog.aclexplode(
      coalesce(n.nspacl, pg_catalog.acldefault('n', n.nspowner))
    ) acl
    where n.nspname = 'private'
      and acl.grantee = 0
      and acl.privilege_type = 'USAGE'
  ) then
    raise exception 'FAIL: PUBLIC has USAGE on private schema';
  end if;

  if not has_schema_privilege('service_role', 'private', 'USAGE') then
    raise exception 'FAIL: service_role is missing USAGE on private schema';
  end if;

  if has_schema_privilege('service_role', 'private', 'CREATE')
     or has_schema_privilege('anon', 'private', 'CREATE')
     or has_schema_privilege('authenticated', 'private', 'CREATE') then
    raise exception 'FAIL: service_role/client role must not have CREATE on private schema';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_namespace n
    cross join lateral pg_catalog.aclexplode(
      coalesce(n.nspacl, pg_catalog.acldefault('n', n.nspowner))
    ) acl
    where n.nspname = 'private'
      and acl.grantee = 0
      and acl.privilege_type = 'CREATE'
  ) then
    raise exception 'FAIL: PUBLIC has CREATE on private schema';
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
        and owner_role.rolname <> 'postgres'
    ) then
      raise exception 'FAIL: private.% is not owned by postgres', t;
    end if;

    foreach p in array all_table_privileges loop
      if has_table_privilege('anon', format('private.%I', t), p)
         or has_table_privilege('authenticated', format('private.%I', t), p) then
        raise exception 'FAIL: PUBLIC/client role has % on private.%', p, t;
      end if;
    end loop;

    if exists (
      select 1
      from pg_catalog.pg_class c
      join pg_catalog.pg_namespace n on n.oid = c.relnamespace
      cross join lateral pg_catalog.aclexplode(
        coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
      ) acl
      where n.nspname = 'private'
        and c.relname = t
        and acl.grantee = 0
    ) then
      raise exception 'FAIL: PUBLIC has an explicit ACL entry on private.%', t;
    end if;

    expected_service_privileges := case t
      when 'profiles' then array['SELECT', 'INSERT', 'UPDATE']
      when 'user_roles' then array['SELECT', 'INSERT', 'DELETE']
      when 'sandbox_accounts' then array['SELECT', 'INSERT', 'UPDATE']
      when 'sandbox_transactions' then array['SELECT', 'INSERT']
      when 'webhook_inbox' then array['SELECT', 'INSERT', 'UPDATE']
      when 'idempotency_keys' then array['SELECT', 'INSERT', 'UPDATE']
      when 'audit_events' then array['SELECT', 'INSERT']
      else array[]::text[]
    end;

    foreach p in array all_table_privileges loop
      if has_table_privilege('service_role', format('private.%I', t), p)
         <> (p = any(expected_service_privileges)) then
        raise exception 'FAIL: service_role privilege % on private.% does not match least-privilege matrix', p, t;
      end if;
    end loop;
  end loop;

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

  -- Sequence must be private to the backend, with no PUBLIC/client ACLs.
  if not has_sequence_privilege('service_role', 'private.audit_events_id_seq', 'USAGE')
     or not has_sequence_privilege('service_role', 'private.audit_events_id_seq', 'SELECT')
     or has_sequence_privilege('service_role', 'private.audit_events_id_seq', 'UPDATE')
     or has_sequence_privilege('anon', 'private.audit_events_id_seq', 'USAGE')
     or has_sequence_privilege('authenticated', 'private.audit_events_id_seq', 'USAGE') then
    raise exception 'FAIL: audit sequence grants are incorrect';
  end if;

  if not has_sequence_privilege('service_role', 'private.audit_events_id_seq', 'USAGE')
     or not has_sequence_privilege('service_role', 'private.audit_events_id_seq', 'SELECT')
     or has_sequence_privilege('service_role', 'private.audit_events_id_seq', 'UPDATE')
     or has_sequence_privilege('anon', 'private.audit_events_id_seq', 'USAGE')
     or has_sequence_privilege('anon', 'private.audit_events_id_seq', 'SELECT')
     or has_sequence_privilege('anon', 'private.audit_events_id_seq', 'UPDATE')
     or has_sequence_privilege('authenticated', 'private.audit_events_id_seq', 'USAGE')
     or has_sequence_privilege('authenticated', 'private.audit_events_id_seq', 'SELECT')
     or has_sequence_privilege('authenticated', 'private.audit_events_id_seq', 'UPDATE') then
    raise exception 'FAIL: audit sequence grants are incorrect';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    join pg_catalog.pg_roles owner_role on owner_role.oid = c.relowner
    where n.nspname = 'private' and c.relkind = 'S'
      and owner_role.rolname <> 'postgres'
  ) then
    raise exception 'FAIL: a private sequence is not owned by postgres';
  end if;

  -- Functions are postgres-owned. No PUBLIC/client execution; only the bounded
  -- cleanup function is executable by service_role.
  if exists (
    select 1
    from pg_catalog.pg_proc f
    join pg_catalog.pg_namespace n on n.oid = f.pronamespace
    join pg_catalog.pg_roles owner_role on owner_role.oid = f.proowner
    where n.nspname = 'private'
      and owner_role.rolname <> 'postgres'
  ) then
    raise exception 'FAIL: a private function is not owned by postgres';
  end if;

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

  if exists (
    select 1
    from pg_catalog.pg_proc f
    join pg_catalog.pg_namespace n on n.oid = f.pronamespace
    where n.nspname = 'private'
      and (
        has_function_privilege('anon', f.oid, 'EXECUTE')
        or has_function_privilege('authenticated', f.oid, 'EXECUTE')
      )
  ) then
    raise exception 'FAIL: a private function is executable by a client role';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_proc f
    join pg_catalog.pg_namespace n on n.oid = f.pronamespace
    where n.nspname = 'private'
      and has_function_privilege('service_role', f.oid, 'EXECUTE')
      and f.oid <> 'private.purge_expired_idempotency_keys(integer)'::regprocedure
  ) then
    raise exception 'FAIL: service_role can execute an unapproved private function';
  end if;

  if has_function_privilege(
       'service_role',
       'private.set_updated_at()'::regprocedure,
       'EXECUTE'
     )
     or has_function_privilege(
       'service_role',
       'private.reject_audit_mutation()'::regprocedure,
       'EXECUTE'
     )
     or not has_function_privilege(
       'service_role',
       'private.purge_expired_idempotency_keys(integer)'::regprocedure,
       'EXECUTE'
     ) then
    raise exception 'FAIL: service_role function execution grants are incorrect';
  end if;

  -- Audit actor UUID is a historical snapshot, not an FK that would attempt
  -- to UPDATE an append-only row when auth.users is deleted.
  if exists (
    select 1
    from pg_catalog.pg_constraint con
    where con.conrelid = 'private.audit_events'::regclass
      and con.contype = 'f'
  ) then
    raise exception 'FAIL: audit_events unexpectedly has a foreign key';
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

  -- Different principals may reuse the same operation/key; the same
  -- principal/scope/key must remain unique. Hash mismatch is backend logic.
  insert into private.idempotency_keys (
    principal_key, operation_scope, idempotency_key, request_sha256, expires_at
  ) values
    ('user:assertion-a', 'transfer:create', 'same-key', decode(repeat('00', 32), 'hex'), pg_catalog.now() + interval '1 day'),
    ('user:assertion-b', 'transfer:create', 'same-key', decode(repeat('00', 32), 'hex'), pg_catalog.now() + interval '1 day');

  rejected := false;
  begin
    insert into private.idempotency_keys (
      principal_key, operation_scope, idempotency_key, request_sha256, expires_at
    ) values (
      'user:assertion-a', 'transfer:create', 'same-key',
      decode(repeat('00', 32), 'hex'), pg_catalog.now() + interval '1 day'
    );
  exception when unique_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'FAIL: duplicate idempotency key for the same principal was accepted';
  end if;

  -- Expired terminal records are purged in bounded batches; expired started
  -- records are deliberately retained for recovery/reconciliation.
  insert into private.idempotency_keys (
    principal_key, operation_scope, idempotency_key, request_sha256,
    processing_status, expires_at
  ) values
    ('system:assertion', 'cleanup:test', 'expired-completed', decode(repeat('11', 32), 'hex'), 'completed', pg_catalog.now() - interval '1 day'),
    ('system:assertion', 'cleanup:test', 'expired-started', decode(repeat('22', 32), 'hex'), 'started', pg_catalog.now() - interval '1 day');

  purged_count := private.purge_expired_idempotency_keys(10);
  if purged_count < 1 then
    raise exception 'FAIL: expired terminal idempotency row was not purged';
  end if;

  if exists (
    select 1 from private.idempotency_keys
    where principal_key = 'system:assertion'
      and operation_scope = 'cleanup:test'
      and idempotency_key = 'expired-completed'
  ) then
    raise exception 'FAIL: expired completed idempotency row remains after cleanup';
  end if;

  if not exists (
    select 1 from private.idempotency_keys
    where principal_key = 'system:assertion'
      and operation_scope = 'cleanup:test'
      and idempotency_key = 'expired-started'
  ) then
    raise exception 'FAIL: cleanup removed an in-flight started idempotency row';
  end if;

  -- Duplicate webhook delivery with the same provider/event ID must be rejected.
  insert into private.webhook_inbox (
    provider, provider_event_id, event_type, payload_sha256
  ) values (
    'sepay', 'assertion-duplicate-event', 'test',
    decode(repeat('33', 32), 'hex')
  );

  rejected := false;
  begin
    insert into private.webhook_inbox (
      provider, provider_event_id, event_type, payload_sha256
    ) values (
      'sepay', 'assertion-duplicate-event', 'test',
      decode(repeat('33', 32), 'hex')
    );
  exception when unique_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'FAIL: duplicate provider webhook event was accepted';
  end if;

  -- Processed requires processed_at; non-processed states must not have it.
  rejected := false;
  begin
    insert into private.webhook_inbox (
      provider, provider_event_id, event_type, payload_sha256,
      processing_status, processed_at
    ) values (
      'sepay', 'assertion-invalid-processed', 'test',
      decode(repeat('00', 32), 'hex'), 'processed', null
    );
  exception when check_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'FAIL: processed webhook without processed_at was accepted';
  end if;

  rejected := false;
  begin
    insert into private.webhook_inbox (
      provider, provider_event_id, event_type, payload_sha256,
      processing_status, processed_at
    ) values (
      'sepay', 'assertion-invalid-received', 'test',
      decode(repeat('00', 32), 'hex'), 'received', pg_catalog.now()
    );
  exception when check_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'FAIL: non-processed webhook with processed_at was accepted';
  end if;

  raise notice 'PASS: schema isolation, exact table/sequence/function ACLs, ownership, RLS, audit guards, idempotency cleanup and webhook state constraints';
end;
$$;

rollback;
