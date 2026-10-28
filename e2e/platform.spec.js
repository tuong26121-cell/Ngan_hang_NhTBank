import { test as base, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPlatform } from "../packages/banking-core/platform.js";
import { DEMO_IDENTITIES } from "../packages/banking-core/model.js";
import { createServerApp } from "../backend/src/server.js";
const test = base.extend({
  platformServer: async ({}, use) => {
    let offset = 0;
    const folder = mkdtempSync(join(tmpdir(), "nht-e2e-")),
      app = createServerApp({
        database: join(folder, "db.sqlite"),
        backupDir: join(folder, "backups"),
        labEnabled: true,
        worker: false,
        clock: () => Date.now() + offset,
      });
    await new Promise((r) => app.server.listen(0, "127.0.0.1", r));
    try {
      await use({
        app,
        advance: (ms) => {
          offset += ms;
        },
        url: `http://127.0.0.1:${app.server.address().port}`,
      });
    } finally {
      await app.close();
      rmSync(folder, { recursive: true, force: true });
    }
  },
});
async function unlock(page, url) {
  await page.goto(url);
  await expect(
    page.getByRole("button", { name: "Số 1", exact: true }),
  ).toBeVisible();
  await page.keyboard.type("123456");
}
async function identity(page, role) {
  await page
    .getByRole("button", { name: "Đổi vai trò thử nghiệm", exact: true })
    .click();
  await page
    .getByLabel("Vai trò thử nghiệm", { exact: true })
    .selectOption(role);
  await page.getByLabel("PIN mô phỏng", { exact: true }).fill("123456");
  await page
    .getByRole("button", { name: "Xác nhận đổi vai trò", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
async function ops(page) {
  await page.getByRole("button", { name: "Cá nhân", exact: true }).click();
  await page
    .getByRole("button", { name: "Không gian vận hành", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Vận hành mô phỏng", exact: true }),
  ).toBeVisible();
}
test("memory incident workflow uses a different approver and isolated recovery", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await unlock(page, "/?workspace=operations");
  await expect(
    page.getByRole("heading", { name: "Vận hành mô phỏng", exact: true }),
  ).toBeVisible();
  await identity(page, "operator");
  await page.getByText("Phòng thử lỗi có kiểm soát", { exact: true }).click();
  await page
    .getByRole("button", { name: "Tạo sai lệch thử nghiệm", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Chạy đối soát", exact: true })
    .click();
  await expect(page.getByText("Đang cô lập", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Đề xuất xây lại số dư", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Đề xuất xử lý có dấu vết",
      exact: true,
    }),
  ).toBeFocused();
  await page
    .getByLabel("Lý do và bằng chứng")
    .fill("Đã đối chiếu sổ gốc, xây lại bộ đệm sau diễn tập");
  await page
    .getByRole("button", { name: "Xác nhận thao tác", exact: true })
    .click();
  await expect(
    page.getByText("Đề xuất · Chờ duyệt", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Phê duyệt xử lý", exact: true }),
  ).toHaveCount(0);
  await identity(page, "approver");
  await page
    .getByRole("button", { name: "Phê duyệt xử lý", exact: true })
    .click();
  await page
    .getByLabel("Lý do và bằng chứng")
    .fill("Người phê duyệt khác đã kiểm tra bằng chứng và sổ gốc");
  await page
    .getByRole("button", { name: "Xác nhận thao tác", exact: true })
    .click();
  await expect(page.getByText("Đã xử lý", { exact: true })).toBeVisible();
  await identity(page, "operator");
  await page
    .getByRole("button", { name: "Tạo bản sao thử nghiệm", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Diễn tập khôi phục", exact: true })
    .click();
  await expect(
    page.getByText("Đã diễn tập đạt", { exact: true }),
  ).toBeVisible();
  for (const width of [320, 360, 390, 412, 768, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 915 });
    // Browser media styles can settle after a viewport change; persistent overflow fails.
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        { message: `operations at ${width}`, timeout: 1500 },
      )
      .toBe(true);
  }
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 390 : 1440,
    height: info.project.name === "mobile" ? 844 : 1000,
  });
  await page.screenshot({
    path: `test-results/platform-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
});
test("SQLite mode safely retries a lost response, resumes session and keeps the ledger", async ({
  page,
  platformServer,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await unlock(page, platformServer.url + "/?runtime=server");
  await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
  await page
    .getByRole("button", { name: /^Chuyển tiền/ })
    .first()
    .click();
  await page.getByLabel("Ngân hàng nhận").selectOption("MB Bank");
  await page.getByLabel("Số tài khoản", { exact: true }).fill("123456789");
  await page.getByLabel("Tên người nhận").fill("Trần Minh Anh Demo");
  await page.getByLabel("Số tiền (VNĐ)").fill("100000");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page
    .getByRole("button", { name: "Xác nhận thông tin", exact: true })
    .click();
  await page.getByLabel("Mã PIN xác nhận").fill("123456");
  let first = true;
  await page.route("**/api/v1/transfers", async (route) => {
    const response = await route.fetch();
    if (first) {
      first = false;
      await route.abort("failed");
    } else await route.fulfill({ response });
  });
  await page
    .getByRole("button", { name: "Chuyển tiền mô phỏng", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Chưa rõ kết quả", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("alert")).toContainText("Chưa nhận được kết quả");
  await expect(
    page.getByRole("heading", { name: "Chuyển tiền thành công!", exact: true }),
  ).toHaveCount(0);
  // A full reload must look up the original key, never POST a second intent.
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Chuyển tiền thành công!", exact: true }),
  ).toBeFocused();
  expect(platformServer.app.store.read().ledger.length).toBe(4);
  expect(platformServer.app.store.read().operations.length).toBe(1);
  await page.getByRole("button", { name: "Về trang chủ", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
  await expect(page.getByLabel("3.956.000 VNĐ", { exact: true })).toHaveText(
    "3.956.000",
  );
  await ops(page);
  await identity(page, "operator");
  await page
    .getByRole("button", { name: "Xử lý thông báo chờ", exact: true })
    .click();
  expect(platformServer.app.store.read().notifications.length).toBe(1);
  await page
    .getByRole("button", { name: "Tạo bản sao thử nghiệm", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Diễn tập khôi phục", exact: true })
    .click();
  await expect(
    page.getByText("Đã diễn tập đạt", { exact: true }),
  ).toBeVisible();
  expect(platformServer.app.store.read().accounts[0].balance).toBe(3956000);
});

async function prepareTransfer(page, url) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await unlock(page, url + "/?runtime=server");
  await page
    .getByRole("button", { name: /^Chuyển tiền/ })
    .first()
    .click();
  await page.getByLabel("Ngân hàng nhận").selectOption("NhTBank Sandbox");
  await page
    .getByRole("button", { name: "Dùng tài khoản nội bộ mẫu", exact: true })
    .click();
  await page.getByLabel("Số tiền (VNĐ)").fill("100000");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await page
    .getByRole("button", { name: "Xác nhận thông tin", exact: true })
    .click();
  await page.getByLabel("Mã PIN xác nhận").fill("123456");
}

test("not-received intent survives reload and session expiry; same-key retry posts once", async ({
  page,
  platformServer,
}, info) => {
  await prepareTransfer(page, platformServer.url);
  const attempts = [];
  await page.route("**/api/v1/transfers", async (route) => {
    attempts.push({
      key: route.request().headers()["idempotency-key"],
      body: route.request().postDataJSON(),
    });
    if (attempts.length === 1) await route.abort("failed");
    else await route.continue();
  });
  await page
    .getByRole("button", { name: "Chuyển tiền mô phỏng", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Chưa rõ kết quả", exact: true }),
  ).toBeFocused();
  expect(platformServer.app.store.read().requests).toHaveLength(0);
  const persisted = await page.evaluate(
    () =>
      Object.entries(localStorage).find(([key]) =>
        key.startsWith("nhtbank:transfer-v2:"),
      )?.[1],
  );
  expect(persisted).toBeTruthy();
  expect(JSON.parse(persisted).key).toBe(attempts[0].key);
  expect(JSON.parse(persisted)).not.toHaveProperty("pin");
  expect(JSON.parse(persisted)).not.toHaveProperty("csrf");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Chưa tìm thấy yêu cầu", exact: true }),
  ).toBeVisible();
  for (const width of [320, 360, 390, 412, 768, 1366, 1920]) {
    await page.setViewportSize({ width, height: 915 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await page.setViewportSize({
    width: info.project.name === "mobile" ? 390 : 1440,
    height: info.project.name === "mobile" ? 844 : 1000,
  });
  await page.screenshot({
    path: `test-results/recovery-${info.project.name}.png`,
    fullPage: true,
  });
  platformServer.advance(31 * 60 * 1000);
  await page
    .getByRole("button", { name: "Kiểm tra kết quả", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Đăng nhập lại và kiểm tra",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("PIN đăng nhập lại", { exact: true }).fill("123456");
  await page
    .getByRole("button", { name: "Đăng nhập lại và kiểm tra", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Đăng nhập lại và kiểm tra",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByLabel("PIN để gửi lại", { exact: true }).fill("123456");
  await page
    .getByRole("button", { name: "Gửi lại cùng mã yêu cầu", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Chuyển tiền thành công!", exact: true }),
  ).toBeFocused();
  expect(attempts).toHaveLength(2);
  expect(attempts[1]).toEqual(attempts[0]);
  expect(platformServer.app.store.read().requests).toHaveLength(1);
  expect(platformServer.app.store.read().ledger).toHaveLength(4);
  expect(
    platformServer.app.store.read().accounts.find((a) => a.id === "peer-vnd")
      .balance,
  ).toBe(100000);
  await ops(page);
  await identity(page, "operator");
  await page
    .getByRole("button", { name: "Đề xuất đảo giao dịch", exact: true })
    .click();
  await page
    .getByLabel("Lý do và bằng chứng")
    .fill("Đã đối chiếu giao dịch nội bộ và yêu cầu bù toàn phần");
  await page
    .getByRole("button", { name: "Xác nhận thao tác", exact: true })
    .click();
  await identity(page, "approver");
  await page
    .getByRole("button", { name: "Phê duyệt xử lý", exact: true })
    .click();
  await page
    .getByLabel("Lý do và bằng chứng")
    .fill("Đã kiểm tra hai tài khoản và đồng ý ghi bút toán bù");
  await page
    .getByRole("button", { name: "Xác nhận thao tác", exact: true })
    .click();
  await expect(page.getByText(/Đã bù bằng REV-/)).toBeVisible();
  expect(platformServer.app.store.read().ledger).toHaveLength(6);
  expect(platformServer.app.store.read().accounts[0].balance).toBe(4056000);
});

test("accepted request polls only three times, then a worker result is recovered without resending", async ({
  page,
  platformServer,
}) => {
  await prepareTransfer(page, platformServer.url);
  let posts = 0,
    gets = 0;
  await page.route("**/api/v1/transfers", async (route) => {
    posts++;
    const crash = createPlatform(platformServer.app.store, {
      failpoint: (stage) => {
        if (stage === "after-acceptance") throw Error("lost process");
      },
    });
    try {
      crash.transfer(
        { ...DEMO_IDENTITIES.customer, expiresAt: Date.now() + 3600000 },
        route.request().postDataJSON(),
        route.request().headers()["idempotency-key"],
      );
    } catch (error) {
      if (error.message !== "lost process") throw error;
    }
    await route.abort("failed");
  });
  page.on("request", (req) => {
    if (req.url().includes("/transfer-requests/")) gets++;
  });
  await page
    .getByRole("button", { name: "Chuyển tiền mô phỏng", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Kiểm tra kết quả", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Máy chủ đã tiếp nhận", exact: true }),
  ).toBeVisible();
  await expect.poll(() => gets, { timeout: 10000 }).toBe(4);
  await page.waitForTimeout(1500);
  expect(gets).toBe(4);
  expect(platformServer.app.store.read().ledger).toHaveLength(2);
  platformServer.app.platform.settleAccepted({
    ...DEMO_IDENTITIES.operator,
    expiresAt: Date.now() + 3600000,
  });
  await page
    .getByRole("button", { name: "Kiểm tra kết quả", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Chuyển tiền thành công!", exact: true }),
  ).toBeFocused();
  expect(posts).toBe(1);
  expect(platformServer.app.store.read().ledger).toHaveLength(4);
});

test("two browser tabs share one durable intent and one posting", async ({
  page,
  context,
  platformServer,
}) => {
  await prepareTransfer(page, platformServer.url);
  const second = await context.newPage();
  await second.emulateMedia({ reducedMotion: "reduce" });
  await second.goto(platformServer.url + "/?runtime=server");
  await expect(second.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
  await second
    .getByRole("button", { name: /^Chuyển tiền/ })
    .first()
    .click();
  await second.getByLabel("Ngân hàng nhận").selectOption("NhTBank Sandbox");
  await second
    .getByRole("button", { name: "Dùng tài khoản nội bộ mẫu", exact: true })
    .click();
  await second.getByLabel("Số tiền (VNĐ)").fill("100000");
  await second.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await second
    .getByRole("button", { name: "Xác nhận thông tin", exact: true })
    .click();
  await second.getByLabel("Mã PIN xác nhận").fill("123456");
  let posts = 0;
  await context.route("**/api/v1/transfers", async (route) => {
    posts++;
    await route.continue();
  });
  await Promise.all(
    [page, second].map((tab) =>
      tab
        .getByRole("button", { name: "Chuyển tiền mô phỏng", exact: true })
        .click(),
    ),
  );
  for (const tab of [page, second])
    await expect(
      tab.getByRole("heading", {
        name: "Chuyển tiền thành công!",
        exact: true,
      }),
    ).toBeVisible();
  expect(posts).toBe(1);
  expect(platformServer.app.store.read().requests).toHaveLength(1);
  expect(platformServer.app.store.read().ledger).toHaveLength(4);
  expect(await page.locator(".receipt-id").first().textContent()).toBe(
    await second.locator(".receipt-id").first().textContent(),
  );
  await second.close();
});
