import { test, expect } from "@playwright/test";

test("Nhan phien ban hien thi ro tren man dang nhap", async ({ page }) => {
  await page.goto("/");
  const badge = page.locator(".nhan-phien-ban").first();
  await expect(badge).toBeVisible();
  await expect(badge).toContainText("Phiên bản 1.0.1");
  const logo = page.locator(".brand-mark img").first();
  await expect(logo).toBeVisible();
  expect(
    await logo.evaluate((img) => img.complete && img.naturalWidth > 0),
  ).toBeTruthy();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
