import type { Telemetry } from './types'

const SIZE = 100
const CX = SIZE / 2
const CY = SIZE / 2
const R = SIZE / 2 - 6
const MAX_KMH = 500
const NEEDLE_LENGTH = R - 12

/** Needle angle: 0 at left (-90°), max at right (+90°). Input: speed in km/h */
function speedToAngle(kmh: number): number {
  const clamped = Math.max(0, Math.min(MAX_KMH, kmh))
  return -90 + (clamped / MAX_KMH) * 180
}

export function AirspeedIndicator({ telemetry, size = SIZE }: { telemetry: Telemetry | null; size?: number }) {
  const kmh = telemetry ? telemetry.airspeed * 3.6 : 0
  const angle = speedToAngle(kmh)
  const needleX = CX + NEEDLE_LENGTH * Math.cos((angle * Math.PI) / 180)
  const needleY = CY + NEEDLE_LENGTH * Math.sin((angle * Math.PI) / 180)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
      <circle cx={CX} cy={CY} r={R} fill="#0d1117" stroke="#333" strokeWidth={2} />
      <circle cx={CX} cy={CY} r={R - 4} fill="none" stroke="#444" strokeWidth={1} />
      {/* Tick marks: 0, 100, 200, 300, 400, 500 km/h */}
      {[0, 100, 200, 300, 400, 500].map((v) => {
        const a = speedToAngle(v)
        const rad = (a * Math.PI) / 180
        const inner = R - 8
        const outer = R
        return (
          <line
            key={v}
            x1={CX + inner * Math.cos(rad)}
            y1={CY + inner * Math.sin(rad)}
            x2={CX + outer * Math.cos(rad)}
            y2={CY + outer * Math.sin(rad)}
            stroke="#888"
            strokeWidth={1.5}
          />
        )
      })}
      {/* Needle */}
      <line
        x1={CX}
        y1={CY}
        x2={needleX}
        y2={needleY}
        stroke="#f00"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={CX} cy={CY} r={4} fill="#333" />
      <text x={CX} y={CY + 4} textAnchor="middle" fill="#aaa" fontSize={8} fontFamily="monospace">
        AS
      </text>
      {telemetry && (
        <text x={CX} y={size - 6} textAnchor="middle" fill="#fff" fontSize={10} fontFamily="monospace">
          {Math.round(kmh)} km/h
        </text>
      )}
    </svg>
  )
}
