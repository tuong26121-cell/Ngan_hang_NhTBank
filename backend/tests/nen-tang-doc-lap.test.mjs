import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createSandboxServer } from '../sepay-sandbox-server.mjs';

// Dữ liệu tổng hợp; không dùng credential hoặc gọi provider thật.
const now = 1_800_000_000_000;
const secret = 'nhom-13-webhook-fixture-0000000000000000';
const token = 'nhom-13-internal-fixture-000000000000000';
const account = '00000000-0000-4000-8000-000000000013';
const body = '{"id":"qa13-replay-1","environment":"sandbox"}';
const env = {
  SEPAY_WEBHOOK_SECRET: secret,
  NHT_INTERNAL_ACCESS_TOKEN: token,
  SEPAY_SANDBOX_TOKEN: 'synthetic-provider-token',
  NHT_SANDBOX_BANK_ACCOUNT_ID: account,
};

async function start(t, fetchImpl = async () => { throw new Error('unexpected provider call'); }) {
  const server = createSandboxServer({ env, clock: () => now, fetchImpl });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  let closed = false;
  const close = async () => {
    if (closed) return;
    closed = true;
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  };
  t.after(close);
  return { base: `http://127.0.0.1:${server.address().port}`, close };
}

function webhook(base, offset = 0, sentBody = body, signedBody = sentBody) {
  const timestamp = String(now / 1000 + offset);
  const signature = 'sha256=' + createHmac('sha256', secret)
    .update(timestamp + '.').update(signedBody).digest('hex');
  return fetch(base + '/api/webhooks/sepay', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-sepay-timestamp': timestamp, 'x-sepay-signature': signature },
    body: sentBody,
  });
}

test('N13-AUTH-01 client role/owner headers and query cannot replace internal authentication', async t => {
  let calls = 0;
  const { base } = await start(t, async () => { calls++; throw new Error('not authorized'); });
  for (const authorization of [undefined, 'Bearer wrong-token', 'Bearer ' + token.slice(0, -1) + 'X']) {
    const res = await fetch(base + '/api/transactions?role=admin&owner_user_id=victim', {
      headers: { 'x-user-id': 'victim', 'x-role': 'admin', ...(authorization ? { authorization } : {}) },
    });
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'unauthorized' });
  }
  assert.equal(calls, 0);
});

test('N13-SCOPE-01 client account query cannot retarget the configured provider account', async t => {
  const urls = [];
  const { base } = await start(t, async url => {
    urls.push(new URL(url));
    return { ok: true, json: async () => ({ status: 'success', data: [] }) };
  });
  const res = await fetch(base + '/api/transactions?bank_account_id=victim&url=https://example.invalid', {
    headers: { authorization: 'Bearer ' + token },
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { environment: 'sandbox', balance: null, transactions: [] });
  assert.equal(urls.length, 1);
  assert.equal(urls[0].origin, 'https://userapi-sandbox.sepay.vn');
  assert.equal(urls[0].searchParams.get('bank_account_id'), account);
});

for (const offset of [-301, -300, 300, 301]) {
  test(`N13-HMAC-01 signed timestamp offset ${offset} seconds`, async t => {
    const { base } = await start(t);
    const res = await webhook(base, offset);
    const acceptedSignature = Math.abs(offset) <= 300;
    assert.equal(res.status, acceptedSignature ? 503 : 401);
    assert.deepEqual(await res.json(), { error: acceptedSignature
      ? 'durable_webhook_storage_not_configured' : 'invalid_webhook_signature' });
  });
}

test('N13-HMAC-02 semantically equal JSON with different raw bytes invalidates signature', async t => {
  const { base } = await start(t);
  const res = await webhook(base, 0, body + ' ', body);
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: 'invalid_webhook_signature' });
});

test('N13-WH-01 ten concurrent valid replays all refuse ACK without durability', async t => {
  const { base } = await start(t);
  const results = await Promise.all(Array.from({ length: 10 }, async () => {
    const res = await webhook(base);
    return { status: res.status, value: await res.json() };
  }));
  assert.equal(results.length, 10);
  for (const result of results) {
    assert.equal(result.status, 503);
    assert.deepEqual(result.value, { error: 'durable_webhook_storage_not_configured' });
  }
});

test('N13-WH-02 retry after server recreation still refuses ACK', async t => {
  const first = await start(t);
  const res1 = await webhook(first.base);
  assert.equal(res1.status, 503);
  assert.deepEqual(await res1.json(), { error: 'durable_webhook_storage_not_configured' });
  await first.close();
  const second = await start(t);
  const res2 = await webhook(second.base);
  assert.equal(res2.status, 503);
  assert.deepEqual(await res2.json(), { error: 'durable_webhook_storage_not_configured' });
});

test('N13-RETRY-01 upstream timeout is redacted; next independent request can succeed', async t => {
  let attempt = 0;
  const { base } = await start(t, async () => {
    if (++attempt === 1) throw new Error('synthetic upstream timeout with private details');
    return { ok: true, json: async () => ({ status: 'success', data: [] }) };
  });
  const request = () => fetch(base + '/api/transactions', { headers: { authorization: 'Bearer ' + token } });
  const first = await request();
  assert.equal(first.status, 502);
  assert.deepEqual(await first.json(), { error: 'sandbox_request_failed' });
  const second = await request();
  assert.equal(second.status, 200);
  assert.deepEqual(await second.json(), { environment: 'sandbox', balance: null, transactions: [] });
  assert.equal(attempt, 2);
});
