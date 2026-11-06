import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { TABLE_OBSTACLES } from './AnniversaryTable'
import { GUEST_SPOTS } from './Characters'
import { memoryWorldPositions } from './MemoryWall'
import { anniversaryConfig } from '../config/anniversary'

export const RING_POS = new THREE.Vector3(3.4, 1.1, -6.2)
export const CAKE_POS = new THREE.Vector3(-3.4, 1.1, -6.2)
export const VIDEO_POS = new THREE.Vector3(0, 2.2, -7.4)
const BOUNDS = { x: 4.3, zMin: -6.7, zMax: 7.0 }
const OBSTACLES = [...TABLE_OBSTACLES, ...GUEST_SPOTS]
const WISH = { x: 0, z: 0 }
const WALK_SPEED = 0.9 // m/s — slow, smooth walk (was 2.4, then 1.7)
// Fixed cinematic camera for ceremonies: when she taps the cake or
// the ring, the view glides to a wide, clear position where she can
// see EVERYTHING — the couple, the cake/ring table, the cheering
// guests and the final wall behind them.
const CEREMONY_CAM = {
  // Cake: camera on the final-wall side, three-quarter FRONT view —
  // the table is in the foreground, both characters face the camera
  // behind it, hands + knife + cake all in frame.
  cake: { pos: [-1.55, 2.25, -7.05], look: [-3.45, 0.95, -5.55] },
  // Proposal: computed from the couple's real spot (2.45, -5.25).
  // Offset (+2.45, +1.07, +3.1) puts the camera south-east of them at
  // ~3.95 m — inside the room (x < 5, z > -7.5), with NO table and NO
  // guests in the lane. At fov 62 that frames ~4.7 m of height and,
  // even on a portrait phone, ~2.3 m of width: both full bodies, the
  // kneel and the hug fit with headroom.
  ring: { pos: [4.9, 2.05, -2.15], look: [2.45, 0.98, -5.3] }
}

function dampAngle(cur, target, lambda, dt) {
  let d = target - cur
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return cur + d * (1 - Math.exp(-lambda * dt))
}

