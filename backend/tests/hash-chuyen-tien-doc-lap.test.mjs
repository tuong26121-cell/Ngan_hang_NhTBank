import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTransferFingerprint, canonicalizeTransferRequest } from '../lib/hop-dong-chuyen-tien.mjs';

// Golden SHA256 values were computed from explicit UTF-8 strings with Python
// hashlib, independently of the production canonicalizer and Node crypto.
const fixtures = JSON.parse(readFileSync(new URL('./du-lieu-hash-doc-lap.json', import.meta.url)));
for (const fixture of fixtures) {
  test(`N13-IDEM-HASH golden ${fixture.id}`, () => {
    assert.equal(createTransferFingerprint(fixture.principal, fixture.request), fixture.sha256);
  });
}

test('N13-IDEM-HASH rejects null description and accepts omitted as empty', () => {
  const request = fixtures[1].request;
  assert.equal(canonicalizeTransferRequest(request).description, '');
  assert.throws(() => canonicalizeTransferRequest({ ...request, description: null }), /VALIDATION_ERROR/);
});

test('N13-IDEM-HASH validates raw codepoint limit before NFC and trimming', () => {
  const request = fixtures[0].request;
  assert.throws(() => canonicalizeTransferRequest({ ...request, description: ' '.repeat(121) }), /VALIDATION_ERROR/);
  assert.throws(() => canonicalizeTransferRequest({ ...request, description: 'e\u0301'.repeat(61) }), /VALIDATION_ERROR/);
  assert.equal(canonicalizeTransferRequest({ ...request, description: 'e\u0301'.repeat(60) }).description, 'é'.repeat(60));
});
