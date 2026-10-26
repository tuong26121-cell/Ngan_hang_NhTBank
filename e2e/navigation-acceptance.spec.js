import { expect, test } from "@playwright/test";

// NhTBank UI acceptance E01–E05, C01, F03 (targeted navigation checks).
// Real-browser results must be reported separately; adding this test is not a pass.
test("five mobile navigation targets stay accessible and open existing pages", async ({
  page,
}) => {
  await page.goto("/");
  for (const digit of "123456") {
    await page.getByRole("button", { name: `Số ${digit}` }).click();
  }

  const navigation = page.getByRole("navigation", { name: "Điều hướng chính" });
  await expect(navigation).toBeVisible();
  const labels = ["Trang chủ", "Giao dịch", "QR", "Lịch sử", "Cá nhân"];

  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 780 });
    await expect(navigation.getByRole("button")).toHaveCount(5);
    for (const label of labels) {
      const button = navigation.getByRole("button", { name: label });
      await expect(button).toBeVisible();
      const bounds = await button.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
    }
  }

  await navigation.getByRole("button", { name: "QR" }).click();
  await expect(page.getByRole("heading", { name: "Nạp tiền" })).toBeVisible();
  await expect(navigation.getByRole("button", { name: "QR" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await navigation.getByRole("button", { name: "Giao dịch" }).click();
  await expect(page.getByRole("heading", { name: "Chuyển tiền" })).toBeVisible();

  await navigation.getByRole("button", { name: "Cá nhân" }).click();
  await expect(page.getByRole("heading", { name: "Cá nhân" })).toBeVisible();
  await expect(page.getByText("0788818374")).toBeVisible();

  await navigation.getByRole("button", { name: "Trang chủ" }).click();
  await expect(navigation.getByRole("button", { name: "Trang chủ" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});
