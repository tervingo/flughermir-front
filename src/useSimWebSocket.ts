import { useEffect, useRef, useState, useCallback } from 'react'
import type { Telemetry, Controls } from './types'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws'

export function useSimWebSocket() {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const controlsRef = useRef<Controls>({
    throttle: 0.3,
    elevator: 0,
    aileron: 0,
    rudder: 0,
  })

  const sendControls = useCallback((c: Partial<Controls> | ((prev: Controls) => Partial<Controls>)) => {
    const update = typeof c === 'function' ? c(controlsRef.current) : c
    Object.assign(controlsRef.current, update)
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(controlsRef.current))
    }
  }, [])

  useEffect(() => {
    const ws = new WebSocket(WS_URL)
    wsRef.current = ws
    ws.onopen = () => {
      setConnected(true)
      ws.send(JSON.stringify(controlsRef.current))
    }
    ws.onclose = () => setConnected(false)
    ws.onmessage = (e) => {
      try {
        const t = JSON.parse(e.data as string) as Telemetry
        setTelemetry(t)
      } catch {
        // ignore
      }
    }
    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [])

  return { telemetry, connected, sendControls }
}
