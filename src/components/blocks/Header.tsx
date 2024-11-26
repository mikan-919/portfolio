'use client'

import { useState, useEffect } from 'react'
import { Magnet, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MagneticLink from '@/components/ui/MagneticLink'
import Link from 'next/link'

function TitleLogo({
  isScrolled,
  isMenuOpen,
}: { isScrolled: boolean; isMenuOpen: boolean }) {
  return (
    <div
      className={`flex justify-start transition-opacity lg:w-0 lg:flex-1 ${isScrolled || isMenuOpen ? '' : 'opacity-0'
        }`}
    >
      <Link href='/' className='text-xl text-primary font-rampart'>
        摘果みかん / Mikan919
      </Link>
    </div>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 256) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${isScrolled || isMenuOpen
        ? 'bg-muted/25 backdrop-blur-md'
        : 'bg-transparent'
        } duration-300 ${isScrolled && !isMenuOpen ? 'shadow-md' : ''}`}
    >
      <div className='max-w-6xl mx-auto px-4 z-10 lg:px-8'>
        <div className='flex justify-between items-center py-4 md:justify-start md:space-x-10'>
          <TitleLogo isScrolled={isScrolled} isMenuOpen={isMenuOpen} />
          <div className=' md:hidden'>
            <Button
              variant='outline'
              size={'icon'}
              onClick={toggleMenu}
              aria-label='Toggle menu'
              className='relative'
            >
              <X
                className={`absolute transition-all w-6 h-6 ${isMenuOpen ? '' : 'scale-0'}`}
              />
              <Menu
                className={`absolute transition-all w-6 h-6 ${isMenuOpen ? 'scale-0' : ''}`}
              />
            </Button>
          </div>
          <ul
            className={`${isScrolled ? 'flex' : 'hidden'} rounded-lg hidden md:flex space-x-10`}
          >
            <MagneticLink isVertical={false} navItems={[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },]} />
          </ul>
          <div
            className={`${isScrolled ? 'flex' : 'hidden'} hidden md:flex items-center justify-end md:flex-1 lg:w-0`}
          >
            <Button>Hire Me</Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${isMenuOpen ? ' max-h-72 bottom-0' : 'bottom-56 max-h-0 opacity-0 bg-transparent'} transition-all  -z-10  duration-300 relative md:hidden max-w-[100vw] `}
      >
        <ul className='relative py-3 mx-3'>
          <MagneticLink
            isVertical={true}
            className='block px-2 mx-6 py-1 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-primary' navItems={[
              { label: "Home", href: "/" },
              { label: "Projects", href: "/projects" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },]} />
        </ul>
        <div className='pt-4 pb-3 border-t border-muted'>
          <div className='px-2'>
            <Button className='w-full'>Hire Me</Button>
          </div>
        </div>
      </div>
    </header>
  )
}
