import type { Metadata } from 'next'
import { Barlow, Rajdhani } from 'next/font/google'
import './globals.css'
import Navbar from './component/navbar'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-rajdhani',
})

export const metadata: Metadata = {
  title: 'Valorant List',
  description: 'Fan site — Agents, Maps, Weapons',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body suppressHydrationWarning className={`${barlow.variable} ${rajdhani.variable} font-barlow bg-[#0f1923] text-white`}>
        <Navbar />
        <main className="pt-14">
          {children}
        </main>
      </body>
    </html>
  )
}