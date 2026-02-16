import type { Telemetry } from './types'

const SIZE = 100
const CX = SIZE / 2
const CY = SIZE / 2
const R = SIZE / 2 - 6
const MAX_VS_MS = 20  // ±20 m/s (±4000 ft/min)
const NEEDLE_LENGTH = R - 15

/** Vertical speed to needle angle: 0 m/s at center (0°), ±20 m/s at ±90° */
function vsToAngle(vsMs: number): number {
  const clamped = Math.max(-MAX_VS_MS, Math.min(MAX_VS_MS, vsMs))
  return (clamped / MAX_VS_MS) * 90
}

export function VerticalSpeedIndicator({ telemetry, size = SIZE }: { telemetry: Telemetry | null; size?: number }) {
  const vs = telemetry?.vertical_speed ?? 0
  const angle = vsToAngle(vs)
  const needleX = CX + NEEDLE_LENGTH * Math.sin((angle * Math.PI) / 180)
  const needleY = CY - NEEDLE_LENGTH * Math.cos((angle * Math.PI) / 180)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
      <circle cx={CX} cy={CY} r={R} fill="#0d1117" stroke="#333" strokeWidth={2} />
      <circle cx={CX} cy={CY} r={R - 4} fill="none" stroke="#444" strokeWidth={1} />
      {/* Center line */}
      <line x1={CX} y1={CY - R + 8} x2={CX} y2={CY + R - 8} stroke="#666" strokeWidth={1} />
      {/* Tick marks: -20, -10, 0, 10, 20 m/s */}
      {[-20, -10, 0, 10, 20].map((v) => {
        const a = vsToAngle(v)
        const rad = (a * Math.PI) / 180
        const inner = R - 8
        const outer = R
        const x1 = CX + inner * Math.sin(rad)
        const y1 = CY - inner * Math.cos(rad)
        const x2 = CX + outer * Math.sin(rad)
        const y2 = CY - outer * Math.cos(rad)
        return (
          <line key={v} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#888" strokeWidth={1.5} />
        )
      })}
      {/* Needle */}
      <line
        x1={CX}
        y1={CY}
        x2={needleX}
        y2={needleY}
        stroke="#0f0"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={CX} cy={CY} r={4} fill="#333" />
      <text x={CX} y={CY + 4} textAnchor="middle" fill="#aaa" fontSize={8} fontFamily="monospace">
        VS
      </text>
      {telemetry && (
        <text x={CX} y={SIZE - 6} textAnchor="middle" fill="#fff" fontSize={10} fontFamily="monospace">
          {vs > 0 ? '+' : ''}{vs.toFixed(1)} m/s
        </text>
      )}
    </svg>
  )
}
