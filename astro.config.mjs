// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: "ayu-dark",
      wrap: false,
    },
  },
  integrations: [mdx(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  site: "http://blog.vigneshvenkatesh.com",
});
