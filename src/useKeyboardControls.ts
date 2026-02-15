import { useEffect } from 'react'
import type { Controls } from './types'

const KEY_MAP: Record<string, { key: keyof Controls; value: number }> = {
  KeyW: { key: 'throttle', value: 1 },
  KeyS: { key: 'throttle', value: -1 },
  KeyA: { key: 'aileron', value: -1 },
  KeyD: { key: 'aileron', value: 1 },
  ArrowUp: { key: 'elevator', value: -1 },
  ArrowDown: { key: 'elevator', value: 1 },
  KeyQ: { key: 'rudder', value: -1 },
  KeyE: { key: 'rudder', value: 1 },
}

const RATE = 1.5
const STEP = 0.02
/** Throttle: ~5% per short keypress (smaller than STEP*RATE for stick/rudder) */
const THROTTLE_STEP = 0.008

type SendControls = (c: Partial<Controls> | ((prev: Controls) => Partial<Controls>)) => void

export function useKeyboardControls(sendControls: SendControls) {
  useEffect(() => {
    const keys = new Set<string>()

    const interval = setInterval(() => {
      if (keys.size === 0) return
      sendControls((prev) => {
        const next = { ...prev }
        let changed = false
        keys.forEach((code) => {
          const m = KEY_MAP[code]
          if (!m) return
          const delta = m.key === 'throttle' ? THROTTLE_STEP : STEP * RATE
          const v = (next[m.key] as number) + m.value * delta
          const clamped = m.key === 'throttle' ? Math.max(0, Math.min(1, v)) : Math.max(-1, Math.min(1, v))
          if (clamped !== next[m.key]) {
            (next as Record<string, number>)[m.key] = clamped
            changed = true
          }
        })
        return changed ? next : {}
      })
    }, 1000 / 60)

    const onKeyDown = (e: KeyboardEvent) => {
      if (KEY_MAP[e.code]) {
        e.preventDefault()
        keys.add(e.code)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (KEY_MAP[e.code]) {
        e.preventDefault()
        keys.delete(e.code)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      clearInterval(interval)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [sendControls])
}
