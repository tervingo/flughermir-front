import type { Telemetry } from './types'

interface AttitudeIndicatorProps {
  telemetry: Telemetry | null
  size?: number
}

export function AttitudeIndicator({ telemetry, size = 120 }: AttitudeIndicatorProps) {
  if (!telemetry) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: size, height: size, borderRadius: '50%', background: '#1a1a2e', border: '2px solid #333' }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>Waiting for sim…</span>
      </div>
    )
  }
  const pitch = -telemetry.theta_deg * 2
  const cy = size / 2
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(to bottom, #87ceeb 50%, #6b8e23 50%)',
        border: '3px solid #333',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: cy - 2 + pitch,
          height: 4,
          background: 'rgba(0,0,0,0.8)',
          transform: `rotate(${telemetry.phi_deg}deg)`,
          transformOrigin: 'center center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${telemetry.phi_deg}deg)`,
        }}
      >
        <div
          style={{
            width: 4,
            height: size * 0.4,
            background: '#ffcc00',
            borderRadius: 2,
            boxShadow: '0 0 4px black',
          }}
        />
      </div>
    </div>
  )
}
