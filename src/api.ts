/** Base URL for REST API (same host as WebSocket, http/https). */
function getApiBase(): string {
  const ws = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws'
  const url = ws.replace(/^wss?:\/\//, '').replace(/\/ws\/?$/, '')
  const protocol = ws.startsWith('wss') ? 'https' : 'http'
  return `${protocol}://${url}`
}

export async function resetSim(): Promise<void> {
  const res = await fetch(`${getApiBase()}/reset`, { method: 'POST' })
  if (!res.ok) throw new Error(`Reset failed: ${res.status}`)
}
