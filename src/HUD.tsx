import type { Telemetry } from './types'
import { AttitudeIndicator } from './AttitudeIndicator'
import { AirspeedIndicator } from './AirspeedIndicator'
import { Altimeter } from './Altimeter'

interface HUDProps {
  telemetry: Telemetry | null
  connected: boolean
  gamepadConnected?: boolean
}

export function HUD({ telemetry, connected, gamepadConnected = false }: HUDProps) {
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
        <span style={{ fontSize: 14 }}>
          {connected ? 'WS connected' : 'WS disconnected'}
          {gamepadConnected && ' · Joystick'}
        </span>
        <div style={{ textAlign: 'right', fontSize: 18 }}>
          {telemetry ? (
            <>
              <div>AS {telemetry.airspeed.toFixed(0)} m/s</div>
              <div>ALT {telemetry.altitude.toFixed(0)} m</div>
              <div>THR {(telemetry.throttle * 100).toFixed(0)}%</div>
            </>
          ) : (
            '—'
          )}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          gap: 24,
        }}
      >
        <AirspeedIndicator telemetry={telemetry} size={100} />
        <AttitudeIndicator telemetry={telemetry} size={140} />
        <Altimeter telemetry={telemetry} size={100} />
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
