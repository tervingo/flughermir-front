import type { Telemetry } from './types'

const SIZE = 100
const CX = SIZE / 2
const CY = SIZE / 2
const R = SIZE / 2 - 6
const MAX_ALT_M = 2000
const NEEDLE_LENGTH = R - 12

/** Needle angle: 0 m at left (-90°), max at right (+90°) */
function altToAngle(altM: number): number {
  const clamped = Math.max(0, Math.min(MAX_ALT_M, altM))
  return -90 + (clamped / MAX_ALT_M) * 180
}

export function Altimeter({ telemetry, size = SIZE }: { telemetry: Telemetry | null; size?: number }) {
  const angle = telemetry ? altToAngle(telemetry.altitude) : -90
  const needleX = CX + NEEDLE_LENGTH * Math.cos((angle * Math.PI) / 180)
  const needleY = CY + NEEDLE_LENGTH * Math.sin((angle * Math.PI) / 180)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
      <circle cx={CX} cy={CY} r={R} fill="#0d1117" stroke="#333" strokeWidth={2} />
      <circle cx={CX} cy={CY} r={R - 4} fill="none" stroke="#444" strokeWidth={1} />
      {[0, 500, 1000, 1500, 2000].map((v) => {
        const a = altToAngle(v)
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
      <line
        x1={CX}
        y1={CY}
        x2={needleX}
        y2={needleY}
        stroke="#0af"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={CX} cy={CY} r={4} fill="#333" />
      <text x={CX} y={CY + 4} textAnchor="middle" fill="#aaa" fontSize={8} fontFamily="monospace">
        ALT
      </text>
      {telemetry && (
        <text x={CX} y={SIZE - 6} textAnchor="middle" fill="#fff" fontSize={10} fontFamily="monospace">
          {Math.round(telemetry.altitude)} m
        </text>
      )}
    </svg>
  )
}
