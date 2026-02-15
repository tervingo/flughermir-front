import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Telemetry } from './types'

interface Scene3DProps {
  telemetry: Telemetry | null
}

export function Scene3D({ telemetry }: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    plane: THREE.Group
  } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87ceeb)
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 10000)
    camera.position.set(0, 0, 50)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Simple plane mesh (Cessna-like silhouette: elongated box + nose)
    const bodyGeom = new THREE.BoxGeometry(8, 2, 1.5)
    const body = new THREE.Mesh(bodyGeom, new THREE.MeshStandardMaterial({ color: 0xffffff }))
    body.position.z = 0
    const wingGeom = new THREE.BoxGeometry(12, 0.3, 4)
    const wing = new THREE.Mesh(wingGeom, new THREE.MeshStandardMaterial({ color: 0x888888 }))
    wing.position.set(0, 0, 0)
    const planeGroup = new THREE.Group()
    planeGroup.add(body)
    planeGroup.add(wing)
    planeGroup.rotation.order = 'YXZ'
    scene.add(planeGroup)

    // Flat ground
    const groundGeom = new THREE.PlaneGeometry(2000, 2000)
    const ground = new THREE.Mesh(groundGeom, new THREE.MeshStandardMaterial({ color: 0x2d5a27 }))
    ground.rotation.x = -Math.PI / 2
    scene.add(ground)

    // Sun
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(100, 100, 200)
    scene.add(light)
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))

    sceneRef.current = { scene, camera, renderer, plane: planeGroup }

    const onResize = () => {
      if (!containerRef.current || !sceneRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      sceneRef.current.camera.aspect = w / h
      sceneRef.current.camera.updateProjectionMatrix()
      sceneRef.current.renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    let frameId: number
    function animate() {
      frameId = requestAnimationFrame(animate)
      if (sceneRef.current) sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frameId)
      renderer.dispose()
      container.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [])

  // Update plane and camera from telemetry (Three.js Y-up: X=E, Y=alt, Z=N)
  useEffect(() => {
    const s = sceneRef.current
    if (!s || !telemetry) return
    const deg = Math.PI / 180
    const psi = telemetry.psi_deg * deg
    const theta = telemetry.theta_deg * deg
    const phi = telemetry.phi_deg * deg
    s.plane.position.set(telemetry.x, telemetry.altitude, telemetry.y)
    s.plane.rotation.set(theta, psi, phi)
    const dist = 40
    const camX = telemetry.x - dist * Math.sin(psi) * Math.cos(theta)
    const camZ = telemetry.y - dist * Math.cos(psi) * Math.cos(theta)
    const camY = telemetry.altitude + dist * Math.sin(theta) + 15
    s.camera.position.set(camX, camY, camZ)
    s.camera.lookAt(telemetry.x, telemetry.altitude, telemetry.y)
  }, [telemetry])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
}
