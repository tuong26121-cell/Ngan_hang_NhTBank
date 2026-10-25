import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: { outDir: "../dist", emptyOutDir: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./frontend/src/test/setup.js"],
    include: ["frontend/src/**/*.test.{js,jsx}"],
  },
});
