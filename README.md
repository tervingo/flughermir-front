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

**Joystick:** Thrustmaster T.Flight Hotas / Airbus is supported via the Web Gamepad API. Connect the stick before or while the app is open; the HUD shows “· Joystick” when detected. Mapping: stick X → aileron, stick Y → elevator, throttle lever → throttle, twist → rudder. You can use keyboard and joystick together (e.g. trim with keys). To change axis indices, edit the `AXIS` object in `src/useGamepadControls.ts`.

## Build

```bash
npm run build
```

Output in `dist/`. For Netlify, set build command to `npm run build` and publish directory to `dist`.
