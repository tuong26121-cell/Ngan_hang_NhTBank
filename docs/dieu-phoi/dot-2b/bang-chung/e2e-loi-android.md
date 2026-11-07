# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bank.spec.js >> complete Sandbox journey without console errors
- Location: e2e/bank.spec.js:3:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Nguyễn Nhựt Tường' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Nguyễn Nhựt Tường' })

```

```yaml
- complementary:
  - navigation "Điều hướng chính":
    - button "Trang chủ"
    - button "Giao dịch"
    - button "Quét QR"
    - button "Lịch sử"
    - button "Cá nhân"
- banner:
  - text: NhTBank Phiên bản 1.0.1 · Bản thử cục bộ
  - button "Thông báo"
  - button "Ảnh đại diện Nhựt Tường":
    - img "Ảnh đại diện Nhựt Tường": NT
- img
- text: Ngân hàng mô phỏng · Không giao dịch tiền thật
- main:
  - text: MỖI ƯỚC MƠ ĐỀU XỨNG ĐÁNG
  - heading "Vay nhanh" [level=1]
  - paragraph: Thêm động lực cho những dự định của bạn.
  - img
  - text: BẢN XEM TRƯỚC
  - heading "Sẵn sàng cho chương tiếp theo." [level=2]
  - paragraph: Trải nghiệm vay mô phỏng sẽ có trong phiên bản tiếp theo. Hiện chưa mở tài khoản tiền gửi, nhận hồ sơ vay hay tính lãi.
  - img
  - text: Ứng dụng mô phỏng · Không nhập PIN, OTP hoặc mật khẩu ngân hàng thật
  - button "Trở về tổng quan":
    - text: Trở về tổng quan
    - img
- contentinfo:
  - text: © 2026 NhTBank. Chạm đến điều tốt đẹp.
  - img
  - text: Ứng dụng mô phỏng · Không nhập PIN, OTP hoặc mật khẩu ngân hàng thật
  - navigation "Chọn bố cục":
    - link "Điện thoại":
      - /url: "?view=android"
    - link "Máy tính":
      - /url: "?view=windows"
