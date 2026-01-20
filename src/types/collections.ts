import type { CollectionEntry } from 'astro:content'

export type WorksListProps = {
  works: CollectionEntry<'works'>[]
}

export type ArticlesListProps = {
  articles: CollectionEntry<'articles'>[]
}
