import { defineCollection, reference, z } from 'astro:content'
import { glob } from 'astro/loaders'

const techStackCollection = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/tech-stack' }),
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
  loader: glob({ pattern: '*.md', base: './src/content/works' }),
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
  techStack: techStackCollection,
}
