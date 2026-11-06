import { LOW } from './quality'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { captionTexture, placeholderTexture } from './textures'

// Loads the owner's real photo. If the file is not in public/media yet,
// it falls back to an elegant placeholder naming the file to add —
// the experience never crashes and never shows a fake couple photo.
function usePhotoTexture(memory) {
  const [texture, setTexture] = useState(
    () => placeholderTexture(memory.caption, memory.image)
  )
  useEffect(() => {
    let alive = true
    let loaded = null
    new THREE.TextureLoader().load(
      memory.image,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = LOW ? 2 : 8
        loaded = tex
        if (alive) setTexture(tex)
      },
      undefined,
      () => {
        if (alive) setTexture(placeholderTexture(memory.caption, memory.image))
      }
    )
    return () => {
      alive = false
      if (loaded) loaded.dispose()
    }
  }, [memory])
  return texture
}

export default function PictureFrame({ memory, position, rotationY, isNearest }) {
  const texture = usePhotoTexture(memory)
  const captionTex = useMemo(() => captionTexture(memory.caption), [memory.caption])
  const group = useRef()

  const portrait = memory.aspect !== 'landscape'
  const w = portrait ? 1.05 : 1.5
  const h = portrait ? 1.4 : 1.05

  // Restrained highlight when this is the frame the player is facing.
  useFrame(({ clock }) => {
    if (!group.current) return
    const target = isNearest ? 1.045 : 1
    const s = THREE.MathUtils.lerp(group.current.scale.x, target, 0.12)
    group.current.scale.setScalar(s)
    void clock
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={group}>
        {/* Walnut + gold frame */}
        <mesh position={[0, 0, -0.035]}>
          <boxGeometry args={[w + 0.16, h + 0.16, 0.06]} />
          <meshStandardMaterial color="#3a2113" roughness={0.55} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0, -0.012]}>
          <boxGeometry args={[w + 0.06, h + 0.06, 0.05]} />
          <meshStandardMaterial color="#b98a2f" roughness={0.35} metalness={0.7} />
        </mesh>
        {/* Cream mount */}
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial color="#f7ecd7" roughness={0.9} />
        </mesh>
        {/* The photograph */}
        <mesh position={[0, 0, 0.028]}>
          <planeGeometry args={[w - 0.12, h - 0.12]} />
          <meshStandardMaterial map={texture} roughness={0.85} />
        </mesh>
        {/* Caption plate */}
        <mesh position={[0, -h / 2 - 0.24, 0.02]}>
          <planeGeometry args={[Math.min(w, 1.25), 0.19]} />
          <meshStandardMaterial map={captionTex} roughness={0.8} />
        </mesh>
        {/* Small warm picture light */}
        <mesh position={[0, h / 2 + 0.2, 0.09]}>
          <boxGeometry args={[0.42, 0.045, 0.045]} />
          <meshStandardMaterial
            color="#8a6420"
            emissive="#ffb45e"
            emissiveIntensity={isNearest ? 1.4 : 0.8}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  )
}

// A framed love-note plaque placed between photographs.
export function QuotePlaque({ texture, position, rotationY }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[1.06, 0.82, 0.05]} />
        <meshStandardMaterial color="#5b2333" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[0.98, 0.74]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
    </group>
  )
}
