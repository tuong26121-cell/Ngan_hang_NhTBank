import { test, expect } from "@playwright/test";

for (const width of [320, 360, 390, 430]) {
  test(`acceptance UI at ${width}px`, async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "One Chromium run per width; full journey also runs on mobile.",
    );
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("./");
    for (const n of "123456")
      await page.getByRole("button", { name: `Số ${n}`, exact: true }).click();
    await expect(page.getByRole("heading", { name: /Xin chào/ })).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Điều hướng chính" });
    await expect(nav.getByRole("button")).toHaveText([
      "Trang chủ",
      "Giao dịch",
      "QR",
      "Lịch sử",
      "Cá nhân",
    ]);
    for (const [label, heading] of [
      ["Trang chủ", /Xin chào/],
      ["Giao dịch", "Chuyển tiền"],
      ["QR", "Nạp tiền"],
      ["Lịch sử", "Lịch sử giao dịch"],
      ["Cá nhân", "Cá nhân"],
    ]) {
      await nav.getByRole("button", { name: label, exact: true }).click();
      await expect(
        page
          .getByRole("heading", {
            name: heading,
            exact: typeof heading === "string",
          })
          .first(),
      ).toBeVisible();
      await expect(
        nav.getByRole("button", { name: label, exact: true }),
      ).toHaveAttribute("aria-current", "page");
      const result = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        targets: [...document.querySelectorAll("button")]
          .filter((e) => e.getClientRects().length)
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width < 43.9 || r.height < 43.9;
          })
          .map((e) => e.textContent.trim() || e.getAttribute("aria-label")),
      }));
      expect(result, label).toEqual({ overflow: false, targets: [] });
    }
    await nav.getByRole("button", { name: "Trang chủ", exact: true }).click();
    const amount = page.getByLabel("4.056.000 VNĐ", { exact: true });
    await expect(amount).toHaveText("4.056.000");
    await page.getByRole("button", { name: "Ẩn số dư" }).click();
    await expect(page.getByLabel("Số dư đã ẩn")).toBeVisible();
    await page.getByRole("button", { name: "Hiện số dư" }).click();
    await expect(amount).toHaveText("4.056.000");
    await page.screenshot({
      path: `test-results/acceptance-${width}.png`,
      fullPage: true,
      animations: "disabled",
    });
    await page.setViewportSize({ width: 844, height: width });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await nav.getByRole("button", { name: "Giao dịch", exact: true }).click();
    await expect(page.getByLabel("Ngân hàng nhận")).toBeVisible();
    expect(errors).toEqual([]);
  });
}
