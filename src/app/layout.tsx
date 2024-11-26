import type { Metadata } from 'next'
import './globals.css'
import fonts from '@/lib/fonts'
import ThemeProvider from '@/components/providers/ThemeProvider'
import Header from '@/components/blocks/Header'

export const metadata: Metadata = {
  title: '摘果みかん / Mikann 919',
  description: 'やる気ない',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='ja' suppressHydrationWarning>
      <body className={`${fonts} bg-background m-0 font-sans antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
