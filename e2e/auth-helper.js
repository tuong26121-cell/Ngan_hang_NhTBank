import { expect } from "@playwright/test";
export const DEMO_USERNAME = "nhtbank_demo";
export const DEMO_PASSWORD = "DemoPass12345!";

export async function createDemoAccount(page) {
  await expect(page.getByRole("heading", { name: "Đăng nhập NhTBank" })).toBeVisible();
  await page.getByRole("button", { name: "Đăng ký tài khoản" }).click();
  await page.getByLabel("Tên đăng nhập", { exact: true }).fill(DEMO_USERNAME);
  await page.getByLabel("Mật khẩu mới", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Tạo tài khoản demo" }).click();
  await expect(page.getByRole("status")).toContainText("Đã đăng ký tài khoản");
}
export async function registerAndLogin(page) {
  await createDemoAccount(page);
  await loginExisting(page);
}
export async function loginExisting(page, password = DEMO_PASSWORD) {
  await page.getByLabel("Tên đăng nhập", { exact: true }).fill(DEMO_USERNAME);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
}
