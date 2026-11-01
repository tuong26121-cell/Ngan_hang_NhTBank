# NhTBank SQL v3 — free local PostgreSQL test pack

**Purpose:** prepare a repeatable, no-cost local test path for the v3 review drafts.
**Execution status:** NOT RUN. This pack does not connect to Supabase Production.

## Safety boundaries

- Use a disposable Supabase Local stack on a computer you control.
- Do not run this against a hosted Supabase URL, a linked project, staging, or Production.
- The runner accepts only an exact URI for `localhost` or `127.0.0.1`, port `54322`, database `postgres`; it rejects query parameters that could override the connection target.
- The runner requires PostgreSQL 17+ and the Supabase bootstrap objects/roles.
- It applies the core draft and runs assertions. The core draft creates objects and commits; use a fresh disposable local database for every run.
- The assertions run inside a transaction and roll back their probe rows.
- No CI runner, cloud database, paid branch, paid compute, or external test service is used.
- Do not put real customer data, secrets, production keys, or actual bank credentials into tests.

## Files

- `run-local.sh` — guarded runner; requires `psql` and an explicitly supplied local connection URL.
- `TEST_MATRIX.md` — coverage, expected behavior and test gaps.
- SQL under `../` — the active v3 core and security assertions.

## Requirements

On a local computer:
- PostgreSQL client `psql` compatible with PostgreSQL 17.
- Supabase CLI.
- Docker-compatible container runtime.
- Enough free disk space for local Supabase images and data.
- Supabase Local may need around 7 GB RAM for the full stack according to current CLI documentation.

Supabase Local runs in containers on the computer. Android ChatGPT alone cannot host the local PostgreSQL/Supabase stack. No Windows computer is currently available to the user, so this pack is prepared but cannot currently be executed from the known environment.

## Create an isolated local stack

Do this in a terminal on a supported computer. Keep it separate from the NhTBank repository so no project linking or production configuration is needed.

```bash
mkdir -p "$HOME/nhtbank-sql-v3-test"
cd "$HOME/nhtbank-sql-v3-test"
supabase init
supabase start
supabase status
```

- Do not run `supabase login` or `supabase link`.
- Do not use `--linked`, `--remote`, or any hosted database URL.
- Use the local database URL printed by `supabase status`. The default local Postgres port is 54322; confirm the actual URL from your local CLI output.
- The default local database password is normally `postgres`; use the value shown by your local setup.

## Run the test pack

From the NhTBank repository checkout on branch `codex/nhtbank-sql-hardening-20261031`:

```bash
chmod +x docs/sql-drafts/testing/run-local.sh
LOCAL_DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:54322/postgres' \
  docs/sql-drafts/testing/run-local.sh
```

Replace the example URL only with the local URL printed by your local Supabase CLI. The script rejects any hostname other than localhost/127.0.0.1, any port other than 54322, and any database other than postgres. It does not accept arbitrary connection URLs.

A successful run prints:
- `PREFLIGHT PASS`
- `CORE DRAFT APPLIED`
- The final assertion NOTICE and `ASSERTIONS PASS`

If any SQL statement fails, `psql` exits non-zero and the script stops. Record the exact error and do not describe the run as passing.

## Fresh database requirement

The core draft uses `CREATE TABLE` and is a one-time schema bootstrap, not an idempotent migration. Run it only on a newly created disposable Supabase Local database. For a repeat run, destroy/recreate the disposable local stack/data first, following the CLI help for your installed version. Do not use a reset command with `--linked` or `--db-url`.

After testing, stop the local stack from its temporary project directory:

```bash
supabase stop
```

This stops local services but retains local data. If you intentionally want to discard the throwaway test data, consult `supabase stop --help` and use the local-only data removal option. Verify the current directory and local project before doing so.

## Expected result and reporting

Use `TEST_MATRIX.md` to record each test as PASS, FAIL, or NOT RUN. A SQL script passing does not prove application authorization, concurrent request handling, real webhook signature verification, or regulatory compliance. Those require separate backend integration/security tests.

## Current status

Prepared only. No local PostgreSQL server or Supabase Local stack is available in the current ChatGPT execution environment; earlier environment inspection found `psql`, `postgres`, `docker`, `supabase`, and PostgreSQL parser packages absent. This pack has not executed SQL and has no test results.
