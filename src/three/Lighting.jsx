import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { LOW } from './quality'

// Warm, efficient lighting: a handful of static lights + 2 flickering
// candle lights. No per-frame React renders — refs only.
export default function Lighting() {
  const candleA = useRef()
  const candleB = useRef()

  useFrame(({ clock }) => {
    if (LOW) return
    const t = clock.elapsedTime
    if (candleA.current)
      candleA.current.intensity = 0.55 + Math.sin(t * 11) * 0.08 + Math.sin(t * 23.7) * 0.05
    if (candleB.current)
      candleB.current.intensity = 0.55 + Math.cos(t * 9.3) * 0.08 + Math.sin(t * 19.1) * 0.05
  })

  return (
    <group>
      <ambientLight intensity={0.48} color="#ffd9a8" />
      <hemisphereLight intensity={0.28} color="#ffe9c9" groundColor="#3a1410" />
      {/* Warm glow from the chandelier at the room's centre */}
      {!LOW && <pointLight position={[0, 3.3, 0]} intensity={6} color="#ffd9a0" distance={10} />}

      {/* Main warm wash down the room */}
      <spotLight
        position={[0, 4, 3.5]}
        angle={0.9}
        penumbra={1}
        intensity={55}
        color="#ffbe78"
        distance={18}
      />
      {/* Final wall — the brightest, most emotional area */}
      <spotLight
        position={[0, 3.9, -3.4]}
        angle={0.75}
        penumbra={0.9}
        intensity={80}
        color="#ffd9a0"
        distance={14}
        castShadow={!LOW}
        shadow-mapSize={[1024, 1024]}
      />
      {/* Picture lights, left & right */}
      {!LOW && (
        <>
          <pointLight position={[-3.6, 2.6, 0.4]} intensity={7} color="#ffc98a" distance={7} />
          <pointLight position={[3.6, 2.6, 0.4]} intensity={7} color="#ffc98a" distance={7} />
        </>
      )}
      {/* Flickering candle lights near the final tables */}
      <pointLight ref={candleA} position={[-3.4, 1.25, -6.2]} intensity={0.55} color="#ff9d4d" distance={4} />
      <pointLight ref={candleB} position={[3.4, 1.25, -6.2]} intensity={0.55} color="#ff9d4d" distance={4} />
    </group>
  )
}
