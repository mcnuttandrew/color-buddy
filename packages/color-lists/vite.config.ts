// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "./main.ts"),
      name: "color-buddy-color-lists",
      // the proper extensions will be added
      fileName: "color-lists",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          //   vue: "Vue",
        },
      },
    },
    sourcemap: true,
  },
  plugins: [dts()],
});
