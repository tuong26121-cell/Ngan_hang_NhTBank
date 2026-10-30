import { test, expect } from "@playwright/test";

for (const view of ["android", "windows"]) {
  test(`buttons respond in ${view} layout`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const activate = async (locator) => {
      if (testInfo.project.name === "mobile") await locator.tap();
      else await locator.click();
    };
    await page.goto(`./?view=${view}`);
    for (const n of "123456")
      await activate(page.getByRole("button", { name: `Số ${n}`, exact: true }));
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
    const home = async () => {
      await activate(page.getByRole("button", { name: "Trang chủ", exact: true }));
      await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
    };
    await activate(page.getByRole("button", { name: "Ẩn số dư" }));
    await expect(page.getByLabel("Số dư đã ẩn")).toBeVisible();
    await activate(page.getByRole("button", { name: "Hiện số dư" }));
    await expect(page.getByLabel("4.056.000 VNĐ", { exact: true })).toBeVisible();
    await activate(page.getByRole("button", { name: "Thông báo", exact: true }));
    await expect(page.getByText("Một khởi đầu tốt đẹp ✦")).toBeVisible();
    await activate(page.getByRole("button", { name: "Đã hiểu", exact: true }));
    await expect(page.getByText("Một khởi đầu tốt đẹp ✦")).toHaveCount(0);
    for (const label of ["Cửa hàng", "Thẻ điện tử", "MỚI Bảo vệ thẻ", "MỚI Ưu đãi", "Vé dịch vụ", "Quà tặng"]) {
      await activate(page.getByRole("button", { name: label, exact: true }));
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await activate(dialog.getByRole("button", { name: "Đã hiểu", exact: true }));
      await expect(dialog).toHaveCount(0);
    }
    for (const [label, heading] of [
      ["Chuyển tiền", "Chuyển tiền"], ["Nạp tiền", "Nạp tiền"],
      ["Tiền gửi", "Tiền gửi"], ["Vay nhanh", "Vay nhanh"],
      ["Ví của tôi", "Cá nhân"], ["Mục tiêu", "Tiền gửi"],
    ]) {
      await activate(page.getByRole("button", { name: label, exact: true }));
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
      await home();
    }
    for (const [label, heading] of [
      ["Giao dịch", "Chuyển tiền"], ["QR", "Nạp tiền"],
      ["Lịch sử", "Lịch sử giao dịch"], ["Cá nhân", "Cá nhân"],
    ]) {
      await activate(page.getByRole("button", { name: label, exact: true }));
      await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
    }
    await activate(page.locator("main").getByRole("button", { name: "Trung tâm hỗ trợ", exact: true }));
    await expect(page.getByRole("dialog")).toBeVisible();
    await activate(page.getByRole("button", { name: "Đóng hỗ trợ" }));
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await activate(page.getByRole("button", { name: "Đăng xuất và xóa dữ liệu phiên" }));
    await expect(page.getByRole("button", { name: "Số 1", exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
