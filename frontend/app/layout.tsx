import type { Metadata, Viewport } from 'next'
import { Bai_Jamjuree, Chakra_Petch, Itim } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { LangProvider } from '@/components/LangProvider'
import { getLang } from '@/lib/i18n-server'

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

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  return {
    title: {
      default: lang === 'en' ? 'Valorant List — a fan-made Valorant notebook' : 'Valorant List — สมุดข้อมูล Valorant ฉบับแฟนเมด',
      template: '%s · Valorant List',
    },
    description:
      lang === 'en'
        ? 'A free fan site for Valorant agents, maps, guns, skins, ranks and collectibles — with 3D views, share cards and a mini aim game.'
        : 'เว็บแฟนเมดฟรี รวมข้อมูลเอเจนท์ แผนที่ ปืน สกิน แรงค์ และของสะสมของ Valorant มีมุมมอง 3D การ์ดแชร์ และมินิเกมฝึกเล็ง',
  }
}

export const viewport: Viewport = {
  themeColor: '#f4efe6',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()
  return (
    <html lang={lang} className={`${chakra.variable} ${bai.variable} ${itim.variable}`}>
      <body suppressHydrationWarning className="font-body text-ink antialiased">
        <LangProvider lang={lang}>
          <Navbar />
          <main className="min-h-dvh pt-16">{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  )
}
