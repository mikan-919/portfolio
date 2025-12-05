import { defineCollection, reference, z } from 'astro:content'
import { file, glob } from 'astro/loaders'

// TechStackコレクションの定義
const techStackCollection = defineCollection({
  loader: glob({ pattern: 'tech-stack/*.md', base: './src/content' }),
  schema: () =>
    z.object({
      displayName: z.string(),
      description: z.string(),
      publisher: z.string(),
      officialSite: z.string().url().optional(),
      github: z.string().url().optional(),
      iconId: z.string(),
    }),
})

// Worksコレクションの定義
const worksCollection = defineCollection({
  loader: glob({ pattern: 'works/*.md', base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.enum(['web site', 'web app', 'mobile app', 'desktop app', 'game', 'other']),
      techStack: z.array(reference('techStack')),
      description: z.string(),
      role: z.string().optional(),
      tags: z.array(z.string()),
      image: image().optional(),
      gallery: z.array(image()).optional(),
      link: z.string().url().optional(),
      github: z.string().url().optional(),
      isComingSoon: z.boolean().default(false),
      publishDate: z.date(),
    }),
})

// Articlesコレクションの定義
const articlesCollection = defineCollection({
  loader: glob({ pattern: 'articles/*.md', base: './src/content' }),
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
  techStack: techStackCollection,
}
