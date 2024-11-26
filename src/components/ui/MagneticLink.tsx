"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface MagneticNavProps {
  navItems: { label: string, href: string }[]
  className: string
  isVertical: boolean
}
export default function MagneticNav({ navItems, className, isVertical }: MagneticNavProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, left: 0, top: 0 })
  const navRef = useRef<HTMLElement>(null)
  const navItemsRef = useRef<(HTMLAnchorElement | null)[]>([])


  useEffect(() => {
    if (hoverIndex !== null) {
      const hoverItem = navItemsRef.current[hoverIndex]
      if (hoverItem) {
        const { width, height, left, top } = hoverItem.getBoundingClientRect()
        const navRect = navRef.current?.getBoundingClientRect()
        const navLeft = navRect?.left || 0
        const navTop = navRect?.top || 0
        setDimensions({ width, height, left: left - navLeft, top: top - navTop })
      }
    }
  }, [hoverIndex])


  return (<nav
    ref={navRef}
    className={`relative p-2 ${isVertical ? 'flex-col' : 'flex-row'
      }`}
  >
    <motion.div
      className="absolute left-0 top-0 rounded-md bg-muted-foreground/50"
      animate={{
        width: dimensions.width,
        height: dimensions.height,
        x: dimensions.left,
        y: dimensions.top,
        opacity: hoverIndex !== null ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    />
    <ul className={`relative flex gap-2 ${isVertical ? 'flex-col' : 'flex-row'}`}>
      {navItems.map((item, index) => (
        <li key={item.label}>
          <a
            ref={(el) => {
              if (el) {
                navItemsRef.current[index] = el;
              }
            }}
            href={item.href}
            className={`relative block rounded-md px-4 py-2 text-sm font-medium text-muted-foreground  transition-colors hover:text-primary ${isVertical ? 'w-full' : ''
              }`}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
  )
}
