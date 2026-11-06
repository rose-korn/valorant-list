'use client'

// คลังของฉัน: สกินที่มีแล้ว / อยากได้ เก็บเป็น uuid ใน localStorage ('valolist:locker') เฉพาะเครื่องนี้
// ใช้ร่วมกันระหว่างหน้าปืน (ปุ่มจด) กับหน้า /my

import { useMemo, useSyncExternalStore } from 'react'

export type Shelf = 'own' | 'want'
export interface Locker {
  own: string[]
  want: string[]
}

const KEY = 'valolist:locker'
const listeners = new Set<() => void>()
let raw: string | null = null

function read() {
  if (raw === null) {
    try {
      raw = localStorage.getItem(KEY) ?? ''
    } catch {
      raw = ''
    }
  }
  return raw
}

function parse(text: string): Locker {
  try {
    const v = JSON.parse(text)
    const list = (x: unknown) => (Array.isArray(x) ? x.filter((s): s is string => typeof s === 'string') : [])
    return { own: list(v?.own), want: list(v?.want) }
  } catch {
    return { own: [], want: [] }
  }
}

function save(next: Locker) {
  raw = JSON.stringify(next)
  try {
    localStorage.setItem(KEY, raw)
  } catch {
    // private mode — จำไม่ได้ก็ไม่เป็นไร
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  // แท็บอื่นแก้ลิสต์ → อัปเดตตาม
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return
    raw = null
    l()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', onStorage)
  }
}

export function useLocker() {
  const text = useSyncExternalStore(subscribe, read, () => '')
  const locker = useMemo(() => parse(text), [text])
  const has = (shelf: Shelf, uuid: string) => locker[shelf].includes(uuid)
  /** ใส่/เอาออก — สกินหนึ่งอยู่ได้ชั้นเดียว (มีแล้วก็ไม่ต้องอยากได้) */
  const toggle = (shelf: Shelf, uuid: string) => {
    const cur = parse(read())
    const other: Shelf = shelf === 'own' ? 'want' : 'own'
    if (cur[shelf].includes(uuid)) save({ ...cur, [shelf]: cur[shelf].filter((x) => x !== uuid) })
    else {
      const next: Locker = { ...cur }
      next[shelf] = [uuid, ...cur[shelf]]
      next[other] = cur[other].filter((x) => x !== uuid)
      save(next)
    }
  }
  const clear = (shelf: Shelf) => save({ ...parse(read()), [shelf]: [] })
  return { locker, has, toggle, clear }
}
