import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./auth-helper";

test("dieu huong lien tiep hien thi dung trang duoc chon", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("./");
  await registerAndLogin(page);
  const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
  for (let lan = 0; lan < 6; lan++) {
    await nav.getByRole("button", { name: "Trang chủ", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
    await page.getByRole("button", { name: /Tiền gửi/ }).click();
    await expect(
      page.getByRole("heading", { name: "Tiền gửi", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("BẢN XEM TRƯỚC")).toBeVisible();
    await page.getByRole("button", { name: "Trở về tổng quan" }).click();
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
    await page.getByRole("button", { name: /Vay nhanh/ }).click();
    await expect(
      page.getByRole("heading", { name: "Vay nhanh", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("BẢN XEM TRƯỚC")).toBeVisible();
    // Nav remains usable while the page's enter/exit animation is running.
    await nav.getByRole("button", { name: "Cá nhân", exact: true }).click();
    await expect(
      nav.getByRole("button", { name: "Cá nhân", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      page.getByRole("heading", { name: "Nguyễn Nhựt Tường" }),
    ).toBeVisible();
  }
});
