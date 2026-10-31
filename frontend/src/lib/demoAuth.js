// NhTBank Sandbox only. Device-local accounts are never bank credentials.
// Real banking requires a server-issued session and independently audited auth.
const STORAGE_KEY = "nhtbank-demo-users-v2";
const ITERATIONS = 150000;
const encoder = new TextEncoder();

// If browser storage is blocked or full, keep demo accounts in memory for this tab.
// This fallback is intentionally temporary and never claims cross-refresh persistence.
let volatileUsers = {};
let useVolatileStorage = false;

export function loadUsers() {
  if (useVolatileStorage) return volatileUsers;
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    useVolatileStorage = true;
    return volatileUsers;
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    volatileUsers = users;
    return true;
  } catch {
    useVolatileStorage = true;
    volatileUsers = users;
    return false;
  }
}

export function isDemoStoragePersistent() {
  return !useVolatileStorage;
}

function toHex(array) {
  return Array.from(array, (value) => value.toString(16).padStart(2, "0")).join("");
}
function randomHex() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}
async function derive(secret, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveBits"]);
  const bytes = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return toHex(new Uint8Array(bytes));
}
function checkName(username) {
  const name = String(username || "").trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,24}$/.test(name)) {
    throw new Error("Tên đăng nhập cần 3–24 ký tự: a-z, 0-9, dấu chấm hoặc gạch dưới.");
  }
  return name;
}
function checkPassword(password) {
  if (typeof password !== "string" || password.length < 10 || password.length > 128) {
    throw new Error("Mật khẩu phải có từ 10 đến 128 ký tự.");
  }
}
async function newRecord(password) {
  const salt = randomHex();
  const recoveryCode = randomHex().toUpperCase().match(/.{1,4}/g).join("-");
  const recoverySalt = randomHex();
  return {
    record: {
      version: 2,
      salt,
      digest: await derive(password, salt),
      recoverySalt,
      recoveryDigest: await derive(recoveryCode.replaceAll("-", ""), recoverySalt),
    },
    recoveryCode,
  };
}
export async function registerDemo(username, password) {
  const name = checkName(username);
  checkPassword(password);
  const users = loadUsers();
  if (users[name]) throw new Error("Tên đăng nhập đã tồn tại trên thiết bị này.");
  const { record, recoveryCode } = await newRecord(password);
  users[name] = record;
  saveUsers(users);
  return { name, recoveryCode };
}
export async function verifyDemo(username, password) {
  const name = String(username || "").trim().toLowerCase();
  const record = loadUsers()[name];
  if (!record || record.version !== 2 || typeof password !== "string") return false;
  return (await derive(password, record.salt)) === record.digest;
}
export async function changeDemoPassword(username, oldPassword, newPassword) {
  if (!(await verifyDemo(username, oldPassword))) {
    throw new Error("Mật khẩu hiện tại chưa đúng.");
  }
  checkPassword(newPassword);
  const name = checkName(username);
  const users = loadUsers();
  const salt = randomHex();
  users[name] = { ...users[name], salt, digest: await derive(newPassword, salt) };
  saveUsers(users);
}
export async function recoverDemo(username, recoveryCode, newPassword) {
  const name = checkName(username);
  checkPassword(newPassword);
  const users = loadUsers();
  const record = users[name];
  const normalized = String(recoveryCode || "").replace(/-/g, "").trim().toUpperCase();
  if (!record || !/^[A-F0-9]{32}$/.test(normalized)) {
    throw new Error("Tên tài khoản hoặc mã khôi phục không đúng.");
  }
  const match = (await derive(normalized, record.recoverySalt)) === record.recoveryDigest;
  if (!match) throw new Error("Tên tài khoản hoặc mã khôi phục không đúng.");
  const next = await newRecord(newPassword);
  users[name] = next.record;
  saveUsers(users);
  return { name, recoveryCode: next.recoveryCode };
}
