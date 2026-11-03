'use client'

// ตัวห่อ 3D แบบโหลดทีหลัง: three.js ใหญ่ ~540KB ถ้า import ตรง ๆ มันจะติดไปกับ JS ของหน้า
// ทำให้ตอนกดเปลี่ยนหน้าต้องรอโหลด + parse three.js ให้เสร็จก่อนหน้าใหม่จะโผล่ (เว็บกระตุก/ค้างแป๊บนึง)
// แยกเป็น chunk ต่างหากแล้วโหลดหลังหน้าขึ้นแล้ว หน้าจะเปลี่ยนทันที ส่วน 3D ค่อยตามมา
// หน้าต่าง ๆ ให้ import จากไฟล์นี้ ไม่ใช่จาก ./Viewer3D, ./MapViewer3D, ./PaperScene ตรง ๆ

import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import { useI18n } from '../LangProvider'
import type Viewer3DImpl from './Viewer3D'
import type MapViewer3DImpl from './MapViewer3D'

function Placeholder({ map = false }: { map?: boolean }) {
  const { t } = useI18n()
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="hand animate-pulse text-lg !text-paper/70">{map ? t.viewer.mapLoading : t.viewer.loading}</span>
    </div>
  )
}

const Viewer3DLazy = dynamic(() => import('./Viewer3D'), { ssr: false, loading: () => <Placeholder /> })
const MapViewer3DLazy = dynamic(() => import('./MapViewer3D'), { ssr: false, loading: () => <Placeholder map /> })

/** เศษกระดาษปลิวหน้าแรก — เป็นแค่พื้นหลัง ระหว่างโหลดไม่ต้องโชว์อะไร */
export const PaperScene = dynamic(() => import('./PaperScene'), { ssr: false })

// กล่องนอกจองขนาดไว้ตาม className เดิม ตัว placeholder (absolute) จะได้อยู่ตรงกลางกล่อง ไม่มี layout กระโดด
export function Viewer3D({ className = '', ...props }: ComponentProps<typeof Viewer3DImpl>) {
  return (
    <div className={`relative ${className}`}>
      <Viewer3DLazy {...props} className="h-full w-full" />
    </div>
  )
}

export function MapViewer3D({ className = '', ...props }: ComponentProps<typeof MapViewer3DImpl>) {
  return (
    <div className={`relative ${className}`}>
      <MapViewer3DLazy {...props} className="h-full w-full" />
    </div>
  )
}
