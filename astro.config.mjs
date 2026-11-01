// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import expressiveCode from 'astro-expressive-code';
import rehypeHeadingSquares from './src/plugins/rehype-heading-squares.mjs';

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  markdown: { processor: unified({ rehypePlugins: [rehypeHeadingSquares] }) },
  integrations: [
    react(),
    expressiveCode({
      themes: ['github-dark'],
      frames: { showCopyToClipboardButton: true },
      styleOverrides: {
        borderColor: 'var(--color-border)',
        borderRadius: '4px',
        codeBackground: 'var(--color-surface)',
        codeForeground: 'var(--color-foreground)',
        codeFontFamily: 'var(--font-google)',
        codeFontSize: '0.75rem',
        codeLineHeight: '1.7',
        uiFontFamily: 'var(--font-google)',
        focusBorder: 'var(--color-accent)',
      },
    }),
    mdx(),
  ],
});
