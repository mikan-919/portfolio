import { createResizeObserver } from '@solid-primitives/resize-observer'
import { createSignal, Show } from 'solid-js'

interface Week {
  contributionDays: Day[]
}

interface Day {
  date: string
  contributionCount: number
}

interface Props {
  weeks: Week[] | undefined
}

export default function ContributionGraph(props: Props) {
  const [visibleWeeks, setVisibleWeeks] = createSignal<Week[]>([])

  let containerRef!: HTMLDivElement

  const getColor = (count: number) => {
    if (count === 0) return 'bg-lp-border-subtle'
    if (count <= 3) return 'bg-lp-accent/25'
    if (count <= 8) return 'bg-lp-accent/50'
    if (count <= 15) return 'bg-lp-accent/75'
    return 'bg-lp-accent'
  }

  createResizeObserver(
    () => containerRef,
    entry => {
      if (!props.weeks || !entry) return

      const width = entry.width
      const weekWidth = 12 // 10px + 2px gap
      const maxWeeks = Math.ceil(width / weekWidth)

      if (maxWeeks > 0) {
        setVisibleWeeks(props.weeks.slice(-maxWeeks))
      } else {
        setVisibleWeeks([])
      }
    },
  )

  return (
    <div
      ref={containerRef}
      class='w-full flex justify-center'
    >
      <Show
        when={props.weeks && visibleWeeks().length > 0}
        fallback={
          <div class='px-8 py-12 text-center rounded-lg border border-dashed border-lp-border text-lp-muted'>
            No contribution data available.
          </div>
        }
      >
        <div class='flex gap-0.5 justify-end'>
          {visibleWeeks().map(week => (
            <div class='flex flex-col gap-0.5'>
              {week.contributionDays.map(day => (
                <div
                  class={`w-2.5 h-2.5 rounded-[2px] ${getColor(day.contributionCount)}`}
                  title={`${day.date}: ${day.contributionCount} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </Show>
    </div>
  )
}
