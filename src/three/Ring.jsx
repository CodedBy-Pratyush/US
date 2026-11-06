import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// The proposal ring: real 3D geometry — a polished gold band and a
// gemstone — resting on a velvet cushion. Gentle float + sparkle.
export default function Ring({ position, highlighted, taken = false }) {
  const group = useRef()
  const gem = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (group.current) {
      group.current.position.y =
        position[1] + Math.sin(t * 1.4) * 0.02 + (highlighted ? 0.1 : 0)
      group.current.rotation.y = t * 0.35
    }
    if (gem.current) {
      const s = 1 + Math.sin(t * 3.2) * 0.07
      gem.current.scale.setScalar(s)
    }
  })

  return (
    <group>
      {/* Velvet cushion */}
      <mesh position={[position[0], position[1] - 0.16, position[2]]} receiveShadow>
        <boxGeometry args={[0.52, 0.14, 0.52]} />
        <meshStandardMaterial color="#6e1423" roughness={0.95} />
      </mesh>
      {!taken && (
      <group
        ref={group}
        position={position}
        onClick={(e) => {
          e.stopPropagation()
          window.dispatchEvent(new Event('anniversary:ring'))
        }}
      >
        {/* Gold band */}
        <mesh rotation={[0.35, 0, 0]} castShadow>
          <torusGeometry args={[0.15, 0.032, 24, 64]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={1}
            roughness={0.16}
            emissive="#664d00"
            emissiveIntensity={highlighted ? 0.5 : 0.15}
          />
        </mesh>
        {/* Gemstone */}
        <mesh ref={gem} position={[0, 0.19, 0.045]} rotation={[0.4, 0, 0]}>
          <octahedronGeometry args={[0.062]} />
          <meshPhysicalMaterial
            color="#cfeaff"
            metalness={0.1}
            roughness={0.05}
            transmission={0.4}
            thickness={0.4}
            emissive="#7fb8ff"
            emissiveIntensity={highlighted ? 0.7 : 0.25}
          />
        </mesh>
        {/* Prongs */}
        {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((a) => (
          <mesh
            key={a}
            position={[Math.sin(a) * 0.045, 0.155, Math.cos(a) * 0.045 + 0.03]}
          >
            <boxGeometry args={[0.014, 0.07, 0.014]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
          </mesh>
        ))}
      </group>
      )}
      {(
        <pointLight
          position={[position[0], position[1] + 0.9, position[2] + 0.35]}
          intensity={highlighted ? 5 : 0}
          color="#ffe9b0"
          distance={3.5}
        />
      )}
    </group>
  )
}
