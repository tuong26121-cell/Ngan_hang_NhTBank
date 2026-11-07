import { createHash } from "node:crypto";

// Pure contract utility: no token verification, database, transfer, or persistence.
// A trusted backend must authenticate/authorize the principal before calling it.
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const fields = new Set([
  "source_account_id",
  "recipient_account_id",
  "amount",
  "currency",
  "description",
]);
const maxAmount = 9007199254740991n;
function invalid() {
  throw new Error("VALIDATION_ERROR");
}
function accountId(value) {
  if (typeof value !== "string" || !uuid.test(value)) invalid();
  return value.toLowerCase();
}

export function canonicalizeTransferRequest(request) {
  if (!request || typeof request !== "object" || Array.isArray(request))
    invalid();
  const prototype = Object.getPrototypeOf(request);
  if (prototype !== Object.prototype && prototype !== null) invalid();
  if (Reflect.ownKeys(request).some((key) => !fields.has(key))) invalid();
  for (const key of [
    "source_account_id",
    "recipient_account_id",
    "amount",
    "currency",
  ]) {
    if (!Object.hasOwn(request, key)) invalid();
  }
  const source = accountId(request.source_account_id);
  const recipient = accountId(request.recipient_account_id);
  if (source === recipient) invalid();
  const amount = request.amount;
  if (
    typeof amount !== "string" ||
    amount.length > 16 ||
    !/^[1-9][0-9]*$/.test(amount)
  )
    invalid();
  const value = BigInt(amount);
  if (value < 1000n || value > maxAmount || request.currency !== "VND")
    invalid();
  const raw = Object.hasOwn(request, "description") ? request.description : "";
  if (typeof raw !== "string" || Array.from(raw).length > 120) invalid();
  const description = raw.normalize("NFC").trim();
  if (Array.from(description).length > 120) invalid();
  return {
    source_account_id: source,
    recipient_account_id: recipient,
    amount,
    currency: "VND",
    description,
  };
}

export function createTransferFingerprint(principalId, request) {
  const principal = accountId(principalId);
  const payload = canonicalizeTransferRequest(request);
  const canonical = JSON.stringify({
    version: 1,
    principal_id: principal,
    operation_scope: "sandbox.transfer.v1",
    payload,
  });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

/**
 * Validate the opaque replay key at the API boundary. A key is NOT a
 * confirmation token or authentication credential. Never trim, lowercase,
 * or otherwise normalize it: byte-for-byte equality matters for replay.
 * The future durable namespace must include trusted principal + operation scope.
 */
export function canonicalizeIdempotencyKey(key) {
  if (
    typeof key !== "string" ||
    key.length < 1 ||
    key.length > 128 ||
    !/^[A-Za-z0-9_-]+$/.test(key)
  )
    invalid();
  return key;
}
