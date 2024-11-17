import type { ReactNode } from 'react'
import { Inter, M_PLUS_2, Rampart_One, Sawarabi_Gothic } from 'next/font/google'

const inter = Inter({
	subsets: ['latin'], display: 'swap',
	variable: '--font-inter',
})
const rampartOne = Rampart_One({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-rampart-one',
})
const mPlus2 = M_PLUS_2({
	weight: 'variable',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-m-plus-2',
})

export default `${inter.variable} ${rampartOne.variable} ${mPlus2.variable}`