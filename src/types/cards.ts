import type { CollectionEntry } from 'astro:content'

export type ArchiveKind = 'work' | 'article'

export type ArchiveCardData = {
  id: string
  href?: string
  title: string
  excerpt: string
  tags: string[]
  date: Date
  image?: CollectionEntry<'works' | 'articles'>['data']['image']
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
    image: entry.data.image,
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
    image: entry.data.image,
    filterKeys: entry.data.tags,
  }
}
