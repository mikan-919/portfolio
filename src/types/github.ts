export interface GitHubApiResponse {
  data?: GitHubApiData
}

export interface GitHubApiData {
  user?: GitHubUser
}

export interface GitHubUser {
  contributionsCollection?: ContributionsCollection
}

export interface ContributionsCollection {
  contributionCalendar?: ContributionCalendar
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: Week[]
}

export interface Week {
  contributionDays: Day[]
}

export interface Day {
  contributionCount: number
  date: string
}

export type GitHubStatusWeek = Week
export type GitHubStatusDay = Day
