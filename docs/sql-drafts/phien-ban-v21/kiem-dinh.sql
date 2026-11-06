-- NhTBank assertions v2.1 / A3.6-2A-r1. CHƯA CHẠY SQL.
-- Chỉ database disposable đã định danh, psql -X -v ON_ERROR_STOP=1.
-- ROLLBACK không hoàn lại nextval của identity sequence.
begin;

do $$
declare
  r text;
  t text;
  p text;
  f record;
  a record;
  allowed boolean;
  expected text;
  tables text[] := array['profiles','user_roles','sandbox_accounts',
    'sandbox_transactions','webhook_inbox','idempotency_keys','audit_events'];
  privileges text[] := array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE',
    'REFERENCES','TRIGGER','MAINTAIN'];
begin
  if current_user <> 'postgres' or session_user <> 'postgres' then
    raise exception 'GATE-05: session/current role must be postgres';
  end if;
  if current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'GATE-09: PostgreSQL 17 required';
  end if;
  if (select nspowner from pg_catalog.pg_namespace where nspname='private')
       is distinct from 'postgres'::regrole::oid then
    raise exception 'GATE-05: unexpected schema owner';
  end if;

  -- Strict baseline: không role ứng dụng nào thừa hưởng/SET sang role khác,
  -- kể cả role predefined. Không tự REVOKE membership toàn cluster.
  foreach r in array array['anon','authenticated','service_role'] loop
    if not exists (select 1 from pg_catalog.pg_roles where rolname=r) then
      raise exception 'GATE-02: missing role %', r;
    end if;
    if exists (select 1 from pg_catalog.pg_roles x where x.rolname=r
      and (x.rolsuper or x.rolcreaterole or x.rolcreatedb or x.rolreplication
        or (r <> 'service_role' and x.rolbypassrls))) then
      raise exception 'GATE-02: elevated role attributes %', r;
    end if;
    if exists (select 1 from pg_catalog.pg_roles x where x.rolname<>r
      and (pg_catalog.pg_has_role(r, x.oid, 'USAGE')
        or pg_catalog.pg_has_role(r, x.oid, 'SET'))) then
      raise exception 'GATE-02: inherited/SET reachable role from %', r;
    end if;
    if pg_catalog.has_schema_privilege(r, 'private', 'CREATE')
       or pg_catalog.has_schema_privilege(r, 'private', 'USAGE') <> (r='service_role') then
      raise exception 'GATE-02: schema privileges %', r;
    end if;
  end loop;
  if not (select rolbypassrls from pg_catalog.pg_roles where rolname='service_role') then
    raise exception 'GATE-02: expected server-only BYPASSRLS contract';
  end if;
  if exists (
    select 1 from pg_catalog.pg_namespace n
    cross join lateral pg_catalog.aclexplode(coalesce(n.nspacl,
      pg_catalog.acldefault('n',n.nspowner))) acl
    where n.nspname='private' and acl.grantee<>n.nspowner
      and not (acl.grantee='service_role'::regrole::oid
        and acl.privilege_type='USAGE' and not acl.is_grantable)
  ) then
    raise exception 'GATE-02: unexpected schema ACL/grant option';
  end if;

  foreach t in array tables loop
    if not exists (select 1 from pg_catalog.pg_class c
      where c.oid=to_regclass(format('private.%I',t)) and c.relkind='r'
        and c.relowner='postgres'::regrole::oid and c.relrowsecurity) then
      raise exception 'GATE-05: table owner/kind/RLS %', t;
    end if;
    expected := case t
      when 'user_roles' then 'SELECT,INSERT,DELETE'
      when 'sandbox_transactions' then 'SELECT,INSERT'
      when 'audit_events' then 'SELECT,INSERT'
      else 'SELECT,INSERT,UPDATE' end;
    foreach r in array array['anon','authenticated','service_role'] loop
      foreach p in array privileges loop
        allowed := r='service_role' and p=any(string_to_array(expected,','));
        if pg_catalog.has_table_privilege(r,format('private.%I',t),p) <> allowed
          or pg_catalog.has_table_privilege(r,format('private.%I',t),p || ' WITH GRANT OPTION') then
          raise exception 'GATE-02: effective table ACL %, %, %',r,t,p;
        end if;
      end loop;
    end loop;
    -- PUBLIC, bên thứ ba, grant option: kiểm tra ACL trực tiếp ngoài has_*.
    for a in select acl.* from pg_catalog.pg_class c
      cross join lateral pg_catalog.aclexplode(coalesce(c.relacl,
        pg_catalog.acldefault('r',c.relowner))) acl
      where c.oid=to_regclass(format('private.%I',t))
        and acl.grantee<>c.relowner loop
      if a.grantee <> 'service_role'::regrole::oid or a.is_grantable
        or not (a.privilege_type=any(string_to_array(expected,','))) then
        raise exception 'GATE-02: unexpected direct table ACL %',t;
      end if;
    end loop;
    if exists (select 1 from pg_catalog.pg_attribute col
      cross join lateral pg_catalog.aclexplode(col.attacl) acl
      where col.attrelid=to_regclass(format('private.%I',t))
        and col.attnum>0 and not col.attisdropped
        and acl.grantee<>'postgres'::regrole::oid) then
      raise exception 'GATE-02: unexpected column ACL %',t;
    end if;
  end loop;
  if exists (select 1 from pg_catalog.pg_policy pol
    where pol.polrelid in (select c.oid from pg_catalog.pg_class c
      where c.relnamespace='private'::regnamespace and c.relname=any(tables))) then
    raise exception 'GATE-05: unexpected RLS policy';
  end if;

  if pg_catalog.pg_get_serial_sequence('private.audit_events','id')
       is distinct from 'private.audit_events_id_seq'
    or not exists (select 1 from pg_catalog.pg_class where
      oid='private.audit_events_id_seq'::regclass and relkind='S'
      and relowner='postgres'::regrole::oid) then
    raise exception 'GATE-03: identity sequence/owner';
  end if;
  foreach r in array array['anon','authenticated','service_role'] loop
    foreach p in array array['USAGE','SELECT','UPDATE'] loop
      if pg_catalog.has_sequence_privilege(r,'private.audit_events_id_seq',p)
        <> (r='service_role' and p in ('USAGE','SELECT'))
        or pg_catalog.has_sequence_privilege(r,'private.audit_events_id_seq',p || ' WITH GRANT OPTION') then
        raise exception 'GATE-03: effective sequence privilege %, %',r,p;
      end if;
    end loop;
  end loop;
  if exists (select 1 from pg_catalog.pg_class c
    cross join lateral pg_catalog.aclexplode(coalesce(c.relacl,
      pg_catalog.acldefault('S',c.relowner))) acl
    where c.oid='private.audit_events_id_seq'::regclass and acl.grantee<>c.relowner
      and not (acl.grantee='service_role'::regrole::oid
        and acl.privilege_type in ('USAGE','SELECT') and not acl.is_grantable)) then
    raise exception 'GATE-03: direct sequence ACL';
  end if;

  if (select count(*) from pg_catalog.pg_proc where pronamespace='private'::regnamespace) <> 2 then
    raise exception 'GATE-06: unexpected function inventory';
  end if;
  for f in select * from pg_catalog.pg_proc where pronamespace='private'::regnamespace loop
    if f.proowner <> 'postgres'::regrole::oid or f.prosecdef
      or f.pronargs<>0 or f.prorettype<>'pg_catalog.trigger'::regtype
      or f.proname not in ('set_updated_at','reject_audit_mutation')
      or f.proconfig is null or not (f.proconfig @> array['search_path=""']::text[])
      or (select count(*) from unnest(f.proconfig) s where s like 'search_path=%') <> 1 then
      raise exception 'GATE-06: function owner/security/search_path %',f.proname;
    end if;
    if exists (select 1 from pg_catalog.aclexplode(coalesce(f.proacl,
      pg_catalog.acldefault('f',f.proowner))) acl where acl.grantee<>f.proowner) then
      raise exception 'GATE-06: direct function EXECUTE %',f.proname;
    end if;
    foreach r in array array['anon','authenticated','service_role'] loop
      if pg_catalog.has_function_privilege(r,f.oid,'EXECUTE') then
        raise exception 'GATE-06: effective function EXECUTE %, %',r,f.proname;
      end if;
    end loop;
  end loop;

  -- Global defaults cộng với defaults theo schema. PUBLIC EXECUTE mặc định
  -- toàn cục được phép tồn tại nhưng mỗi function phải REVOKE tường minh.
  if exists (select 1 from pg_catalog.pg_default_acl d
    cross join lateral pg_catalog.aclexplode(d.defaclacl) acl
    where d.defaclrole='postgres'::regrole::oid
      and d.defaclnamespace in (0,'private'::regnamespace::oid)
      and d.defaclobjtype in ('r','S','f') and acl.grantee<>d.defaclrole
      and not (d.defaclobjtype='f' and d.defaclnamespace=0
        and acl.grantee=0 and acl.privilege_type='EXECUTE' and not acl.is_grantable)) then
    raise exception 'GATE-04: unexpected global/schema default ACL';
  end if;
  if exists (select 1 from pg_catalog.pg_constraint c
    join pg_catalog.pg_attribute col on col.attrelid=c.conrelid
      and col.attnum=any(c.conkey)
    where c.conrelid='private.audit_events'::regclass and c.contype='f'
      and col.attname='actor_user_id') then
    raise exception 'GATE-01: audit actor must remain a UUID snapshot without FK';
  end if;
  if (select count(*) from pg_catalog.pg_trigger where not tgisinternal
      and tgrelid='private.audit_events'::regclass) <> 2
    or not exists (select 1 from pg_catalog.pg_trigger where
      tgrelid='private.audit_events'::regclass and tgname='audit_events_no_update_delete'
      and tgfoid='private.reject_audit_mutation()'::regprocedure
      and tgtype=27 and tgenabled in ('O','A') and tgqual is null)
    or not exists (select 1 from pg_catalog.pg_trigger where
      tgrelid='private.audit_events'::regclass and tgname='audit_events_no_truncate'
      and tgfoid='private.reject_audit_mutation()'::regprocedure
      and tgtype=34 and tgenabled in ('O','A') and tgqual is null) then
    raise exception 'GATE-01: audit trigger definition/enabled state';
  end if;
