#!/usr/bin/env python3
"""PG17 disposable only. No DSN input, no hosted endpoint, no published port.

Requires a previously pulled postgres:17-bookworm image and explicit --thuc-hien.
Uses a local Docker socket, network=none, tmpfs PGDATA and synthetic auth fixture.
This verifies PostgreSQL semantics, not a complete Supabase/Auth deployment.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
import re
from pathlib import Path
import subprocess
import time
from threading import Barrier
import uuid

ROOT = Path(__file__).resolve().parents[2]
SQL = ROOT / 'docs/sql-drafts/phien-ban-v21'
DOCKER = ['docker', '--host=unix:///var/run/docker.sock']
ENV = {k: v for k, v in os.environ.items() if k not in
       ('DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH')}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--thuc-hien', action='store_true', required=True)
    parser.add_argument('--dau-ra', type=Path, required=True)
    args = parser.parse_args()
    args.dau_ra.mkdir(parents=True, exist_ok=True)
    records = []
    label = 'nhtbank-qa13-' + uuid.uuid4().hex[:12]
    container = None
    image = json.loads(subprocess.check_output(DOCKER + ['image', 'inspect', 'postgres:17-bookworm'], env=ENV))[0]
    image_id = image['Id']
    summary = {'source_commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
               'runner_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
               'image_id': image_id, 'repo_digests': image.get('RepoDigests'), 'tests': records,
               'scope': 'PostgreSQL17 + synthetic auth.users/roles; not Supabase API/Auth/ledger'}
    for path in (SQL / 'luoc-do.sql', SQL / 'kiem-dinh.sql'):
        summary[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()

    def run(name, command, *, sql=None, expected=0, contains=None):
        result = subprocess.run(command, env=ENV, input=sql, text=True, capture_output=True, timeout=90)
        output = result.stdout + result.stderr
        (args.dau_ra / (name + '.log')).write_text(output)
        ok = result.returncode == expected and (contains is None or contains in output)
        records.append({'id': name, 'exit_code': result.returncode, 'expected_exit': expected,
                        'expected_text': contains, 'status': 'PASS' if ok else 'FAIL'})
        print(name, records[-1]['status'], flush=True)
        if not ok:
            raise RuntimeError(name + ': ' + output[-2500:])
        return output

    def psql(name, sql, **options):
        return run(name, DOCKER + ['exec', '-i', container, 'psql', '-X', '-U', 'postgres',
                   '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose'], sql=sql, **options)

    def create():
        nonlocal container
        container = subprocess.check_output(DOCKER + ['run', '-d', '--network=none',
            '--label', 'nhtbank.qa13=' + label, '--tmpfs', '/var/lib/postgresql/data:rw',
            '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', image_id,
            'postgres', '-c', 'listen_addresses=', '-c', 'statement_timeout=10000',
            '-c', 'lock_timeout=2000'], env=ENV, text=True).strip()
        info = json.loads(subprocess.check_output(DOCKER + ['inspect', container], env=ENV))[0]
        assert info['HostConfig']['NetworkMode'] == 'none'
        assert not info['HostConfig'].get('PortBindings')
        assert info['HostConfig']['Tmpfs'].get('/var/lib/postgresql/data') == 'rw'
        assert not any(m['Type'] in ('volume', 'bind') for m in info['Mounts'])
        (args.dau_ra / ('identity-' + container[:12] + '.json')).write_text(json.dumps({
            'container_id': container, 'image_id': info['Image'], 'label': label,
            'network': 'none', 'ports': info['HostConfig'].get('PortBindings'),
            'mounts': info['Mounts'], 'postgres_version_binary': subprocess.check_output(
                DOCKER + ['exec', container, 'postgres', '--version'], env=ENV, text=True).strip()}, indent=2))
        for _ in range(60):
            if subprocess.run(DOCKER + ['exec', container, 'pg_isready', '-U', 'postgres'],
                              env=ENV, capture_output=True).returncode == 0:
                break
            time.sleep(.5)
        else:
            raise RuntimeError('Postgres not ready')

    def destroy():
        nonlocal container
        if container:
            info = json.loads(subprocess.check_output(DOCKER + ['inspect', container], env=ENV))[0]
            assert info['Config']['Labels']['nhtbank.qa13'] == label
            subprocess.run(DOCKER + ['rm', '-f', container], env=ENV, check=True, capture_output=True)
            container = None

    preflight = """
select version(), current_user, session_user, current_database(), inet_server_addr();
select system_identifier from pg_control_system();
do $$ begin
 if current_setting('server_version_num')::int not between 170000 and 179999
 or current_user <> 'postgres' or session_user <> 'postgres'
 or not (select rolsuper from pg_roles where rolname=current_user)
 or to_regnamespace('private') is not null then raise exception 'unsafe baseline'; end if;
end $$;
"""
    bootstrap = """
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth authorization postgres;
create table auth.users(id uuid primary key);
"""
    core = (SQL / 'luoc-do.sql').read_text()
    assertions = (SQL / 'kiem-dinh.sql').read_text()
    catalog = assertions[assertions.index('do $$'):assertions.index('-- Disposable probes:')]
    try:
        # Recovery proof BEFORE core: recreate a clean cluster with a new identity.
        create()
        psql('01-preflight-recovery-origin', preflight)
        psql('02-synthetic-fixture-origin', bootstrap)
        destroy()
        create()
        psql('03-preflight-recreated', preflight)
        psql('04-synthetic-fixture', bootstrap)
        # Fail a catalog gate before core COMMIT; the fresh connection must see
        # neither schema nor tables. No source file is modified for this mutant.
        bad_core = core.replace(catalog, 'grant maintain on private.profiles to service_role;\n' + catalog, 1)
        if bad_core == core:
            raise RuntimeError('catalog block not found in core')
        psql('04b-core-precommit-rejected', bad_core, expected=3, contains='GATE-02')
        psql('04c-core-rollback-verified', """
