#!/usr/bin/env python3
"""Kiểm tra văn bản/patch cục bộ; không kết nối hay thực thi SQL."""
from pathlib import Path
import difflib
import hashlib
import json
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SOURCE = 'docs/sql-drafts/archive/v2/'
FILES = [
    ('20261031_000001_nhtbank_core_schema.draft.sql', 'luoc-do.sql',
     '48ed0ab6adec0ffa3091e081924d051e2a6a2bda'),
    ('20261031_000002_nhtbank_security_assertions.draft.sql', 'kiem-dinh.sql',
     'ad49155c2d43c12d7a6eda179b6d5b4f6f3bd379'),
]


def blob(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def check(condition, message):
    if not condition:
        raise RuntimeError(message)
    print('ĐẠT (tĩnh): ' + message)


def main():
    patch = ''
    records = []
    for old, new, sha in FILES:
        src = (ROOT / SOURCE / old).read_bytes()
        dst = (HERE / new).read_bytes()
        check(blob(src) == sha, 'Git blob nguồn ' + old + ' = ' + sha)
        check(dst.endswith(b'\n') and b'\r' not in dst, 'UTF-8/LF ' + new)
        dst.decode('utf-8')
        patch += ''.join(difflib.unified_diff(
            src.decode().splitlines(True), dst.decode().splitlines(True),
            fromfile='a/' + SOURCE + old, tofile='b/' + SOURCE + old))
        records.append({'source': SOURCE+old, 'source_git_blob': sha,
                        'target': new, 'target_git_blob': blob(dst),
                        'target_sha256': hashlib.sha256(dst).hexdigest()})
    check((HERE / 'sql-v21.diff').read_text() == patch, 'unified diff đúng hai file/đúng bytes')
    with tempfile.TemporaryDirectory(prefix='nhtbank-a36-') as tmp:
        work = Path(tmp)
        for old, _, _ in FILES:
            p = work / SOURCE / old
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes((ROOT / SOURCE / old).read_bytes())
        for flags in (['--check'], []):
            result = subprocess.run(['git', 'apply', '--no-index', *flags, '-'],
                                    cwd=work, input=patch, text=True, capture_output=True)
            check(result.returncode == 0, 'git apply ' + ('--check' if flags else 'thực áp dụng')
                  + '; exit=' + str(result.returncode) + '; ' + result.stderr.strip())
        for old, new, _ in FILES:
            check((work / SOURCE / old).read_bytes() == (HERE / new).read_bytes(),
                  'patch round-trip byte-for-byte ' + new)
    core = (HERE/'luoc-do.sql').read_text()
    assertions = (HERE/'kiem-dinh.sql').read_text()
    catalog = assertions[assertions.index('do $$'):assertions.index('-- Disposable probes:')]
    check(catalog in core and core.index(catalog) < core.index('\ncommit;'),
          'catalog assertions đồng bộ và đứng trước COMMIT')
    check(core.count('\nbegin;') == 1 and core.count('\ncommit;') == 1,
          'core có một transaction ngoài cùng (kiểm tra văn bản)')
    check(assertions.count('\nbegin;') == 1 and assertions.count('\nrollback;') == 1,
          'assertions kết thúc ROLLBACK (không hoàn lại sequence)')
    check('actor_user_id uuid,' in core and
          'actor_user_id uuid references' not in core, 'actor UUID snapshot không FK')
    check("'MAINTAIN'" in catalog and 'pg_has_role' in catalog and "'SET'" in catalog
          and 'attacl' in catalog and 'pg_default_acl' in catalog,
          'có kiểm tra PG17 MAINTAIN/membership/column/default ACL')
    check('testing-v3' not in core+assertions and 'reversed' not in core+assertions,
          'không đưa testing-v3/reversed vào SQL')
    print(json.dumps(records, ensure_ascii=False, indent=2))
    print('SQL NOT RUN; parser NOT RUN; DB-01 BỊ CHẶN; đây không phải kiểm thử PostgreSQL.')


if __name__ == '__main__':
    main()
