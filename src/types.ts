export interface Telemetry {
  x: number
  y: number
  altitude: number
  phi_deg: number
  theta_deg: number
  psi_deg: number
  airspeed: number
  throttle: number
}

export interface Controls {
  throttle: number
  elevator: number
  aileron: number
  rudder: number
}