end;
$$;

-- Disposable probes: rollback xóa object; không chạy trên shared database.
create table private.a36_default_table_probe (id integer);
create sequence private.a36_default_sequence_probe;
create function private.a36_default_function_probe() returns integer
language sql set search_path = '' as 'select 1';
revoke all on function private.a36_default_function_probe() from public, anon, authenticated, service_role;
do $$
begin
  if exists (select 1 from pg_catalog.pg_class c
    cross join lateral pg_catalog.aclexplode(coalesce(c.relacl,
      pg_catalog.acldefault(case when c.relkind='S' then 'S'::"char" else 'r'::"char" end,c.relowner))) acl
    where c.relnamespace='private'::regnamespace
      and c.relname in ('a36_default_table_probe','a36_default_sequence_probe')
      and acl.grantee<>c.relowner) or exists (
    select 1 from pg_catalog.pg_proc f
    cross join lateral pg_catalog.aclexplode(coalesce(f.proacl,
      pg_catalog.acldefault('f',f.proowner))) acl
    where f.oid='private.a36_default_function_probe()'::regprocedure and acl.grantee<>f.proowner
  ) then
    raise exception 'GATE-04: disposable default ACL probe';
  end if;
end;
$$;

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
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN'
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

    if has_table_privilege('service_role', format('private.%I', t), 'TRUNCATE')
       or has_table_privilege('service_role', format('private.%I', t), 'REFERENCES')
       or has_table_privilege('service_role', format('private.%I', t), 'TRIGGER') then
      raise exception 'FAIL: service_role has elevated table privilege on private.%', t;
    end if;
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

  -- Different principals may reuse the same operation/key; the same
  -- principal/scope/key must remain unique. Request-hash mismatch handling is
  -- an application-layer assertion and is not enforced by this unique index.
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

  -- A processed webhook must carry processed_at; this inconsistent row must fail.
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
    raise exception 'FAIL: inconsistent processed webhook state was accepted';
  end if;

  raise notice 'Assertions executed; this is not DB-01 acceptance or concurrency evidence';
