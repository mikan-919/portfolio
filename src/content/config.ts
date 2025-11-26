// src/content/config.ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

// Worksコレクションの定義

const worksCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.enum(['web site', 'web app', 'mobile app', 'desktop app', 'game', 'other']),
      description: z.string(),
      tags: z.array(z.string()),
      image: image().optional(),
      link: z.string().url().optional(),
      github: z.string().url().optional(),
      isComingSoon: z.boolean().default(false),
      publishDate: z.date(),
    }),
})

const articlesCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      summary: z.string().optional(),
      tags: z.array(z.string()),
      image: image().optional(),
      publishDate: z.date(),
    }),
})

// エクスポート（ここで名前を決める）
export const collections = {
  works: worksCollection,
  articles: articlesCollection,
}
