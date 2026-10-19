import { getCollection } from 'astro:content'
import { Resvg } from '@resvg/resvg-js'
import type { APIRoute, GetStaticPaths } from 'astro'
import { renderCoverSvg } from '@/lib/cover'

export const getStaticPaths: GetStaticPaths = async () => {
  const [articles, works] = await Promise.all([getCollection('articles'), getCollection('works')])
  return [
    ...works.map(entry => ({ params: { route: `works/${entry.id}` } })),
    ...articles.map(entry => ({ params: { route: `articles/${entry.id}` } })),
  ]
}

export const GET: APIRoute = async ({ params }) => {
  const svg = renderCoverSvg(params.route ?? 'cover')
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1280 } })
  const png = resvg.render().asPng()
  return new Response(Buffer.from(png), {
    headers: { 'Content-Type': 'image/png' },
  })
}
