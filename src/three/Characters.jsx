import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { emojiTexture, nameTagTexture } from './textures'
import { anniversaryConfig } from '../config/anniversary'

// Stylised low-poly people built from primitives — light enough for
// Android phones, dressed for an anniversary ceremony.
// THE COUPLE IS THE PLAYER: Sonai is who enters and walks; Babai
// walks beside her, holding her hand, wherever she roams.

const SKINS = ['#f2c29b', '#c68863', '#8d5a3b', '#ffdbb4']

function Arm({ side, outfit, skin, armRef, ring = false }) {
  return (
    <group ref={armRef} position={[side * 0.27, 1.24, 0]}>
      <mesh position={[0, -0.24, 0]}>
        <cylinderGeometry args={[0.05, 0.045, 0.5, 8]} />
        <meshStandardMaterial color={outfit} roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.52, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      {/* The ring ON her finger, once she has said yes */}
      {ring && (
        <mesh position={[0, -0.55, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.04, 0.012, 10, 22]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.12} emissive="#664d00" emissiveIntensity={0.7} />
        </mesh>
      )}
    </group>
  )
}

function Head({ skin, hairColor, longHair, bun, blinkOffset = 0, feminine = false }) {
  const eyeL = useRef()
  const eyeR = useRef()
  // Blinking: every ~3.6 s the eyes close for a tenth of a second.
  // Each character has its own offset so they don't blink in unison.
  useFrame(({ clock }) => {
    const cycle = (clock.elapsedTime + blinkOffset) % 3.6
    const k = cycle > 3.35 ? Math.sin(((cycle - 3.35) / 0.25) * Math.PI) : 0
    const s = 1 - 0.88 * k
    if (eyeL.current) eyeL.current.scale.y = s
    if (eyeR.current) eyeR.current.scale.y = s
  })
  return (
    <group position={[0, 1.52, 0]}>
      <mesh>
        <sphereGeometry args={[0.155, 14, 12]} />
        <meshStandardMaterial color={skin} roughness={0.65} />
      </mesh>
      {/* Hair cap, swept back so the face stays open */}
      <mesh position={[0, 0.045, -0.018]} scale={[1.02, 0.82, 1.02]}>
        <sphereGeometry args={[0.158, 14, 12]} />
        <meshStandardMaterial color={hairColor} roughness={0.9} />
      </mesh>
      {/* Fringe / side part */}
      <mesh position={[0, 0.1, 0.1]} rotation={[0.5, 0, 0]} scale={[1.05, 0.5, 0.6]}>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshStandardMaterial color={hairColor} roughness={0.9} />
      </mesh>
      {/* Eyes + glints */}
      {[-0.055, 0.055].map((x) => (
        <group key={x}>
          <mesh ref={x < 0 ? eyeL : eyeR} position={[x, 0.02, 0.138]}>
            <sphereGeometry args={[0.021, 10, 10]} />
            <meshStandardMaterial color="#1d1008" roughness={0.25} />
          </mesh>
          <mesh position={[x + 0.007, 0.032, 0.155]}>
            <sphereGeometry args={[0.006, 6, 6]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} emissive="#ffffff" emissiveIntensity={0.5} />
          </mesh>
          {/* Eyebrow */}
          <mesh position={[x, 0.078, 0.142]} rotation={[0, 0, x < 0 ? 0.18 : -0.18]}>
            <boxGeometry args={[0.05, 0.009, 0.012]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          {/* Blush */}
          <mesh position={[x * 1.75, -0.032, 0.118]} scale={[1, 0.7, 0.5]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#e88a7a" roughness={0.9} transparent opacity={0.75} />
          </mesh>
        </group>
      ))}
      {/* Nose + smile */}
      <mesh position={[0, -0.018, 0.152]} scale={[0.8, 1.15, 0.7]}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshStandardMaterial color={skin} roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.062, 0.138]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.038, 0.007, 8, 14, Math.PI]} />
        <meshStandardMaterial color="#8a3b2e" roughness={0.7} />
      </mesh>
      {feminine && (
        <>
          {/* Gold earrings */}
          {[-0.152, 0.152].map((x) => (
            <mesh key={x} position={[x, -0.02, 0.02]}>
              <sphereGeometry args={[0.014, 8, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
            </mesh>
          ))}
        </>
      )}
      {longHair && (
        <>
          <mesh position={[0, -0.16, -0.11]}>
            <boxGeometry args={[0.2, 0.36, 0.07]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          {/* Side strands framing the face */}
          {[-0.14, 0.14].map((x) => (
            <mesh key={x} position={[x, -0.1, 0.06]} rotation={[0, 0, x < 0 ? 0.12 : -0.12]}>
              <boxGeometry args={[0.045, 0.3, 0.05]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
          ))}
        </>
      )}
      {bun && (
        <>
          <mesh position={[0, 0.16, -0.07]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          {/* A small rose tucked by the bun */}
          <mesh position={[0.075, 0.17, -0.02]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshStandardMaterial color="#c9404d" roughness={0.7} />
          </mesh>
        </>
      )}
    </group>
  )
}

function Body({ outfit, dress, shirt, legs = true, legRefs, feminine = false }) {
  return (
    <group>
      {dress ? (
        <>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.17, 0.37, 0.82, 14]} />
            <meshStandardMaterial color={outfit} roughness={0.75} />
          </mesh>
          {/* Gold waist sash + hem trim */}
          <mesh position={[0, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.175, 0.022, 8, 20]} />
            <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.365, 0.014, 8, 24]} />
            <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.35} />
          </mesh>
        </>
      ) : !legs ? null : (
        <>
          {[-0.09, 0.09].map((x, i) => (
            <group key={x} position={[x, 0.58, 0]} ref={legRefs?.[i]}>
              <mesh position={[0, -0.28, 0]}>
                <cylinderGeometry args={[0.06, 0.055, 0.58, 8]} />
                <meshStandardMaterial color="#23202b" roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.55, 0.035]}>
                <boxGeometry args={[0.1, 0.05, 0.19]} />
                <meshStandardMaterial color="#14100c" roughness={0.6} />
              </mesh>
            </group>
          ))}
        </>
      )}
      <mesh position={[0, 1.03, 0]} castShadow>
        <capsuleGeometry args={[0.185, 0.33, 6, 12]} />
        <meshStandardMaterial color={outfit} roughness={0.8} />
      </mesh>
      {feminine && (
        <>
          {/* Delicate gold necklace with a tiny pendant */}
          <mesh position={[0, 1.18, 0.16]} rotation={[0.35, 0, 0]}>
            <torusGeometry args={[0.075, 0.008, 8, 18, Math.PI * 1.2]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, 1.1, 0.185]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
          </mesh>
        </>
      )}
      {shirt && (
        <>
          <mesh position={[0, 1.04, 0.168]}>
            <boxGeometry args={[0.17, 0.38, 0.025]} />
            <meshStandardMaterial color="#fff8ec" roughness={0.8} />
          </mesh>
          {/* Jacket lapels */}
          <mesh position={[-0.07, 1.16, 0.18]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.05, 0.2, 0.012]} />
            <meshStandardMaterial color="#16233f" roughness={0.75} />
          </mesh>
          <mesh position={[0.07, 1.16, 0.18]} rotation={[0, 0, -0.35]}>
            <boxGeometry args={[0.05, 0.2, 0.012]} />
            <meshStandardMaterial color="#16233f" roughness={0.75} />
          </mesh>
          {/* Pocket square */}
          <mesh position={[0.11, 1.12, 0.185]}>
            <boxGeometry args={[0.05, 0.035, 0.012]} />
            <meshStandardMaterial color="#fff8ec" roughness={0.8} />
          </mesh>
          <mesh position={[0, 1.24, 0.185]}>
            <boxGeometry args={[0.11, 0.045, 0.03]} />
            <meshStandardMaterial color="#a41623" roughness={0.7} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ---------- Guests: 4 couples clapping + cheering ----------
function Guest({ position, rotationY, outfit, dress, skin, hairColor, phase, celebrating }) {
  const group = useRef()
  const armL = useRef()
  const armR = useRef()
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase * 10
    const speed = celebrating ? 4.6 : 3.4
    const clap = Math.sin(t * speed)
    if (armL.current) {
      armL.current.rotation.x = -1.05
      armL.current.rotation.z = 0.5 + clap * 0.2
    }
    if (armR.current) {
      armR.current.rotation.x = -1.05
      armR.current.rotation.z = -0.5 - clap * 0.2
    }
    if (group.current) {
      // smooth sway (sin^2-style, no sharp turnaround) — gentle, not shaky
      group.current.position.y = (1 - Math.cos(t * speed * 0.5)) * 0.5 * (celebrating ? 0.03 : 0.015)
    }
  })
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={group}>
        <Body outfit={outfit} dress={dress} shirt={!dress} feminine={dress} />
        <Head skin={skin} hairColor={hairColor} longHair={dress} blinkOffset={phase} feminine={dress} />
        <Arm side={-1} outfit={outfit} skin={skin} armRef={armL} />
        <Arm side={1} outfit={outfit} skin={skin} armRef={armR} />
      </group>
    </group>
  )
}

