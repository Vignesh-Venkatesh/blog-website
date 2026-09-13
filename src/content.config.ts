import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";


const blog = defineCollection({
  loader: glob({
    base: "./src/data/blog",
    pattern: "**/*.(md|mdx)"
  }),

  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    category: z.enum(["technical", "notebook"]).default("technical"),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
    cover: z.string().optional(),
    format: z.enum(["project", "paper", "essay", "note", "photo", "poem"]).optional(),
  })
})

export const collections = {blog}
