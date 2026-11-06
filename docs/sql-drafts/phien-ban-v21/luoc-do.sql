-- NhTBank core database draft v2.1 (A3.6)
-- STATUS: REVIEW ONLY. DO NOT APPLY TO ANY HOSTED SUPABASE PROJECT.
-- Target: PostgreSQL 17 / Supabase. Expected DDL owner: postgres.
-- This file is intentionally under docs/sql-drafts/, not supabase/migrations/.
--
-- Important: service_role bypasses RLS. Keep its secret server-side and
-- enforce user/business authorization in the trusted backend.
-- Confirm schema "private" is not in Supabase API > Exposed schemas.

begin;

-- Chỉ tạo mới trên database disposable đã qua preflight bên ngoài.
-- Không phải migration nâng cấp tại chỗ; psql phải dùng ON_ERROR_STOP=1.
do $$
begin
  if current_user <> 'postgres' or session_user <> 'postgres' then
    raise exception 'Expected session_user/current_user postgres; no SET ROLE migration';
  end if;
  if current_setting('server_version_num')::integer not between 170000 and 179999 then
    raise exception 'PostgreSQL 17 required';
  end if;
  if exists (
    select 1 from pg_catalog.pg_default_acl d
    cross join lateral pg_catalog.aclexplode(d.defaclacl) a
    where d.defaclrole = 'postgres'::regrole
      and (d.defaclnamespace = 0 or d.defaclnamespace = coalesce(to_regnamespace('private')::oid, 0::oid))
      and d.defaclobjtype in ('r', 'S') and a.grantee <> d.defaclrole
  ) then
    raise exception 'Unexpected global/schema table or sequence default ACL; review separately';
  end if;
end;
$$;

create schema if not exists private authorization postgres;

do $$
declare
  actual_owner text;
begin
  select r.rolname into actual_owner
  from pg_catalog.pg_namespace n
  join pg_catalog.pg_roles r on r.oid = n.nspowner
  where n.nspname = 'private';

  if exists (select 1 from pg_catalog.pg_class where relnamespace = 'private'::regnamespace)
     or exists (select 1 from pg_catalog.pg_proc where pronamespace = 'private'::regnamespace) then
    raise exception 'private must be empty; do not rerun or replace existing objects';
  end if;

  if actual_owner is distinct from 'postgres' then
    raise exception 'Unexpected owner for schema private: %. Expected postgres; review ownership before continuing.', actual_owner;
  end if;
end;
$$;

revoke all on schema private from public, anon, authenticated, service_role;
grant usage on schema private to service_role;

-- Default privileges are scoped to the object-creating role. DDL is expected
-- to run as postgres; if another owner is used, reproduce these rules for it.
alter default privileges for role postgres in schema private
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema private
  revoke all on sequences from public, anon, authenticated, service_role;
-- Per-schema default ACLs cannot revoke a global PUBLIC function grant.
-- Every function created below therefore has an explicit REVOKE; repeat that
-- explicit REVOKE for each future function added to this schema.

create table private.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name varchar(120),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated, service_role;

create trigger profiles_set_updated_at
before update on private.profiles
for each row execute function private.set_updated_at();

create table private.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_name text not null
    check (role_name in ('customer', 'support', 'operations', 'risk_analyst', 'admin')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default pg_catalog.now(),
  primary key (user_id, role_name)
);

-- Explicitly sandbox-only. No real bank account records in this first draft.
create table private.sandbox_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  provider text not null check (provider = 'sepay' and length(btrim(provider)) > 0),
  environment text not null default 'sandbox' check (environment = 'sandbox'),
  provider_account_ref text check (provider_account_ref is null or length(btrim(provider_account_ref)) > 0),
  account_label varchar(80) not null check (length(btrim(account_label)) > 0),
  currency char(3) not null default 'VND' check (currency = 'VND'),
  is_active boolean not null default true,
  created_at timestamptz not null default pg_catalog.now()
);

create unique index sandbox_accounts_provider_ref_uidx
  on private.sandbox_accounts(provider, provider_account_ref)
  where provider_account_ref is not null;

create index sandbox_accounts_owner_idx
  on private.sandbox_accounts(owner_user_id, created_at desc);

-- Imported TEST MODE transactions only; amount is an integer number of VND.
create table private.sandbox_transactions (
  id uuid primary key default gen_random_uuid(),
  sandbox_account_id uuid not null
    references private.sandbox_accounts(id) on delete restrict,
  provider_transaction_id text not null
    check (length(btrim(provider_transaction_id)) > 0),
  direction text not null check (direction in ('credit', 'debit')),
  amount_vnd bigint not null check (amount_vnd > 0),
  currency char(3) not null default 'VND' check (currency = 'VND'),
  description varchar(500),
  occurred_at timestamptz not null,
  imported_at timestamptz not null default pg_catalog.now(),
  unique (sandbox_account_id, provider_transaction_id)
);

create index sandbox_transactions_account_time_idx
  on private.sandbox_transactions(sandbox_account_id, occurred_at desc);