// NOTE: no guests stand in the south-east quadrant near the ring
// table — the proposal camera lives there, and a guest in that lane
// once blocked the entire proposal view.
const GUEST_PAIRS = [
  { pos: [-4.05, -3.4], yaw: Math.PI / 2, colors: ['#7a1f2b', '#274156'] },
  { pos: [4.05, -0.6], yaw: -Math.PI / 2, colors: ['#b98a2f', '#3d5a45'] },
  { pos: [-4.05, 4.9], yaw: Math.PI / 2, colors: ['#274156', '#8c4a6e'] },
  { pos: [4.05, 4.9], yaw: -Math.PI / 2, colors: ['#3d5a45', '#a4552e'] }
]

export function GuestCouples({ celebrating }) {
  return (
    <group>
      {GUEST_PAIRS.map((pair, i) => (
        <group key={i}>
          <Guest
            position={[pair.pos[0], 0, pair.pos[1] - 0.34]}
            rotationY={pair.yaw}
            outfit={pair.colors[0]}
            dress
            skin={SKINS[i % SKINS.length]}
            hairColor="#2a1608"
            phase={i * 0.7}
            celebrating={celebrating}
          />
          <Guest
            position={[pair.pos[0], 0, pair.pos[1] + 0.34]}
            rotationY={pair.yaw}
            outfit={pair.colors[1]}
            dress={false}
            skin={SKINS[(i + 2) % SKINS.length]}
            hairColor="#120a04"
            phase={i * 0.7 + 0.35}
            celebrating={celebrating}
          />
        </group>
      ))}
    </group>
  )
}

