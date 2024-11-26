'use client'
import AnimateBackground from '@/components/blocks/AnimateBackground'
import Header from '@/components/blocks/Header'
import { useWindowDimensions } from '@/components/hooks/useWindowDimensions'
import GitHub from '@/components/icon/simpleicons.github'
import X from '@/components/icon/simpleicons.x'
import { Button, buttonVariants } from '@/components/ui/button'
import { H1, H2, P } from '@/components/ui/typography'
import Link from 'next/link'
import { Suspense } from 'react'

export const experimental_ppr = true

export default function Home() {
  const { width, height } = useWindowDimensions(window, 100)
  return (
    <>
      <section>
        <Suspense
          fallback={
            <div className='absolute w-full h-screen overflow-hidden touch-none select-none bg-gradient-to-br to-orange-100 from-orange-300' />
          }
        >
          <AnimateBackground width={width} height={height} />
        </Suspense>
        <div className='relative flex flex-col justify-evenly h-screen pt-16 pl-4 md:pl-8 lg:p-16'>
          <div>
            <H1 className='lg:text-7xl md:text-5xl font-sans'>
              摘果みかん / Mikan 919
            </H1>
            <P className='lg:text-lg text-base mb-4 italic font-sans'>
              高校一年生,アプリ甲子園二次脱落,他の成果は特になし
              <br />
              ...書いてみたけどかなり悲惨な状況だな。
            </P>
          </div>
          <div className='flex space-x-4'>
            <Button asChild variant='link'>
              <Link href='https://github.com/mikan-919'>
                <GitHub className='size-6' />
                <span>GitHub</span>
              </Link>
            </Button>
            <Button asChild variant='link'>
              <Link href='https://x.com/mikan_919_main'>
                <X className='size-6' />
                <span>X</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
