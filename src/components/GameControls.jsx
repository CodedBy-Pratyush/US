import { useEffect, useRef } from 'react'
import { Hand, Pause, Play, RotateCcw } from 'lucide-react'
import { anniversaryConfig as cfg } from '../config/anniversary'

// On-screen HUD for the 3D room: nearest-object prompt, video controls,
// desktop help, and the mobile joystick + interact button.
export default function GameControls({
  nearest,
  videoStatus,
  onExitRoom,
  joystickRef,
  cinematic = false
}) {
  const stickBase = useRef(null)
  const stickKnob = useRef(null)
  const activePointer = useRef(null)

  // Releases everything the joystick holds: the tracked pointer, the
  // pointer capture, the knob position and the movement input.
  const resetStick = () => {
    const base = stickBase.current
    const id = activePointer.current
    activePointer.current = null
    if (base && id !== null) {
      try { base.releasePointerCapture?.(id) } catch { /* already released */ }
    }
    if (joystickRef.current) {
      joystickRef.current.x = 0
      joystickRef.current.y = 0
    }
    if (stickKnob.current)
      stickKnob.current.style.transform = 'translate(-50%, -50%)'
  }
  const resetRef = useRef(resetStick)
  resetRef.current = resetStick

  // The joystick element is mounted ONCE for the whole room visit (it is
  // only hidden during events), so these listeners are never orphaned.
  useEffect(() => {
    const base = stickBase.current
    if (!base) return undefined
    const setKnob = (dx, dy) => {
      if (stickKnob.current)
        stickKnob.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
    }
    const apply = (e) => {
      const rect = base.getBoundingClientRect()
      let dx = e.clientX - (rect.left + rect.width / 2)
      let dy = e.clientY - (rect.top + rect.height / 2)
      const max = rect.width / 2 - 8
      const d = Math.hypot(dx, dy)
      if (d > max) {
        dx = (dx / d) * max
        dy = (dy / d) * max
      }
      setKnob(dx, dy)
      if (joystickRef.current) {
        joystickRef.current.x = dx / max
        joystickRef.current.y = -dy / max // screen-up = walk forward
      }
    }
    const down = (e) => {
      // A new touch ALWAYS takes over — a stale pointer id (lost
      // pointerup) can never lock the stick again.
      resetRef.current()
      activePointer.current = e.pointerId
      base.setPointerCapture?.(e.pointerId)
      apply(e)
    }
    const move = (e) => {
      if (e.pointerId === activePointer.current) apply(e)
    }
    const up = (e) => {
      if (e.pointerId === activePointer.current) resetRef.current()
    }
    const reset = () => resetRef.current()
    base.addEventListener('pointerdown', down)
    base.addEventListener('pointermove', move)
    base.addEventListener('pointerup', up)
    base.addEventListener('pointercancel', up)
    base.addEventListener('lostpointercapture', up)
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', reset)
    return () => {
      base.removeEventListener('pointerdown', down)
      base.removeEventListener('pointermove', move)
      base.removeEventListener('pointerup', up)
      base.removeEventListener('pointercancel', up)
      base.removeEventListener('lostpointercapture', up)
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', reset)
      reset()
    }
  }, [joystickRef])

  // Every event start/end: clear any held input so nothing is stuck.
  useEffect(() => {
    resetRef.current()
  }, [cinematic])

  const interact = () => window.dispatchEvent(new Event('anniversary:interact'))
  const videoEvent = (name) => window.dispatchEvent(new Event(name))

  return (
    <div className="hud">
      <button type="button" className="hud-exit" onClick={onExitRoom}>
        ✕ Exit room
      </button>

      {/* Contextual prompt */}
      {nearest?.type === 'memory' && (
        <div className="hud-prompt">
          <Hand size={17} />
          <span className="desktop-only">Press <kbd>E</kbd> to open this memory</span>
          <span className="mobile-only">Tap ✋ to open this memory</span>
          <em>{nearest.memory.caption}</em>
        </div>
      )}
      {nearest?.type === 'cake' && (
        <div className="hud-prompt">
          <span>{cfg.characters.cakePrompt}</span>
          <span className="desktop-only">Press <kbd>E</kbd> to begin</span>
          <span className="mobile-only">Tap ✋ to begin</span>
        </div>
      )}
      {nearest?.type === 'ring' && (
        <div className="hud-prompt ring-prompt">
          <span>{cfg.characters.ringPromptTeaser}</span>
          <span className="desktop-only">Press <kbd>E</kbd> — {cfg.ringPrompt}</span>
          <span className="mobile-only">Tap ✋ — {cfg.ringPrompt}</span>
        </div>
      )}
      {nearest?.type === 'video' && !videoStatus.playing && (
        <div className="hud-video">
          {videoStatus.failed ? (
            <span className="video-missing-note">
              Add your video at <code>public/media/our-video.mp4</code> to play it here
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => videoEvent('anniversary:video-toggle')}
                aria-label={videoStatus.playing ? 'Pause video' : 'Play video'}
              >
                {videoStatus.playing ? <Pause size={18} /> : <Play size={18} />}
                {videoStatus.playing ? 'Pause' : 'Play our video'}
              </button>
              <button
                type="button"
                onClick={() => videoEvent('anniversary:video-replay')}
                aria-label="Replay video"
              >
                <RotateCcw size={18} />
              </button>
            </>
          )}
        </div>
      )}

      {!cinematic && (
        <div className="hud-help desktop-only">
          <strong>W A S D</strong> walk — you are Sonai❤️, Babai❤️ holds your hand ·{' '}
          <strong>Mouse</strong> orbit camera · <strong>E</strong> interact ·{' '}
          <strong>Esc</strong> release mouse
        </div>
      )}

      {/* Mobile controls — always mounted, only hidden during events */}
      <div className="mobile-controls" style={cinematic ? { display: 'none' } : undefined}>
        <div className="joystick" ref={stickBase} aria-label="Movement joystick">
          <div className="joystick-knob" ref={stickKnob} />
        </div>
        <button
          type="button"
          className="interact-button"
          onClick={interact}
          disabled={!nearest}
          aria-label="Interact"
        >
          <Hand size={26} />
        </button>
      </div>
    </div>
  )
}
