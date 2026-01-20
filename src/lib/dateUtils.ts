export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDateJP(date: Date): string {
  return date.toLocaleDateString(new Intl.Locale('ja-JP'), { dateStyle: 'short' })
}
