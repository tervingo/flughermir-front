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

- **W / S** — throttle up / down  
- **A / D** — aileron (roll)  
- **↑ / ↓** — elevator (pitch)  
- **Q / E** — rudder (yaw)

## Build

```bash
npm run build
```

Output in `dist/`. For Netlify, set build command to `npm run build` and publish directory to `dist`.
