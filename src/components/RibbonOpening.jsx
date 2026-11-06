import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Scissors } from 'lucide-react'
import { anniversaryConfig as cfg } from '../config/anniversary'

// Scene A — ribbon cutting. Drag the scissors (or pointer) across the
// ribbon: progress tracks how far you have cut. A full drag, a click,
// or pressing Enter/Space all cut it — nobody gets stuck on a gesture.
export default function RibbonOpening({ onCut }) {
  const [progress, setProgress] = useState(0)
  const [cut, setCut] = useState(false)
  const trackRef = useRef(null)
  const dragging = useRef(false)

  const finish = () => {
    if (cut) return
    setCut(true)
    setProgress(1)
    setTimeout(onCut, 1250)
  }

  const updateFromClientX = (clientX) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const p = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    setProgress((prev) => {
      const next = Math.max(prev, p)
      if (next >= 0.92) setTimeout(finish, 60)
      return next
    })
  }

  return (
    <div className="opening" role="dialog" aria-label="Anniversary opening ceremony">
      <div className="opening-spotlight" aria-hidden="true" />
      <div className="dust" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} style={{ left: `${(i * 71) % 100}%`, animationDelay: `${i * 0.7}s` }} />
        ))}
      </div>
      <div className="corner corner-tl" aria-hidden="true">❦</div>
      <div className="corner corner-tr" aria-hidden="true">❦</div>
      <div className="corner corner-bl" aria-hidden="true">❦</div>
      <div className="corner corner-br" aria-hidden="true">❦</div>

      <motion.div
        className="opening-copy"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
        <p className="opening-eyebrow">For {cfg.recipient} · {cfg.anniversaryDateLong}</p>
        <h1>{cfg.openingTitle}</h1>
        <p className="opening-sub">{cfg.openingSubtitle}</p>
      </motion.div>

      <div
        ref={trackRef}
        className={`ribbon-track${cut ? ' is-cut' : ''}`}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture?.(e.pointerId)
          updateFromClientX(e.clientX)
        }}
        onPointerMove={(e) => dragging.current && updateFromClientX(e.clientX)}
        onPointerUp={() => {
          dragging.current = false
        }}
      >
        <div className="ribbon ribbon-left" style={{ '--cut': progress }} />
        <div className="ribbon ribbon-right" style={{ '--cut': progress }} />
        <div
          className="ribbon-knot"
          style={{ opacity: 1 - progress, transform: `translate(-50%,-50%) scale(${1 - progress * 0.4})` }}
          aria-hidden="true"
        >
          🎀
        </div>
        {!cut && (
          <div className="scissors" style={{ left: `${8 + progress * 84}%` }} aria-hidden="true">
            <Scissors size={30} />
          </div>
        )}
        {cut && <div className="ribbon-light" aria-hidden="true" />}
      </div>

      <button
        type="button"
        className="cut-button"
        onClick={finish}
        aria-label="Cut the ribbon to begin"
      >
        <Scissors size={18} /> {cfg.openingInstruction}
      </button>
      <p className="opening-hint">Drag the scissors across the ribbon — or tap the button.</p>
    </div>
  )
}
