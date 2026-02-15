import { useEffect, useRef, useState } from 'react'
import type { Controls } from './types'

/** Axis indices for Thrustmaster T.Flight Hotas / Airbus (adjust if your stick differs) */
const AXIS = {
  aileron: 0,   // stick X
  elevator: 1,   // stick Y
  throttle: 4,   // throttle lever
  rudder: 3,     // twist or pedals
} as const

const DEADZONE = 0.08

function applyDeadzone(value: number, deadzone: number): number {
  if (Math.abs(value) <= deadzone) return 0
  const sign = value > 0 ? 1 : -1
  return sign * (Math.abs(value) - deadzone) / (1 - deadzone)
}

/** Map raw axis [-1, 1] to throttle [0, 1]. Throttle lever often reports -1..1 or 0..1. */
function throttleFromAxis(raw: number): number {
  return Math.max(0, Math.min(1, (raw + 1) / 2))
}

type SendControls = (c: Partial<Controls>) => void

export function useGamepadControls(sendControls: SendControls) {
  const [gamepadConnected, setGamepadConnected] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    let wasConnected = false
    const poll = () => {
      const pads = navigator.getGamepads()
      const pad = Array.from(pads).find((p) => p != null)
      if (!pad) {
        if (wasConnected) {
          wasConnected = false
          setGamepadConnected(false)
        }
        rafRef.current = requestAnimationFrame(poll)
        return
      }
      if (!wasConnected) {
        wasConnected = true
        setGamepadConnected(true)
      }

      const aileron = applyDeadzone(pad.axes[AXIS.aileron] ?? 0, DEADZONE)
      const elevator = applyDeadzone(-(pad.axes[AXIS.elevator] ?? 0), DEADZONE) // pull back = pitch up
      const throttleRaw = pad.axes[AXIS.throttle] ?? -1
      const throttle = throttleFromAxis(throttleRaw)
      const rudder = applyDeadzone(pad.axes[AXIS.rudder] ?? 0, DEADZONE)

      sendControls({
        aileron,
        elevator,
        rudder,
        throttle: throttle,
      })
      rafRef.current = requestAnimationFrame(poll)
    }
    rafRef.current = requestAnimationFrame(poll)

    const onConnect = () => setGamepadConnected(true)
    const onDisconnect = () => setGamepadConnected(false)
    window.addEventListener('gamepadconnected', onConnect)
    window.addEventListener('gamepaddisconnected', onDisconnect)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('gamepadconnected', onConnect)
      window.removeEventListener('gamepaddisconnected', onDisconnect)
    }
  }, [sendControls])

  return { gamepadConnected }
}
