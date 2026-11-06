import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

// Elegant photo overlay. Closing returns the player to exactly where
// they were — the 3D player is never reset, movement is only paused.
export default function MemoryViewer({ memory, onClose }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={memory.caption}
    >
      <motion.figure
        className="memory-card"
        initial={{ opacity: 0, scale: 0.92, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close memory">
          <X size={20} />
        </button>
        {!failed ? (
          <img src={memory.image} alt={memory.caption} onError={() => setFailed(true)} />
        ) : (
          <div className="memory-missing">
            <p>❤</p>
            <p>
              This photo has not been added yet.
              <br />
              <code>public{memory.image}</code>
            </p>
          </div>
        )}
        <figcaption>
          <h3>{memory.caption}</h3>
          {memory.note && <p>{memory.note}</p>}
        </figcaption>
      </motion.figure>
    </motion.div>
  )
}
