import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import { createApiAuthenticator } from "../lib/xac-thuc-api.mjs";
const now = 1800000000;
const user = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const pair = await generateKeyPair("ES256");
const jwk = await exportJWK(pair.publicKey);
Object.assign(jwk, { kid: "test-key", alg: "ES256", use: "sig" });
const roles = new Map([
  [user, ["customer"]],
  [other, ["admin"]],
]);
const config = {
  issuer: "https://auth.example.invalid",
  audience: "nhtbank-sandbox",
  algorithms: ["ES256"],
  maxTokenAgeSeconds: 300,
  jwks: { keys: [jwk] },
  lookupPrincipal: async (id) =>
    roles.has(id) ? { id, roles: roles.get(id) } : null,
  clock: () => new Date(now * 1000),
};
async function token(options = {}) {
  const {
    key = pair.privateKey,
    issuer = config.issuer,
    audience = config.audience,
    sub = user,
    iat = now,
    exp = now + 120,
    claims = {},
    header = {},
  } = options;
  const body = { iss: issuer, aud: audience, sub, iat, ...claims };
  if (exp !== null) body.exp = exp;
  return new SignJWT(body)
    .setProtectedHeader({ alg: "ES256", kid: "test-key", ...header })
    .sign(key);
}
const errorCode = (code) => (e) => e.code === code;
test("JWT hợp lệ chỉ nhận roles từ lookup backend, context bất biến", async () => {
  const auth = createApiAuthenticator(config);
  const session = await auth.authenticate(
    "Bearer " +
      (await token({
        claims: { roles: ["admin"], user_metadata: { role: "admin" } },
      })),
  );
  assert.deepEqual(session, { id: user, roles: ["customer"] });
  assert.ok(Object.isFrozen(session));
  assert.ok(Object.isFrozen(session.roles));
  assert.doesNotThrow(() =>
    auth.authorizeOwnResource(session, { owner_id: user }, "transfer"),
  );
});
test("không tin jku/x5u của client và không fetch mạng", async () => {
  const auth = createApiAuthenticator(config);
  const session = await auth.authenticate(
    "Bearer " +
      (await token({
        header: {
          jku: "https://not-trusted.invalid/keys",
          x5u: "https://not-trusted.invalid/cert",
        },
      })),
  );
  assert.equal(session.id, user);
});
for (const [name, options] of [
  ["issuer sai", { issuer: "https://evil.invalid" }],
  ["audience sai", { audience: "other" }],
  ["hết hạn", { exp: now - 1 }],
  ["thiếu exp", { exp: null }],
  ["iat tương lai", { iat: now + 60 }],
  ["quá tuổi session", { iat: now - 301 }],
  ["subject sai", { sub: "not-uuid" }],
])
  test(name, async () => {
    await assert.rejects(
      async () =>
        createApiAuthenticator(config).authenticate(
          "Bearer " + (await token(options)),
        ),
      errorCode("UNAUTHENTICATED"),
    );
  });
