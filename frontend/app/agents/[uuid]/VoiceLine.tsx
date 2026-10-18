'use client'

import { useEffect, useRef, useState } from 'react'

/** ปุ่มเล่นเสียงพากย์ตอนเลือกเอเจนท์ พร้อม equalizer เล็ก ๆ */
export default function VoiceLine({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = new Audio(src)
    el.preload = 'none'
    const stop = () => setPlaying(false)
    el.addEventListener('ended', stop)
    el.addEventListener('pause', stop)
    audio.current = el
    return () => {
      el.pause()
      el.removeEventListener('ended', stop)
      el.removeEventListener('pause', stop)
      audio.current = null
    }
  }, [src])

  const toggle = () => {
    const el = audio.current
    if (!el) return
    if (playing) {
      el.pause()
      el.currentTime = 0
    } else {
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  return (
    <button onClick={toggle} className="btn btn-paper" aria-pressed={playing}>
      <span className="flex h-4 items-end gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-0.5 origin-bottom"
            style={{
              background: 'var(--color-red)',
              height: playing ? '100%' : '35%',
              animation: playing ? `eq 0.${5 + i}s ease-in-out ${i * 0.1}s infinite alternate` : 'none',
            }}
          />
        ))}
      </span>
      {playing ? 'หยุดเสียง' : 'ฟังเสียงพากย์'}
      <style>{`@keyframes eq { from { transform: scaleY(.2) } to { transform: scaleY(1) } }`}</style>
    </button>
  )
}
