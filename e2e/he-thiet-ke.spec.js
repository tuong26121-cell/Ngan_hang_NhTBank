import { test, expect } from "@playwright/test";
import { registerAndLogin } from "./auth-helper";

test("UX-01 tokens, keyboard, reduced motion and short auth screen", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Computed contract checked once in Chromium",
  );
  await page.setViewportSize({ width: 320, height: 480 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "Đăng nhập NhTBank" }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  expect(
    await page.evaluate(() => document.activeElement.matches(":focus-visible")),
  ).toBe(true);
  await page.getByRole("button", { name: "Đăng ký tài khoản" }).click();
  const submit = page.getByRole("button", { name: "Tạo tài khoản demo" });
  await submit.scrollIntoViewIfNeeded();
  await expect(submit).toBeInViewport();
  const auth = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > innerWidth,
    small: [
      ...document.querySelectorAll(".auth-card button, .auth-fields > input"),
    ]
      .filter((e) => e.getClientRects().length)
      .some((e) => e.getBoundingClientRect().height < 44),
  }));
  expect(auth).toEqual({ overflow: false, small: false });
  await page.reload();
  await registerAndLogin(page);
  const contract = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    const luminance = (hex) => {
      hex = hex.trim();
      if (hex.length === 4)
        hex = "#" + [...hex.slice(1)].map((c) => c + c).join("");
      const rgb = hex
        .trim()
        .slice(1)
        .match(/../g)
        .map((v) => parseInt(v, 16) / 255)
        .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
      return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
    };
    const ratio = (a, b) => {
      const x = luminance(style.getPropertyValue(a)),
        y = luminance(style.getPropertyValue(b));
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    return {
      ratios: [
        ratio("--nht-ink", "--nht-page"),
        ratio("--nht-muted", "--nht-surface"),
        ratio("--nht-primary", "--nht-surface"),
        ratio("--nht-error", "--nht-error-wash"),
        ratio("--nht-success", "--nht-surface"),
      ],
      motion: getComputedStyle(document.querySelector(".button"))
        .transitionDuration,
    };
  });
  for (const ratio of contract.ratios)
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  expect(contract.motion).toBe("0s");
  await page.getByRole("button", { name: "Ẩn số dư" }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(
      () => getComputedStyle(document.activeElement).outlineStyle,
    ),
  ).toBe("solid");
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Số dư đã ẩn")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("4.056.000 VNĐ", { exact: true })).toBeVisible();
  await info.attach("token-contrast", {
    body: JSON.stringify(contract, null, 2),
    contentType: "application/json",
  });
});
