export type WorksCardProps = {
  id: string
  title: string
  category: string
  description: string
  image?: unknown
  isComingSoon?: boolean
  tags: string[]
  link?: string
  github?: string
  date?: Date
  role?: string
  tight?: boolean
}

export type ArticleCardProps = {
  slug: string
  title: string
  description: string
  summary?: string
  tags: string[]
  image?: unknown
  date: Date
}
