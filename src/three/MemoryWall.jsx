import { useMemo } from 'react'
import PictureFrame, { QuotePlaque } from './PictureFrame'
import { quoteTexture } from './textures'
import { anniversaryConfig } from '../config/anniversary'

// Gallery layout: memories alternate left / right wall; a quote plaque
// sits between each pair of frames. Positions are exported so the
// player controller can detect the nearest memory.
export const FRAME_Y = 2.05
// 11 memories: 6 on the left wall, 5 on the right (alternating).
export const FRAME_Z = [5.3, 3.5, 1.7, -0.1, -1.9, -3.7]
export const QUOTE_Z = [4.4, 2.6, 0.8, -1.0, -2.8, -4.6]

export function memoryWorldPositions(memories) {
  return memories.map((memory, i) => {
    const side = i % 2 === 0 ? -1 : 1 // left, right, left, ...
    const row = Math.floor(i / 2) % FRAME_Z.length
    return {
      memory,
      index: i,
      side,
      position: [side * 4.9, FRAME_Y, FRAME_Z[row]],
      rotationY: side === -1 ? Math.PI / 2 : -Math.PI / 2
    }
  })
}

export default function MemoryWall({ nearestIndex }) {
  const { memories, quotes } = anniversaryConfig
  const frames = useMemo(() => memoryWorldPositions(memories), [memories])
  const quoteTex = useMemo(() => quotes.map((q) => quoteTexture(q)), [quotes])

  const plaques = []
  quotes.forEach((_, i) => {
    const side = i % 2 === 0 ? -1 : 1
    const row = Math.floor(i / 2) % QUOTE_Z.length
    if (i >= 8) return
    plaques.push({
      texture: quoteTex[i],
      position: [side * 4.92, 2.0, QUOTE_Z[row]],
      rotationY: side === -1 ? Math.PI / 2 : -Math.PI / 2
    })
  })

  return (
    <group>
      {frames.map((f) => (
        <PictureFrame
          key={f.index}
          memory={f.memory}
          position={f.position}
          rotationY={f.rotationY}
          isNearest={nearestIndex === f.index}
        />
      ))}
      {plaques.map((p, i) => (
        <QuotePlaque key={i} {...p} />
      ))}
    </group>
  )
}
