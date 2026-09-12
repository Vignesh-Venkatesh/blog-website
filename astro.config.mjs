// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import expressiveCode from "astro-expressive-code";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    react(),

    expressiveCode({
      themes: ["github-dark"],

      frames: {
        showCopyToClipboardButton: true,
      },

      styleOverrides: {
        borderColor: "var(--color-border)",
        borderRadius: "4px",
        borderWidth: "1px",

        codeBackground: "var(--color-surface)",
        codeForeground: "var(--color-foreground)",

        codeFontFamily: "var(--font-mono)",
        codeFontSize: "0.75rem",
        codeFontWeight: "400",
        codeLineHeight: "1.7",

        codePaddingBlock: "1.15rem",
        codePaddingInline: "1.25rem",

        uiFontFamily: "var(--font-mono)",
        uiFontSize: "0.625rem",
        uiFontWeight: "400",

        focusBorder: "var(--color-accent)",

        frames: {
          editorBackground: "var(--color-surface)",

          editorTabBarBackground: "var(--color-bg)",
          editorTabBarBorderColor: "var(--color-border)",
          editorTabBarBorderBottomColor: "var(--color-border)",

          editorActiveTabBackground: "var(--color-surface)",
          editorActiveTabForeground: "var(--color-muted)",
          editorActiveTabBorderColor: "var(--color-border)",

          editorActiveTabIndicatorTopColor: "var(--color-accent)",
          editorActiveTabIndicatorBottomColor: "transparent",
          editorActiveTabIndicatorHeight: "1px",

          inlineButtonForeground: "var(--color-muted)",

          shadowColor: "transparent",
          frameBoxShadowCssValue: "none",

          terminalBackground: "var(--color-surface)",
          terminalTitlebarBackground: "var(--color-bg)",
          terminalTitlebarBorderBottomColor: "var(--color-border)",
          terminalTitlebarForeground: "var(--color-muted)",
          terminalTitlebarDotsForeground: "var(--color-faint)",
        },
      },
    }),

    mdx(),
  ],
});
