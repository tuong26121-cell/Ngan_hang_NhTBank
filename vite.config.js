import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { thongTinPhienBan } from "./scripts/thong-tin-phien-ban.mjs";
const phienBan = thongTinPhienBan();
export default defineConfig({
  define: { __NHT_PHIEN_BAN__: JSON.stringify(phienBan) },
  plugins: [react()],
  server: { allowedHosts: ["terminal.local"] },
  build: { outDir: "../dist", emptyOutDir: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./frontend/src/test/setup.js"],
    include: ["frontend/src/**/*.test.{js,jsx}", "backend/**/*.test.js"],
  },
});
