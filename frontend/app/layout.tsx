import type { Metadata } from 'next'
import { Prompt, Chakra_Petch } from 'next/font/google'
import './globals.css'
import Navbar from './_components/Navbar'

// Barlow/Rajdhani have no Thai glyphs, so Thai text fell back to a mismatched
// system font. Prompt + Chakra Petch cover Thai + Latin with the same look.
const barlow = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
})

const rajdhani = Chakra_Petch({
  subsets: ['latin', 'thai'],
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