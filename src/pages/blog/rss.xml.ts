import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const articles = await getCollection('articles')
  const sorted = articles.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())

  return rss({
    title: 'mikan-919 | Blog',
    description: '摘果みかんのブログ。日常とプログラミングについて書いています。',
    site: context.site ?? context.url.origin,
    items: sorted.map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    customData: '<language>ja</language>',
  })
}
