import { createResizeObserver } from '@solid-primitives/resize-observer'
import { createSignal, Show } from 'solid-js'

interface Day {
  date: string
  contributionCount: number
}

interface Week {
  contributionDays: Day[]
}

interface Props {
  weeks: Week[] | undefined
}

export default function ContributionGraph(props: Props) {
  const [visibleWeeks, setVisibleWeeks] = createSignal<Week[]>([])

  let containerRef!: HTMLDivElement

  // オレンジ寄りのGitHub風カラー（2024〜2025現在の色に近い）
  // const getColor = (count: number) => {
  //   if (count === 0) return 'bg-gray-100'
  //   if (count <= 4) return 'bg-orange-200'
  //   if (count <= 9) return 'bg-orange-300'
  //   if (count <= 16) return 'bg-orange-400'
  //   return 'bg-orange-500' // 17以上は一番濃い
  // }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-100'
    if (count <= 3) return 'bg-orange-200'
    if (count <= 8) return 'bg-orange-400'
    if (count <= 15) return 'bg-orange-500'
    return 'bg-orange-600'
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
          <div class='px-8 py-12 text-center border-2 border-dashed rounded-xl border-gray-300 text-gray-500'>
            No contribution data available.
          </div>
        }
      >
        <div class='flex gap-0.5 justify-end'>
          {visibleWeeks().map(week => (
            <div class='flex flex-col gap-0.5'>
              {week.contributionDays.map(day => (
                <div
                  class={`w-2.5 h-2.5 rounded-xs ${getColor(day.contributionCount)}`}
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
