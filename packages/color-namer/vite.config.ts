// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "./main.ts"),
      name: "color-buddy-color-namer",
      // the proper extensions will be added
      fileName: "color-namer",
    },
    sourcemap: true,
    rollupOptions: {
      external: ["colorjs.io"],
    },
  },
  plugins: [dts()],
});
