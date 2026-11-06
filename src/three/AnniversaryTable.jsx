import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Candle, RoseBunch } from './Room'
import Ring from './Ring'
import { cakeSignTexture } from './textures'

// World position of the cake (table position + cake offset).
export const CAKE_WORLD = { x: -3.55, z: -6.05, topY: 0.86 }

function Strawberry({ position }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.032, 10, 10]} />
        <meshStandardMaterial color="#c22430" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.032, 0]}>
        <coneGeometry args={[0.02, 0.025, 8]} />
        <meshStandardMaterial color="#2e5d33" roughness={0.9} />
      </mesh>
    </group>
  )
}

function CakeCandle({ position }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 0.11, 8]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.075, 0]}>
        <sphereGeometry args={[0.016, 8, 8]} />
        <meshStandardMaterial color="#ffca7a" emissive="#ff9d4d" emissiveIntensity={3.4} toneMapped={false} />
      </mesh>
    </group>
  )
}

// The anniversary cake: two frosted layers, icing rings, strawberries,
// two candles and a "Happy Anniversary" sign. The cut seam appears as
// the knife goes in (stage>=2) and the slice slides out (stage>=3),
// driven by the shared ceremony stage ref the couple writes to.
function Cake({ stageRef }) {
  const signTex = useMemo(() => cakeSignTexture(), [])
  const seamRef = useRef()
  const sliceRef = useRef()
  const slicePos = useRef(0)

  useFrame((_, delta) => {
    const stage = stageRef?.current?.cake ?? 0
    if (seamRef.current) seamRef.current.visible = stage >= 2
    const target = stage >= 3 ? 1 : 0
    slicePos.current = THREE.MathUtils.damp(slicePos.current, target, 5, delta)
    if (sliceRef.current) {
      const p = slicePos.current
      sliceRef.current.visible = p > 0.02
      // The slice slides out toward the couple and tips onto a plate.
      sliceRef.current.position.set(0.05 + p * 0.1, 0.1, 0.2 + p * 0.24)
      sliceRef.current.rotation.set(p * 0.5, 0.5, 0)
    }
  })

  return (
    <group
      position={[-0.15, 0.5, 0.15]}
      onClick={(e) => {
        e.stopPropagation()
        window.dispatchEvent(new Event('anniversary:cake'))
      }}
    >
      {/* Plate */}
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.34, 0.3, 0.025, 28]} />
        <meshStandardMaterial color="#e9e2d0" metalness={0.35} roughness={0.3} />
      </mesh>
      {/* Bottom layer — cream */}
      <mesh position={[0, 0.13, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.22, 28]} />
        <meshStandardMaterial color="#fff1dc" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.245, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.028, 10, 32]} />
        <meshStandardMaterial color="#f6c9cd" roughness={0.6} />
      </mesh>
      {/* Top layer — pastel pink */}
      <mesh position={[0, 0.315, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 28]} />
        <meshStandardMaterial color="#eeb7bc" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.395, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.19, 0.024, 10, 32]} />
        <meshStandardMaterial color="#fff6e6" roughness={0.6} />
      </mesh>
      {/* Strawberries + candles on top */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Strawberry
          key={i}
          position={[Math.sin(i * 1.256) * 0.13, 0.42, Math.cos(i * 1.256) * 0.13]}
        />
      ))}
      <CakeCandle position={[-0.07, 0.45, -0.05]} />
      <CakeCandle position={[0.08, 0.45, 0.06]} />
      {/* Cut seam (appears as the knife cuts) */}
      <mesh ref={seamRef} position={[0.03, 0.22, 0.12]} rotation={[0, 0.5, 0]} visible={false}>
        <boxGeometry args={[0.014, 0.34, 0.3]} />
        <meshStandardMaterial color="#8a5a2b" roughness={0.85} />
      </mesh>
      {/* The separated slice */}
      <group ref={sliceRef} visible={false}>
        <mesh>
          <boxGeometry args={[0.15, 0.2, 0.15]} />
          <meshStandardMaterial color="#fff1dc" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.152, 0.05, 0.152]} />
          <meshStandardMaterial color="#eeb7bc" roughness={0.7} />
        </mesh>
      </group>
      {/* "Happy Anniversary" sign on two sticks, facing the room */}
      <group position={[0, 0.3, 0.3]} rotation={[0.22, 0, 0]}>
        {[-0.09, 0.09].map((x) => (
          <mesh key={x} position={[x, -0.07, -0.01]}>
            <cylinderGeometry args={[0.006, 0.006, 0.14, 6]} />
            <meshStandardMaterial color="#8a6420" roughness={0.6} />
          </mesh>
        ))}
        <mesh>
          <planeGeometry args={[0.46, 0.13]} />
          <meshStandardMaterial map={signTex} transparent roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Warm light on the cake */}
      <pointLight position={[0, 0.75, 0.35]} intensity={1.6} color="#ffbe78" distance={2.2} />
    </group>
  )
}

// Two decorated tables flanking the final wall:
// left = anniversary cake + candles + roses, right = the ring table.
export default function AnniversaryTable({ ringHighlighted, ringTaken, stageRef }) {
  return (
    <group>
      {/* Left table — anniversary display */}
      <group position={[-3.4, 0, -6.2]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.78, 0.78, 0.09, 28]} />
          <meshStandardMaterial color="#3a2113" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.09, 0.13, 0.45, 12]} />
          <meshStandardMaterial color="#2a1710" roughness={0.6} />
        </mesh>
        <Cake stageRef={stageRef} />
        <Candle position={[0.38, 0.62, -0.25]} />
        <Candle position={[0.15, 0.62, 0.42]} />
        <RoseBunch position={[-0.55, 0.5, -0.35]} scale={0.9} />
      </group>

      {/* Right table — the ring */}
      <group position={[3.4, 0, -6.2]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.62, 0.62, 0.09, 28]} />
          <meshStandardMaterial color="#3a2113" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.45, 12]} />
          <meshStandardMaterial color="#2a1710" roughness={0.6} />
        </mesh>
        <Candle position={[-0.4, 0.62, -0.3]} />
        <RoseBunch position={[0.42, 0.5, 0.3]} scale={0.85} />
      </group>
      <Ring position={[3.4, 0.72, -6.2]} highlighted={ringHighlighted} taken={ringTaken} />
    </group>
  )
}

export const TABLE_OBSTACLES = [
  { x: -3.4, z: -6.2, r: 0.88 },
  { x: 3.4, z: -6.2, r: 0.88 }
]