```

# Test source

```ts
  13  |   await registerAndLogin(page);
  14  |   await expect(page.getByLabel("4.056.000 VNĐ", { exact: true })).toHaveText(
  15  |     "4.056.000",
  16  |   );
  17  |   await page.screenshot({
  18  |     path: `test-results/dashboard-${testInfo.project.name}.png`,
  19  |     fullPage: true,
  20  |     animations: "disabled",
  21  |   });
  22  |   await page.getByRole("button", { name: "Ẩn số dư" }).click();
  23  |   await expect(page.getByLabel("Số dư đã ẩn")).toBeVisible();
  24  |   await page.getByRole("button", { name: "Hiện số dư" }).click();
  25  |   await page
  26  |     .getByRole("button", { name: "Giao dịch", exact: true })
  27  |     .first()
  28  |     .click();
  29  |   await page.getByLabel("Ngân hàng nhận").selectOption("MB Bank");
  30  |   await page.getByLabel("Số tài khoản", { exact: true }).fill("123456789");
  31  |   await page.getByLabel("Tên người nhận").fill("Trần Minh Anh Demo");
  32  |   await page.getByLabel("Số tiền (VNĐ)").fill("9000000");
  33  |   await page.getByRole("button", { name: "Tiếp tục" }).click();
  34  |   await expect(page.getByRole("alert")).toContainText("không đủ");
  35  |   await page.getByLabel("Số tiền (VNĐ)").fill("100000");
  36  |   await page.getByLabel(/Nội dung chuyển khoản/).fill("Bữa tối mô phỏng");
  37  |   await page.getByRole("button", { name: "Tiếp tục" }).click();
  38  |   await page.getByRole("button", { name: "Xác nhận thông tin" }).click();
  39  |   await page.getByLabel("Mã PIN xác nhận").fill("000000");
  40  |   await page.getByRole("button", { name: "Chuyển tiền mô phỏng" }).click();
  41  |   await expect(page.getByRole("alert")).toContainText("chưa đúng");
  42  |   await page.getByLabel("Mã PIN xác nhận").fill("123456");
  43  |   await page.getByRole("button", { name: "Chuyển tiền mô phỏng" }).click();
  44  |   await expect(
  45  |     page.getByRole("heading", { name: "Chuyển tiền thành công!" }),
  46  |   ).toBeVisible();
  47  |   await page.getByRole("button", { name: "Xem lịch sử giao dịch" }).click();
  48  |   await expect(
  49  |     page.getByText("Trần Minh Anh Demo", { exact: true }),
  50  |   ).toBeVisible();
  51  |   await page.getByRole("button", { name: "Tiền vào", exact: true }).click();
  52  |   await expect(
  53  |     page.getByText("Trần Minh Anh Demo", { exact: true }),
  54  |   ).toHaveCount(0);
  55  |   await expect(page.getByText("Lương tháng 10", { exact: true })).toBeVisible();
  56  |   await page.getByRole("button", { name: "Tiền ra", exact: true }).click();
  57  |   await page.getByLabel("Tìm giao dịch").fill("Demo");
  58  |   await expect(page.locator(".transaction")).toHaveCount(1);
  59  |   await page.getByRole("button", { name: "Trang chủ", exact: true }).click();
  60  |   await expect(page.getByLabel("3.956.000 VNĐ", { exact: true })).toHaveText(
  61  |     "3.956.000",
  62  |   );
  63  |   const externalRequests = [];
  64  |   page.on("request", (request) => {
  65  |     if (new URL(request.url()).origin !== new URL(page.url()).origin)
  66  |       externalRequests.push(request.url());
  67  |   });
  68  |   await page
  69  |     .getByRole("button", { name: /Nạp tiền/ })
  70  |     .first()
  71  |     .click();
  72  |   const qr = page.getByRole("img", { name: /QR mô phỏng/ });
  73  |   await expect(qr).toHaveAttribute("src", /^data:image\/svg\+xml/);
  74  |   await page.getByLabel("Số tiền (VNĐ)").fill("250000");
  75  |   await page.getByLabel("Nội dung", { exact: true }).fill("NAP DEMO");
  76  |   await expect(qr).toBeVisible();
  77  |   await expect(qr).toHaveAttribute("src", /^data:image\/svg\+xml/);
  78  |   await expect(page.getByText("NAP DEMO", { exact: true })).toBeVisible();
  79  |   await page.addScriptTag({ path: "node_modules/jsqr/dist/jsQR.js" });
  80  |   const payload = await qr.evaluate(async (image) => {
  81  |     if (!image.complete)
  82  |       await new Promise((resolve, reject) => {
  83  |         image.onload = resolve;
  84  |         image.onerror = reject;
  85  |       });
  86  |     const canvas = document.createElement("canvas");
  87  |     canvas.width = 720;
  88  |     canvas.height = 852;
  89  |     const context = canvas.getContext("2d");
  90  |     context.drawImage(image, 0, 0, canvas.width, canvas.height);
  91  |     const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  92  |     return window.jsQR(pixels.data, pixels.width, pixels.height)?.data;
  93  |   });
  94  |   expect(payload).toBe('NHTBANK_SANDBOX:{"amount":250000,"note":"NAP DEMO"}');
  95  |   await page.screenshot({
  96  |     path: `test-results/qr-${testInfo.project.name}.png`,
  97  |     fullPage: true,
  98  |     animations: "disabled",
  99  |   });
  100 |   expect(externalRequests).toEqual([]);
  101 |   await expect(
  102 |     page.getByText("DEMO · KHÔNG THANH TOÁN", { exact: true }),
  103 |   ).toBeVisible();
  104 |   await page.getByRole("button", { name: "Về tổng quan" }).click();
  105 |   await page.getByRole("button", { name: /Tiền gửi/ }).click();
  106 |   await expect(page.getByText("BẢN XEM TRƯỚC")).toBeVisible();
  107 |   await page.getByRole("button", { name: "Trở về tổng quan" }).click();
  108 |   await page.getByRole("button", { name: /Vay nhanh/ }).click();
  109 |   await expect(page.getByText("BẢN XEM TRƯỚC")).toBeVisible();
  110 |   await page.getByRole("button", { name: "Cá nhân", exact: true }).click();
  111 |   await expect(
  112 |     page.getByRole("heading", { name: "Nguyễn Nhựt Tường" }),
> 113 |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  114 |   await page
  115 |     .getByRole("button", { name: "Đăng xuất và xóa dữ liệu phiên" })
  116 |     .click();
  117 |   await loginExisting(page);
  118 |   await expect(page.getByLabel("4.056.000 VNĐ", { exact: true })).toHaveText(
  119 |     "4.056.000",
  120 |   );
  121 |   await page.getByRole("button", { name: "Lịch sử", exact: true }).click();
  122 |   await expect(page.getByLabel("Tìm giao dịch")).toHaveValue("");
  123 |   await expect(
  124 |     page.getByText("Trần Minh Anh Demo", { exact: true }),
  125 |   ).toHaveCount(0);
  126 |   await expect(page.getByText("Lương tháng 10", { exact: true })).toBeVisible();
  127 |   expect(
  128 |     await page.evaluate(
  129 |       () => document.documentElement.scrollWidth <= window.innerWidth,
  130 |     ),
  131 |   ).toBe(true);
  132 |   expect(errors).toEqual([]);
  133 | });
  134 | test("keyboard login, notifications and reduced motion", async ({ page }) => {
  135 |   await page.emulateMedia({ reducedMotion: "reduce" });
  136 |   await page.goto("./");
  137 |   await createDemoAccount(page);
  138 |   await page.screenshot({
  139 |     path: `test-results/login-${test.info().project.name}.png`,
  140 |     fullPage: true,
  141 |     animations: "disabled",
  142 |   });
  143 |   await page.getByLabel("Tên đăng nhập", { exact: true }).fill("nhtbank_demo");
  144 |   await page.getByLabel("Mật khẩu", { exact: true }).fill("Incorrect000!");
  145 |   await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  146 |   await expect(page.getByRole("alert")).toContainText("không đúng");
  147 |   await loginExisting(page);
  148 |   await expect(page.getByLabel("4.056.000 VNĐ", { exact: true })).toHaveText(
  149 |     "4.056.000",
  150 |   );
  151 |   await page.getByRole("button", { name: "Thông báo", exact: true }).click();
  152 |   await expect(page.getByText("Một khởi đầu tốt đẹp ✦")).toBeVisible();
  153 |   await page.getByRole("button", { name: "Đã hiểu" }).click();
  154 |   await expect(page.getByText("Một khởi đầu tốt đẹp ✦")).toHaveCount(0);
  155 | });
  156 |
  157 | test("support dialog traps focus and closes with Escape", async ({
  158 |   page,
  159 | }, testInfo) => {
  160 |   await page.goto("./");
  161 |   await registerAndLogin(page);
  162 |   if (testInfo.project.use.isMobile)
  163 |     await page.getByRole("button", { name: "Cá nhân", exact: true }).click();
  164 |   await page.getByRole("button", { name: "Trung tâm hỗ trợ" }).click();
  165 |   await expect(page.getByRole("dialog")).toBeVisible();
  166 |   await page.keyboard.press("Tab");
  167 |   await page.keyboard.press("Tab");
  168 |   await expect(page.getByRole("button", { name: "Đóng hỗ trợ" })).toBeFocused();
  169 |   await page.keyboard.press("Escape");
  170 |   await expect(page.getByRole("dialog")).toHaveCount(0);
  171 |   await expect(
  172 |     page.getByRole("button", { name: "Trung tâm hỗ trợ" }),
  173 |   ).toBeFocused();
  174 | });
  175 |
```
