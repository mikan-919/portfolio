import type { CollectionEntry } from 'astro:content'
import type { ImageMetadata } from 'astro'
import { coverUrl } from '@/lib/cover'

export type ArchiveKind = 'work' | 'article'

export type ArchiveCardData = {
  id: string
  href?: string
  title: string
  excerpt: string
  tags: string[]
  date: Date
  image?: ImageMetadata | string
  meta?: string
  comingSoon?: boolean
  filterKeys: string[]
}

export function workToCard(entry: CollectionEntry<'works'>): ArchiveCardData {
  return {
    id: entry.id,
    href: entry.data.isComingSoon ? undefined : `/works/${entry.id}`,
    title: entry.data.title,
    excerpt: entry.data.description,
    tags: entry.data.tags,
    date: entry.data.date,
    image: entry.data.image ?? coverUrl('works', entry.id),
    meta: entry.data.category,
    comingSoon: entry.data.isComingSoon,
    filterKeys: [entry.data.category.toUpperCase()],
  }
}

export function articleToCard(entry: CollectionEntry<'articles'>): ArchiveCardData {
  return {
    id: entry.id,
    href: `/blog/${entry.id}`,
    title: entry.data.title,
    excerpt: entry.data.summary ?? entry.data.description,
    tags: entry.data.tags,
    date: entry.data.date,
    image: entry.data.image ?? coverUrl('articles', entry.id),
    filterKeys: entry.data.tags,
  }
}
