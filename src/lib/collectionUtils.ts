import type { CollectionEntry } from 'astro:content'

export type SortableCollectionEntry = CollectionEntry<'works' | 'articles'>

export function sortByDateDescending<T extends SortableCollectionEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export function sortByDateAscending<T extends SortableCollectionEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf())
}

export function pickFeatured(entries: CollectionEntry<'works'>[]): CollectionEntry<'works'> | undefined {
  return entries.find(entry => entry.data.featured) ?? entries.find(entry => entry.data.image) ?? entries[0]
}
