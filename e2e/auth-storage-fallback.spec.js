import { test, expect } from "@playwright/test";

test("authentication remains usable when browser storage is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    const blocked = new Set(["getItem", "setItem", "removeItem"]);
    for (const method of blocked) {
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value() {
          throw new DOMException("Storage is disabled by browser policy", "SecurityError");
        },
      });
    }
  });

  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Đăng nhập NhTBank" })).toBeVisible();
  await page.getByRole("button", { name: "Đăng ký tài khoản" }).click();
  await page.getByLabel("Tên đăng nhập", { exact: true }).fill("volatile_demo");
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill("VolatilePass123!");
  await page.getByLabel("Nhập lại mật khẩu").fill("VolatilePass123!");
  await page.getByRole("button", { name: "Tạo tài khoản demo" }).click();

  await expect(page.getByRole("status")).toContainText("tài khoản demo tạm thời");
  await expect(page.getByText(/chỉ tồn tại trong tab hiện tại/)).toBeVisible();
  const recovery = await page.locator(".auth-recovery-output code").textContent();
  expect(recovery).toMatch(/^[A-F0-9]{4}(-[A-F0-9]{4}){7}$/);

  await page.getByLabel("Mật khẩu", { exact: true }).fill("VolatilePass123!");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
});
