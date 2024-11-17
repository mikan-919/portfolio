'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"

function TitleLogo({ isScrolled, isMenuOpen }: { isScrolled: boolean, isMenuOpen: boolean }) {
  return <div className={`flex justify-start transition-opacity lg:w-0 lg:flex-1 ${isScrolled || isMenuOpen ? '' : 'opacity-0'
    }`}>
    <a href="#" className="text-xl text-primary font-rampart">
      摘果みかん / Mikan919
    </a>
  </div>
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

    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMenuOpen ? 'backdrop-blur-md' : 'bg-transparent'
      }`}>
      <div className={`max-w-6xl mx-auto px-4 z-10 lg:px-8 ${isScrolled || isMenuOpen ? 'bg-background/50 ' : ''
        } ${isScrolled && !isMenuOpen ? "shadow-sm" : ""}`}>
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          <TitleLogo isScrolled={isScrolled} isMenuOpen={isMenuOpen} />
          <div className=" md:hidden">
            <Button variant="outline" size={'icon'} onClick={toggleMenu} aria-label="Toggle menu" className='relative'>
              <X className={`absolute transition-all w-6 h-6 ${isMenuOpen ? "" : "scale-0"}`} />
              <Menu className={`absolute transition-all w-6 h-6 ${isMenuOpen ? "scale-0" : ""}`} />
            </Button>
          </div>
          <nav className={`${isScrolled ? 'flex' : 'hidden'} hidden md:flex space-x-10`}>
            <a href="#" className="text-base font-medium text-muted-foreground hover:text-primary">
              Home
            </a>
            <a href="#" className="text-base font-medium text-muted-foreground hover:text-primary">
              Projects
            </a>
            <a href="#" className="text-base font-medium text-muted-foreground hover:text-primary">
              About
            </a>
            <a href="#" className="text-base font-medium text-muted-foreground hover:text-primary">
              Contact
            </a>
          </nav>
          <div className={`${isScrolled ? 'flex' : 'hidden'} hidden md:flex items-center justify-end md:flex-1 lg:w-0`}>
            <Button>Hire Me</Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? ' max-h-72 bottom-0' : 'bottom-72 max-h-0 opacity-0 bg-transparent'} transition-all -z-10 ease-in-out duration-300 relative md:hidden max-w-[100vw] bg-background/50 shadow-sm`
      }>
        <div className="py-3 mx-3">
          <a href="#" className="block px-2 mx-6 py-1 rounded-md text-base font-medium text-primary hover:bg-muted">
            Home
          </a>
          <a href="#" className="block px-2 mx-6 py-1 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-primary">
            Projects
          </a>
          <a href="#" className="block px-2 mx-6 py-1 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-primary">
            About
          </a>
          <a href="#" className="block px-2 mx-6 py-1 rounded-md text-base font-medium text-muted-foreground hover:bg-muted hover:text-primary">
            Contact
          </a>
        </div>
        <div className="pt-4 pb-3 border-t border-muted">
          <div className="px-2">
            <Button className="w-full">Hire Me</Button>
          </div>
        </div>
      </div>
    </header >
  )
}