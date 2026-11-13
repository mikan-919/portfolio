import { getCollection } from 'astro:content'
import { resolve } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import type { APIRoute, GetStaticPaths } from 'astro'
import { renderCoverSvg } from '@/lib/cover'

// ponytail: process.cwd() is project root during astro build, same as og.ts
const fontPath = resolve(process.cwd(), 'src/assets/fonts/UDEVGothicHSLG-Regular.ttf')

export const getStaticPaths: GetStaticPaths = async () => {
  const [articles, works] = await Promise.all([getCollection('articles'), getCollection('works')])
  return [
    ...works.map(entry => ({ params: { route: `works/${entry.id}` } })),
    ...articles.map(entry => ({ params: { route: `articles/${entry.id}` } })),
  ]
}

export const GET: APIRoute = async ({ params }) => {
  const svg = renderCoverSvg(params.route ?? 'cover')
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1280 },
    font: { fontFiles: [fontPath], loadSystemFonts: false, defaultFontFamily: 'UDEV Gothic HSLG' },
  })
  const png = resvg.render().asPng()
  return new Response(Buffer.from(png), {
    headers: { 'Content-Type': 'image/png' },
  })
}
