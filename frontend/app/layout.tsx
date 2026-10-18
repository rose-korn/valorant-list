import type { Metadata, Viewport } from 'next'
import { Bai_Jamjuree, Chakra_Petch, Itim } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

// ฟอนต์ไทยจาก Cadson Demak — หัวข้อเหลี่ยม ๆ เข้ากับเกม, เนื้อหาอ่านง่าย
const chakra = Chakra_Petch({
  subsets: ['thai', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-chakra',
})

const bai = Bai_Jamjuree({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600'],
  variable: '--font-bai',
})

// ลายมือ สำหรับโน้ตเล็ก ๆ
const itim = Itim({
  subsets: ['thai', 'latin'],
  weight: ['400'],
  variable: '--font-itim',
})

export const metadata: Metadata = {
  title: {
    default: 'Valorant List — สมุดข้อมูล Valorant ฉบับแฟนเมด',
    template: '%s · Valorant List',
  },
  description: 'เว็บรวมข้อมูล Valorant ที่ทำไว้ดูกับเพื่อน ๆ — เอเจนท์ แผนที่ ปืน สกิน แรงค์ บันเดิล และของสะสม หมุนดูแบบ 3D ได้',
}

export const viewport: Viewport = {
  themeColor: '#f4efe6',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${chakra.variable} ${bai.variable} ${itim.variable}`}>
      <body suppressHydrationWarning className="font-body text-ink antialiased">
        <Navbar />
        <main className="min-h-dvh pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
