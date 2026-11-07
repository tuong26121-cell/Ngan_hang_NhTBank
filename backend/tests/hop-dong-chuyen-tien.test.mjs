import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  canonicalizeTransferRequest,
  createTransferFingerprint,
  canonicalizeIdempotencyKey,
} from "../lib/hop-dong-chuyen-tien.mjs";
const principal = "11111111-1111-4111-8111-111111111111";
const request = {
  source_account_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  recipient_account_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  amount: "1000",
  currency: "VND",
  description: " Demo ",
};
test("chuẩn hóa payload mà không thay đầu vào", () => {
  const before = structuredClone(request);
  const actual = canonicalizeTransferRequest(request);
  assert.deepEqual(actual, { ...request, description: "Demo" });
  assert.deepEqual(request, before);
});
test("thứ tự trường, UUID hoa/thường và Unicode tương đương cho cùng fingerprint", () => {
  const a = { ...request, description: "Café" };
  const b = {
    description: " Cafe\u0301 ",
    currency: "VND",
    amount: "1000",
    recipient_account_id: request.recipient_account_id.toUpperCase(),
    source_account_id: request.source_account_id.toUpperCase(),
  };
  assert.equal(
    createTransferFingerprint(principal, a),
    createTransferFingerprint(principal, b),
  );
  assert.match(createTransferFingerprint(principal, a), /^[a-f0-9]{64}$/);
});
test("namespace principal khác không dùng chung fingerprint", () => {
  assert.notEqual(
    createTransferFingerprint(principal, request),
    createTransferFingerprint("22222222-2222-4222-8222-222222222222", request),
  );
});
test("cùng key nhưng số tiền/nội dung khác có fingerprint khác", () => {
  for (const change of [
    { amount: "1001" },
    { description: "Khác" },
    { recipient_account_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" },
  ])
    assert.notEqual(
      createTransferFingerprint(principal, request),
      createTransferFingerprint(principal, { ...request, ...change }),
    );
});
test("description thiếu và rỗng cùng nghĩa; tính theo Unicode codepoint", () => {
  const { description, ...r } = request;
  assert.equal(
    createTransferFingerprint(principal, r),
    createTransferFingerprint(principal, { ...r, description: "" }),
  );
  assert.equal(
    canonicalizeTransferRequest({ ...r, description: "😀".repeat(120) })
      .description,
    "😀".repeat(120),
  );
  assert.throws(
    () => canonicalizeTransferRequest({ ...r, description: "😀".repeat(121) }),
    /VALIDATION_ERROR/,
  );
});
test("giữ nguyên độ chính xác số tiền ở cận safe integer", () => {
  assert.equal(
    canonicalizeTransferRequest({ ...request, amount: "9007199254740991" })
      .amount,
    "9007199254740991",
  );
});
for (const amount of [
  "999",
  "0",
  "-1000",
  "1000.0",
  "1e3",
  "01000",
  " 1000",
  "9007199254740992",
  1000,
  null,
])
  test(`từ chối amount ${JSON.stringify(amount)}`, () =>
    assert.throws(
      () => canonicalizeTransferRequest({ ...request, amount }),
      /VALIDATION_ERROR/,
    ));
for (const field of [
  "principal_id",
  "role",
  "request_sha256",
  "idempotency_key",
  "__proto__",
])
  test(`không nhận trường client ${field}`, () => {
    const data = JSON.parse(JSON.stringify(request));
    Object.defineProperty(data, field, { value: "x", enumerable: true });
    assert.throws(() => canonicalizeTransferRequest(data), /VALIDATION_ERROR/);
  });
test("từ chối tài khoản trùng, currency sai và payload không phải object", () => {
  for (const r of [
    null,
    [],
    { ...request, source_account_id: request.recipient_account_id },
    { ...request, currency: "USD" },
    { ...request, recipient_account_id: "not-a-uuid" },
  ])
    assert.throws(() => canonicalizeTransferRequest(r), /VALIDATION_ERROR/);
});
test("principal chưa định danh bị từ chối; utility không phải token verifier", () => {
  for (const p of ["", null, 123, "not-uuid"])
    assert.throws(
      () => createTransferFingerprint(p, request),
      /VALIDATION_ERROR/,
    );
});

test("Idempotency-Key giữ nguyên byte, không trim hoặc thay đổi hoa thường", () => {
  for (const key of ["A", "a", "AbC_019-Z", "Z".repeat(128)]) {
    assert.equal(canonicalizeIdempotencyKey(key), key);
  }
  assert.notEqual(canonicalizeIdempotencyKey("Key"), canonicalizeIdempotencyKey("key"));
});
test("Idempotency-Key từ chối key trống, ký tự lạ và quá dài", () => {
  for (const key of [
    "", " ", " a", "a ", "a.b", "a/b", "a:b", "a\nb",
    "é", "你好", "\u0000", "A".repeat(129), 10, null,
    undefined, {}, ["a"]
  ]) {
    assert.throws(() => canonicalizeIdempotencyKey(key), /VALIDATION_ERROR/);
  }
});

test("OpenAPI Idempotency-Key đồng nhất với validator backend tại ranh giới", async () => {
  const contract = JSON.parse(
    await readFile(
      new URL("../../docs/dieu-phoi/dot-2a/hop-dong-api-v1.json", import.meta.url),
      "utf8",
    ),
  );
  const operation = contract.paths["/v1/sandbox/transfers"].post;
  const parameter = contract.components.parameters.IdempotencyKey;
  const schema = contract.components.schemas.IdempotencyKey;
  assert.equal(operation["x-implementation-status"], "PROPOSED");
  assert.ok(operation.parameters.some((p) =>
    p.$ref === "#/components/parameters/IdempotencyKey"
  ));
  assert.equal(parameter.in, "header");
  assert.equal(parameter.name, "Idempotency-Key");
  assert.equal(parameter.required, true);
  assert.equal(parameter.schema.$ref, "#/components/schemas/IdempotencyKey");
  assert.equal(schema.type, "string");
  assert.equal(schema.minLength, 1);
  assert.equal(schema.maxLength, 128);
  assert.equal(schema.pattern, "^[A-Za-z0-9_-]+$");
  const regex = new RegExp(schema.pattern, "u");
  for (const value of [
    "A", "z", "_", "-", "A".repeat(128), "", "A".repeat(129),
    "A.b", "A b", "á", "A\\nB", null, 10,
  ]) {
    const schemaAllows = typeof value === "string" &&
      value.length >= schema.minLength &&
      value.length <= schema.maxLength && regex.test(value);
    let runtimeAllows = true;
    try {
      assert.equal(canonicalizeIdempotencyKey(value), value);
    } catch (error) {
      assert.match(error.message, /VALIDATION_ERROR/);
      runtimeAllows = false;
    }
    assert.equal(runtimeAllows, schemaAllows, String(value));
  }
});
