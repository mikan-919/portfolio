import { cn } from '@/lib/utils'
import { ceil, uniqueId } from 'lodash'
import { useCallback, type CSSProperties } from 'react'

const ANIMATION_BLOCK_WIDTH = 500 //実測値, フォントが固定なので変更は不要なはず
const ANIMATION_BLOCK_HEIGHT = 100

function AnimationBlock({
  style,
  className,
}: { style?: CSSProperties; className: string }) {
  return (
    <span
      className={cn(
        'inline-block px-4 text-5xl font-bold text-orange-300 font-rampart',
        className
      )}
      style={style}
    >
      摘果みかん / Mikan 919
    </span>
  )
}

interface AnimateBackgroundProps {
  width: number
  height: number
}
export default function AnimateBackground({
  width,
  height,
}: AnimateBackgroundProps) {
  const rowCount = ceil((width / ANIMATION_BLOCK_WIDTH) * 2) + 1
  const colCount = ceil((height / ANIMATION_BLOCK_HEIGHT) * 2) + 3

  const AnimationRow = ({
    slideRight,
    duration,
  }: { slideRight: boolean; duration: number }) =>
    Array.from({ length: rowCount }).map((_, i) => (
      <AnimationBlock
        key={uniqueId()}
        style={{
          animationDuration: `${duration}s`,
        }}
        className={slideRight ? 'animate-slide-right' : 'animate-slide-left'}
      />
    ))

  const AnimationCol = () => (
    <>
      {Array.from({ length: colCount }).map((_, i) => (
        <div className='text-row whitespace-nowrap' key={uniqueId()}>
          <AnimationRow
            slideRight={i % 2 === 0}
            duration={(150 + 50 * Math.sin(i * 0.2 * Math.PI)) / 10}
          />
        </div>
      ))}
    </>
  )

  return (
    <div className='absolute w-full h-screen overflow-hidden touch-none select-none bg-gradient-to-br to-orange-100 from-orange-300'>
      <div className='relative inset-0 transform -rotate-12 scale-200'>
        <AnimationCol />
      </div>
      <div className='absolute md:bottom-0 -bottom-32 md:-translate-x-[16vh] h-[80vh] md:h-[101vh] w-screen lg:max-w-screen-lg md:max-w-screen-sm md:w-screen backdrop-blur-sm bg-background/50 skew-x-0 md:skew-x-[-15deg] md:skew-y-0 skew-y-[15deg] ' />
    </div>
  )
}
