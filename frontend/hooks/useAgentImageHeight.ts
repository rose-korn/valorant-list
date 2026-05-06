'use client'
import { useDeviceSize } from './useDeviceSize'

interface AgentImageStyle {
  height: string
  marginTop: string
}

export function useAgentImageHeight(): AgentImageStyle {
  const { isMobile, isTablet } = useDeviceSize()
  if (isMobile) return { height: 'clamp(160px, 30vh, 260px)', marginTop: '2rem' }
  if (isTablet) return { height: 'clamp(260px, 45vh, 400px)', marginTop: '1rem' }
  return { height: 'clamp(400px, 60vh, 70vh)', marginTop: '0' }
}