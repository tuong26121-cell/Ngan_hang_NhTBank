import test from "node:test";
import assert from "node:assert/strict";
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
