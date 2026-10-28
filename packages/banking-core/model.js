export const SCHEMA_VERSION = 1;
export const PRIMARY_ACCOUNT = "customer-vnd";
export const DEMO_IDENTITIES = Object.freeze({
  customer: {
    id: "demo-customer",
    name: "Khách hàng thử nghiệm",
    role: "customer",
  },
  operator: {
    id: "demo-operator",
    name: "Nhân viên vận hành thử nghiệm",
    role: "operator",
  },
  approver: {
    id: "demo-approver",
    name: "Người phê duyệt thử nghiệm",
    role: "approver",
  },
});
export const PERMISSIONS = Object.freeze({
  customer: ["account:read", "transfer:create"],
  operator: [
    "platform:read",
    "reconcile:run",
    "incident:propose",
    "outbox:dispatch",
    "backup:create",
    "lab:inject",
  ],
  approver: ["platform:read", "incident:approve"],
});
export class BankingError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = "BankingError";
    this.code = code;
    this.status = status;
  }
}
export function requirePermission(actor, permission, now = Date.now()) {
  if (
    !actor ||
    typeof actor.id !== "string" ||
    !Number.isFinite(actor.expiresAt) ||
    actor.expiresAt <= now
  )
    throw new BankingError(
      "SESSION_EXPIRED",
      "Phiên đã hết hạn. Vui lòng đăng nhập lại.",
      401,
    );
  if (!PERMISSIONS[actor.role]?.includes(permission))
    throw new BankingError(
      "FORBIDDEN",
      "Vai trò hiện tại không có quyền thực hiện thao tác này.",
      403,
    );
}
export const localDay = (date) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
export function seedState(now = new Date().toISOString()) {
  const accounts = [
    {
      id: PRIMARY_ACCOUNT,
      ownerId: DEMO_IDENTITIES.customer.id,
      name: "Nguyễn Nhựt Tường",
      kind: "customer",
      currency: "VND",
      balance: 4056000,
      status: "active",
      singleLimit: 2000000,
      dailyLimit: 3000000,
    },
    {
      id: "opening-equity",
      name: "Nguồn số dư mẫu",
      kind: "system",
      currency: "VND",
      balance: -4056000,
      status: "active",
    },
    {
      id: "sandbox-clearing",
      name: "Đối ứng chuyển tiền mô phỏng",
      kind: "system",
      currency: "VND",
      balance: 0,
      status: "active",
    },
  ];
  return {
    schemaVersion: SCHEMA_VERSION,
    version: 0,
    createdAt: now,
    accounts,
    operations: [],
    transfers: [
      {
        id: "opening",
        kind: "opening",
        amount: 4056000,
        accountId: PRIMARY_ACCOUNT,
        date: now,
      },
    ],
    ledger: [
      {
        id: "opening-1",
        transactionId: "opening",
        accountId: PRIMARY_ACCOUNT,
        amount: 4056000,
        date: now,
      },
      {
        id: "opening-2",
        transactionId: "opening",
        accountId: "opening-equity",
        amount: -4056000,
        date: now,
      },
    ],
    audit: [
      {
        id: "audit-opening",
        action: "sandbox.opening",
        actorId: "system",
        date: now,
        detail:
          "Số dư đầu kỳ mẫu. Lịch sử minh họa cũ không được ghi lại vào sổ này.",
      },
    ],
    outbox: [],
    notifications: [],
    reconciliations: [],
    incidents: [],
    proposals: [],
    backups: [],
  };
}
export const IMMUTABLE_COLLECTIONS = [
  "ledger",
  "audit",
  "operations",
  "transfers",
  "notifications",
  "reconciliations",
];
export const COLLECTIONS = [
  "accounts",
  "operations",
  "transfers",
  "ledger",
  "audit",
  "outbox",
  "notifications",
  "reconciliations",
  "incidents",
  "proposals",
  "backups",
];
export function assertAppendOnly(previous, next) {
  for (const key of COLLECTIONS) {
    if (previous[key].some((row, i) => next[key][i]?.id !== row.id))
      throw new BankingError(
        "RECORD_REMOVAL_FORBIDDEN",
        "Không được xóa hoặc đổi vị trí bản ghi.",
        409,
      );
    if (new Set(next[key].map((row) => row.id)).size !== next[key].length)
      throw new BankingError("DUPLICATE_ID", "Trùng mã bản ghi.", 409);
  }
  for (const key of IMMUTABLE_COLLECTIONS) {
    if (
      next[key].length < previous[key].length ||
      previous[key].some(
        (row, i) => JSON.stringify(row) !== JSON.stringify(next[key][i]),
      )
    )
      throw new BankingError(
        "IMMUTABLE_RECORD",
        "Không được sửa hoặc xóa bản ghi đã chốt.",
        409,
      );
  }
}
export function createMemoryStore(initial = seedState()) {
  let state = structuredClone(initial);
  return {
    kind: "memory",
    read: () => structuredClone(state),
    transact(fn) {
      const next = structuredClone(state),
        result = fn(next);
      if (result?.then) throw new Error("Unit of work must be synchronous");
      assertAppendOnly(state, next);
      if (JSON.stringify(next) === JSON.stringify(state))
        return structuredClone(result);
      next.version = state.version + 1;
      state = next;
      return structuredClone(result);
    },
    close() {},
  };
}