test("chữ ký bằng khóa khác bị từ chối", async () => {
  const fake = await generateKeyPair("ES256");
  await assert.rejects(
    async () =>
      createApiAuthenticator(config).authenticate(
        "Bearer " + (await token({ key: fake.privateKey })),
      ),
    errorCode("UNAUTHENTICATED"),
  );
});
test("không chấp nhận HS256 hoặc none", async () => {
  const hs = await new SignJWT({
    iss: config.issuer,
    aud: config.audience,
    sub: user,
    iat: now,
    exp: now + 60,
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(new Uint8Array(32));
  const none =
    Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url") +
    "." +
    Buffer.from("{}").toString("base64url") +
    ".";
  for (const t of [hs, none])
    await assert.rejects(
      () => createApiAuthenticator(config).authenticate("Bearer " + t),
      errorCode("UNAUTHENTICATED"),
    );
});
for (const header of [
  undefined,
  "",
  "Basic abc",
  "Bearer x",
  "Bearer " + "x".repeat(9000),
  ["Bearer abc"],
])
  test(
    "từ chối header thiếu/sai định dạng hoặc quá lớn " +
      String(header).slice(0, 20),
    async () => {
      await assert.rejects(
        () => createApiAuthenticator(config).authenticate(header),
        errorCode("UNAUTHENTICATED"),
      );
    },
  );
test("thiếu trust config hoặc private/symmetric key không được khởi tạo", () => {
  for (const change of [
    { issuer: "" },
    { audience: "" },
    { algorithms: [] },
    { algorithms: ["HS256"] },
    { maxTokenAgeSeconds: 0 },
    { lookupPrincipal: null },
    { jwks: { keys: [{ kty: "oct", k: "secret" }] } },
    { jwks: { keys: [{ ...jwk, d: "private" }] } },
  ])
    assert.throws(
      () => createApiAuthenticator({ ...config, ...change }),
      /AUTH_CONFIG_REQUIRED/,
    );
});
test("lookup principal lỗi không bị nhầm thành token hợp lệ", async () => {
  const auth = createApiAuthenticator({
    ...config,
    lookupPrincipal: async () => {
      throw new Error("internal secret detail");
    },
  });
  await assert.rejects(
    async () => auth.authenticate("Bearer " + (await token())),
    (e) => e.code === "AUTH_UNAVAILABLE" && !e.message.includes("secret"),
  );
});
test("role không biết, subject bị vô hiệu hoặc lookup trả nhầm principal phải failclosed", async () => {
  for (const result of [
    null,
    { id: user, roles: ["unknown"] },
    { id: other, roles: ["customer"] },
    { id: user, roles: [], disabled: true },
  ]) {
    const auth = createApiAuthenticator({
      ...config,
      lookupPrincipal: async () => result,
    });
    await assert.rejects(
      async () => auth.authenticate("Bearer " + (await token())),
      errorCode("FORBIDDEN"),
    );
  }
});
test("không dùng context tự chế, quyền admin hoặc token từ authenticator khác để vượt ownership", async () => {
  const auth = createApiAuthenticator(config),
    auth2 = createApiAuthenticator(config);
  const session = await auth.authenticate("Bearer " + (await token()));
  const admin = await auth.authenticate(
    "Bearer " + (await token({ sub: other })),
  );
  assert.throws(
    () => auth.authorizeOwnResource(session, { owner_id: other }, "read"),
    errorCode("NOT_FOUND"),
  );
  assert.throws(
    () =>
      auth.authorizeOwnResource(
        { id: user, roles: ["customer"] },
        { owner_id: user },
        "transfer",
      ),
    errorCode("UNAUTHENTICATED"),
  );
  assert.throws(
    () => auth2.authorizeOwnResource(session, { owner_id: user }, "transfer"),
    errorCode("UNAUTHENTICATED"),
  );
  assert.throws(
    () => auth.authorizeOwnResource(admin, { owner_id: other }, "transfer"),
    errorCode("FORBIDDEN"),
  );
  assert.throws(
    () => auth.authorizeOwnResource(session, { owner_id: user }, "delete"),
    errorCode("FORBIDDEN"),
  );
});
test("context hết hạn hoặc hết hạn trong lúc lookup không được dùng", async () => {
  let time = now;
  const auth = createApiAuthenticator({
    ...config,
    clock: () => new Date(time * 1000),
  });
  const session = await auth.authenticate("Bearer " + (await token()));
  time = now + 121;
  assert.throws(
    () => auth.authorizeOwnResource(session, { owner_id: user }, "read"),
    errorCode("UNAUTHENTICATED"),
  );
  time = now;
  const slow = createApiAuthenticator({
    ...config,
    clock: () => new Date(time * 1000),
    lookupPrincipal: async (id) => {
      time = now + 121;
      return { id, roles: ["customer"] };
    },
  });
  await assert.rejects(
    async () => slow.authenticate("Bearer " + (await token())),
    errorCode("UNAUTHENTICATED"),
  );
});
test("lỗi clock hoặc public key null không làm lộ lỗi nội bộ", async () => {
  assert.throws(
    () => createApiAuthenticator({ ...config, jwks: { keys: [null] } }),
    /AUTH_CONFIG_REQUIRED/,
  );
  const auth = createApiAuthenticator({
    ...config,
    clock: () => {
      throw new Error("private clock detail");
    },
  });
  await assert.rejects(
    async () => auth.authenticate("Bearer " + (await token())),
    (e) => e.code === "AUTH_UNAVAILABLE" && !e.message.includes("private"),
  );
});

test("RS256 chỉ hợp lệ với public JWKS và allowlist tương ứng", async () => {
  const rsa = await generateKeyPair("RS256");
  const pub = await exportJWK(rsa.publicKey);
  Object.assign(pub, { kid: "rsa-test", alg: "RS256", use: "sig" });
  const signed = await new SignJWT({
    iss: config.issuer,
    aud: config.audience,
    sub: user,
    iat: now,
    exp: now + 120,
  })
    .setProtectedHeader({ alg: "RS256", kid: "rsa-test" })
    .sign(rsa.privateKey);
  const auth = createApiAuthenticator({
    ...config,
    algorithms: ["RS256"],
    jwks: { keys: [pub] },
  });
  assert.equal((await auth.authenticate("Bearer " + signed)).id, user);
  await assert.rejects(
    () => createApiAuthenticator(config).authenticate("Bearer " + signed),
    errorCode("UNAUTHENTICATED"),
  );
});
test("kid không có trong bộ khóa tin cậy phải bị từ chối", async () => {
  await assert.rejects(
    async () =>
      createApiAuthenticator(config).authenticate(
        "Bearer " + (await token({ header: { kid: "missing" } })),
      ),
    errorCode("UNAUTHENTICATED"),
  );
});
