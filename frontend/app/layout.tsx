import type { Metadata, Viewport } from 'next'
import { Anton, Barlow, Kanit } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anton',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
})

// ฟอนต์ไทย ใช้เป็น fallback ของทั้ง display และ body
const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-kanit',
})

export const metadata: Metadata = {
  title: {
    default: 'Valorant List — Agents, Maps, Weapons & More',
    template: '%s · Valorant List',
  },
  description: 'แฟนไซต์ Valorant รวมข้อมูลเอเจนท์ แผนที่ อาวุธ สกิน แรงค์ บันเดิล และของสะสม พร้อมมุมมอง 3D',
}

export const viewport: Viewport = {
  themeColor: '#0f1923',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${anton.variable} ${barlow.variable} ${kanit.variable}`}>
      <body suppressHydrationWarning className="font-body antialiased">
        <Navbar />
        <main className="min-h-dvh pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
