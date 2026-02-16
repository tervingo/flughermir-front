import type { Telemetry } from './types'

const SIZE = 100
const CX = SIZE / 2
const CY = SIZE / 2
const R = SIZE / 2 - 6
const MAX_TURN_RATE = 6  // deg/s (standard rate turn = 3 deg/s)

export function TurnCoordinator({ telemetry, size = SIZE }: { telemetry: Telemetry | null; size?: number }) {
  const roll = telemetry?.phi_deg ?? 0
  const turnRate = telemetry?.r_deg_s ?? 0
  const clampedRate = Math.max(-MAX_TURN_RATE, Math.min(MAX_TURN_RATE, turnRate))
  const ballOffset = (clampedRate / MAX_TURN_RATE) * (R - 20)  // ball moves left/right based on yaw rate

  return (
    <svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
      <circle cx={CX} cy={CY} r={R} fill="#0d1117" stroke="#333" strokeWidth={2} />
      {/* Mini airplane symbol */}
      <g transform={`translate(${CX}, ${CY}) rotate(${roll})`}>
        <line x1={-R + 10} y1={0} x2={R - 10} y2={0} stroke="#fff" strokeWidth={2} />
        <polygon points={`0,0 ${-8},-4 ${-8},4`} fill="#fff" />
      </g>
      {/* Turn rate marks: L, S, R (Left, Straight, Right) */}
      <text x={CX - R + 12} y={CY + 4} fill="#888" fontSize={8} fontFamily="monospace">L</text>
      <text x={CX} y={CY + 4} textAnchor="middle" fill="#888" fontSize={8} fontFamily="monospace">S</text>
      <text x={CX + R - 12} y={CY + 4} fill="#888" fontSize={8} fontFamily="monospace">R</text>
      {/* Ball (inclinometer) */}
      <g transform={`translate(${CX + ballOffset}, ${CY + R - 12})`}>
        <circle cx={0} cy={0} r={6} fill="#ff0" stroke="#333" strokeWidth={1} />
      </g>
      {/* Ball track */}
      <rect x={CX - R + 8} y={CY + R - 18} width={R * 2 - 16} height={12} fill="none" stroke="#666" strokeWidth={1} />
      <text x={CX} y={CY - R + 6} textAnchor="middle" fill="#aaa" fontSize={8} fontFamily="monospace">
        TURN
      </text>
      {telemetry && (
        <text x={CX} y={SIZE - 6} textAnchor="middle" fill="#fff" fontSize={9} fontFamily="monospace">
          {turnRate.toFixed(1)}°/s
        </text>
      )}
    </svg>
  )
}
