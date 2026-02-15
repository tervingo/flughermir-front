import { useEffect } from 'react'

const KEY_MAP: Record<string, { key: string; value: number }> = {
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

export function useKeyboardControls(sendControls: (c: { throttle?: number; elevator?: number; aileron?: number; rudder?: number }) => void) {
  useEffect(() => {
    const state = { throttle: 0.3, elevator: 0, aileron: 0, rudder: 0 }
    const keys = new Set<string>()

    const flush = () => {
      sendControls(state)
    }

    const interval = setInterval(() => {
      let changed = false
      keys.forEach((code) => {
        const m = KEY_MAP[code]
        if (!m) return
        const prev = state[m.key as keyof typeof state] as number
        let next = prev + (m.value * STEP * RATE)
        if (m.key === 'throttle') next = Math.max(0, Math.min(1, next))
        else next = Math.max(-1, Math.min(1, next))
        if (next !== prev) {
          (state as Record<string, number>)[m.key] = next
          changed = true
        }
      })
      if (changed) flush()
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
    flush()
    return () => {
      clearInterval(interval)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [sendControls])
}
