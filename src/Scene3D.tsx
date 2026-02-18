import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js'
import type { Telemetry } from './types'

interface Scene3DProps {
  telemetry: Telemetry | null
}

/**
 * Procedural terrain height at world position (wx, wz).
 * Flat near the runway corridor (east of origin along +X), rolling hills beyond.
 */
function terrainHeight(wx: number, wz: number): number {
  // Keep a flat strip along the runway (positive-X axis, ±150 m in Z)
  const inRunwayCorridor = wx > -200 && wx < 1600 && Math.abs(wz) < 150
  if (inRunwayCorridor) return 0
  const dist = Math.sqrt(Math.max(0, wx - 700) ** 2 + wz ** 2)
  const blend = Math.min(1.0, Math.max(0.0, (dist - 200) / 500))
  const h =
    Math.sin(wx * 0.003) * Math.cos(wz * 0.002) * 60 +
    Math.sin(wx * 0.007 + wz * 0.005) * 25 +
    Math.cos(wx * 0.002 - wz * 0.004) * 40 +
    Math.sin(wx * 0.015 - wz * 0.010) * 15
  return Math.max(0, h * blend)
}

export function Scene3D({ telemetry }: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    plane: THREE.Group
    followGround: THREE.Mesh
  } | null>(null)

  // ── Scene setup (runs once on mount) ─────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const w = Math.max(1, container.clientWidth || window.innerWidth)
    const h = Math.max(1, container.clientHeight || window.innerHeight)

    // Renderer — tone-mapping makes Sky colours look natural
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.5
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    // Fog colour roughly matches the Sky horizon; density tuned for flight distances
    scene.fog = new THREE.FogExp2(0xbbd4e8, 0.00015)

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.5, 50000)

    // ── Sky ──────────────────────────────────────────────────────────────────
    const sky = new Sky()
    sky.scale.setScalar(450000)
    scene.add(sky)
    const sun = new THREE.Vector3()
    sun.setFromSphericalCoords(
      1,
      THREE.MathUtils.degToRad(90 - 35), // 35° elevation
      THREE.MathUtils.degToRad(200),      // slightly south-west azimuth
    )
    const su = sky.material.uniforms
    su['sunPosition'].value.copy(sun)
    su['turbidity'].value = 10
    su['rayleigh'].value = 2
    su['mieCoefficient'].value = 0.005
    su['mieDirectionalG'].value = 0.8

    // ── Lighting ─────────────────────────────────────────────────────────────
    const sunLight = new THREE.DirectionalLight(0xfff4e0, 2)
    sunLight.position.copy(sun).multiplyScalar(1000)
    scene.add(sunLight)
    scene.add(new THREE.AmbientLight(0x8ab4d4, 0.8))

    // ── Aircraft silhouette ──────────────────────────────────────────────────
    // Body long in X (forward direction in Three.js at psi=0 is east / +X)
    const matWhite = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 })
    const matGrey  = new THREE.MeshStandardMaterial({ color: 0x888888 })
    const body  = new THREE.Mesh(new THREE.BoxGeometry(8, 1.5, 1.5), matWhite)
    const wing  = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.25, 14), matGrey)  // wingspan along Z
    wing.position.set(0, 0.4, 0)
    const hTail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 6), matGrey)
    hTail.position.set(-3.5, 0, 0)
    const vTail = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 0.3), matGrey)
    vTail.position.set(-3.5, 1.2, 0)
    const planeGroup = new THREE.Group()
    planeGroup.add(body, wing, hTail, vTail)
    planeGroup.rotation.order = 'YXZ'
    scene.add(planeGroup)

    // ── Follow-ground (large flat plane centred on aircraft to avoid visible edges) ──
    const followGround = new THREE.Mesh(
      new THREE.PlaneGeometry(40000, 40000),
      new THREE.MeshStandardMaterial({ color: 0x4a7c3f }),
    )
    followGround.rotation.x = -Math.PI / 2
    scene.add(followGround)

    // ── Terrain (procedural hills, static at world origin) ──────────────────
    // PlaneGeometry lies in local XY; after rotation.x = -PI/2:
    //   local X → world X (east),  local Y → world -Z (south),  local Z → world Y (height)
    const tSize = 8000
    const tSegs = 100
    const terrainGeom = new THREE.PlaneGeometry(tSize, tSize, tSegs, tSegs)
    const pos = terrainGeom.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const wx =  pos.getX(i)          // local X  = world X (east)
      const wz = -pos.getY(i)          // local Y  = world -Z, so world Z = -localY
      pos.setZ(i, terrainHeight(wx, wz))
    }
    terrainGeom.computeVertexNormals()
    const terrain = new THREE.Mesh(
      terrainGeom,
      new THREE.MeshStandardMaterial({ color: 0x3d6b35 }),
    )
    terrain.rotation.x = -Math.PI / 2
    terrain.position.y = 0.05          // sit fractionally above follow-ground
    scene.add(terrain)

    // ── Runway (30 m wide × 1 500 m long along +X / east) ───────────────────
    const runway = new THREE.Mesh(
      new THREE.PlaneGeometry(1500, 30),
      new THREE.MeshStandardMaterial({ color: 0x444444 }),
    )
    runway.rotation.x = -Math.PI / 2
    runway.position.set(750, 0.1, 0)   // centred at 750 m east, north = 0
    scene.add(runway)

    // Centreline dashes every 70 m
    const dashMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
    for (let i = 0; i < 20; i++) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(30, 1), dashMat)
      dash.rotation.x = -Math.PI / 2
      dash.position.set(50 + i * 70, 0.12, 0)
      scene.add(dash)
    }

    sceneRef.current = { scene, camera, renderer, plane: planeGroup, followGround }

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!containerRef.current || !sceneRef.current) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      sceneRef.current.camera.aspect = w / h
      sceneRef.current.camera.updateProjectionMatrix()
      sceneRef.current.renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Render loop ──────────────────────────────────────────────────────────
    let frameId: number
    function animate() {
      frameId = requestAnimationFrame(animate)
      if (sceneRef.current) {
        sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera)
      }
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

  // ── Per-telemetry update: move aircraft + camera ─────────────────────────
  useEffect(() => {
    const s = sceneRef.current
    if (!s || !telemetry) return
    const deg = Math.PI / 180
    const psi   = telemetry.psi_deg   * deg
    const theta = telemetry.theta_deg * deg
    const phi   = telemetry.phi_deg   * deg

    // Three.js coord system: X = east, Y = altitude, Z = north
    s.plane.position.set(telemetry.x, telemetry.altitude, telemetry.y)
    s.plane.rotation.set(theta, psi, phi)

    // Follow-ground tracks aircraft in XZ only (stays at Y = 0)
    s.followGround.position.set(telemetry.x, 0, telemetry.y)

    // Chase camera — placed 40 m behind and 15 m above the aircraft
    const dist = 40
    const camX = telemetry.x - dist * Math.sin(psi) * Math.cos(theta)
    const camZ = telemetry.y - dist * Math.cos(psi) * Math.cos(theta)
    const camY = telemetry.altitude + dist * Math.sin(theta) + 15
    s.camera.position.set(camX, camY, camZ)
    s.camera.lookAt(telemetry.x, telemetry.altitude, telemetry.y)
  }, [telemetry])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  )
}
