'use client'

import { useEffect, useRef } from 'react'

export default function AnimateBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleResize = () => {
      const rows = container.querySelectorAll('.text-row')
      rows.forEach((row, index) => {
        const rowElement = row as HTMLElement
        rowElement.style.animationDuration = `${120}s`
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className='absolute w-full h-screen overflow-hidden touch-none select-none bg-gradient-to-br to-orange-100 from-orange-300'>
      <div
        ref={containerRef}
        className='relative inset-0 transform -rotate-12 scale-200'
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`text-row whitespace-nowrap ${i % 2 === 0 ? 'animate-slide-right' : 'animate-slide-left'
              }`}
          >
            {Array.from({ length: 10 }).map((_, j) => (
              <span
                key={j}
                className='inline-block mx-4 text-5xl font-bold text-orange-300 font-rampart'
                style={
                  {
                    // WebkitTextStroke: '2px rgba(255, 140, 0, 0.7)',
                    // textStroke: '2px rgba(255, 140, 0, 0.7)',
                  }
                }
              >
                摘果みかん / Mikan 919
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className='absolute md:bottom-0 -bottom-32 md:-translate-x-[16vh] h-[80vh] md:h-[101vh] w-screen lg:max-w-screen-lg md:max-w-screen-sm md:w-screen backdrop-blur-sm bg-background/50 skew-x-0 md:skew-x-[-15deg] md:skew-y-0 skew-y-[15deg] '></div>

      <style jsx>{`
        @keyframes slide-right {
          0% {
            transform: translateX(-200%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        @keyframes slide-left {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-200%);
          }
        }
        .animate-slide-right {
          animation: slide-right linear infinite;
        }
        .animate-slide-left {
          animation: slide-left linear infinite;
        }
        .text-row {
          animation-duration: 2s;
        }
      `}</style>
    </div>
  )
}
