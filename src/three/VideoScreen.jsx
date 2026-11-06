import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// A real HTML5 <video> playing as a texture on the final-wall screen.
// The video element is owned here; App controls it through window
// events ('anniversary:video-toggle' | '-mute' | '-replay') so the
// on-screen HTML controls and clicking the 3D screen stay in sync.
export default function VideoScreen({ src, onStatusChange }) {
  const meshRef = useRef()
  const [failed, setFailed] = useState(false)
  const videoRef = useRef(null)
  const textureRef = useRef(null)
  const newFrame = useRef(true)

  useEffect(() => {
    const video = document.createElement('video')
    video.loop = true
    video.muted = true // muted autoplay is allowed on Android Chrome
    video.defaultMuted = true
    video.playsInline = true
    video.preload = 'auto'
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.src = src
    videoRef.current = video
    // Only upload a texture frame when the video really has a new one.
    const rvfc = video.requestVideoFrameCallback
      ? () => {
          newFrame.current = true
          video.requestVideoFrameCallback(rvfc)
        }
      : null
    if (rvfc) video.requestVideoFrameCallback(rvfc)

    // Autoplay as soon as the room (this component) exists. `userPaused`
    // stops auto-resume after the visitor pauses it on purpose.
    let userPaused = false
    let resumeAfterHide = false
    const tryPlay = () => {
      if (userPaused || !video.paused) return
      const p = video.play()
      if (p && p.catch) {
        p.catch(() => {
          // Autoplay blocked: retry on the visitor's very first touch.
          if (!retryArmed) {
            retryArmed = true
            const retry = () => {
              retryArmed = false
              tryPlay()
            }
            window.addEventListener('pointerdown', retry, { once: true })
          }
        })
      }
    }
    let retryArmed = false
    const onCanPlay = () => tryPlay()
    video.addEventListener('canplay', onCanPlay)
    // Keep the video's real aspect ratio inside the 5.5 x 2.95 screen
    // (letterboxed on the dark panel behind it) — no stretching.
    const onMeta = () => {
      const ar = video.videoWidth / video.videoHeight
      const planeAr = 5.5 / 2.95
      const m = meshRef.current
      if (!m || !ar) return
      if (ar < planeAr) m.scale.set(ar / planeAr, 1, 1)
      else m.scale.set(1, planeAr / ar, 1)
    }
    video.addEventListener('loadedmetadata', onMeta)
    const onVis = () => {
      if (document.hidden) {
        resumeAfterHide = !video.paused
        video.pause()
      } else if (resumeAfterHide) {
        resumeAfterHide = false
        tryPlay()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    tryPlay()

    const texture = new THREE.VideoTexture(video)
    texture.colorSpace = THREE.SRGBColorSpace
    textureRef.current = texture
    if (meshRef.current) {
      // The material starts near-black for the idle screen; once the
      // video texture is attached it must go white or it tints the
      // video almost black, and needsUpdate recompiles the shader.
      meshRef.current.material.map = texture
      meshRef.current.material.color.set('#ffffff')
      meshRef.current.material.needsUpdate = true
    }

    const report = () =>
      onStatusChange?.({
        playing: !video.paused && !video.ended,
        muted: video.muted,
        failed,
        ended: video.ended
      })
    const onErr = () => {
      setFailed(true)
      onStatusChange?.({ playing: false, muted: true, failed: true, ended: false })
    }
    video.addEventListener('play', report)
    video.addEventListener('pause', report)
    video.addEventListener('ended', report)
    video.addEventListener('volumechange', report)
    video.addEventListener('error', onErr)

    const toggle = () => {
      if (video.paused) {
        userPaused = false
        tryPlay()
      } else {
        userPaused = true
        video.pause()
      }
    }
    const replay = () => {
      video.currentTime = 0
      userPaused = false
      tryPlay()
    }
    window.addEventListener('anniversary:video-toggle', toggle)
    window.addEventListener('anniversary:video-replay', replay)
    return () => {
      window.removeEventListener('anniversary:video-toggle', toggle)
      window.removeEventListener('anniversary:video-replay', replay)
      video.removeEventListener('play', report)
      video.removeEventListener('pause', report)
      video.removeEventListener('ended', report)
      video.removeEventListener('volumechange', report)
      video.removeEventListener('error', onErr)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('loadedmetadata', onMeta)
      document.removeEventListener('visibilitychange', onVis)
      // Leaving the room: stop playback and release the decoder.
      video.pause()
      video.removeAttribute('src')
      video.load()
      videoRef.current = null
      textureRef.current = null
      texture.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  useFrame(() => {
    // Only upload frames once the video actually has data — otherwise
    // the browser spams "no video" warnings every frame and wastes
    // GPU time while the file is missing or still loading.
    const v = videoRef.current
    if (!textureRef.current || !v || v.readyState < 2 || v.paused) return
    // requestVideoFrameCallback marks real new frames; fall back to
    // uploading every frame on browsers without it.
    if (!v.requestVideoFrameCallback || newFrame.current) {
      newFrame.current = false
      textureRef.current.needsUpdate = true
    }
  })

  return (
    <group position={[0, 2.45, -7.42]}>
      {/* Elegant frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[5.9, 3.35, 0.09]} />
        <meshStandardMaterial color="#b98a2f" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[5.7, 3.15, 0.09]} />
        <meshStandardMaterial color="#12060a" roughness={0.4} />
      </mesh>
      {/* Screen — click toggles play/pause */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0.03]}
        onClick={(e) => {
          e.stopPropagation()
          window.dispatchEvent(new Event('anniversary:video-toggle'))
        }}
      >
        <planeGeometry args={[5.5, 2.95]} />
        <meshBasicMaterial color={failed ? '#241016' : '#0a0a0a'} toneMapped={false} />
      </mesh>
      {failed && (
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[5.5, 2.95]} />
          <meshBasicMaterial color="#241016" toneMapped={false} transparent opacity={0.001} />
        </mesh>
      )}
    </group>
  )
}
