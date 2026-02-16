import type { Telemetry } from './types'

const SIZE = 100
const CX = SIZE / 2
const CY = SIZE / 2
const R = SIZE / 2 - 6
const TICK_LENGTH = 8

export function HeadingIndicator({ telemetry, size = SIZE }: { telemetry: Telemetry | null; size?: number }) {
  const heading = telemetry?.psi_deg ?? 0
  const normalized = ((heading % 360) + 360) % 360

  return (
    <svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
      <circle cx={CX} cy={CY} r={R} fill="#0d1117" stroke="#333" strokeWidth={2} />
      <circle cx={CX} cy={CY} r={R - 4} fill="none" stroke="#444" strokeWidth={1} />
      {/* Rotating compass card */}
      <g transform={`translate(${CX}, ${CY}) rotate(${-normalized})`}>
        {/* Major ticks every 30° */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180
          const inner = R - TICK_LENGTH
          const outer = R
          const x1 = inner * Math.sin(rad)
          const y1 = -inner * Math.cos(rad)
          const x2 = outer * Math.sin(rad)
          const y2 = -outer * Math.cos(rad)
          const label = deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : deg === 270 ? 'W' : (deg / 10).toString()
          return (
            <g key={deg}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={2} />
              <text
                x={x2 + (label.length === 1 ? 8 : 6) * Math.sin(rad)}
                y={y2 - 8 * Math.cos(rad)}
                textAnchor="middle"
                fill="#fff"
                fontSize={label.length === 1 ? 10 : 8}
                fontFamily="monospace"
              >
                {label}
              </text>
            </g>
          )
        })}
      </g>
      {/* Fixed lubber line (top) */}
      <line x1={CX} y1={CY - R + 4} x2={CX} y2={CY - R + 12} stroke="#f00" strokeWidth={3} />
      <polygon points={`${CX},${CY - R + 4} ${CX - 4},${CY - R + 12} ${CX + 4},${CY - R + 12}`} fill="#f00" />
      <text x={CX} y={CY + 4} textAnchor="middle" fill="#aaa" fontSize={8} fontFamily="monospace">
        HDG
      </text>
      {telemetry && (
        <text x={CX} y={SIZE - 6} textAnchor="middle" fill="#fff" fontSize={10} fontFamily="monospace">
          {Math.round(normalized)}°
        </text>
      )}
    </svg>
  )
}
