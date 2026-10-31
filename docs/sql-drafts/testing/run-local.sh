#!/usr/bin/env bash
set -Eeuo pipefail

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 2
}

command -v psql >/dev/null 2>&1 || fail "psql is required. Install PostgreSQL 17 client tools."
[[ -n "${LOCAL_DATABASE_URL:-}" ]] || fail "Set LOCAL_DATABASE_URL to the disposable Supabase Local database URL."

# Strict allow-list: never accept a hosted hostname, alternate port, or database.
# Credentials may be present in the URL, but it must target local loopback only.
if [[ ! "$LOCAL_DATABASE_URL" =~ ^postgres(ql)?://([^/@?]+@)?(localhost|127\.0\.0\.1):54322/postgres$ ]]; then
  fail "Refusing connection. Only an exact localhost/127.0.0.1:54322/postgres URI without query parameters is allowed."
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CORE_SQL="$SCRIPT_DIR/../20261031_000001_nhtbank_core_schema.draft.sql"
ASSERT_SQL="$SCRIPT_DIR/../20261031_000002_nhtbank_security_assertions.draft.sql"

[[ -s "$CORE_SQL" ]] || fail "Core SQL draft not found: $CORE_SQL"
[[ -s "$ASSERT_SQL" ]] || fail "Security assertions SQL not found: $ASSERT_SQL"

printf '%s\n' "== NhTBank SQL v3 local-only test runner =="
printf '%s\n' "Target allow-list: localhost/127.0.0.1:54322/postgres"
printf '%s\n' "No hosted database target is accepted."

psql "$LOCAL_DATABASE_URL" -X -v ON_ERROR_STOP=1 <<'SQL'
do $preflight$
declare
  required_role text;
begin
  if current_database() <> 'postgres' then
    raise exception 'Preflight failed: expected database postgres, got %', current_database();
  end if;

  if current_user <> 'postgres' then
    raise exception 'Preflight failed: expected current_user postgres, got %', current_user;
  end if;

  if current_setting('server_version_num')::integer < 170000 then
    raise exception 'Preflight failed: PostgreSQL 17+ required; server_version=%',
      current_setting('server_version');
  end if;

  if to_regclass('auth.users') is null then
    raise exception 'Preflight failed: auth.users is missing; use a Supabase Local database, not plain PostgreSQL';
  end if;

  foreach required_role in array array['anon', 'authenticated', 'service_role'] loop
    if not exists (select 1 from pg_catalog.pg_roles where rolname = required_role) then
      raise exception 'Preflight failed: required Supabase role % is missing', required_role;
    end if;
  end loop;
end;
$preflight$;
select 'PREFLIGHT PASS — PostgreSQL 17+ and Supabase local bootstrap objects detected' as result;
SQL

printf '%s\n' "== Applying core draft to disposable local database =="
psql "$LOCAL_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$CORE_SQL"
printf '%s\n' "CORE DRAFT APPLIED"

printf '%s\n' "== Running transactional security assertions =="
psql "$LOCAL_DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$ASSERT_SQL"
printf '%s\n' "ASSERTIONS PASS"

printf '%s\n' "== COMPLETE =="
printf '%s\n' "This result applies only to this disposable local database and this exact commit."