// Third-person companion controller.
// The PLAYER IS SONAI: playerStateRef holds her position + facing.
// WASD / arrows / joystick move her (camera-relative), the mouse or a
// drag orbits the camera around the couple, and Babai (in Characters)
// walks beside her holding her hand wherever she goes.
export default function PlayerController({
  roaming,
  mode,
  playerStateRef,
  joystickRef,
  onNearestChange,
  onInteract
}) {
  const { camera, gl } = useThree()
  const vel = useRef({ x: 0, z: 0 })
  const keys = useRef({})
  const nearestRef = useRef(null)
  const lastOrbit = useRef(0)
  const center = useRef(new THREE.Vector3(0, 0, 6.3))
  const lookRef = useRef(new THREE.Vector3(0, 1.02, 5.6))
  const camPosRef = useRef(new THREE.Vector3(0.4, 2.9, 10.6))
  const frames = useMemo(
    () => memoryWorldPositions(anniversaryConfig.memories),
    []
  )
  const targets = useMemo(() => {
    const list = frames.map((f) => ({
      x: f.position[0], z: f.position[2], range: 2.7,
      item: { type: 'memory', index: f.index, memory: f.memory, key: `memory:${f.index}` }
    }))
    list.push({ x: RING_POS.x, z: RING_POS.z, range: 2.5, item: { type: 'ring', key: 'ring:' } })
    list.push({ x: CAKE_POS.x, z: CAKE_POS.z, range: 2.8, item: { type: 'cake', key: 'cake:' } })
    list.push({ x: VIDEO_POS.x, z: VIDEO_POS.z, range: 3.6, item: { type: 'video', key: 'video:' } })
    return list
  }, [frames])
  const cbRef = useRef({ onNearestChange, onInteract })
  cbRef.current = { onNearestChange, onInteract }
  const stateRef = useRef({ roaming, mode })
  stateRef.current = { roaming, mode }

  useEffect(() => {
    const doInteract = () => {
      if (nearestRef.current) cbRef.current.onInteract(nearestRef.current)
    }
    window.addEventListener('anniversary:interact', doInteract)
    return () => window.removeEventListener('anniversary:interact', doInteract)
  }, [])

  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true
      if (e.code === 'KeyE' && stateRef.current.roaming && nearestRef.current) {
        cbRef.current.onInteract(nearestRef.current)
      }
    }
    const up = (e) => {
      keys.current[e.code] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    const orbit = (dx, dy) => {
      const ps = playerStateRef.current
      ps.camYaw -= dx * 0.0026
      ps.camPitch = THREE.MathUtils.clamp(ps.camPitch + dy * 0.0016, 0.04, 1.0)
      lastOrbit.current = performance.now()
    }
    const onMouseMove = (e) => {
      if (document.pointerLockElement === gl.domElement) {
        orbit(e.movementX, e.movementY)
      }
    }
    document.addEventListener('mousemove', onMouseMove)

    // Drag-orbit fallback (and the touch look control on mobile).
    let dragging = false
    let lastX = 0
    let lastY = 0
    const el = gl.domElement
    let dragId = null
    const pDown = (e) => {
      dragging = true
      dragId = e.pointerId
      lastX = e.clientX
      lastY = e.clientY
    }
    const pMove = (e) => {
      if (!dragging || e.pointerId !== dragId || document.pointerLockElement === el) return
      orbit((e.clientX - lastX) * 1.9, (e.clientY - lastY) * 1.9)
      lastX = e.clientX
      lastY = e.clientY
    }
    const pUp = () => {
      dragging = false
    }
    el.addEventListener('pointerdown', pDown)
    window.addEventListener('pointermove', pMove)
    window.addEventListener('pointerup', pUp)
    window.addEventListener('pointercancel', pUp)
    window.addEventListener('blur', pUp)
    const onClick = () => {
      if (window.matchMedia('(pointer: fine)').matches) {
        el.requestPointerLock?.()
      }
    }
    el.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      document.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('pointerdown', pDown)
      window.removeEventListener('pointermove', pMove)
      window.removeEventListener('pointerup', pUp)
      window.removeEventListener('pointercancel', pUp)
      window.removeEventListener('blur', pUp)
      keys.current = {}
      el.removeEventListener('click', onClick)
    }
  }, [gl, playerStateRef])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1)
    const ps = playerStateRef.current
    const { roaming: canRoam, mode: currentMode } = stateRef.current

    // ---------- Movement (Sonai) ----------
    const wish = WISH
    wish.x = 0
    wish.z = 0
    if (canRoam) {
      const k = keys.current
      let ix = 0
      let iz = 0
      if (k.KeyW || k.ArrowUp) iz += 1
      if (k.KeyS || k.ArrowDown) iz -= 1
      if (k.KeyA || k.ArrowLeft) ix -= 1
      if (k.KeyD || k.ArrowRight) ix += 1
      if (joystickRef?.current) {
        ix += joystickRef.current.x
        iz += joystickRef.current.y
      }
      const len = Math.hypot(ix, iz)
      if (len > 1) {
        ix /= len
        iz /= len
      }
      const sin = Math.sin(ps.camYaw)
      const cos = Math.cos(ps.camYaw)
      wish.x = (ix * cos - iz * sin) * WALK_SPEED
      wish.z = (-ix * sin - iz * cos) * WALK_SPEED
      if (len > 0.12) {
        // She turns to face where she's walking.
        const targetYaw = Math.atan2(-wish.x, -wish.z)
        ps.yaw = dampAngle(ps.yaw, targetYaw, 10, dt)
        // Camera gently settles behind her if the user isn't orbiting.
        if (performance.now() - lastOrbit.current > 1600) {
          ps.camYaw = dampAngle(ps.camYaw, ps.yaw, 1.4, dt)
        }
      }
    }
    vel.current.x = THREE.MathUtils.damp(vel.current.x, wish.x, 6, dt)
    vel.current.z = THREE.MathUtils.damp(vel.current.z, wish.z, 6, dt)
    if (canRoam) {
      ps.x += vel.current.x * dt
      ps.z += vel.current.z * dt
      ps.x = THREE.MathUtils.clamp(ps.x, -BOUNDS.x, BOUNDS.x)
      ps.z = THREE.MathUtils.clamp(ps.z, BOUNDS.zMin, BOUNDS.zMax)
      for (const o of OBSTACLES) {
        const dx = ps.x - o.x
        const dz = ps.z - o.z
        const d = Math.hypot(dx, dz)
        if (d > 0.001 && d < o.r) {
          ps.x = o.x + (dx / d) * o.r
          ps.z = o.z + (dz / d) * o.r
        }
      }
    }
    ps.speed = Math.hypot(vel.current.x, vel.current.z)

    // ---------- Camera ----------
    const ceremony = CEREMONY_CAM[currentMode]
    if (ceremony) {
      // Cinematic wide shot: glide to the fixed ceremony position and
      // hold it, so the whole scene stays clearly in frame.
      camPosRef.current.x = THREE.MathUtils.damp(camPosRef.current.x, ceremony.pos[0], 2.4, dt)
      camPosRef.current.y = THREE.MathUtils.damp(camPosRef.current.y, ceremony.pos[1], 2.4, dt)
      camPosRef.current.z = THREE.MathUtils.damp(camPosRef.current.z, ceremony.pos[2], 2.4, dt)
      lookRef.current.x = THREE.MathUtils.damp(lookRef.current.x, ceremony.look[0], 2.4, dt)
      lookRef.current.y = THREE.MathUtils.damp(lookRef.current.y, ceremony.look[1], 2.4, dt)
      lookRef.current.z = THREE.MathUtils.damp(lookRef.current.z, ceremony.look[2], 2.4, dt)
      camera.position.copy(camPosRef.current)
      camera.lookAt(lookRef.current)
    } else {
      // Follow-cam: orbit around the roaming couple.
      center.current.x = THREE.MathUtils.damp(center.current.x, ps.x, 3.2, dt)
      center.current.z = THREE.MathUtils.damp(center.current.z, ps.z, 3.2, dt)
      const fwd = {
        x: -Math.sin(ps.camYaw),
        z: -Math.cos(ps.camYaw)
      }
      const dist = 3.7
      camPosRef.current.set(
        THREE.MathUtils.clamp(center.current.x - fwd.x * dist, -4.85, 4.85),
        1.5 + ps.camPitch * 1.7,
        THREE.MathUtils.clamp(center.current.z - fwd.z * dist, -7.3, 7.35)
      )
      lookRef.current.set(
        center.current.x + fwd.x * 0.7,
        1.02,
        center.current.z + fwd.z * 0.7
      )
      camera.position.copy(camPosRef.current)
      camera.lookAt(lookRef.current)
    }

    // ---------- Nearest interactable (allocation-free) ----------
    let best = null
    let bestD = Infinity
    for (let i = 0; i < targets.length; i++) {
      const tg = targets[i]
      const d = Math.hypot(ps.x - tg.x, ps.z - tg.z)
      if (d < tg.range && d < bestD) {
        bestD = d
        best = tg.item
      }
    }
    if ((best?.key ?? null) !== (nearestRef.current?.key ?? null)) {
      nearestRef.current = best
      cbRef.current.onNearestChange(best)
    }
  })

  return null
}
