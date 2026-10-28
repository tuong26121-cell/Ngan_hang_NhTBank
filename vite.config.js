import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["terminal.local"],
    proxy: {
      "/api": {
        target: process.env.NHT_BACKEND_URL || "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
  build: { outDir: "../dist", emptyOutDir: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./frontend/src/test/setup.js"],
    include: ["frontend/src/**/*.test.{js,jsx}"],
  },
});
