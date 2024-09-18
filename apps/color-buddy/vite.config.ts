import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import postcss from "./postcss.config.js";

import Icons from "unplugin-icons/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), Icons({ compiler: "svelte" })],
  css: {
    postcss,
  },
  worker: {
    format: "es",
  },
});
