# Flughermir Frontend

React + Three.js + WebSocket client for the flight sim.

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

Open http://localhost:5173. Ensure the backend is running on port 8000 (see `back/README.md`).

## Controls

**Keyboard:** W/S throttle · A/D aileron · ↑/↓ elevator · Q/E rudder  

**Joystick:** Thrustmaster T.Flight Hotas / Airbus via Web Gamepad API. Stick = roll/pitch, twist = yaw. Throttle = W/S only. Edit `AXIS` in `src/useGamepadControls.ts` if your stick differs.

**Instruments (Phase 1):** Airspeed (0–500 km/h), attitude indicator, altimeter (0–2000 m). Runway strip visible on the ground.

## Build

```bash
npm run build
```

Output in `dist/`. For Netlify, set build command to `npm run build` and publish directory to `dist`.
