import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { finalWallTexture, woodFloorTexture } from './textures'
import { anniversaryConfig } from '../config/anniversary'
import { LOW } from './quality'

export const ROOM = { width: 10, depth: 15, height: 4.2 }

function FairyLights() {
  const bulbs = useMemo(() => {
    const pts = []
    for (const side of [-1, 1]) {
      for (let i = 0; i < 26; i++) {
        const z = -7 + (i / 25) * 14
        const sag = Math.abs(Math.sin(i * 1.7)) * 0.16
        pts.push([side * (ROOM.width / 2 - 0.14), 3.55 - sag, z])
      }
    }
    // Swag across the final wall
    for (let i = 0; i < 22; i++) {
      const x = -4.6 + (i / 21) * 9.2
      const sag = Math.sin((i / 21) * Math.PI) * 0.28
      pts.push([x, 3.95 - sag, -ROOM.depth / 2 + 0.14])
    }
    return pts
  }, [])
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current)
      ref.current.material.emissiveIntensity =
        1.5 + Math.sin(clock.elapsedTime * 2.1) * 0.25
  })
  return (
    <instancedMesh
      args={[null, null, bulbs.length]}
      ref={(m) => {
        ref.current = m
        if (!m) return
        const dummy = new THREE.Object3D()
        bulbs.forEach((p, i) => {
          dummy.position.set(p[0], p[1], p[2])
          dummy.updateMatrix()
          m.setMatrixAt(i, dummy.matrix)
        })
        m.instanceMatrix.needsUpdate = true
      }}
    >
      <sphereGeometry args={LOW ? [0.035, 6, 4] : [0.035, 8, 8]} />
      <meshStandardMaterial
        color="#ffd9a0"
        emissive="#ffb45e"
        emissiveIntensity={1.6}
        toneMapped={false}
      />
    </instancedMesh>
  )
}

export function Candle({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.22, 16]} />
        <meshStandardMaterial color="#f7ecd7" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.028, 10, 10]} />
        <meshStandardMaterial
          color="#ffca7a"
          emissive="#ff9d4d"
          emissiveIntensity={3.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

export function RoseBunch({ position, scale = 1 }) {
  const petals = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => [
        Math.sin(i * 2.4) * 0.09,
        0.16 + (i % 3) * 0.03,
        Math.cos(i * 2.4) * 0.09
      ]),
    []
  )
  return (
    <group position={position} scale={scale}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.05, 0.26, 12]} />
        <meshStandardMaterial color="#9db8c4" roughness={0.15} metalness={0.4} transparent opacity={0.75} />
      </mesh>
      {petals.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color={i % 2 ? '#a41623' : '#c9404d'} roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]} rotation={[0.4, 0, 0.5]}>
        <coneGeometry args={[0.045, 0.16, 6]} />
        <meshStandardMaterial color="#2e5d33" roughness={0.9} />
      </mesh>
    </group>
  )
}

function FallingPetals() {
  const COUNT = LOW ? 14 : 34
  const ref = useRef()
  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 12,
        offset: Math.random() * 4,
        speed: 0.05 + Math.random() * 0.07,
        sway: 0.4 + Math.random() * 0.7,
        rot: Math.random() * Math.PI
      })),
    []
  )
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    seeds.forEach((s, i) => {
      const fall = (t * s.speed + s.offset) % 3.6
      dummy.position.set(s.x + Math.sin(t * s.sway + s.offset) * 0.3, 3.7 - fall, s.z)
      dummy.rotation.set(s.rot + t * 0.4, s.rot, t * 0.3)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, COUNT]}>
      <planeGeometry args={[0.09, 0.13]} />
      <meshStandardMaterial color="#c9404d" roughness={0.9} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