do $$ begin if to_regnamespace('private') is not null then
 raise exception 'partial core survived rollback'; end if; end $$;
""")
        psql('05-core', core)
        psql('06-assertions', assertions)
        psql('07-reapply-rejected', core, expected=3, contains='private must be empty')
        psql('08-post-reapply-assertions', assertions)
        psql('09-audit-actor-deletion', """
begin;
insert into auth.users values ('00000000-0000-4000-8000-000000000013');
insert into private.audit_events(actor_user_id,actor_type,action,entity_type)
 values ('00000000-0000-4000-8000-000000000013','user','qa13','test');
delete from auth.users where id='00000000-0000-4000-8000-000000000013';
do $$ begin
 if (select count(*) from private.audit_events where actor_user_id='00000000-0000-4000-8000-000000000013')<>1
 then raise exception 'audit snapshot changed'; end if;
end $$;
rollback;
""")
        injections = {
            'maintain': 'grant maintain on private.profiles to service_role;',
            'column': 'grant select(display_name) on private.profiles to authenticated;',
            'public-table': 'grant select on private.profiles to public;',
            'schema-create': 'grant create on schema private to service_role;',
            'sequence-update': 'grant update on sequence private.audit_events_id_seq to service_role;',
            'function-execute': 'grant execute on function private.set_updated_at() to authenticated;',
            'set-role': 'create role qa13_escalation; grant qa13_escalation to authenticated;',
            'global-default': 'alter default privileges for role postgres grant select on tables to authenticated;',
            'grant-option': 'grant select on private.profiles to service_role with grant option;',
            'function-search-path': 'alter function private.set_updated_at() set search_path=public;',
            'rls-disabled': 'alter table private.profiles disable row level security;',
        }
        for name, injection in injections.items():
            psql('10-negative-' + name, 'begin;\n' + injection + '\n' + catalog + '\nrollback;', expected=3, contains='GATE-')
        for role in ('anon', 'authenticated'):
            psql('11-client-denied-' + role, 'begin; set local role ' + role + '; select * from private.profiles;',
                 expected=3, contains='42501')
        for name, statement in {
            'update': "update private.audit_events set action='tampered'",
            'delete': 'delete from private.audit_events',
            'truncate': 'truncate private.audit_events',
        }.items():
            psql('11-audit-service-denied-' + name, 'begin; set local role service_role; ' + statement + ';',
                 expected=3, contains='42501')
        psql('12-rls-deny-with-temporary-acl', """
begin;
insert into auth.users values ('00000000-0000-4000-8000-000000000013');
insert into private.profiles(user_id) values ('00000000-0000-4000-8000-000000000013');
grant usage on schema private to authenticated;
grant select on private.profiles to authenticated;
set local role authenticated;
do $$ begin if (select count(*) from private.profiles)<>0 then raise exception 'RLS leak'; end if; end $$;
rollback;
""")
        # Uniqueness primitive only: there is no transfer/ledger in this schema.
        barrier = Barrier(10)
        concurrent_sql = """
select 'QA13_PID=' || pg_backend_pid();
select pg_sleep(1);
begin;
insert into private.idempotency_keys(principal_key,operation_scope,idempotency_key,request_sha256,expires_at)
 values ('user:qa13','primitive-only','ten-connections',decode(repeat('13',32),'hex'),now()+interval '1 day');
select pg_sleep(.3);
commit;
"""
        def claim(index):
            barrier.wait(timeout=10)
            result = subprocess.run(DOCKER + ['exec', '-i', container, 'psql', '-X', '-U', 'postgres',
                '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose'],
                env=ENV, input=concurrent_sql, text=True, capture_output=True, timeout=30)
            output = result.stdout + result.stderr
            (args.dau_ra / ('14-connection-' + str(index) + '.log')).write_text(output)
            return result.returncode, output
        with ThreadPoolExecutor(max_workers=10) as pool:
            outcomes = list(pool.map(claim, range(10)))
        pids = [re.search(r'QA13_PID=(\d+)', output).group(1) for _, output in outcomes]
        ok = (len(set(pids)) == 10 and sum(code == 0 for code, _ in outcomes) == 1
              and sum(code == 3 and '23505' in output for code, output in outcomes) == 9)
        records.append({'id': '14-ten-connections-unique-primitive', 'backend_pids': pids,
                        'status': 'PASS' if ok else 'FAIL', 'scope': 'not a transfer test'})
        if not ok:
            raise RuntimeError('10-connection uniqueness failed')
        psql('15-concurrent-persisted-count', """
do $$ begin if (select count(*) from private.idempotency_keys
 where principal_key='user:qa13' and operation_scope='primitive-only' and idempotency_key='ten-connections')<>1
 then raise exception 'duplicate primitive rows'; end if; end $$;
""")
        psql('13-final-assertions', assertions)
    finally:
        destroy()
        summary['cleanup'] = 'verified labelled container removed; tmpfs discarded'
        (args.dau_ra / 'ket-qua-sql.json').write_text(json.dumps(summary, indent=2) + '\n')


if __name__ == '__main__':
    main()
