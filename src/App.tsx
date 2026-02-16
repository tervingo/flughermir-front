import { Scene3D } from './Scene3D'
import { HUD } from './HUD'
import { useSimWebSocket } from './useSimWebSocket'
import { useKeyboardControls } from './useKeyboardControls'
import { useGamepadControls } from './useGamepadControls'

function App() {
  const { telemetry, connected, sendControls, resetControls } = useSimWebSocket()
  useKeyboardControls(sendControls)
  const { gamepadConnected } = useGamepadControls(sendControls)

  return (
    <>
      <Scene3D telemetry={telemetry} />
      <HUD telemetry={telemetry} connected={connected} gamepadConnected={gamepadConnected} resetControls={resetControls} />
    </>
  )
}

export default App
