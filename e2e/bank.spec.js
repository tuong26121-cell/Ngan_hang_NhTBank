import { test, expect } from "@playwright/test";
async function login(page) {
  await page.goto("/");
  for (const number of "123456")
    await page
      .getByRole("button", { name: `Số ${number}`, exact: true })
      .click();
  await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
}
test("complete Sandbox journey without console errors", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await login(page);
  await expect(page.getByLabel("7.829.890 VNĐ", { exact: true })).toHaveText(
    "7.829.890",
  );
  await page.screenshot({
    path: `test-results/dashboard-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Ẩn số dư" }).click();
  await expect(page.getByLabel("Số dư đã ẩn")).toBeVisible();
  await page.getByRole("button", { name: "Hiện số dư" }).click();
  await page
    .getByRole("button", { name: "Chuyển tiền", exact: true })
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
  await page.getByRole("button", { name: "Tổng quan", exact: true }).click();
  await expect(page.getByLabel("7.729.890 VNĐ", { exact: true })).toHaveText(
    "7.729.890",
  );
  await page
    .getByRole("button", { name: /Nạp tiền/ })
    .first()
    .click();
  // Deterministic external image boundary; real API connectivity is checked separately.
  await page.route("https://img.vietqr.io/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="300"><rect width="240" height="300" fill="white"/><text x="20" y="100">VietQR test fixture</text></svg>',
    }),
  );
  await page.getByLabel("Số tiền (VNĐ)").fill("250000");
  await page.getByLabel("Nội dung", { exact: true }).fill("NAP DEMO");
  await page.getByRole("button", { name: "Tạo mã QR mẫu" }).click();
  const qr = page.getByRole("img", { name: /VietQR mô phỏng/ });
  await expect(qr).toBeVisible();
  await expect(qr).toHaveAttribute("src", /amount=250000/);
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
  await page.getByRole("button", { name: "Đăng xuất an toàn" }).click();
  await expect(
    page.getByRole("button", { name: "Số 1", exact: true }),
  ).toBeVisible();
  await login(page); // Reload restores all initial sample data.
  await expect(page.getByLabel("7.829.890 VNĐ", { exact: true })).toHaveText(
    "7.829.890",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("keyboard login, notifications and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Nguyễn Nhựt Tường" }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/login-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.keyboard.type("000000");
  await expect(page.getByRole("alert")).toContainText("PIN chưa đúng");
  await page.keyboard.type("123456");
  await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
  await expect(page.getByLabel("7.829.890 VNĐ", { exact: true })).toHaveText(
    "7.829.890",
  );
  await page.getByRole("button", { name: "Thông báo", exact: true }).click();
  await expect(page.getByText("Một khởi đầu tốt đẹp ✦")).toBeVisible();
  await page.getByRole("button", { name: "Đã hiểu" }).click();
  await expect(page.getByText("Một khởi đầu tốt đẹp ✦")).toHaveCount(0);
});

test("support dialog traps focus and closes with Escape", async ({
  page,
}, testInfo) => {
  await login(page);
  if (testInfo.project.name === "mobile")
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
