'use client'
import { useState, useEffect } from 'react'

type DeviceSize = 'mobile' | 'tablet' | 'desktop'

interface DeviceInfo {
  size: DeviceSize
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
}

export function useDeviceSize(): DeviceInfo {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const update = () => setWidth(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const size: DeviceSize = width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
  return { size, isMobile: size === 'mobile', isTablet: size === 'tablet', isDesktop: size === 'desktop', width }
}