import { useCallback, useEffect, useRef, useState } from 'react'

// One single <audio> instance for the whole journey. It is created
// once, never remounted on scene changes, so playback position is
// preserved across the opening -> welcome -> room transitions.
export function useBackgroundMusic(src) {
  const audioRef = useRef(null)
  const wasPlayingRef = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!src) return undefined
    const audio = new Audio()
    audio.src = src
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = 0.55
    const onError = () => setHasError(true)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    audio.addEventListener('error', onError)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.removeEventListener('error', onError)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audioRef.current = null
    }
  }, [src])

  // Call after the first meaningful user gesture (ribbon cut / click).
  // Browsers block autoplay with sound before that.
  const start = useCallback(() => {
    const audio = audioRef.current
    if (!audio || hasError) return
    audio.play().catch(() => {
      /* still blocked or file missing — toggle stays available */
    })
  }, [hasError])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || hasError) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }, [hasError])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setIsMuted(audio.muted)
  }, [])

  // Used while the personal video plays with its own sound.
  const duckForVideo = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    wasPlayingRef.current = !audio.paused
    if (wasPlayingRef.current) audio.pause()
  }, [])

  const restoreAfterVideo = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (wasPlayingRef.current) audio.play().catch(() => {})
    wasPlayingRef.current = false
  }, [])

  return {
    isPlaying,
    isMuted,
    hasError,
    start,
    toggle,
    toggleMute,
    duckForVideo,
    restoreAfterVideo
  }
}
