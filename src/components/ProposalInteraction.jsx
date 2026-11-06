import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, RotateCcw } from 'lucide-react'
import { anniversaryConfig as cfg } from '../config/anniversary'

// The proposal overlay. Both answers work, No is never blocked or
// made un-clickable, and the visitor can always close and keep
// exploring the room.
export default function ProposalInteraction({ onClose, onYes }) {
  const [answer, setAnswer] = useState(null) // null | 'yes' | 'no'

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="modal-backdrop proposal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="A question for you"
    >
      <div className="proposal-spotlight" aria-hidden="true" />
      <motion.div
        className="proposal-card"
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close and keep exploring">
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {answer === null && (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="proposal-ring" aria-hidden="true">💍</div>
              <motion.p
                className="proposal-line"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25 }}
              >
                {cfg.characters.ringMessage}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.5 }}
              >
                {cfg.proposalQuestion}
              </motion.h2>
              <motion.div
                className="proposal-buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 2.3 }}
              >
                <button
                  type="button"
                  className="yes-button"
                  onClick={() => (onYes ? onYes() : setAnswer('yes'))}
                >
                  {cfg.proposalYesButton}
                </button>
                <button type="button" className="no-button" onClick={() => setAnswer('no')}>
                  {cfg.proposalNoButton}
                </button>
              </motion.div>
            </motion.div>
          )}

          {answer === 'yes' && (
            <motion.div
              key="yes"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="petal-burst" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      '--angle': `${i * 20}deg`,
                      '--delay': `${(i % 6) * 0.06}s`
                    }}
                  >
                    {i % 3 === 0 ? '❤️' : '🌸'}
                  </span>
                ))}
              </div>
              <Heart size={42} fill="#c9404d" color="#c9404d" className="proposal-heart" />
              <h2>{cfg.proposalYesMessage}</h2>
              <p className="proposal-sub">{cfg.proposalYesSubMessage}</p>
              <button type="button" className="enter-button small" onClick={onClose}>
                Back to our little world
              </button>
            </motion.div>
          )}

          {answer === 'no' && (
            <motion.div
              key="no"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="proposal-ring" aria-hidden="true">🥺</div>
              <h2 className="no-heading">{cfg.proposalNoMessage}</h2>
              <div className="proposal-buttons">
                <button type="button" className="yes-button" onClick={() => setAnswer(null)}>
                  <RotateCcw size={17} /> Ask me again
                </button>
                <button type="button" className="no-button" onClick={onClose}>
                  Keep exploring
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
