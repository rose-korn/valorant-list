import type { NextConfig } from 'next'

// build เป็นไฟล์ static ล้วน (โฟลเดอร์ out/) เอาขึ้น Cloudflare Pages ได้ตรง ๆ ไม่ต้องมี server
const nextConfig: NextConfig = {
  output: 'export',
  experimental: {
    // 404 กลางของทั้งเว็บ (layout หลักอยู่ใต้ /[lang] เลยทำ not-found ธรรมดาครอบทุก path ไม่ได้)
    globalNotFound: true,
  },
}

export default nextConfig
