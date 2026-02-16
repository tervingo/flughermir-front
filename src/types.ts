export interface Telemetry {
  x: number
  y: number
  altitude: number
  phi_deg: number
  theta_deg: number
  psi_deg: number
  airspeed: number
  vertical_speed?: number  // m/s, positive = climbing
  p_deg_s?: number  // roll rate deg/s
  q_deg_s?: number  // pitch rate deg/s
  r_deg_s?: number  // yaw rate deg/s
  throttle: number
  physics_engine?: 'jsbsim' | 'manual'  // Which physics engine is active
}

export interface Controls {
  throttle: number
  elevator: number
  aileron: number
  rudder: number
}
