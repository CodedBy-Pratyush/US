import { Suspense, useEffect, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { LOW, IS_TOUCH, DPR_MAX } from './quality'
import Room from './Room'
import Lighting from './Lighting'
import MemoryWall from './MemoryWall'
import AnniversaryTable from './AnniversaryTable'
import VideoScreen from './VideoScreen'
import PlayerController from './PlayerController'
import { CeremonyCouple, GuestCouples } from './Characters'
import { anniversaryConfig } from '../config/anniversary'

// Renders at most 60 fps. 90/120 Hz Android screens would otherwise
// double the GPU work for no visible gain; also stops when hidden.
function FrameLimiter({ active, fps = 60 }) {
  const advance = useThree((st) => st.advance)
  useEffect(() => {
    if (!active) return undefined
    const step = 1000 / fps - 1
    let raf = 0
    let last = 0
    const loop = (t) => {
      raf = requestAnimationFrame(loop)
      if (t - last >= step) {
        last = t
        advance(t)
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active, fps, advance])
  return null
}

export default function AnniversaryWorld({
  roaming,
  joystickRef,
  nearest,
  ceremonyMode,
  proposalScene,
  wearingRing,
  stageRef,
  playerStateRef,
  onNearestChange,
  onInteract,
  onVideoStatus
}) {
  // Start at the device cap; drop resolution if frames get slow.
  const [dpr, setDpr] = useState(DPR_MAX)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
  return (
    <Canvas
      frameloop="never"
      shadows={!LOW}
      dpr={dpr}
      gl={{ antialias: !LOW, powerPreference: IS_TOUCH ? 'default' : 'high-performance', stencil: false, alpha: false }}
      camera={{ fov: 62, near: 0.1, far: 60, position: [0.4, 2.9, 10.6] }}
      style={{ background: '#160408' }}
      // Adaptive resolution: if the frame rate drops on a weaker
      // phone, R3F lowers the pixel ratio instead of stuttering.
      performance={{ min: 0.5 }}
    >
      <FrameLimiter active={visible} />
      <PerformanceMonitor
        bounds={() => [LOW ? 40 : 50, 90]}
        onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
      />
      <fog attach="fog" args={['#2a0d12', 13, 32]} />
      <Suspense fallback={null}>
        <Lighting />
        <Room />
        <MemoryWall nearestIndex={nearest?.type === 'memory' ? nearest.index : -1} />
        <GuestCouples celebrating={ceremonyMode !== 'welcome'} />
        <CeremonyCouple
          mode={ceremonyMode}
          playerStateRef={playerStateRef}
          proposalScene={proposalScene}
          wearingRing={wearingRing}
          stageRef={stageRef}
        />
        <AnniversaryTable
          ringHighlighted={nearest?.type === 'ring' || ceremonyMode === 'ring'}
          ringTaken={proposalScene || wearingRing}
          stageRef={stageRef}
        />
        <VideoScreen src={anniversaryConfig.video} onStatusChange={onVideoStatus} />
        <PlayerController
          roaming={roaming}
          mode={ceremonyMode}
          playerStateRef={playerStateRef}
          joystickRef={joystickRef}
          onNearestChange={onNearestChange}
          onInteract={onInteract}
        />
      </Suspense>
    </Canvas>
  )
}
