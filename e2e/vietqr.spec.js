import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./auth-helper";

test("VietQR opt-in works on Android and Windows without touching demo QR", async ({ page }) => {
  const external = [];
  await page.route("https://vietqr.app/img**", async (route) => {
    external.push(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="white"/></svg>',
    });
  });
  await page.goto("./");
  await registerAndLogin(page);
  await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
  await page.getByRole("button", { name: /Nạp tiền/ }).first().click();
  const demo = page.getByRole("img", { name: /QR mô phỏng/ });
  await expect(demo).toHaveAttribute("src", /^data:image\/svg\+xml/);
  await expect(page.getByRole("heading", { name: "NhTBank QR Studio" })).toBeVisible();
  expect(external).toHaveLength(0);

  await page.getByLabel("Số tài khoản nhận").fill("0788818374");
  await page.getByRole("button", { name: /Tạo ảnh VietQR/ }).click();
  await expect(page.getByRole("alert")).toContainText("đồng ý");
  expect(external).toHaveLength(0);
  await page.getByLabel(/Tôi hiểu rằng khi nhấn tạo/).check();
  await page.getByLabel("Số tiền (VNĐ, có thể để trống)").fill("500000");
  await page.getByLabel("Nội dung chuyển khoản").fill("NHAN & THU");
  await page.getByRole("button", { name: /Tạo ảnh VietQR/ }).click();
  const image = page.getByRole("img", { name: /Ảnh VietQR/ });
  await expect(image).toBeVisible();
  await expect.poll(() => external.length).toBe(1);
  expect(new URL(external[0]).searchParams.get("des")).toBe("NHAN & THU");
  expect(new URL(external[0]).searchParams.get("amount")).toBe("500000");
  await page.getByLabel("Số tài khoản nhận").fill("123456789");
  await expect(image).toHaveCount(0);
  expect(external).toHaveLength(1);
  await expect(demo).toHaveAttribute("src", /^data:image\/svg\+xml/);
});