-- Store event identifiers and a SHA-256 digest only, never raw webhook bodies.
create table private.webhook_inbox (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'sepay'),
  provider_event_id text not null check (length(btrim(provider_event_id)) > 0),
  provider_account_ref text check (provider_account_ref is null or length(btrim(provider_account_ref)) > 0),
  event_type varchar(100) not null check (length(btrim(event_type)) > 0),
  payload_sha256 bytea not null check (octet_length(payload_sha256) = 32),
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processing', 'processed', 'failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  received_at timestamptz not null default pg_catalog.now(),
  processed_at timestamptz,
  last_error_code varchar(80),
  unique (provider, provider_event_id),
  check ((processing_status = 'processed') = (processed_at is not null))
);

create index webhook_inbox_status_time_idx
  on private.webhook_inbox(processing_status, received_at);

-- principal_key is generated by the trusted backend, never accepted as an
-- authoritative client identity. Examples: user:<uuid>, system:<service>.
-- A repeated key with a different request hash must be rejected by the backend.
create table private.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  principal_key varchar(120) not null check (length(btrim(principal_key)) > 0),
  operation_scope varchar(120) not null check (length(btrim(operation_scope)) > 0),
  idempotency_key varchar(200) not null check (length(btrim(idempotency_key)) > 0),
  request_sha256 bytea not null check (octet_length(request_sha256) = 32),
  processing_status text not null default 'started'
    check (processing_status in ('started', 'completed', 'failed')),
  resource_id uuid,
  created_at timestamptz not null default pg_catalog.now(),
  expires_at timestamptz not null,
  unique (principal_key, operation_scope, idempotency_key),
  check (expires_at > created_at)
);

create index idempotency_keys_expiry_idx
  on private.idempotency_keys(expires_at);

-- Append-only, redacted audit metadata. A DB owner/superuser can still alter
-- triggers; export important audit events to an independently controlled sink.
create table private.audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid, -- UUID lịch sử; cố ý không FK tới auth.users
  actor_type text not null check (actor_type in ('user', 'admin', 'system', 'provider')),
  action varchar(120) not null check (length(btrim(action)) > 0),
  entity_type varchar(120) not null check (length(btrim(entity_type)) > 0),
  entity_id varchar(200),
  request_id uuid,
  metadata jsonb not null default '{}'::jsonb
    check (pg_catalog.jsonb_typeof(metadata) = 'object')
    check (pg_catalog.pg_column_size(metadata) <= 8192),
  created_at timestamptz not null default pg_catalog.now()
);
-- Xóa auth.users không được sửa audit. Backend xác minh actor trước INSERT.
-- UUID lịch sử có thể trỏ tới user đã xóa; retention/pseudonymization cần review riêng.

create index audit_events_actor_time_idx
  on private.audit_events(actor_user_id, created_at desc);
create index audit_events_entity_idx
  on private.audit_events(entity_type, entity_id, created_at desc);

-- Reject row mutation and TRUNCATE. This is defense in depth, not protection
-- against a superuser or trusted table owner disabling triggers.
create function private.reject_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_events is append-only'
    using errcode = '55000';
end;
$$;

revoke all on function private.reject_audit_mutation() from public, anon, authenticated, service_role;

create trigger audit_events_no_update_delete
before update or delete on private.audit_events
for each row execute function private.reject_audit_mutation();

create trigger audit_events_no_truncate
before truncate on private.audit_events
for each statement execute function private.reject_audit_mutation();

-- RLS is enabled on every application table. There are intentionally no
-- client policies because browser/mobile direct database access is prohibited.
alter table private.profiles enable row level security;
alter table private.user_roles enable row level security;
alter table private.sandbox_accounts enable row level security;
alter table private.sandbox_transactions enable row level security;
alter table private.webhook_inbox enable row level security;
alter table private.idempotency_keys enable row level security;
alter table private.audit_events enable row level security;

-- REVOKE chỉ đúng bảy bảng; không thay ACL của object ngoài phạm vi.
revoke all on table private.profiles, private.user_roles,
  private.sandbox_accounts, private.sandbox_transactions, private.webhook_inbox,
  private.idempotency_keys, private.audit_events
  from public, anon, authenticated, service_role;
revoke all on sequence private.audit_events_id_seq
  from public, anon, authenticated, service_role;
-- REVOKE ALL bao gồm MAINTAIN trên PG17. Column ACL được assertions kiểm tra
-- độc lập; bản tạo mới không có GRANT cột, không giả định table REVOKE xóa attacl.

-- Narrow backend grants. service_role bypasses RLS and must never reach clients.
grant select, insert, update on private.profiles to service_role;
grant select, insert, delete on private.user_roles to service_role;
grant select, insert, update on private.sandbox_accounts to service_role;
grant select, insert on private.sandbox_transactions to service_role;
grant select, insert, update on private.webhook_inbox to service_role;
grant select, insert, update on private.idempotency_keys to service_role;
grant select, insert on private.audit_events to service_role;
grant usage, select on sequence private.audit_events_id_seq to service_role;

-- BEGIN A3.6 CATALOG GATE (đồng bộ với kiem-dinh.sql)
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

-- END A3.6 CATALOG GATE

-- Assertions hành vi là transaction riêng; không rollback core đã COMMIT.
commit;

-- Deferred pending separate design/review:
-- accounts/account_owners, double-entry ledger and balance invariants,
-- provider credentials/Vault, user-facing RPC/views, retention/partitioning.
