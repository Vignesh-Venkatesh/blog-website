# Vignesh | Blog

Astro blog with Markdown and MDX content collections, styled with Tailwind and the portfolio's dark green theme.

## Writing a post

Add a `.md` or `.mdx` file to `src/data/blog/`. The filename becomes the URL: `my-post.mdx` is available at `/blog/my-post`.

```yaml
---
title: "My new post"
description: "A short description for listings and search engines."
date: 2026-10-31
category: technical
tags: [astro, projects]
draft: false
showOnHome: true
# pinnedPost: true
# updated: 2026-11-01
# cover: "/images/covers/my-post.webp"
# format: project
---
```

Write normal Markdown below the frontmatter. Use MDX when embedding components. Existing posts demonstrate callouts, optimized figures, diagrams, and interactive shader examples.

- `category`: `technical` (default) or `notebook`.
- `draft`: defaults to `true`. Draft URLs are available in development but excluded from production and public lists.
- `showOnHome`: legacy field, defaults to `false`. The homepage now lists all published posts.
- `pinnedPost`: defaults to `false`. Set this to `true` to feature a published post in the homepage's pinned posts section. Pinned posts appear newest first and also appear in the all posts list below, grouped by year. Drafts remain hidden.
- `format`: optional `project`, `paper`, `essay`, `note`, `photo`, or `poem`.
- Dates, title, and description are validated by `src/content.config.ts`.

Put public cover images in `public/images/covers/`. For optimized inline images, import assets from `src/assets/` and use `Figure.astro`.

Fenced code blocks support syntax highlighting, copy buttons, filenames, and line highlighting through Expressive Code.

## Commands

- `bun install` — install dependencies.
- `bun run dev` — start the local development server.
- `bun run build` — validate content and build the static site into `dist/`.
- `bun run preview` — preview the production build.

## Structure

- `src/data/blog/` — Markdown and MDX articles.
- `src/content.config.ts` — frontmatter schema and content loader.
- `src/pages/blog/[...slug].astro` — generated article routes.
- `src/layouts/` — shared site and article layouts.
- `src/components/` — site navigation, post lists, and MDX components.
- `src/pages/technical.astro`, `notebook.astro`, `archive.astro`, `tags/` — browsing routes.

## GitHub Pages deployment

`.github/workflows/deploy.yml` builds on pushes to `main` and supports manual runs.

In the GitHub repository settings:

- Set **Pages → Source** to **GitHub Actions**.
- Set the Actions repository variable **ENABLE_DEPLOY** to `true` to enable deployment. Without it, deployment is skipped.

The workflow installs Node 22.23.4 and Bun, installs dependencies with the frozen lockfile, builds the site, and deploys `dist/` to GitHub Pages. `public/CNAME` preserves the existing domain, `blog.vigneshvenkatesh.com`.