end;
$$;


do $$
declare rejected boolean := false;
begin
  -- Snapshot actor không cần tồn tại trong auth.users; không tạo user thật.
  insert into private.audit_events(actor_user_id,actor_type,action,entity_type)
    values ('00000000-0000-0000-0000-000000000007','user','snapshot_probe','test');
  begin
    insert into private.audit_events(actor_type,action,entity_type,metadata)
      values ('system','invalid_metadata','test','[]'::jsonb);
  exception when check_violation then rejected := true;
  end;
  if not rejected then raise exception 'GATE-01: non-object metadata accepted'; end if;
  insert into private.webhook_inbox(provider,provider_event_id,event_type,payload_sha256)
    values ('sepay','a36-duplicate-event','test',decode(repeat('00',32),'hex'));
  rejected := false;
  begin
    insert into private.webhook_inbox(provider,provider_event_id,event_type,payload_sha256)
      values ('sepay','a36-duplicate-event','test',decode(repeat('01',32),'hex'));
  exception when unique_violation then rejected := true;
  end;
  if not rejected then raise exception 'GATE-07: duplicate webhook accepted'; end if;
  rejected := false;
  begin
    insert into private.webhook_inbox(provider,provider_event_id,event_type,payload_sha256,
      processing_status,processed_at) values ('sepay','a36-invalid-received','test',
      decode(repeat('00',32),'hex'),'received',pg_catalog.now());
  exception when check_violation then rejected := true;
  end;
  if not rejected then raise exception 'GATE-07: received with processed_at accepted'; end if;
end;
$$;

rollback;
