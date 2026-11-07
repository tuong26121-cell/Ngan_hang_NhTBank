import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { createApiAuthenticator } from '../lib/xac-thuc-api.mjs';

const user = '00000000-0000-4000-8000-000000000013';
const victim = '00000000-0000-4000-8000-000000000014';
const now = 1_800_000_000;
const pair = await generateKeyPair('ES256');
const key = { ...await exportJWK(pair.publicKey), kid: 'qa13-local', alg: 'ES256', use: 'sig' };
async function fixture(roles) {
  const auth = createApiAuthenticator({
    issuer: 'https://qa13.invalid', audience: 'qa13-local', algorithms: ['ES256'],
    maxTokenAgeSeconds: 60, jwks: { keys: [key] }, clock: () => new Date(now * 1000),
    lookupPrincipal: async id => ({ id, roles }),
  });
  const token = await new SignJWT({ roles: ['customer', 'admin'], user_metadata: { role: 'admin' } })
    .setProtectedHeader({ alg: 'ES256', kid: 'qa13-local' }).setIssuer('https://qa13.invalid')
    .setAudience('qa13-local').setSubject(user).setIssuedAt(now).setExpirationTime(now + 60)
    .sign(pair.privateKey);
  return { auth, token };
}

for (const role of ['support', 'operations', 'risk_analyst', 'admin']) {
  test(`N13-RBAC seam ${role} cannot transfer despite customer claim in signed JWT`, async () => {
    const { auth, token } = await fixture([role]);
    const context = await auth.authenticate('Bearer ' + token);
    assert.deepEqual(context.roles, [role]);
    assert.throws(() => auth.authorizeOwnResource(context, { owner_id: user }, 'transfer'),
      e => e.code === 'FORBIDDEN');
  });
}

test('N13-AUTH seam rejects a validly signed token with changed issuer', async () => {
  const { auth } = await fixture(['customer']);
  const wrong = await new SignJWT({}).setProtectedHeader({ alg: 'ES256', kid: 'qa13-local' })
    .setIssuer('https://wrong-issuer.invalid').setAudience('qa13-local').setSubject(user)
    .setIssuedAt(now).setExpirationTime(now + 60).sign(pair.privateKey);
  await assert.rejects(() => auth.authenticate('Bearer ' + wrong), e => e.code === 'UNAUTHENTICATED');
});

test('N13-RBAC seam denies victim resource and forged context; accepts own customer resource', async () => {
  const { auth, token } = await fixture(['customer']);
  const context = await auth.authenticate('Bearer ' + token);
  assert.equal(auth.authorizeOwnResource(context, { owner_id: user }, 'transfer'), true);
  assert.throws(() => auth.authorizeOwnResource(context, { owner_id: victim }, 'read'), e => e.code === 'NOT_FOUND');
  assert.throws(() => auth.authorizeOwnResource({ id: user, roles: ['customer'] }, { owner_id: user }, 'transfer'),
    e => e.code === 'UNAUTHENTICATED');
});
