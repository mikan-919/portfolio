import { defineCollection, reference, z } from 'astro:content'
import { file, glob } from 'astro/loaders'

// TechStackコレクションの定義
const techStackCollection = defineCollection({
  loader: glob({ pattern: 'tech-stack/*.md', base: './src/content' }),
  schema: () =>
    z.object({
      displayName: z.string(),
      description: z.string(),
      publisher: z.string(),
      officialSite: z.string().url().optional(),
      github: z.string().url().optional(),
      iconId: z.string(),
    }),
})

// Worksコレクションの定義
const worksCollection = defineCollection({
  loader: glob({ pattern: 'works/*.md', base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      category: z.enum(['web site', 'web app', 'mobile app', 'desktop app', 'game', 'other']),
      techStack: z.array(reference('techStack')),
      description: z.string(),
      role: z.string().optional(),
      tags: z.array(z.string()),
      image: image().optional(),
      gallery: z.array(image()).optional(),
      link: z.string().url().optional(),
      github: z.string().url().optional(),
      isComingSoon: z.boolean().default(false),
      date: z.date(),
    }),
})

// Articlesコレクションの定義
const articlesCollection = defineCollection({
  loader: glob({ pattern: 'articles/*.md', base: './src/content' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      summary: z.string().optional(),
      tags: z.array(z.string()),
      image: image().optional(),
      date: z.date(),
    }),
})

// GitHub Statusコレクションの定義
const githubStatusCollection = defineCollection({
  loader: async () => {
    const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN
    const username = 'mikan-919'

    if (!GITHUB_TOKEN) {
      console.warn('GITHUB_TOKEN is not set. Skipping GitHub status fetch.')
      return []
    }

    try {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query($userName:String!) {
              user(login: $userName){
                contributionsCollection {
                  contributionCalendar {
                    totalContributions
                    weeks {
                      contributionDays {
                        contributionCount
                        date
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            userName: username,
          },
        }),
      })

      if (!response.ok) {
        console.error(`GitHub API error: ${response.status} ${response.statusText}`)
        return []
      }

      const json = (await response.json()) as any
      const calendar = json.data?.user?.contributionsCollection?.contributionCalendar

      if (!calendar) {
        console.error('Invalid GitHub API response structure')
        return []
      }

      return [
        {
          id: 'contributions',
          ...calendar,
        },
      ]
    } catch (error) {
      console.error('Failed to fetch GitHub contributions:', error)
      return []
    }
  },
  schema: z.object({
    totalContributions: z.number(),
    weeks: z.array(
      z.object({
        contributionDays: z.array(
          z.object({
            contributionCount: z.number(),
            date: z.string(),
          }),
        ),
      }),
    ),
  }),
})

const timelineCollection = defineCollection({
  loader: file('src/content/data/timeline.json'),
  schema: z.object({
    date: z.string().regex(/^[X\d]{4}-[X\d]{2}-[X\d]{2}$/),
    title: z.string(),
    desc: z.string(),
  }),
})

// エクスポート（ここで名前を決める）
export const collections = {
  works: worksCollection,
  articles: articlesCollection,
  techStack: techStackCollection,
  githubStatus: githubStatusCollection,
  timeline: timelineCollection,
}
