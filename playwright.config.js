import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.NHT_TEST_URL || "http://127.0.0.1:4173",
    launchOptions: process.env.NHT_CHROMIUM_PATH
      ? { executablePath: process.env.NHT_CHROMIUM_PATH }
      : {},
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
    {
      name: "android",
      use: { ...devices["Pixel 7"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: process.env.NHT_TEST_URL
    ? undefined
    : {
        command: "npm run dev -- --port 4173 --strictPort",
        url: "http://127.0.0.1:4173",
        reuseExistingServer: false,
      },
});
