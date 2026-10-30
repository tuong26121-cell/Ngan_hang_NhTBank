import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./auth-helper";

for (const view of ["android", "windows"]) {
  test(`buttons respond in ${view} layout`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    // Missing production assets can make every control appear unresponsive.
    page.on("requestfailed", (request) => {
      if (["script", "stylesheet"].includes(request.resourceType()))
        errors.push(`${request.url()}: ${request.failure()?.errorText}`);
    });
    page.on("response", (response) => {
      if (
        response.status() >= 400 &&
        ["script", "stylesheet"].includes(response.request().resourceType())
      )
        errors.push(`${response.status()} ${response.url()}`);
    });
    const activate = async (locator) => {
      if (testInfo.project.use.hasTouch) await locator.tap();
      else await locator.click();
    };
    await page.goto(`./?view=${view}`);
    await expect(page.locator("html")).toHaveAttribute("data-display", view);
    await testInfo.attach("browser-context", {
      body: JSON.stringify(
        await page.evaluate(() => ({
          url: location.href,
          userAgent: navigator.userAgent,
          maxTouchPoints: navigator.maxTouchPoints,
          viewport: { width: innerWidth, height: innerHeight },
          scripts: [...document.scripts]
            .map((script) => script.src)
            .filter(Boolean),
        })),
        null,
        2,
      ),
      contentType: "application/json",
    });
    await registerAndLogin(page);
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
    const home = async () => {
      await activate(
        page.getByRole("button", { name: "Trang chủ", exact: true }),
      );
      await expect(
        page.getByRole("heading", { name: /Xin chào/ }),
      ).toBeVisible();
    };
    await activate(page.getByRole("button", { name: "Ẩn số dư" }));
    await expect(page.getByLabel("Số dư đã ẩn")).toBeVisible();
    await activate(page.getByRole("button", { name: "Hiện số dư" }));
    await expect(
      page.getByLabel("4.056.000 VNĐ", { exact: true }),
    ).toBeVisible();
    await activate(
      page.getByRole("button", { name: "Thông báo", exact: true }),
    );
    await expect(page.getByText("Một khởi đầu tốt đẹp ✦")).toBeVisible();
    await activate(page.getByRole("button", { name: "Đã hiểu", exact: true }));
    await expect(page.getByText("Một khởi đầu tốt đẹp ✦")).toHaveCount(0);
    for (const label of [
      "Cửa hàng",
      "Thẻ điện tử",
      "MỚI Bảo vệ thẻ",
      "MỚI Ưu đãi",
      "Vé dịch vụ",
      "Quà tặng",
    ]) {
      await activate(page.getByRole("button", { name: label, exact: true }));
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await activate(
        dialog.getByRole("button", { name: "Đã hiểu", exact: true }),
      );
      await expect(dialog).toHaveCount(0);
    }
    for (const [label, heading] of [
      ["Chuyển tiền", "Chuyển tiền"],
      ["Nạp tiền", "Nạp tiền"],
      ["Tiền gửi", "Tiền gửi"],
      ["Vay nhanh", "Vay nhanh"],
      ["Ví của tôi", "Cá nhân"],
      ["Mục tiêu", "Tiền gửi"],
    ]) {
      await activate(page.getByRole("button", { name: label, exact: true }));
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
      await home();
    }
    for (const [label, heading] of [
      ["Giao dịch", "Chuyển tiền"],
      ["Quét QR", "Quét mã QR"],
      ["Lịch sử", "Lịch sử giao dịch"],
      ["Cá nhân", "Cá nhân"],
    ]) {
      await activate(page.getByRole("button", { name: label, exact: true }));
      await expect(
        page.getByRole("heading", { name: heading, exact: true }).first(),
      ).toBeVisible();
    }
    await activate(
      page
        .locator("main")
        .getByRole("button", { name: "Trung tâm hỗ trợ", exact: true }),
    );
    await expect(page.getByRole("dialog")).toBeVisible();
    await activate(page.getByRole("button", { name: "Đóng hỗ trợ" }));
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await activate(
      page.getByRole("button", { name: "Đăng xuất và xóa dữ liệu phiên" }),
    );
    await expect(
      page.getByRole("heading", { name: "Đăng nhập NhTBank" }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}


for (const startView of ["android", "windows"]) {
  test(`switching layouts preserves the active sandbox session from ${startView}`, async ({ page }, testInfo) => {
    test.setTimeout(60000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`./?view=${startView}`);
    const activate = async (locator) => {
      if (testInfo.project.name === "mobile") await locator.tap();
      else await locator.click();
    };
    await registerAndLogin(page);
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();

    const switcher = page.getByRole("navigation", { name: "Chọn bố cục" });
    const initialNavigation = await page.evaluate(() => performance.getEntriesByType("navigation").length);
    const nextView = startView === "android" ? "windows" : "android";
    await activate(switcher.getByRole("link", { name: nextView === "android" ? "Điện thoại" : "Máy tính" }));
    await expect(page).toHaveURL(new RegExp(`[?&]view=${nextView}`));
    await expect(page.locator("html")).toHaveAttribute("data-display", nextView);
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Số 1", exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => performance.getEntriesByType("navigation").length)).toBe(initialNavigation);

    await page.goBack();
    await expect(page.locator("html")).toHaveAttribute("data-display", startView);
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
