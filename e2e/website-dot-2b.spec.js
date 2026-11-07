import { test, expect } from "@playwright/test";
import { registerAndLogin, DEMO_USERNAME } from "./auth-helper";

test("Website demo: focus, lịch sử theo ngày, hồ sơ và tiết kiệm", async ({
  page,
  baseURL,
}) => {
  const external = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL).origin)
      external.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await registerAndLogin(page);
  await expect(
    page.getByRole("heading", { name: "Dòng tiền trong phiên" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Đến nội dung chính" }),
  ).toHaveAttribute("href", "#main-content");
  const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
  await nav.getByRole("button", { name: "Lịch sử", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Lịch sử giao dịch", exact: true }),
  ).toBeFocused();
  await page.getByLabel("Từ ngày").fill("2026-10-25");
  await page.getByLabel("Đến ngày").fill("2026-10-25");
  await expect(page.getByRole("status")).toContainText("2 giao dịch demo");
  await expect(page.locator(".transaction")).toHaveCount(2);
  await page.getByLabel("Tìm giao dịch").fill("không có kết quả");
  await expect(page.getByRole("status")).toContainText("0 giao dịch demo");
  await expect(
    page.getByText("Chưa có giao dịch trong bộ lọc này."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
  await expect(page.locator(".transaction")).toHaveCount(4);
  await page.getByLabel("Từ ngày").fill("2026-10-26");
  await page.getByLabel("Đến ngày").fill("2026-10-25");
  await expect(page.getByRole("alert")).toHaveText(
    "Ngày kết thúc phải từ ngày bắt đầu trở đi.",
  );
  await expect(page.locator(".transaction")).toHaveCount(0);
  await nav.getByRole("button", { name: "Cá nhân", exact: true }).click();
  await expect(page.getByText(DEMO_USERNAME, { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Hồ sơ mẫu dùng chung · Không phải thông tin ngân hàng của tài khoản đăng nhập",
    ),
  ).toBeVisible();
  await nav.getByRole("button", { name: "Trang chủ", exact: true }).click();
  await page.getByRole("button", { name: "Tiền gửi", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Tiền gửi", exact: true }),
  ).toBeFocused();
  await expect(page.getByText("BẢN XEM TRƯỚC · DEMO")).toBeVisible();
  await expect(page.getByText(/Hiện chưa mở tài khoản tiền gửi/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/website-2b-${test.info().project.name}.png`,
    fullPage: true,
  });
  expect(external).toEqual([]);
});

test("Đăng ký demo dùng được ở màn hình thấp, ô nhập 16px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 480 });
  await page.goto("./");
  await page
    .getByRole("button", { name: "Đăng ký tài khoản", exact: true })
    .click();
  expect(
    await page
      .getByLabel("Nhập lại mật khẩu")
      .evaluate((el) => getComputedStyle(el).fontSize),
  ).toBe("16px");
  await page.getByLabel("Nhập lại mật khẩu").scrollIntoViewIfNeeded();
  await expect(page.getByLabel("Nhập lại mật khẩu")).toBeInViewport();
  await page
    .getByRole("button", { name: "Tạo tài khoản demo" })
    .scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Tạo tài khoản demo" }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
