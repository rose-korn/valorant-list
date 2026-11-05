import type { Metadata, Viewport } from 'next'
import { Anton, Bai_Jamjuree, Chonburi, Courier_Prime, Itim, Kanit, Rye } from 'next/font/google'
import '../globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { LangProvider } from '@/components/LangProvider'
import FunLayer from '@/components/FunLayer'
import { SEO_YEAR, SITE_URL, seoKeywords } from '@/lib/seo'
import { getI18n, langParams } from '@/lib/i18n-server'

// ธีม "นิตยสารแฟนเมดพิมพ์ riso" — ชุดฟอนต์เดียวกับโปสเตอร์ Valolist
// หัวข้อ: Kanit หนา ๆ แบบหัวนิตยสาร
const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-kanit',
})

// ตัวเลข/โลโก้ใหญ่ ๆ แบบตัวพาดหัว (ละตินอย่างเดียว)
const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anton',
})

// ตัวพิมพ์ดีด สำหรับเลขฉบับ ป้ายเล็ก ๆ
const courier = Courier_Prime({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-courier',
})

// ฉบับพิเศษงานวัด (มินิเกม / สุ่มเอเจนท์)
const rye = Rye({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-rye',
})
const chonburi = Chonburi({
  subsets: ['thai', 'latin'],
  weight: ['400'],
  variable: '--font-chonburi',
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

// build ไว้ทั้ง /th และ /en ล่วงหน้า ภาษาอื่นไม่มี
export const generateStaticParams = langParams
export const dynamicParams = false

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await getI18n(params)
  return {
    // ให้ canonical / hreflang / og:image กลายเป็น URL เต็ม (Google กับ LINE/FB ต้องการ)
    // canonical + hreflang ใส่แยกรายหน้าผ่าน pageMeta() ใน lib/seo.ts — ห้ามใส่ตรงนี้ ไม่งั้นทุกหน้าจะชี้ไปหน้าแรก
    metadataBase: new URL(SITE_URL),
    title: {
      default: lang === 'en' ? 'Valorant List — a fan-made Valorant notebook' : 'Valorant List — สมุดข้อมูล Valorant ฉบับแฟนเมด',
      template: '%s · Valorant List',
    },
    description:
      lang === 'en'
        ? `A free fan site for Valorant agents, maps, guns, skins, ranks and collectibles, updated for ${SEO_YEAR} — with 3D views, share cards and a mini aim game.`
        : `เว็บข้อมูล Valorant ภาษาไทย ฟรี อัปเดต ${SEO_YEAR} รวมตัวละคร สกิล แมพ ปืน สกิน แรงค์ และของสะสม มีมุมมอง 3D การ์ดแชร์ และมินิเกมฝึกเอม`,
    keywords: seoKeywords[lang],
  }
}

export const viewport: Viewport = {
  themeColor: '#efe8da',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await getI18n(params)
  return (
    <html lang={lang} className={`${kanit.variable} ${anton.variable} ${courier.variable} ${rye.variable} ${chonburi.variable} ${bai.variable} ${itim.variable}`}>
      <body suppressHydrationWarning className="font-body text-ink antialiased">
        <LangProvider lang={lang}>
          <Navbar />
          <main className="min-h-dvh pt-16">{children}</main>
          <Footer lang={lang} />
          <FunLayer />
        </LangProvider>
      </body>
    </html>
  )
}
