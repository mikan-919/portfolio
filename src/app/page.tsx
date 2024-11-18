import AnimateBackground from '@/components/blocks/AnimateBackground'
import Header from '@/components/blocks/Header'
import GitHub from '@/components/icon/simpleicons.github'
import X from '@/components/icon/simpleicons.x'
import { buttonVariants } from '@/components/ui/button'
import { H1, H2, P } from '@/components/ui/typography'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Header />
      <section className=''>
        <AnimateBackground />
        <div className='absolute flex flex-col justify-evenly h-full pt-16 pl-4 md:pl-8 lg:p-16'>
          <div>
            <H1 className='lg:text-7xl md:text-5xl font-sans'>摘果みかん / Mikan 919</H1>
            <P className='lg:text-lg text-base mb-4 italic font-sans'>
              高校一年生,アプリ甲子園二次脱落,他の成果は特になし
              <br />
              ...書いてみたけどかなり悲惨な状況だな。
            </P>
          </div>
          <div className='flex space-x-4'>
            <Link
              href='https://github.com/mikan-919'
              className={buttonVariants({ variant: 'link' })}
            >
              <GitHub className='size-6' />
              <span>GitHub</span>
            </Link>
            <Link
              href='https://x.com/mikan_919_main'
              className={buttonVariants({ variant: 'link' })}
            >
              <X className='size-6' />
              <span>X</span>
            </Link>
          </div>
        </div>
      </section >
      <pre className=' min-h-[200vh] max-w-[100vw] overflow-x-hidden text-xs'>
        {Array(200)
          .fill(0)
          .map((_, i) => i)
          .map((e) => '='.repeat(e) + '>')
          .join('\n')}
      </pre>
    </>
  )
}
