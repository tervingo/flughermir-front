import { useState } from 'react'
import type { Telemetry } from './types'
import { AttitudeIndicator } from './AttitudeIndicator'
import { AirspeedIndicator } from './AirspeedIndicator'
import { Altimeter } from './Altimeter'
import { VerticalSpeedIndicator } from './VerticalSpeedIndicator'
import { TurnCoordinator } from './TurnCoordinator'
import { HeadingIndicator } from './HeadingIndicator'
import { resetSim } from './api'

interface HUDProps {
  telemetry: Telemetry | null
  connected: boolean
  gamepadConnected?: boolean
  resetControls?: () => void
}

export function HUD({ telemetry, connected, gamepadConnected = false, resetControls }: HUDProps) {
  const [resetting, setResetting] = useState(false)
  const handleReset = async () => {
    setResetting(true)
    try {
      await resetSim()
      resetControls?.() // Reset frontend controls (throttle to 0, etc.)
    } catch {
      // ignore
    } finally {
      setResetting(false)
    }
  }
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 16,
        color: 'white',
        fontFamily: 'monospace',
        textShadow: '0 0 4px black, 0 1px 2px black',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 14 }}>
            {connected ? 'WS connected' : 'WS disconnected'}
            {gamepadConnected && ' · Joystick'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting || !connected}
            style={{
              pointerEvents: 'auto',
              padding: '6px 12px',
              fontSize: 12,
              fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: '1px solid #666',
              borderRadius: 4,
              cursor: connected ? 'pointer' : 'not-allowed',
            }}
          >
            {resetting ? 'Resetting…' : 'Reset'}
          </button>
          <div style={{ textAlign: 'right', fontSize: 18 }}>
          {telemetry ? (
            <>
              <div>AS {Math.round(telemetry.airspeed * 3.6)} km/h</div>
              <div>ALT {telemetry.altitude.toFixed(0)} m</div>
              <div>THR {(telemetry.throttle * 100).toFixed(0)}%</div>
            </>
          ) : (
            '—'
          )}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Six-pack: top row */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <AirspeedIndicator telemetry={telemetry} size={100} />
          <AttitudeIndicator telemetry={telemetry} size={140} />
          <Altimeter telemetry={telemetry} size={100} />
        </div>
        {/* Six-pack: bottom row */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <TurnCoordinator telemetry={telemetry} size={100} />
          <HeadingIndicator telemetry={telemetry} size={100} />
          <VerticalSpeedIndicator telemetry={telemetry} size={100} />
        </div>
      </div>
      <div style={{ alignSelf: 'center', fontSize: 14, textAlign: 'center' }}>
        <div>W/S throttle · A/D aileron · ↑/↓ elevator · Q/E rudder</div>
        {gamepadConnected && (
          <div style={{ marginTop: 4, opacity: 0.9 }}>
            Joystick: stick = roll/pitch · twist = yaw (throttle = W/S only)
          </div>
        )}
      </div>
    </div>
  )
}
