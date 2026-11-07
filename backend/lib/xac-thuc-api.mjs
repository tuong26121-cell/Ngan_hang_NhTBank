import { createLocalJWKSet, jwtVerify } from "jose";
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const roleNames = new Set([
  "customer",
  "support",
  "operations",
  "risk_analyst",
  "admin",
]);
function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

// Server-only seam. Does not issue tokens, connect a provider/DB or expose routes.
export function createApiAuthenticator(options) {
  if (
    !options ||
    typeof options.issuer !== "string" ||
    !options.issuer.trim() ||
    typeof options.audience !== "string" ||
    !options.audience.trim() ||
    !Array.isArray(options.algorithms) ||
    !options.algorithms.length ||
    options.algorithms.some((a) => !["ES256", "RS256"].includes(a)) ||
    !Number.isSafeInteger(options.maxTokenAgeSeconds) ||
    options.maxTokenAgeSeconds <= 0 ||
    typeof options.lookupPrincipal !== "function" ||
    !Array.isArray(options.jwks?.keys) ||
    !options.jwks.keys.length ||
    options.jwks.keys.some(
      (k) =>
        !k ||
        typeof k !== "object" ||
        !["RSA", "EC"].includes(k.kty) ||
        ["d", "p", "q", "dp", "dq", "qi", "oth", "k"].some((field) =>
          Object.hasOwn(k, field),
        ),
    ) ||
    (options.clock !== undefined && typeof options.clock !== "function")
  )
    fail("AUTH_CONFIG_REQUIRED");
  const { issuer, audience, maxTokenAgeSeconds, lookupPrincipal } = options;
  const algorithms = [...options.algorithms];
  const clock = options.clock ?? (() => new Date());
  const keys = createLocalJWKSet(structuredClone(options.jwks));
  const sessions = new WeakMap();
  function currentTime() {
    let date;
    try {
      date = clock();
    } catch {
      fail("AUTH_UNAVAILABLE");
    }
    if (!(date instanceof Date) || !Number.isFinite(date.getTime()))
      fail("AUTH_UNAVAILABLE");
    return date;
  }
  async function authenticate(authorization) {
    if (
      typeof authorization !== "string" ||
      authorization.length > 8192 ||
      !/^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/i.test(
        authorization,
      )
    )
      fail("UNAUTHENTICATED");
    const currentDate = currentTime();
    let payload;
    try {
      ({ payload } = await jwtVerify(authorization.slice(7), keys, {
        issuer,
        audience,
        algorithms,
        currentDate,
        maxTokenAge: maxTokenAgeSeconds,
        clockTolerance: 0,
        requiredClaims: ["sub", "iss", "aud", "exp", "iat"],
      }));
      if (typeof payload.sub !== "string" || !uuid.test(payload.sub))
        fail("UNAUTHENTICATED");
    } catch {
      fail("UNAUTHENTICATED");
    }
    const id = payload.sub.toLowerCase();
    let record;
    try {
      record = await lookupPrincipal(id);
    } catch {
      fail("AUTH_UNAVAILABLE");
    }
    if (
      !record ||
      record.disabled ||
      record.id !== id ||
      !Array.isArray(record.roles) ||
      !record.roles.length ||
      record.roles.some((role) => !roleNames.has(role))
    )
      fail("FORBIDDEN");
    const expiry = Math.min(payload.exp, payload.iat + maxTokenAgeSeconds);
    if (expiry <= currentTime().getTime() / 1000) fail("UNAUTHENTICATED");
    const session = Object.freeze({
      id,
      roles: Object.freeze([...new Set(record.roles)]),
    });
    sessions.set(session, expiry);
    // Tokens and arbitrary claims never leave this boundary.
    return session;
  }
  function authorizeOwnResource(session, resource, action) {
    const expiry =
      session && typeof session === "object"
        ? sessions.get(session)
        : undefined;
    if (expiry === undefined || expiry <= currentTime().getTime() / 1000)
      fail("UNAUTHENTICATED");
    if (
      !["read", "transfer"].includes(action) ||
      !session.roles.includes("customer")
    )
      fail("FORBIDDEN");
    if (
      !resource ||
      typeof resource.owner_id !== "string" ||
      !uuid.test(resource.owner_id) ||
      resource.owner_id.toLowerCase() !== session.id
    )
      fail("NOT_FOUND");
    return true;
  }
  return Object.freeze({ authenticate, authorizeOwnResource });
}
