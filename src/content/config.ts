// src/content/config.ts
import { defineCollection, z } from 'astro:content'
import { file, glob } from 'astro/loaders'

// Worksコレクションの定義
export const worksCollectionSchema = z.object({
  title: z.string(),
  category: z.enum(['web site', 'web app', 'mobile app', 'desktop app', 'game', 'other']),
  description: z.string(),
  tags: z.array(z.string()),
  image: z.string().url().optional(),
  link: z.string().url().optional(),
  github: z.string().url().optional(),
  isComingSoon: z.boolean().default(false),
  publishDate: z.date(),
})
export type WorksCollectionSchemaType = z.infer<typeof worksCollectionSchema>
const worksCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/works' }),
  schema: worksCollectionSchema,
})

// エクスポート（ここで名前を決める）
export const collections = {
  works: worksCollection,
}
