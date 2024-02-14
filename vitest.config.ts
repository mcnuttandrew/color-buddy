import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [],
  test: {
    setupFiles: ["@vitest/web-worker"],
    environment: "jsdom",
  },
});
