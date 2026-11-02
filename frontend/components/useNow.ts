'use client'

import { useSyncExternalStore } from 'react'

const LOADED_AT = Date.now()
const noop = () => () => {}

/**
 * เวลาปัจจุบันฝั่ง client — เว็บเป็น static ตอน render HTML ใช้ `serverNow` (เวลาตอน build) ให้ตรงกับ HTML
 * แล้วค่อยเปลี่ยนเป็นเวลาจริงหลัง hydrate ป้ายใหม่/ของประจำวันจะได้ถูกต้องโดยไม่ต้อง build ใหม่
 */
export function useNow(serverNow: number) {
  return useSyncExternalStore(noop, () => LOADED_AT, () => serverNow)
}
