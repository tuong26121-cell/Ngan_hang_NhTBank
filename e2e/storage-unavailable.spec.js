import { test, expect } from "@playwright/test";

test("login remains usable when browser storage is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() { throw new DOMException("Storage blocked", "SecurityError"); },
    });
  });
  await page.goto("./?view=android");
  await expect(page.getByRole("heading", { name: "Đăng nhập NhTBank" })).toBeVisible();
  await page.getByRole("button", { name: "Đăng ký tài khoản", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Đăng ký tài khoản", exact: true })).toBeVisible();
});
