import { test, expect } from "@playwright/test";
import { createDemoAccount, loginExisting, DEMO_USERNAME } from "./auth-helper";

test("NT splash, single viewport, registration and remembered username", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("./?view=android");
  await expect(page.getByRole("heading", { name: "Đăng nhập NhTBank" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-display", "android");
  await expect(page.locator(".brand-mark img")).toHaveAttribute("src", /branding\/nt-logo\.webp/);
  await page.setViewportSize({ width: 320, height: 568 });
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollHeight <= window.innerHeight &&
    document.documentElement.scrollWidth <= window.innerWidth
  )).toBe(true);
  await createDemoAccount(page);
  const code = await page.locator(".auth-recovery-output code").textContent();
  expect(code).toMatch(/^[A-F0-9]{4}(-[A-F0-9]{4}){7}$/);
  await page.getByRole("checkbox", { name: /Ghi nhớ tên đăng nhập/ }).check();
  await loginExisting(page);
  await page.getByRole("button", { name: "Cá nhân", exact: true }).click();
  await page.getByRole("button", { name: "Đăng xuất và xóa dữ liệu phiên" }).click();
  await expect(page.getByRole("heading", { name: "Đăng nhập NhTBank" })).toBeVisible();
  await expect(page.getByLabel("Tên đăng nhập", { exact: true })).toHaveValue(DEMO_USERNAME);
  await expect(page.getByLabel("Mật khẩu", { exact: true })).toHaveValue("");
});

test("settings change password and recovery code reset work locally", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("./");
  await createDemoAccount(page);
  const recovery = await page.locator(".auth-recovery-output code").textContent();
  await loginExisting(page);
  await page.getByRole("button", { name: "Cá nhân", exact: true }).click();
  await page.getByRole("button", { name: "Mở cài đặt bảo mật" }).click();
  await expect(page.getByRole("heading", { name: "Cài đặt bảo mật", exact: true })).toBeVisible();
  await page.getByLabel("Mật khẩu hiện tại").fill("DemoPass12345!");
  await page.getByLabel("Mật khẩu mới").fill("ChangedPass12345!");
  await page.getByLabel("Xác nhận mật khẩu mới").fill("ChangedPass12345!");
  await page.getByRole("button", { name: "Đổi mật khẩu" }).click();
  await expect(page.getByRole("status")).toContainText("Đã đổi mật khẩu");
  await page.getByRole("button", { name: "Cá nhân", exact: true }).click();
  await page.getByRole("button", { name: "Đăng xuất và xóa dữ liệu phiên" }).click();
  await page.getByLabel("Tên đăng nhập", { exact: true }).fill(DEMO_USERNAME);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("DemoPass12345!");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("không đúng");
  await page.getByRole("button", { name: "Quên mật khẩu?" }).click();
  await page.getByLabel("Mã khôi phục đã lưu khi đăng ký").fill(recovery);
  await page.getByLabel("Mật khẩu mới").fill("RecoveredPass12345!");
  await page.getByLabel("Nhập lại mật khẩu").fill("RecoveredPass12345!");
  await page.getByRole("button", { name: "Đặt lại mật khẩu" }).click();
  await expect(page.getByRole("status")).toContainText("Đã đặt lại mật khẩu");
  const nextCode = await page.locator(".auth-recovery-output code").textContent();
  expect(nextCode).not.toBe(recovery);
  await page.getByLabel("Mật khẩu", { exact: true }).fill("RecoveredPass12345!");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
});