function DustMotes() {
  const ref = useRef()
  const positions = useMemo(() => {
    const N = LOW ? 70 : 180
    const arr = new Float32Array(N * 3)
    for (let i = 0; i < N; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 9
      arr[i * 3 + 1] = Math.random() * 3.8 + 0.2
      arr[i * 3 + 2] = (Math.random() - 0.5) * 13
    }
    return arr
  }, [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.008
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffdca8" size={0.02} transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function ScatteredPetals() {
  const n = LOW ? 24 : 46
  const setup = (m) => {
    if (!m) return
    const d = new THREE.Object3D()
    const c = new THREE.Color()
    for (let i = 0; i < n; i++) {
      d.position.set((Math.random() - 0.5) * 3.4, 0.012, -6.6 + Math.random() * 12.5)
      d.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI)
      d.updateMatrix()
      m.setMatrixAt(i, d.matrix)
      m.setColorAt(i, c.set(i % 3 ? '#b02a37' : '#d4697a'))
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }
  return (
    <instancedMesh ref={setup} args={[null, null, n]}>
      <planeGeometry args={[0.1, 0.14]} />
      <meshStandardMaterial roughness={1} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

function BalloonCluster({ position, phase = 0 }) {
  const ref = useRef()
  const colors = ['#d4af37', '#c9404d', '#f3e2c7']
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.7 + phase) * 0.05
  })
  return (
    <group ref={ref} position={position}>
      {colors.map((c, i) => (
        <group key={c} position={[(i - 1) * 0.22, 2.9 + (i % 2) * 0.12, 0]}>
          <mesh>
            <sphereGeometry args={[0.17, 14, 12]} />
            <meshStandardMaterial color={c} roughness={0.25} metalness={0.1} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <coneGeometry args={[0.03, 0.06, 6]} />
            <meshStandardMaterial color={c} roughness={0.4} />
          </mesh>
          <mesh position={[0, -1.2, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 1.9, 4]} />
            <meshStandardMaterial color="#e8dcc0" roughness={0.9} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.22, 0.12, 0.22]} />
        <meshStandardMaterial color="#8a6a2f" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Chandelier() {
  return (
    <group position={[0, 3.5, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
        <meshStandardMaterial color="#8a6a2f" metalness={0.7} roughness={0.35} />
      </mesh>
      {[0.34, 0.2].map((r, i) => (
        <mesh key={r} position={[0, -i * 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.018, 8, 28]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <group key={i} position={[Math.cos(a) * 0.34, 0.06, Math.sin(a) * 0.34]}>
            <mesh>
              <cylinderGeometry args={[0.02, 0.026, 0.09, 8]} />
              <meshStandardMaterial color="#f7ecd7" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.08, 0]}>
              <sphereGeometry args={[0.022, 8, 8]} />
              <meshStandardMaterial color="#ffca7a" emissive="#ff9d4d" emissiveIntensity={3} toneMapped={false} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function FloralArch() {
  const roses = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const u = i / 10
        const ang = Math.PI * u
        return [Math.cos(ang) * 1.05, 1.55 + Math.sin(ang) * 1.55, 0]
      }),
    []
  )
  return (
    <group position={[0, 0, 7.38]}>
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.05, 0.05, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#2e5d33" roughness={0.9} />
      </mesh>
      {roses.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={i % 2 ? '#a41623' : '#d4697a'} roughness={0.7} />
        </mesh>
      ))}
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 0.85, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 1.7, 8]} />
          <meshStandardMaterial color="#2e5d33" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function WallSconce({ position, rotationY }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[0.1, 0.3, 0.04]} />
        <meshStandardMaterial color="#8a6a2f" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.2, 0.05]}>
        <cylinderGeometry args={[0.025, 0.03, 0.12, 8]} />
        <meshStandardMaterial color="#f7ecd7" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.3, 0.05]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial color="#ffca7a" emissive="#ff9d4d" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function Room() {
  const floorTex = useMemo(() => woodFloorTexture(), [])
  const finalTex = useMemo(
    () =>
      finalWallTexture({
        title: anniversaryConfig.anniversaryTitle,
        message: anniversaryConfig.personalMessage,
        date: anniversaryConfig.anniversaryDate
      }),
    []
  )
  const { width: W, depth: D, height: H } = ROOM

  return (
    <group>
      {/* Floor + a deep-red runner down the centre path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={floorTex} roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[1.7, D - 0.6]} />
        <meshStandardMaterial color="#5e1220" roughness={1} />
      </mesh>
      {/* Gold borders along the runner */}
      {[-0.88, 0.88].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.008, 0]}>
          <planeGeometry args={[0.05, D - 0.6]} />
          <meshStandardMaterial color="#b98a2f" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Walls */}
      <mesh position={[-W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#ead9bd" roughness={0.95} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#ead9bd" roughness={0.95} />
      </mesh>
      {/* Final wall — deep burgundy accent */}
      <mesh position={[0, H / 2, -D / 2]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#43101d" roughness={0.95} />
      </mesh>
      {/* Entrance wall */}
      <mesh position={[0, H / 2, D / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#e2cfae" roughness={0.95} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#2e1a12" roughness={1} />
      </mesh>

      {/* Baseboards + crown trim */}
      {[-W / 2 + 0.03, W / 2 - 0.03].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.14, 0]}>
            <boxGeometry args={[0.05, 0.28, D]} />
            <meshStandardMaterial color="#f4e8d2" roughness={0.8} />
          </mesh>
          <mesh position={[x, H - 0.12, 0]}>
            <boxGeometry args={[0.05, 0.2, D]} />
            <meshStandardMaterial color="#b98a2f" roughness={0.5} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Entrance doorway glow (behind the player) */}
      <mesh position={[0, 1.55, D / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.7, 3.1]} />
        <meshStandardMaterial color="#1f0d08" emissive="#3a1c0c" emissiveIntensity={0.6} />
      </mesh>
      {/* Wainscot panels on the side walls */}
      {[-W / 2 + 0.05, W / 2 - 0.05].map((x) => (
        <mesh key={x} position={[x, 0.95, 0]}>
          <boxGeometry args={[0.03, 1.1, D - 0.4]} />
          <meshStandardMaterial color="#dcc7a0" roughness={0.9} />
        </mesh>
      ))}

      {/* Decor: balloons, chandelier, floral arch, vases, sconces */}
      <BalloonCluster position={[-4.35, 0, 6.5]} phase={0} />
      <BalloonCluster position={[4.35, 0, 6.5]} phase={1.4} />
      <BalloonCluster position={[-4.35, 0, -6.5]} phase={2.6} />
      <Chandelier />
      <FloralArch />
      {[-4.35, 4.35].map((x) => (
        <group key={x} position={[x, 0, -6.85]}>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.16, 0.11, 0.84, 14]} />
            <meshStandardMaterial color="#b98a2f" metalness={0.55} roughness={0.35} />
          </mesh>
          <RoseBunch position={[0, 0.86, 0]} scale={1.15} />
        </group>
      ))}
      <WallSconce position={[-W / 2 + 0.08, 2.3, 2.2]} rotationY={Math.PI / 2} />
      <WallSconce position={[-W / 2 + 0.08, 2.3, -2.2]} rotationY={Math.PI / 2} />
      <WallSconce position={[W / 2 - 0.08, 2.3, 2.2]} rotationY={-Math.PI / 2} />
      <WallSconce position={[W / 2 - 0.08, 2.3, -2.2]} rotationY={-Math.PI / 2} />

      {/* Final-wall anniversary text, under the video screen */}
      <mesh position={[0, 0.62, -D / 2 + 0.06]}>
        <planeGeometry args={[6.4, 1.05]} />
        <meshStandardMaterial map={finalTex} transparent roughness={0.9} />
      </mesh>

      <FairyLights />
      <FallingPetals />
      <DustMotes />
      <ScatteredPetals />
    </group>
  )
}
