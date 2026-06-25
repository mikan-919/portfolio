import { getCollection } from 'astro:content'
import type { APIRoute, GetStaticPaths } from 'astro'
import { renderOgImage } from '@/lib/og'

export const getStaticPaths: GetStaticPaths = async () => {
  const [articles, works] = await Promise.all([getCollection('articles'), getCollection('works')])
  return [
    ...articles.map(entry => ({
      params: { route: `blog/${entry.id}` },
      props: { title: entry.data.title },
    })),
    ...works.map(entry => ({
      params: { route: `works/${entry.id}` },
      props: { title: entry.data.title },
    })),
  ]
}

export const GET: APIRoute = async ({ props }) => {
  const { title } = props as { title: string }
  const png = await renderOgImage(title)
  return new Response(Buffer.from(png), {
    headers: { 'Content-Type': 'image/png' },
  })
}
