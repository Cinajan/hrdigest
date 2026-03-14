import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: 'RecruitPulse — HR Digest',
  description: 'Týdenní výběr nejlepších článků z oblasti HR a recruitmentu v češtině.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
