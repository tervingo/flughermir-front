import { Scene3D } from './Scene3D'
import { HUD } from './HUD'
import { useSimWebSocket } from './useSimWebSocket'
import { useKeyboardControls } from './useKeyboardControls'

function App() {
  const { telemetry, connected, sendControls } = useSimWebSocket()
  useKeyboardControls(sendControls)

  return (
    <>
      <Scene3D telemetry={telemetry} />
      <HUD telemetry={telemetry} connected={connected} />
    </>
  )
}

export default App
