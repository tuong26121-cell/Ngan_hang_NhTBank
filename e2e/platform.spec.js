import { test as base, expect } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServerApp } from "../backend/src/server.js";
const test = base.extend({
  platformServer: async ({}, use) => {
    const folder = mkdtempSync(join(tmpdir(), "nht-e2e-")),
      app = createServerApp({
        database: join(folder, "db.sqlite"),
        backupDir: join(folder, "backups"),
        labEnabled: true,
        worker: false,
      });
    await new Promise((r) => app.server.listen(0, "127.0.0.1", r));
    try {
      await use({ app, url: `http://127.0.0.1:${app.server.address().port}` });
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
  await expect(page.getByRole("alert")).toContainText("Chưa nhận được kết quả");
  await expect(
    page.getByRole("heading", { name: "Chuyển tiền thành công!", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Chuyển tiền mô phỏng", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Chuyển tiền thành công!", exact: true }),
  ).toBeFocused();
  expect(platformServer.app.store.read().ledger.length).toBe(4);
  expect(platformServer.app.store.read().operations.length).toBe(1);
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
