'use client'

import { useEffect } from 'react'

/*
 * ล็อกการเลื่อนหน้าเว็บตอนเปิด modal/เมนู โดยรางของ scrollbar ด้านขวายังอยู่ (ซ่อนแค่ thumb)
 * (ไม่ใช้ overflow:hidden ซึ่งทำให้ scrollbar หายทั้งแถบและหน้าเลื่อนข้าง)
 * วิธีนี้: กัน wheel/touch/ปุ่มคีย์บอร์ดที่จะเลื่อนหน้า และถ้าหน้ายังเลื่อนได้
 * (เช่นลาก thumb) ก็ดึงกลับตำแหน่งเดิมทันที ส่วนกล่องที่เลื่อนได้ข้างใน modal ยังเลื่อนได้ปกติ
 */

let locks = 0
let savedY = 0
let touchY = 0
let touchX = 0
let teardown: (() => void) | null = null

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

/** หากล่องที่เลื่อนได้ (ไม่ใช่ตัวหน้า) ตั้งแต่ target ขึ้นไป ที่ยังเลื่อนไปทาง dx/dy ได้อีก */
function canScrollInside(target: EventTarget | null, dx: number, dy: number): boolean {
  let el = target instanceof Element ? target : null
  while (el && el !== document.body && el !== document.documentElement) {
    const s = getComputedStyle(el)
    if (dy !== 0 && /(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight) {
      if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true
    }
    if (dx !== 0 && /(auto|scroll)/.test(s.overflowX) && el.scrollWidth > el.clientWidth) {
      if (dx < 0 ? el.scrollLeft > 0 : el.scrollLeft + el.clientWidth < el.scrollWidth - 1) return true
    }
    el = el.parentElement
  }
  return false
}

function isTyping(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
}

/** Chrome ไม่วาด ::-webkit-scrollbar ใหม่เมื่อเปลี่ยน class บน html เลยต้องกระตุ้นให้วาดใหม่ */
function repaintScrollbar(root: HTMLElement) {
  const x = window.scrollX
  const y = window.scrollY
  const prev = root.style.overflowY
  root.style.overflowY = 'hidden'
  void root.offsetHeight
  root.style.overflowY = prev
  void root.offsetHeight
  if (window.scrollY !== y || window.scrollX !== x) window.scrollTo(x, y)
}

function lock() {
  savedY = window.scrollY
  const root = document.documentElement
  const prevBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  root.classList.add('scroll-locked') // ซ่อน thumb เหลือแค่ราง (globals.css)
  repaintScrollbar(root)

  const onWheel = (e: WheelEvent) => {
    if (!canScrollInside(e.target, e.deltaX, e.deltaY)) e.preventDefault()
  }
  const onTouchStart = (e: TouchEvent) => {
    touchY = e.touches[0]?.clientY ?? 0
    touchX = e.touches[0]?.clientX ?? 0
  }
  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1) return // ซูมด้วยสองนิ้วได้
    const t = e.touches[0]
    const dy = touchY - t.clientY
    const dx = touchX - t.clientX
    if (!canScrollInside(e.target, dx, dy)) e.preventDefault()
  }
  const onKey = (e: KeyboardEvent) => {
    if (!SCROLL_KEYS.has(e.key) || isTyping(e.target)) return
    const dy = e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home' ? -1 : 1
    if (!canScrollInside(e.target, 0, dy)) e.preventDefault()
  }
  // กันกรณีที่เหลือ เช่นลาก thumb ของ scrollbar: ดึงกลับตำแหน่งเดิม
  const onScroll = () => {
    if (Math.abs(window.scrollY - savedY) > 0.5) window.scrollTo(window.scrollX, savedY)
  }

  const opts = { passive: false } as AddEventListenerOptions
  window.addEventListener('wheel', onWheel, opts)
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, opts)
  window.addEventListener('keydown', onKey)
  window.addEventListener('scroll', onScroll, { passive: true })

  teardown = () => {
    window.removeEventListener('wheel', onWheel, opts)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove, opts)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('scroll', onScroll)
    root.classList.remove('scroll-locked')
    repaintScrollbar(root)
    root.style.scrollBehavior = prevBehavior
  }
}

/** ล็อกการเลื่อนหน้าเมื่อ active เป็น true (ซ้อนกันได้หลาย modal) */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    if (locks++ === 0) lock()
    return () => {
      if (--locks === 0) {
        teardown?.()
        teardown = null
      }
    }
  }, [active])
}