export const GUEST_SPOTS = GUEST_PAIRS.map((p) => ({ x: p.pos[0], z: p.pos[1], r: 0.62 }))

// ---------- Babai & Sonai — the roaming couple ----------
// Fixed ceremony spots (model yaw = atan2 facing convention for the
// character models, whose front is +Z).
const SPOTS = {
  // Room-side of the cake table, facing north toward the cake — so
  // the frontal camera (final-wall side) sees their faces, hands,
  // the knife and the cake, with the table in the foreground.
  cake: {
    babai: { x: -3.85, z: -5.15, yaw: -2.82 },
    sonai: { x: -2.95, z: -5.15, yaw: -2.55 }
  },
  ring: {
    babai: { x: 2.45, z: -4.85, yaw: Math.PI },
    sonai: { x: 2.45, z: -5.65, yaw: 0.15 }
  }
}

// Name tags are NOT children of the bobbing / leaning bodies and have no
// animation of their own: they glide with the character's smoothed x/z at a
// fixed height, so they never shake while walking.
function NameSprite({ text, spriteRef }) {
  const tex = useMemo(() => nameTagTexture(text), [text])
  return (
    <sprite ref={spriteRef} position={[0, 2.04, 0]} scale={[1.3, 0.33, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} />
    </sprite>
  )
}

export function CeremonyCouple({ mode, playerStateRef, proposalScene = false, wearingRing = false, stageRef }) {
  const babai = useRef()
  const sonai = useRef()
  const babaiTag = useRef()
  const sonaiTag = useRef()
  const babaiArmL = useRef()
  const babaiArmR = useRef()
  const sonaiArmL = useRef()
  const sonaiArmR = useRef()
  const babaiLegL = useRef()
  const babaiLegR = useRef()
  const heartRef = useRef()
  const transferRing = useRef()
  const knifeRef = useRef()
  // Proposal timeline: 0 KNEEL+PRESENT · 1 RING_PLACEMENT ·
  // 2 BABAI_STANDS · 3 EMBRACE
  const [scenePhase, setScenePhase] = useState(0)
  const phaseRef = useRef(0)
  // Cake timeline: 0 POSITION · 1 HANDS_REACH · 2 KNIFE_CUT ·
  // 3 CAKE_SLICE · 4 CELEBRATION
  const [cakeStage, setCakeStage] = useState(0)
  const cakeStageRef = useRef(0)
  // Ceremony clocks: accumulated ONLY from the same frame delta that
  // moves the characters, and only once they have ARRIVED at their
  // ceremony spots. This keeps the timeline in sync with the bodies
  // at ANY frame rate — the fix for scenes "playing" mid-room on
  // slower devices.
  const sceneTime = useRef(0)
  const cakeTime = useRef(0)
  const hugHold = useRef(0)
  const celebHold = useRef(0)
  const propRef = useRef(proposalScene)
  propRef.current = proposalScene
  const modeRef = useRef(mode)
  modeRef.current = mode
  const prevMode = useRef(mode)
  const s = useRef({
    sx: -0.32, sz: 6.3, sYaw: Math.PI,
    bx: 0.3, bz: 6.3, bYaw: Math.PI,
    walkPhase: 0,
    bSink: 0
  })
  const heartTex = useMemo(() => emojiTexture('❤️'), [])
  const { characters } = anniversaryConfig

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.1)
    const t = clock.elapsedTime
    const ps = playerStateRef.current
    const st = s.current
    const modeNow = modeRef.current

    // Returning to roaming: hand Sonai's current spot back to the
    // player controller so she continues from exactly where she is.
    if (modeNow === 'welcome' && prevMode.current !== 'welcome') {
      ps.x = st.sx
      ps.z = st.sz
      ps.yaw = st.sYaw - Math.PI
      ps.camYaw = ps.yaw
    }
    prevMode.current = modeNow

    // ----- Targets -----
    let sT; let bT; let sYawT; let bYawT
    if (modeNow === 'welcome') {
      sT = { x: ps.x, z: ps.z }
      sYawT = ps.yaw + Math.PI
      // Babai at Sonai's right hand side, always.
      const my = sYawT
      const right = { x: -Math.cos(my), z: Math.sin(my) }
      bT = { x: sT.x + right.x * 0.6, z: sT.z + right.z * 0.6 }
      bYawT = sYawT
    } else {
      const spot = SPOTS[modeNow]
      sT = spot.sonai
      bT = spot.babai
      sYawT = spot.sonai.yaw
      bYawT = spot.babai.yaw
    }

    // ----- Ceremony timelines (arrival-gated, movement-clock) -----
    const arrived =
      Math.hypot(st.sx - sT.x, st.sz - sT.z) < 0.3 &&
      Math.hypot(st.bx - bT.x, st.bz - bT.z) < 0.3

    if (propRef.current && arrived) sceneTime.current += dt
    if (!propRef.current) {
      sceneTime.current = 0
      hugHold.current = 0
    }
    const st3 = sceneTime.current
    const newPhase = !propRef.current
      ? 0
      : st3 < 2.4
        ? 0
        : st3 < 4.6
          ? 1
          : st3 < 6.1
            ? 2
            : 3
    if (newPhase !== phaseRef.current) {
      phaseRef.current = newPhase
      setScenePhase(newPhase)
      if (stageRef?.current) stageRef.current.proposal = newPhase
    }
    const phase = phaseRef.current
    if (phase === 3) {
      hugHold.current += dt
      if (hugHold.current > 7 && stageRef?.current) stageRef.current.proposalDone = true
    }

    if (modeNow === 'cake' && arrived) cakeTime.current += dt
    if (modeNow !== 'cake') {
      cakeTime.current = 0
      celebHold.current = 0
    }
    const ct = cakeTime.current
    const newCakeStage = modeNow !== 'cake' || !arrived
      ? 0
      : ct < 1.0
        ? 1
        : ct < 2.8
          ? 2
          : ct < 3.8
            ? 3
            : 4
    if (newCakeStage !== cakeStageRef.current) {
      cakeStageRef.current = newCakeStage
      setCakeStage(newCakeStage)
      if (stageRef?.current) stageRef.current.cake = newCakeStage
    }
    const cStage = cakeStageRef.current
    if (cStage === 4) {
      celebHold.current += dt
      if (celebHold.current > 2.6 && stageRef?.current) stageRef.current.cakeDone = true
    }

    // Late target overrides that depend on the timeline state:
    if (modeNow === 'ring' && propRef.current && phase === 3) {
      sT = { x: 2.45, z: -5.44 }
      bT = { x: 2.45, z: -5.06 }
    }
    if (modeNow === 'cake' && cStage === 4) {
      sYawT = Math.atan2(st.bx - st.sx, st.bz - st.sz)
      bYawT = Math.atan2(st.sx - st.bx, st.sz - st.bz)
    }

    const dampPos = (cur, target, lambda) => cur + (target - cur) * (1 - Math.exp(-lambda * dt))
    const dampYaw = (cur, target, lambda) => {
      let d = target - cur
      while (d > Math.PI) d -= Math.PI * 2
      while (d < -Math.PI) d += Math.PI * 2
      return cur + d * (1 - Math.exp(-lambda * dt))
    }

    const prevSx = st.sx
    const prevSz = st.sz
    st.sx = dampPos(st.sx, sT.x, modeNow === 'welcome' ? 14 : 2.6)
    st.sz = dampPos(st.sz, sT.z, modeNow === 'welcome' ? 14 : 2.6)
    st.sYaw = dampYaw(st.sYaw, sYawT, 10)
    st.bx = dampPos(st.bx, bT.x, modeNow === 'welcome' ? 7 : 2.6)
    st.bz = dampPos(st.bz, bT.z, modeNow === 'welcome' ? 7 : 2.6)
    st.bYaw = dampYaw(st.bYaw, bYawT, 8)
    // Keep Babai inside the room even at the walls.
    st.bx = THREE.MathUtils.clamp(st.bx, -4.55, 4.55)
    st.bz = THREE.MathUtils.clamp(st.bz, -6.9, 7.1)

    // ----- Walk bounce -----
    const dist = Math.hypot(st.sx - prevSx, st.sz - prevSz)
    const speed = dt > 0 ? dist / dt : 0
    st.walkPhase += dt * (2 + speed * 3.2)
    const bob = Math.abs(Math.sin(st.walkPhase * 2.4)) * 0.035 * Math.min(1, speed)
    const bBob = Math.abs(Math.sin(st.walkPhase * 2.4 + 0.7)) * 0.035 * Math.min(1, speed)

    const kneel = modeNow === 'ring' && propRef.current && phase < 2
    const hugging = modeNow === 'ring' && propRef.current && phase === 3
    // Smooth sink/rise: kneeling and standing are damped, never a pop.
    st.bSink = THREE.MathUtils.damp(st.bSink, kneel ? -0.4 : 0, 4.2, dt)
    const celebBounce =
      modeNow === 'cake' && cStage === 4 ? Math.abs(Math.sin(t * 5)) * 0.045 : 0
    // Idle breathing — a slow, gentle lean, on top of every pose.
    const breathe = Math.sin(t * 1.5) * 0.012
    if (babai.current) {
      babai.current.position.set(st.bx, st.bSink + bBob + celebBounce, st.bz)
      babai.current.rotation.set(kneel ? 0.06 + breathe : hugging ? 0.09 + breathe : breathe, st.bYaw, 0)
    }
    if (babaiTag.current) babaiTag.current.position.set(st.bx, 2.04 + st.bSink * 0.6, st.bz)
    if (sonaiTag.current) sonaiTag.current.position.set(st.sx, 2.04, st.sz)
    if (sonai.current) {
      sonai.current.position.set(st.sx, bob + celebBounce, st.sz)
      sonai.current.rotation.set(
        hugging ? 0.09 + breathe : breathe,
        st.sYaw,
        Math.sin(st.walkPhase * 2.4) * 0.02 * Math.min(1, speed)
      )
    }
    // Babai's legs swing with his stride (Sonai's gown hides hers).
    const legSwing = Math.sin(st.walkPhase * 2.4) * 0.5 * Math.min(1, speed)
    if (babaiLegL.current)
      babaiLegL.current.rotation.x = THREE.MathUtils.damp(babaiLegL.current.rotation.x, legSwing, 10, dt)
    if (babaiLegR.current)
      babaiLegR.current.rotation.x = THREE.MathUtils.damp(babaiLegR.current.rotation.x, -legSwing, 10, dt)

    // ----- Arms -----
    const setArm = (ref, x, z) => {
      if (!ref.current) return
      ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, x, 8, dt)
      ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, z, 8, dt)
    }
    const swing = Math.sin(st.walkPhase * 2.4) * 0.32 * Math.min(1, speed)
    if (modeNow === 'welcome') {
      // Holding hands: Babai is on Sonai's RIGHT.
      // Her right arm reaches slightly across to his left hand.
      setArm(sonaiArmR, -0.14, 0.2)
      setArm(babaiArmL, -0.14, -0.2)
      // Free arms swing naturally while walking.
      setArm(sonaiArmL, swing, 0.13)
      setArm(babaiArmR, -swing, -0.13)
    } else if (modeNow === 'cake') {
      if (cStage === 0) {
        // Standing beside the cake, turning toward it.
        setArm(babaiArmL, -0.1, 0.12)
        setArm(babaiArmR, -0.1, -0.12)
        setArm(sonaiArmL, -0.1, 0.12)
        setArm(sonaiArmR, -0.1, -0.12)
      } else if (cStage === 1) {
        // Both reach for the knife — hands converge on the handle.
        setArm(babaiArmR, -0.88, -0.34)
        setArm(babaiArmL, -0.6, 0.26)
        setArm(sonaiArmL, -0.88, 0.34)
        setArm(sonaiArmR, -0.6, -0.26)
      } else if (cStage === 2) {
        // Cutting: hands press down together, gentle sawing motion.
        const saw = Math.sin(t * 7) * 0.05
        setArm(babaiArmR, -1.04 + saw, -0.34)
        setArm(babaiArmL, -0.72 + saw, 0.26)
        setArm(sonaiArmL, -1.04 + saw, 0.34)
        setArm(sonaiArmR, -0.72 + saw, -0.26)
      } else if (cStage === 3) {
        // Lifting the knife clear as the slice slides out.
        setArm(babaiArmR, -0.78, -0.3)
        setArm(babaiArmL, -0.5, 0.24)
        setArm(sonaiArmL, -0.78, 0.3)
        setArm(sonaiArmR, -0.5, -0.24)
      } else {
        // Celebration: facing each other, one hand joined, one waving.
        const wave = Math.sin(t * 6) * 0.18
        setArm(babaiArmR, -0.3, -0.22)
        setArm(babaiArmL, -1.65 + wave, 0.35)
        setArm(sonaiArmL, -0.3, 0.22)
        setArm(sonaiArmR, -1.65 - wave, -0.35)
      }
    } else if (!propRef.current) {
      // At the ring table, facing each other, holding hands — waiting
      // for her answer.
      setArm(babaiArmL, -0.55, 0.16)
      setArm(babaiArmR, -0.55, -0.16)
      setArm(sonaiArmL, -0.55, 0.16)
      setArm(sonaiArmR, -0.55, -0.16)
    } else if (phase === 0) {
      // Babai down on one knee, ring held up; Sonai's hands to her heart.
      setArm(babaiArmL, -1.3, 0.22)
      setArm(babaiArmR, -1.3, -0.22)
      setArm(sonaiArmL, -0.72, 0.62)
      setArm(sonaiArmR, -0.72, -0.62)
    } else if (phase === 1) {
      // He reaches the ring toward her raised hand; she lifts it to him.
      setArm(babaiArmL, -1.05, 0.12)
      setArm(babaiArmR, -1.05, -0.12)
      setArm(sonaiArmR, -2.05, -0.28)
      setArm(sonaiArmL, -0.72, 0.62)
    } else if (phase === 2) {
      // He rises back to standing (body sink is damped in the position
      // update); she admires the ring on her raised hand.
      setArm(babaiArmL, -0.14, 0.14)
      setArm(babaiArmR, -0.14, -0.14)
      setArm(sonaiArmR, -2.05, -0.28)
      setArm(sonaiArmL, -0.72, 0.62)
    } else {
      // The hug — arms around each other.
      setArm(babaiArmL, -0.55, 0.55)
      setArm(babaiArmR, -0.55, -0.55)
      setArm(sonaiArmL, -0.55, 0.55)
      setArm(sonaiArmR, -0.55, -0.55)
    }

    // ----- The knife: held by BOTH pairs of hands, always -----
    // Its position is computed from the couple's joined hands and the
    // cake — it never floats on its own and moves exactly with the
    // cutting motion of their arms.
    if (knifeRef.current) {
      const showKnife = modeNow === 'cake' && cStage >= 1 && cStage <= 3
      if (showKnife) {
        const cake = { x: -3.55, z: -6.05 }
        const midX = (st.sx + st.bx) / 2
        const midZ = (st.sz + st.bz) / 2
        const dx = cake.x - midX
        const dz = cake.z - midZ
        const dl = Math.hypot(dx, dz) || 1
        const dirX = dx / dl
        const dirZ = dz / dl
        let y = 1.05
        let tilt = 0.55
        if (cStage === 2) {
          const cutP = THREE.MathUtils.clamp((ct - 1.0) / 1.8, 0, 1)
          y = 1.05 - cutP * 0.19 + Math.sin(t * 7) * 0.012
          tilt = 0.55 + cutP * 0.3
        } else if (cStage === 3) {
          y = 0.99
          tilt = 0.5
        }
        knifeRef.current.visible = true
        knifeRef.current.position.set(midX + dirX * 0.46, y, midZ + dirZ * 0.46)
        knifeRef.current.rotation.set(tilt, Math.atan2(dirX, dirZ), 0)
      } else {
        knifeRef.current.visible = false
      }
    }

    // The ring travelling from his hands to her finger (phase 1)
    if (transferRing.current) {
      if (modeNow === 'ring' && propRef.current && phase === 1) {
        const u = THREE.MathUtils.clamp((sceneTime.current - 2.4) / 2.2, 0, 1)
        const start = {
          x: st.bx + Math.sin(st.bYaw) * 0.5,
          y: 0.74,
          z: st.bz + Math.cos(st.bYaw) * 0.5
        }
        const end = { x: st.sx - 0.28, y: 1.5, z: st.sz + 0.22 }
        transferRing.current.position.set(
          start.x + (end.x - start.x) * u,
          start.y + (end.y - start.y) * u + Math.sin(u * Math.PI) * 0.12,
          start.z + (end.z - start.z) * u
        )
        transferRing.current.scale.setScalar(1)
        transferRing.current.rotation.y = t * 2
      } else {
        transferRing.current.scale.setScalar(0.001)
      }
    }

    // ----- Floating heart -----
    if (heartRef.current) {
      let hx; let hy; let hz; let target = 0.3
      if (modeNow === 'welcome') {
        const my = st.sYaw
        const right = { x: -Math.cos(my), z: Math.sin(my) }
        hx = st.sx + right.x * 0.3
        hz = st.sz + right.z * 0.3
        hy = 0.86 + Math.sin(t * 2.2) * 0.04
      } else {
        hx = (st.sx + st.bx) / 2
        hz = (st.sz + st.bz) / 2
        hy = 1.95 + Math.sin(t * 2.2) * 0.05
        target =
          modeNow === 'ring' && propRef.current && phase === 3
            ? 0.55
            : modeNow === 'ring'
              ? 0.36
              : modeNow === 'cake' && cStage === 4
                ? 0.45
                : 0.001
      }
      heartRef.current.position.set(hx, hy, hz)
      const cur = heartRef.current.scale.x
      const next = THREE.MathUtils.damp(cur, target, 6, dt)
      heartRef.current.scale.set(next, next, 1)
    }
  })

  const kneeling = mode === 'ring' && proposalScene && scenePhase < 2

  return (
    <group>
      {/* Dedicated ceremony lighting — the couple is always clearly
          lit during the proposal / cake scenes, even with the dim. */}
      <pointLight
        position={mode === 'cake' ? [-3.4, 2.7, -5.1] : [2.45, 2.7, -4.4]}
        intensity={mode === 'cake' ? 9 : mode === 'ring' ? 10 : 0}
        color="#ffd9a0"
        distance={8}
      />
      {/* Babai — dark suit, white shirt, red bow tie */}
      <group ref={babai}>
        {kneeling ? (
          <group>
            <mesh position={[0.1, 0.22, 0.16]} rotation={[Math.PI / 2.4, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.055, 0.5, 8]} />
              <meshStandardMaterial color="#23202b" roughness={0.9} />
            </mesh>
            <mesh position={[-0.1, 0.08, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.055, 0.48, 8]} />
              <meshStandardMaterial color="#23202b" roughness={0.9} />
            </mesh>
          </group>
        ) : null}
        <Body outfit="#1d2a4a" dress={false} shirt legs={!kneeling} legRefs={[babaiLegL, babaiLegR]} />
        <Head skin="#c68863" hairColor="#120a04" blinkOffset={1.2} />
        <Arm side={-1} outfit="#1d2a4a" skin="#c68863" armRef={babaiArmL} />
        <Arm side={1} outfit="#1d2a4a" skin="#c68863" armRef={babaiArmR} />
        {kneeling && scenePhase === 0 && (
          <mesh position={[0, 1.02, 0.42]} rotation={[0.3, 0, 0]}>
            <torusGeometry args={[0.075, 0.016, 12, 28]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.15} emissive="#664d00" emissiveIntensity={0.6} />
          </mesh>
        )}
      </group>

      {/* Sonai — the player. Rose ceremony gown, hair in a bun. */}
      <group ref={sonai}>
        <Body outfit="#a41623" dress shirt={false} feminine />
        <Head skin="#f2c29b" hairColor="#1d0f06" bun blinkOffset={2.1} feminine />
        <Arm side={-1} outfit="#a41623" skin="#f2c29b" armRef={sonaiArmL} />
        <Arm side={1} outfit="#a41623" skin="#f2c29b" armRef={sonaiArmR} ring={wearingRing} />
      </group>

      <NameSprite text={characters.babaiName} spriteRef={babaiTag} />
      <NameSprite text={characters.sonaiName} spriteRef={sonaiTag} />

      {/* The cake knife — driven by the couple's hands (see useFrame) */}
      <group ref={knifeRef} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, -0.06]}>
          <cylinderGeometry args={[0.02, 0.023, 0.17, 10]} />
          <meshStandardMaterial color="#4a2410" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.015, 0.16]}>
          <boxGeometry args={[0.014, 0.085, 0.34]} />
          <meshStandardMaterial color="#d9dde2" metalness={0.9} roughness={0.22} />
        </mesh>
        <mesh position={[0, -0.05, 0.345]} rotation={[0.5, 0, 0]}>
          <coneGeometry args={[0.042, 0.09, 4]} />
          <meshStandardMaterial color="#d9dde2" metalness={0.9} roughness={0.22} />
        </mesh>
      </group>

      {/* The ring in transit, from his hands to her finger */}
      <mesh ref={transferRing} scale={[0.001, 0.001, 0.001]}>
        <torusGeometry args={[0.07, 0.015, 12, 28]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.12} emissive="#664d00" emissiveIntensity={0.8} />
      </mesh>

      <sprite ref={heartRef} scale={[0.3, 0.3, 1]}>
        <spriteMaterial map={heartTex} transparent depthWrite={false} />
      </sprite>
    </group>
  )
}
