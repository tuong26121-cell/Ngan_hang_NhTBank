import { test, expect } from "@playwright/test";
import { registerAndLogin, createDemoAccount, loginExisting } from "./auth-helper";
test("complete Sandbox journey without console errors", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("./");
  await registerAndLogin(page);
  await expect(page.getByLabel("4.056.000 VNĐ", { exact: true })).toHaveText(
    "4.056.000",
  );
  await page.screenshot({
    path: `test-results/dashboard-${testInfo.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Ẩn số dư" }).click();
  await expect(page.getByLabel("Số dư đã ẩn")).toBeVisible();
  await page.getByRole("button", { name: "Hiện số dư" }).click();
  await page
    .getByRole("button", { name: "Giao dịch", exact: true })
    .first()
    .click();
  await page.getByLabel("Ngân hàng nhận").selectOption("MB Bank");
  await page.getByLabel("Số tài khoản", { exact: true }).fill("123456789");
  await page.getByLabel("Tên người nhận").fill("Trần Minh Anh Demo");
  await page.getByLabel("Số tiền (VNĐ)").fill("9000000");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await expect(page.getByRole("alert")).toContainText("không đủ");
  await page.getByLabel("Số tiền (VNĐ)").fill("100000");
  await page.getByLabel(/Nội dung chuyển khoản/).fill("Bữa tối mô phỏng");
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Xác nhận thông tin" }).click();
  await page.getByLabel("Mã PIN xác nhận").fill("000000");
  await page.getByRole("button", { name: "Chuyển tiền mô phỏng" }).click();
  await expect(page.getByRole("alert")).toContainText("chưa đúng");
  await page.getByLabel("Mã PIN xác nhận").fill("123456");
  await page.getByRole("button", { name: "Chuyển tiền mô phỏng" }).click();
  await expect(
    page.getByRole("heading", { name: "Chuyển tiền thành công!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xem lịch sử giao dịch" }).click();
  await expect(
    page.getByText("Trần Minh Anh Demo", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tiền vào", exact: true }).click();
  await expect(
    page.getByText("Trần Minh Anh Demo", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("Lương tháng 10", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tiền ra", exact: true }).click();
  await page.getByLabel("Tìm giao dịch").fill("Demo");
  await expect(page.locator(".transaction")).toHaveCount(1);
  await page.getByRole("button", { name: "Trang chủ", exact: true }).click();
  await expect(page.getByLabel("3.956.000 VNĐ", { exact: true })).toHaveText(
    "3.956.000",
  );
  const externalRequests = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== new URL(page.url()).origin)
      externalRequests.push(request.url());
  });
  await page
    .getByRole("button", { name: /Nạp tiền/ })
    .first()
    .click();
  const qr = page.getByRole("img", { name: /QR mô phỏng/ });
  await expect(qr).toHaveAttribute("src", /^data:image\/svg\+xml/);
  await page.getByLabel("Số tiền (VNĐ)").fill("250000");
  await page.getByLabel("Nội dung", { exact: true }).fill("NAP DEMO");
  await expect(qr).toBeVisible();
  await expect(qr).toHaveAttribute("src", /^data:image\/svg\+xml/);
  await expect(page.getByText("NAP DEMO", { exact: true })).toBeVisible();
  await page.addScriptTag({ path: "node_modules/jsqr/dist/jsQR.js" });
  const payload = await qr.evaluate(async (image) => {
    if (!image.complete)
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 852;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    return window.jsQR(pixels.data, pixels.width, pixels.height)?.data;
  });
  expect(payload).toBe('NHTBANK_SANDBOX:{"amount":250000,"note":"NAP DEMO"}');
  await page.screenshot({
    path: `test-results/qr-${testInfo.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  expect(externalRequests).toEqual([]);
  await expect(
    page.getByText("DEMO · KHÔNG THANH TOÁN", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Về tổng quan" }).click();
  await page.getByRole("button", { name: /Tiền gửi/ }).click();
  await expect(page.getByText("BẢN XEM TRƯỚC")).toBeVisible();
  await page.getByRole("button", { name: "Trở về tổng quan" }).click();
  await page.getByRole("button", { name: /Vay nhanh/ }).click();
  await expect(page.getByText("BẢN XEM TRƯỚC")).toBeVisible();
  await page.getByRole("button", { name: "Cá nhân", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Nguyễn Nhựt Tường" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Đăng xuất và xóa dữ liệu phiên" })
    .click();
  await loginExisting(page);
  await expect(page.getByLabel("4.056.000 VNĐ", { exact: true })).toHaveText(
    "4.056.000",
  );
  await page.getByRole("button", { name: "Lịch sử", exact: true }).click();
  await expect(page.getByLabel("Tìm giao dịch")).toHaveValue("");
  await expect(
    page.getByText("Trần Minh Anh Demo", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("Lương tháng 10", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("keyboard login, notifications and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await createDemoAccount(page);
  await page.screenshot({
    path: `test-results/login-${test.info().project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByLabel("Tên đăng nhập", { exact: true }).fill("nhtbank_demo");
  await page.getByLabel("Mật khẩu", { exact: true }).fill("Incorrect000!");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("không đúng");
  await loginExisting(page);
  await expect(page.getByLabel("4.056.000 VNĐ", { exact: true })).toHaveText(
    "4.056.000",
  );
  await page.getByRole("button", { name: "Thông báo", exact: true }).click();
  await expect(page.getByText("Một khởi đầu tốt đẹp ✦")).toBeVisible();
  await page.getByRole("button", { name: "Đã hiểu" }).click();
  await expect(page.getByText("Một khởi đầu tốt đẹp ✦")).toHaveCount(0);
});

test("support dialog traps focus and closes with Escape", async ({
  page,
}, testInfo) => {
  await page.goto("./");
  await registerAndLogin(page);
  if (testInfo.project.use.isMobile)
    await page.getByRole("button", { name: "Cá nhân", exact: true }).click();
  await page.getByRole("button", { name: "Trung tâm hỗ trợ" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Đóng hỗ trợ" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Trung tâm hỗ trợ" }),
  ).toBeFocused();
});
